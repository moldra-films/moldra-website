import os
import tempfile
import json
import shutil

# Load environment variables from .env.local or .env in the parent or current directory
from dotenv import load_dotenv
for path in ["../.env.local", "../.env", ".env.local", ".env"]:
    full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), path)
    if os.path.exists(full_path):
        load_dotenv(full_path)
        print(f"✓ Loaded environment variables from {full_path}")
        break

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing

# Local imports
from image_processor import ImageProcessor, r2_client, r2_bucket_name, r2_public_url

culling_error = None
CullingAI = None

def get_culling_ai():
    global CullingAI, culling_error
    if CullingAI is not None:
        return CullingAI
    try:
        from culling_ai import CullingAI as LoadedCullingAI
        CullingAI = LoadedCullingAI
        return CullingAI
    except Exception as e:
        import traceback
        culling_error = traceback.format_exc()
        print(f"⚠️ Warning: CullingAI failed to load:\n{culling_error}")
        return None

app = FastAPI(title="Moldra Engine Cloud API", version="2.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global task state tracking
active_jobs = {
    "culling": {"progress": 0, "status": "Idle", "total": 0, "current": 0, "project_name": None},
    "export": {"progress": 0, "status": "Idle", "total": 0, "current": 0, "project_name": None}
}

class CullRequest(BaseModel):
    project_name: str
    file_urls: List[str] # List of public URLs of uploaded RAW/JPEG files

class ExportRequest(BaseModel):
    project_name: str
    watermark_text: Optional[str] = "Moldra Films"
    scale_max_dim: Optional[int] = 0

@app.get("/api/status")
def get_status():
    """Returns general server status and active cloud jobs."""
    # List projects by querying R2 prefix 'projects/'
    projects = []
    if r2_client and r2_bucket_name:
        try:
            response = r2_client.list_objects_v2(
                Bucket=r2_bucket_name,
                Prefix="projects/",
                Delimiter="/"
            )
            if "CommonPrefixes" in response:
                projects = [p["Prefix"].replace("projects/", "").rstrip("/") for p in response["CommonPrefixes"]]
        except Exception as e:
            print(f"Error listing projects from R2: {e}")

    return {
        "status": "online",
        "mode": "cloud-first",
        "projects_count": len(projects),
        "projects_list": projects,
        "cores_available": multiprocessing.cpu_count(),
        "active_jobs": active_jobs,
        "culling_error": culling_error
    }

def bg_culling_task(project_name: str, file_urls: List[str]):
    """Background task to download files, generate proxies if RAW, run AI culling, and save sidecars back to R2 incrementally."""
    import gc
    try:
        active_jobs["culling"]["status"] = "Processing"
        active_jobs["culling"]["progress"] = 0
        total_files = len(file_urls)
        active_jobs["culling"]["total"] = total_files

        # 1. Read existing settings from R2 or create fresh
        settings_key = f"projects/{project_name}/settings.json"
        project_settings = {"adjustments": {}, "culling_results": []}
        
        if r2_client and r2_bucket_name:
            try:
                response = r2_client.get_object(Bucket=r2_bucket_name, Key=settings_key)
                project_settings = json.loads(response["Body"].read().decode("utf-8"))
            except Exception:
                pass # Settings not created yet

        existing_results = project_settings.get("culling_results", [])
        existing_filenames = {item["filename"] for item in existing_results}

        # Filter out files that are already processed
        files_to_process = []
        for url in file_urls:
            filename = url.split("/")[-1]
            if filename not in existing_filenames:
                files_to_process.append(url)

        total_to_process = len(files_to_process)
        print(f"Incremental culling: {total_to_process} of {total_files} files need processing.")

        temp_dir = tempfile.mkdtemp(prefix="moldra_cull_")
        ai = get_culling_ai()
        if ai is None:
            raise Exception("CullingAI could not be loaded")

        processed_count = total_files - total_to_process
        active_jobs["culling"]["current"] = processed_count
        if total_files > 0:
            active_jobs["culling"]["progress"] = int((processed_count / total_files) * 100)

        # Process one file at a time
        for index, url in enumerate(files_to_process):
            filename = url.split("/")[-1]
            local_raw_path = os.path.join(temp_dir, filename)
            
            # 1. Download file from R2 to worker local storage
            success = ImageProcessor.download_temp_file(url, local_raw_path)
            if not success:
                continue

            # 2. Check if file is RAW and requires proxy generation
            is_raw = not (filename.lower().endswith(('.jpg', '.jpeg')))
            local_cull_path = local_raw_path
            proxy_ref = url
            
            if is_raw:
                # Extract JPEG preview for culling
                local_proxy_name = os.path.splitext(filename)[0] + ".jpg"
                local_proxy_path = os.path.join(temp_dir, "proxy_" + local_proxy_name)
                
                extracted = ImageProcessor.extract_embedded_jpeg(local_raw_path, local_proxy_path)
                if extracted:
                    # Upload proxy preview back to R2
                    r2_proxy_key = f"projects/{project_name}/Proxies/{local_proxy_name}"
                    uploaded_proxy_url = ImageProcessor.upload_to_r2(local_proxy_path, r2_proxy_key, "image/jpeg")
                    local_cull_path = local_proxy_path
                    proxy_ref = uploaded_proxy_url
                
                # Delete heavy RAW file immediately to conserve disk space
                if os.path.exists(local_raw_path):
                    try:
                        os.remove(local_raw_path)
                    except Exception as e:
                        print(f"Error removing raw file {local_raw_path}: {e}")

            # 3. Execute AI Culling over single local image
            results = ai.run_culling_on_images([local_cull_path])
            if results:
                item = results[0]
                
                # Generate XMP local sidecar
                xmp_local = ai.generate_xmp_sidecar(local_cull_path, item["stars"], item["color_label"])
                if xmp_local and os.path.exists(xmp_local):
                    # Upload XMP next to original image
                    original_key = url.replace(r2_public_url.rstrip("/") + "/", "")
                    xmp_key = os.path.splitext(original_key)[0] + ".xmp"
                    ImageProcessor.upload_to_r2(xmp_local, xmp_key, "application/xml")
                    try:
                        os.remove(xmp_local)
                    except Exception:
                        pass
                
                existing_results.append({
                    "filename": filename,
                    "url": url,
                    "proxyUrl": proxy_ref,
                    "sharpness": round(item["sharpness"], 2),
                    "faces_count": item["faces_count"],
                    "eyes_open": item["eyes_open"],
                    "smiling": item["smiling"],
                    "group_id": None,
                    "is_hero": False,
                    "stars": item["stars"],
                    "color_label": item["color_label"],
                    "time": item["time"] # Keep as datetime for grouping
                })

            # Delete local cull file (proxy or jpeg)
            if os.path.exists(local_cull_path):
                try:
                    os.remove(local_cull_path)
                except Exception as e:
                    print(f"Error removing cull file {local_cull_path}: {e}")

            processed_count += 1
            active_jobs["culling"]["current"] = processed_count
            if total_files > 0:
                active_jobs["culling"]["progress"] = int((processed_count / total_files) * 100)

            # Save progress every 5 photos or at the very end
            if (index + 1) % 5 == 0 or (index + 1) == total_to_process:
                # Group duplicates/bursts over the captured results so far
                # Convert datetime to string for json serialization in a temporary copy
                serializable_results = []
                for res in existing_results:
                    res_copy = res.copy()
                    if isinstance(res_copy["time"], datetime):
                        res_copy["time"] = res_copy["time"].strftime("%Y-%m-%d %H:%M:%S")
                    serializable_results.append(res_copy)
                
                project_settings["culling_results"] = serializable_results
                settings_bytes = json.dumps(project_settings, indent=2, ensure_ascii=False).encode("utf-8")
                ImageProcessor.upload_data_to_r2(settings_bytes, settings_key, "application/json")

            # Force garbage collection
            gc.collect()

        # 4. Final Grouping & Save
        if len(existing_results) > 0:
            # Sort by time
            # Make sure we handle both datetime objects and string representations in existing results
            def parse_time(x):
                t = x["time"]
                if isinstance(t, datetime):
                    return t
                try:
                    return datetime.strptime(t, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    return datetime.now()

            existing_results.sort(key=parse_time)
            
            # Reset all group ids and re-run clustering
            group_id_counter = 1
            for item in existing_results:
                item["group_id"] = None
                
            for i, item in enumerate(existing_results):
                if item["group_id"] is not None:
                    continue
                item["group_id"] = group_id_counter
                
                item_time = parse_time(item)
                # Find all visually similar photos taken within 3 seconds
                for j in range(i + 1, len(existing_results)):
                    other = existing_results[j]
                    if other["group_id"] is not None:
                        continue
                    
                    other_time = parse_time(other)
                    time_diff = abs((other_time - item_time).total_seconds())
                    if time_diff > 3:
                        break # sorted by time, so no need to search further
                        
                    # Compare perceptual hashes (distance <= 12)
                    other["group_id"] = group_id_counter
                group_id_counter += 1

            # Identify hero (sharpest) for each group
            for g_id in range(1, group_id_counter):
                group_photos = [p for p in existing_results if p["group_id"] == g_id]
                if not group_photos:
                    continue
                # Set all to false, then find max sharpness and set to true
                for p in group_photos:
                    p["is_hero"] = False
                sharpest = max(group_photos, key=lambda x: x["sharpness"])
                sharpest["is_hero"] = True

            # Convert datetime to string for final serialization
            serializable_results = []
            for res in existing_results:
                res_copy = res.copy()
                if isinstance(res_copy["time"], datetime):
                    res_copy["time"] = res_copy["time"].strftime("%Y-%m-%d %H:%M:%S")
                serializable_results.append(res_copy)

            project_settings["culling_results"] = serializable_results
            settings_bytes = json.dumps(project_settings, indent=2, ensure_ascii=False).encode("utf-8")
            ImageProcessor.upload_data_to_r2(settings_bytes, settings_key, "application/json")

        # Cleanup local worker temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)

        active_jobs["culling"]["status"] = "Completed"
        active_jobs["culling"]["progress"] = 100

    except Exception as e:
        print(f"Error in background culling: {e}")
        active_jobs["culling"]["status"] = f"Failed: {str(e)}"
        active_jobs["culling"]["progress"] = 0

@app.post("/api/cull")
def trigger_cull(req: CullRequest, bg_tasks: BackgroundTasks):
    """Triggers background task to download R2 files, process culling, and save sidecars."""
    ai = get_culling_ai()
    if ai is None:
        raise HTTPException(
            status_code=500,
            detail=f"O processador de IA (CullingAI) não foi inicializado com sucesso. Erro: {culling_error}"
        )
    active_jobs["culling"] = {"progress": 0, "status": "Pending", "total": 0, "current": 0}
    bg_tasks.add_task(bg_culling_task, req.project_name, req.file_urls)
    return {"message": "Culling iniciado em background.", "project": req.project_name}

def bg_export_task(project_name: str, watermark_text: str, scale_max_dim: int):
    """Downloads original images, applies saved adjustments and watermark, and uploads to R2."""
    try:
        active_jobs["export"]["status"] = "Processing"
        active_jobs["export"]["progress"] = 0
        
        settings_key = f"projects/{project_name}/settings.json"
        project_settings = {"adjustments": {}, "culling_results": []}

        # 1. Fetch settings from R2
        if r2_client and r2_bucket_name:
            try:
                response = r2_client.get_object(Bucket=r2_bucket_name, Key=settings_key)
                project_settings = json.loads(response["Body"].read().decode("utf-8"))
            except Exception as e:
                print(f"Could not load project settings from R2: {e}")

        culling_results = project_settings.get("culling_results", [])
        adjustments_map = project_settings.get("adjustments", {})
        total_files = len(culling_results)
        active_jobs["export"]["total"] = total_files

        if total_files == 0:
            active_jobs["export"]["status"] = "Completed (No culling results found)"
            active_jobs["export"]["progress"] = 100
            return

        tasks = []
        for photo in culling_results:
            filename = photo["filename"]
            original_url = photo["url"]
            adj = adjustments_map.get(filename, {})
            
            output_name = os.path.splitext(filename)[0] + ".jpg"
            r2_key_output = f"projects/{project_name}/Prontas/{output_name}"

            tasks.append({
                "file_url": original_url,
                "r2_key_output": r2_key_output,
                "adjustments": adj,
                "watermark_text": watermark_text,
                "scale_max_dim": scale_max_dim
            })

        # Thread pool execution (lightweight memory footprint for serverless/containers)
        # We run strictly sequentially (max_workers=1) to prevent Out of Memory (OOM) crashes on 512MB RAM
        max_workers = 1
        print(f"Starting cloud export for {total_files} files using {max_workers} thread (sequential)...")

        import gc
        completed = 0
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(ImageProcessor.export_worker, t) for t in tasks]
            for future in futures:
                future.result()
                completed += 1
                active_jobs["export"]["current"] = completed
                active_jobs["export"]["progress"] = int((completed / total_files) * 100)
                # Reclaim memory buffers immediately
                gc.collect()

        active_jobs["export"]["status"] = "Completed"
        active_jobs["export"]["progress"] = 100

    except Exception as e:
        print(f"Error in background export: {e}")
        active_jobs["export"]["status"] = f"Failed: {str(e)}"
        active_jobs["export"]["progress"] = 0

class AdjustmentRequest(BaseModel):
    project_name: str
    filename: str
    adjustments: dict

@app.get("/api/project/{project_name}/settings")
def get_project_settings(project_name: str):
    """Retrieves settings and adjustments for a project directly from Cloudflare R2."""
    settings_key = f"projects/{project_name}/settings.json"
    if not r2_client or not r2_bucket_name:
        return {"adjustments": {}, "culling_results": []}
    try:
        response = r2_client.get_object(Bucket=r2_bucket_name, Key=settings_key)
        return json.loads(response["Body"].read().decode("utf-8"))
    except Exception as e:
        # Check if error is NoSuchKey (404)
        if "NoSuchKey" in str(e):
            return {"adjustments": {}, "culling_results": []}
        raise HTTPException(status_code=500, detail=f"Erro ao ler configurações: {str(e)}")

@app.post("/api/adjust")
def save_adjustment(req: AdjustmentRequest):
    """Saves or updates custom adjustments for a specific photo inside R2 settings JSON."""
    settings_key = f"projects/{req.project_name}/settings.json"
    project_settings = {"adjustments": {}, "culling_results": []}
    
    if not r2_client or not r2_bucket_name:
        raise HTTPException(status_code=500, detail="R2 client is not configured.")
        
    try:
        # Try fetching existing settings
        try:
            response = r2_client.get_object(Bucket=r2_bucket_name, Key=settings_key)
            project_settings = json.loads(response["Body"].read().decode("utf-8"))
        except Exception as e:
            if "NoSuchKey" not in str(e):
                raise e
            
        if "adjustments" not in project_settings:
            project_settings["adjustments"] = {}
            
        # Update adjustments for this file
        project_settings["adjustments"][req.filename] = req.adjustments
        
        # Save back to R2
        settings_bytes = json.dumps(project_settings, indent=2, ensure_ascii=False).encode("utf-8")
        ImageProcessor.upload_data_to_r2(settings_bytes, settings_key, "application/json")
        return {"status": "success", "message": f"Ajustes salvos para {req.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar ajustes: {str(e)}")

@app.delete("/api/project/{project_name}")
def delete_project(project_name: str):
    """Deletes all R2 objects (Originals, Proxies, Settings) associated with a project name."""
    if not r2_client or not r2_bucket_name:
        raise HTTPException(status_code=500, detail="R2 client is not configured.")
        
    prefix = f"projects/{project_name}/"
    try:
        # List all keys with the project prefix
        paginator = r2_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=r2_bucket_name, Prefix=prefix)
        
        deleted_count = 0
        for page in pages:
            if "Contents" in page:
                # Extract keys to delete
                delete_keys = [{"Key": obj["Key"]} for obj in page["Contents"]]
                
                # Delete objects in batch
                r2_client.delete_objects(
                    Bucket=r2_bucket_name,
                    Delete={"Objects": delete_keys}
                )
                deleted_count += len(delete_keys)
                
        # Reset export job tracking if the deleted project was the one being tracked
        if active_jobs["export"].get("project_name") == project_name:
            active_jobs["export"] = {"progress": 0, "status": "Idle", "total": 0, "current": 0, "project_name": None}
            
        return {"status": "success", "message": f"Projeto '{project_name}' deletado com sucesso. {deleted_count} arquivos removidos do R2."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar projeto: {str(e)}")

@app.post("/api/export")
def trigger_export(req: ExportRequest, bg_tasks: BackgroundTasks):
    """Triggers background multiprocessing render export."""
    active_jobs["export"] = {"progress": 0, "status": "Pending", "total": 0, "current": 0, "project_name": req.project_name}
    bg_tasks.add_task(bg_export_task, req.project_name, req.watermark_text, req.scale_max_dim)
    return {"message": "Exportação iniciada em background.", "project": req.project_name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
