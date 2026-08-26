import os
import glob
import json
import psutil
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
from concurrent.futures import ProcessPoolExecutor
import multiprocessing

# Local imports
from image_processor import ImageProcessor, PROJECTS_ROOT
from culling_ai import CullingAI

app = FastAPI(title="Moldra Engine API", version="1.0.0")

# Enable CORS for Next.js panel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production you can restrict this to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global task state tracking
active_jobs = {
    "ingestion": {"progress": 0, "status": "Idle", "total": 0, "current": 0},
    "culling": {"progress": 0, "status": "Idle", "total": 0, "current": 0},
    "export": {"progress": 0, "status": "Idle", "total": 0, "current": 0}
}

class IngestRequest(BaseModel):
    source_dir: str
    project_name: str

class CullRequest(BaseModel):
    project_name: str

class AdjustmentRequest(BaseModel):
    project_name: str
    filename: str
    adjustments: dict

class ExportRequest(BaseModel):
    project_name: str
    watermark_text: Optional[str] = "Moldra Films"
    scale_max_dim: Optional[int] = 0 # 0 means full resolution

@app.get("/api/status")
def get_status():
    """Returns general server status and resource utilization details."""
    cpu_percent = psutil.cpu_percent()
    ram = psutil.virtual_memory()
    
    # Scan active projects in Moldra_Projects
    projects = []
    if os.path.exists(PROJECTS_ROOT):
        projects = [d for d in os.listdir(PROJECTS_ROOT) if os.path.isdir(os.path.join(PROJECTS_ROOT, d))]

    return {
        "status": "online",
        "cpu_usage": f"{cpu_percent}%",
        "ram_usage": f"{ram.percent}%",
        "projects_count": len(projects),
        "projects_list": projects,
        "cores_available": multiprocessing.cpu_count(),
        "active_jobs": active_jobs
    }

def bg_ingest_task(source_dir: str, project_name: str):
    """Background task to copy RAW files and extract lightweight JPEG proxies."""
    try:
        active_jobs["ingestion"]["status"] = "Processing"
        active_jobs["ingestion"]["progress"] = 0
        
        # 1. Create project directories
        paths = ImageProcessor.create_project_structure(project_name)
        
        # 2. Scan source directory for RAW/JPEG files
        extensions = ['*.cr2', '*.cr3', '*.nef', '*.arw', '*.dng', '*.jpg', '*.jpeg', '*.tiff']
        source_files = []
        for ext in extensions:
            source_files.extend(glob.glob(os.path.join(source_dir, ext)))
            source_files.extend(glob.glob(os.path.join(source_dir, ext.upper())))
            
        total_files = len(source_files)
        active_jobs["ingestion"]["total"] = total_files
        
        if total_files == 0:
            active_jobs["ingestion"]["status"] = "Completed (No files found)"
            active_jobs["ingestion"]["progress"] = 100
            return
            
        print(f"Ingesting {total_files} images from {source_dir}...")
        
        for index, file_path in enumerate(source_files):
            filename = os.path.basename(file_path)
            dest_raw = os.path.join(paths["original"], filename)
            
            # Copy original file to project folder
            shutil.copy2(file_path, dest_raw)
            
            # Generate JPEG proxy
            proxy_name = os.path.splitext(filename)[0] + ".jpg"
            dest_proxy = os.path.join(paths["proxies"], proxy_name)
            
            # If the file is already a JPEG, copy and resize it
            if filename.lower().endswith(('.jpg', '.jpeg')):
                shutil.copy2(dest_raw, dest_proxy)
                ImageProcessor.resize_to_proxy(dest_proxy)
            else:
                # Extract preview from RAW file
                success = ImageProcessor.extract_embedded_jpeg(dest_raw, dest_proxy)
                if not success:
                    # Fallback to creating a blank thumbnail
                    blank = np.zeros((300, 300, 3), dtype=np.uint8)
                    cv2.imwrite(dest_proxy, blank)
                    
            # Update progress status
            active_jobs["ingestion"]["current"] = index + 1
            active_jobs["ingestion"]["progress"] = int(((index + 1) / total_files) * 100)
            
        active_jobs["ingestion"]["status"] = "Completed"
        active_jobs["ingestion"]["progress"] = 100
        
    except Exception as e:
        print(f"Error during background ingestion: {e}")
        active_jobs["ingestion"]["status"] = f"Failed: {str(e)}"
        active_jobs["ingestion"]["progress"] = 0

@app.post("/api/ingest")
def start_ingest(req: IngestRequest, bg_tasks: BackgroundTasks):
    """Triggers asynchronous ingestion from memory card to local project directories."""
    if not os.path.exists(req.source_dir):
        raise HTTPException(status_code=400, detail="Diretório de origem não existe.")
        
    # Reset job metrics
    active_jobs["ingestion"] = {"progress": 0, "status": "Pending", "total": 0, "current": 0}
    bg_tasks.add_task(bg_ingest_task, req.source_dir, req.project_name)
    return {"message": "Ingestão iniciada no background.", "project": req.project_name}

@app.post("/api/cull")
def start_cull(req: CullRequest):
    """
    Synchronously runs culling pipeline over JPEG proxies.
    Returns clustered list containing focus score, eye aspect ratios, and Hero photo selection.
    """
    proj_dir = os.path.join(PROJECTS_ROOT, req.project_name)
    proxies_dir = os.path.join(proj_dir, "Proxies")
    
    if not os.path.exists(proxies_dir):
        raise HTTPException(status_code=400, detail="Projeto não encontrado ou proxies ausentes.")
        
    # Scan proxy images
    proxy_paths = glob.glob(os.path.join(proxies_dir, "*.jpg"))
    if not proxy_paths:
        return {"message": "Nenhuma imagem encontrada na pasta de proxies.", "results": []}
        
    print(f"Running AI Culling on {len(proxy_paths)} images...")
    active_jobs["culling"]["status"] = "Processing"
    active_jobs["culling"]["total"] = len(proxy_paths)
    
    # Run pipeline
    results = CullingAI.run_culling_on_images(proxy_paths)
    
    # Write initial XMP files for Lightroom sidecar compatibility
    for item in results:
        CullingAI.generate_xmp_sidecar(
            image_path=item["path"].replace("Proxies", "Original"), # Point sidecars to original files
            stars=item["stars"],
            color_label=item["color_label"]
        )
        
    # Convert absolute paths to relative paths for UI safety
    serializable_results = []
    for item in results:
        serializable_results.append({
            "filename": item["filename"],
            "sharpness": round(item["sharpness"], 2),
            "faces_count": item["faces_count"],
            "eyes_open": item["eyes_open"],
            "smiling": item["smiling"],
            "group_id": item["group_id"],
            "is_hero": item["is_hero"],
            "stars": item["stars"],
            "color_label": item["color_label"],
            "time": item["time"].strftime("%Y-%m-%d %H:%M:%S")
        })
        
    active_jobs["culling"]["status"] = "Completed"
    active_jobs["culling"]["progress"] = 100
    
    # Save culling metadata locally inside project settings
    settings_path = os.path.join(proj_dir, "settings.json")
    project_settings = {}
    if os.path.exists(settings_path):
        try:
            with open(settings_path, 'r', encoding='utf-8') as f:
                project_settings = json.load(f)
        except Exception:
            pass
            
    project_settings["culling_results"] = serializable_results
    with open(settings_path, 'w', encoding='utf-8') as f:
        json.dump(project_settings, f, indent=2, ensure_ascii=False)
        
    return {
        "project": req.project_name,
        "total_images": len(proxy_paths),
        "results": serializable_results
    }

@app.post("/api/adjust")
def save_adjustment(req: AdjustmentRequest):
    """Saves user modifications (exposure, contrast, white balance adjustments) to a project settings JSON."""
    proj_dir = os.path.join(PROJECTS_ROOT, req.project_name)
    if not os.path.exists(proj_dir):
        raise HTTPException(status_code=400, detail="Projeto não encontrado.")
        
    settings_path = os.path.join(proj_dir, "settings.json")
    project_settings = {}
    if os.path.exists(settings_path):
        try:
            with open(settings_path, 'r', encoding='utf-8') as f:
                project_settings = json.load(f)
        except Exception:
            pass
            
    if "adjustments" not in project_settings:
        project_settings["adjustments"] = {}
        
    project_settings["adjustments"][req.filename] = req.adjustments
    
    with open(settings_path, 'w', encoding='utf-8') as f:
        json.dump(project_settings, f, indent=2, ensure_ascii=False)
        
    return {"status": "success", "message": f"Ajustes salvos para {req.filename}"}

@app.get("/api/project/{project_name}/settings")
def get_project_settings(project_name: str):
    """Retrieves metadata and custom adjustments saved in the project settings JSON."""
    proj_dir = os.path.join(PROJECTS_ROOT, project_name)
    settings_path = os.path.join(proj_dir, "settings.json")
    
    if not os.path.exists(settings_path):
        return {"adjustments": {}, "culling_results": []}
        
    try:
        with open(settings_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler configurações: {str(e)}")

def bg_export_task(project_name: str, watermark_text: str, scale_max_dim: int):
    """Multiprocessing background task to render and export all images."""
    try:
        active_jobs["export"]["status"] = "Processing"
        active_jobs["export"]["progress"] = 0
        
        proj_dir = os.path.join(PROJECTS_ROOT, project_name)
        original_dir = os.path.join(proj_dir, "Original")
        prontas_dir = os.path.join(proj_dir, "Prontas")
        settings_path = os.path.join(proj_dir, "settings.json")
        
        # Load adjustments map from settings
        adjustments_map = {}
        if os.path.exists(settings_path):
            try:
                with open(settings_path, 'r', encoding='utf-8') as f:
                    project_settings = json.load(f)
                    adjustments_map = project_settings.get("adjustments", {})
            except Exception:
                pass

        # Scan original RAW/JPG files
        original_files = []
        for ext in ['*.cr2', '*.cr3', '*.nef', '*.arw', '*.dng', '*.jpg', '*.jpeg']:
            original_files.extend(glob.glob(os.path.join(original_dir, ext)))
            original_files.extend(glob.glob(os.path.join(original_dir, ext.upper())))
            
        total_files = len(original_files)
        active_jobs["export"]["total"] = total_files
        
        if total_files == 0:
            active_jobs["export"]["status"] = "Completed (No original files found)"
            active_jobs["export"]["progress"] = 100
            return
            
        # Create execution tasks for multiprocessing pool
        tasks = []
        for file_path in original_files:
            filename = os.path.basename(file_path)
            # Find matching adjustments or use default empty adjustments
            adj = adjustments_map.get(filename, {})
            
            output_name = os.path.splitext(filename)[0] + ".jpg"
            output_path = os.path.join(prontas_dir, output_name)
            
            tasks.append({
                "raw_path": file_path,
                "output_path": output_path,
                "adjustments": adj,
                "watermark_text": watermark_text,
                "scale_max_dim": scale_max_dim
            })

        # Run process pool executor to render in parallel
        # Max workers matches CPU core count for optimal speed
        max_workers = multiprocessing.cpu_count()
        print(f"Exporting {total_files} images using process pool with {max_workers} workers...")
        
        completed = 0
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            # Submit tasks to pool
            futures = [executor.submit(ImageProcessor.export_worker, t) for t in tasks]
            
            for future in futures:
                # Wait for each task to complete
                future.result()
                completed += 1
                active_jobs["export"]["current"] = completed
                active_jobs["export"]["progress"] = int((completed / total_files) * 100)
                
        active_jobs["export"]["status"] = "Completed"
        active_jobs["export"]["progress"] = 100
        
    except Exception as e:
        print(f"Error during background export: {e}")
        active_jobs["export"]["status"] = f"Failed: {str(e)}"
        active_jobs["export"]["progress"] = 0

@app.post("/api/export")
def start_export(req: ExportRequest, bg_tasks: BackgroundTasks):
    """Spawns multiprocessing render engine to export all RAW files to watermark JPEGs."""
    proj_dir = os.path.join(PROJECTS_ROOT, req.project_name)
    if not os.path.exists(proj_dir):
        raise HTTPException(status_code=400, detail="Projeto não encontrado.")
        
    # Reset job status
    active_jobs["export"] = {"progress": 0, "status": "Pending", "total": 0, "current": 0}
    bg_tasks.add_task(bg_export_task, req.project_name, req.watermark_text, req.scale_max_dim)
    return {"message": "Renderização e exportação iniciadas.", "project": req.project_name}

@app.get("/api/proxy/{project_name}/{filename}")
def get_proxy_image(project_name: str, filename: str):
    """Serves the proxy JPEG image from local disk to the client browser."""
    # Ensure proxy file extension is .jpg
    proxy_name = os.path.splitext(filename)[0] + ".jpg"
    proxy_path = os.path.join(PROJECTS_ROOT, project_name, "Proxies", proxy_name)
    
    if not os.path.exists(proxy_path):
        raise HTTPException(status_code=404, detail="Proxy image not found.")
        
    return FileResponse(proxy_path)

if __name__ == "__main__":
    import uvicorn
    # Start server on localhost:8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
