import os
import shutil
import rawpy
import cv2
import uuid
# Disable OpenCV multi-threading to prevent pthreads RAM overhead and OOM crashes in limited memory containers
cv2.setNumThreads(0)
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import urllib.request
import boto3
from datetime import datetime
from botocore.config import Config

# Initialize R2 Client using standard Boto3
r2_account_id = os.environ.get("R2_ACCOUNT_ID", "")
r2_access_key_id = os.environ.get("R2_ACCESS_KEY_ID", "")
r2_secret_access_key = os.environ.get("R2_SECRET_ACCESS_KEY", "")
r2_bucket_name = os.environ.get("R2_BUCKET_NAME", "")
r2_public_url = os.environ.get("NEXT_PUBLIC_R2_PUBLIC_URL", "")

r2_client = None
if r2_account_id and r2_access_key_id and r2_secret_access_key:
    try:
        r2_client = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{r2_account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=r2_access_key_id,
            aws_secret_access_key=r2_secret_access_key,
            region_name="auto",
            config=Config(signature_version="s3v4")
        )
        print("✓ R2 Boto3 client successfully initialized in Moldra Engine.")
    except Exception as e:
        print(f"❌ Failed to initialize R2 Boto3 client: {e}")

class ImageProcessor:
    @staticmethod
    def download_temp_file(url: str, dest_path: str) -> bool:
        """Downloads a remote file (from R2/HTTP) to a local temporary path."""
        # 1. Try direct download via authenticated Boto3 if it's our R2 bucket to bypass Cloudflare bot firewalls
        if r2_client and r2_bucket_name and r2_public_url:
            clean_public_url = r2_public_url.rstrip("/")
            if clean_public_url in url:
                try:
                    key = url.split(clean_public_url + "/")[-1].split("?")[0]
                    r2_client.download_file(r2_bucket_name, key, dest_path)
                    return True
                except Exception as e:
                    print(f"Boto3 direct download failed for {url}: {e}. Falling back to HTTP...")

        # 2. Fallback to standard HTTP download
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
                shutil.copyfileobj(response, out_file)
            return True
        except Exception as e:
            print(f"Error downloading {url} to {dest_path} via HTTP: {e}")
            return False

    @staticmethod
    def upload_to_r2(local_path: str, r2_key: str, content_type: str = "image/jpeg") -> str:
        """Uploads a local file directly to Cloudflare R2 bucket."""
        if not r2_client or not r2_bucket_name:
            print("R2 Client not configured, skipping cloud upload.")
            return ""
        try:
            r2_client.upload_file(
                Filename=local_path,
                Bucket=r2_bucket_name,
                Key=r2_key,
                ExtraArgs={"ContentType": content_type}
            )
            # Return public access URL
            public_base = r2_public_url.rstrip("/")
            return f"{public_base}/{r2_key}"
        except Exception as e:
            print(f"Error uploading {local_path} to R2 key {r2_key}: {e}")
            return ""

    @staticmethod
    def upload_data_to_r2(data_bytes: bytes, r2_key: str, content_type: str = "application/octet-stream") -> str:
        """Uploads raw data bytes directly to R2 bucket."""
        if not r2_client or not r2_bucket_name:
            return ""
        try:
            r2_client.put_object(
                Body=data_bytes,
                Bucket=r2_bucket_name,
                Key=r2_key,
                ContentType=content_type
            )
            public_base = r2_public_url.rstrip("/")
            return f"{public_base}/{r2_key}"
        except Exception as e:
            print(f"Error uploading data bytes to R2 key {r2_key}: {e}")
            return ""

    @staticmethod
    def process_adjustment(img_np: np.ndarray, adjustments: dict) -> np.ndarray:
        """Applies batch adjustments (Exposure, Contrast, WB, Saturation, Sharpness, Noise) via OpenCV."""
        out = img_np.copy()
        
        # 1. Exposure
        exposure = adjustments.get("exposure", 0.0)
        if exposure != 0.0:
            scale = 2.0 ** exposure
            out = cv2.multiply(out, np.array([scale]))
            
        # 2. Contrast
        contrast = adjustments.get("contrast", 0.0)
        if contrast != 0.0:
            factor = (259 * (contrast * 128 + 255)) / (255 * (259 - contrast * 128))
            out = cv2.addWeighted(out, factor, out, 0, 128 * (1 - factor))
            
        # 3. White Balance (Temp)
        temp = adjustments.get("temp", 0.0)
        tint = adjustments.get("tint", 0.0)
        if temp != 0.0 or tint != 0.0:
            r_gain = 1.0 + temp * 0.15 - tint * 0.05
            g_gain = 1.0 + tint * 0.15
            b_gain = 1.0 - temp * 0.15 - tint * 0.05
            r_gain, g_gain, b_gain = max(0.1, r_gain), max(0.1, g_gain), max(0.1, b_gain)
            
            b, g, r = cv2.split(out)
            b = cv2.multiply(b, np.array([b_gain]))
            g = cv2.multiply(g, np.array([g_gain]))
            r = cv2.multiply(r, np.array([r_gain]))
            out = cv2.merge([b, g, r])

        # 4. Saturation
        saturation = adjustments.get("saturation", 0.0)
        if saturation != 0.0:
            hsv = cv2.cvtColor(out, cv2.COLOR_BGR2HSV).astype(np.float32)
            h, s, v = cv2.split(hsv)
            s = s * (1.0 + saturation)
            s = np.clip(s, 0, 255)
            hsv = cv2.merge([h, s, v])
            out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
            
        # 5. Sharpness
        sharpness = adjustments.get("sharpness", 0.0)
        if sharpness > 0.0:
            blurred = cv2.GaussianBlur(out, (5, 5), 1.0)
            out = cv2.addWeighted(out, 1.0 + sharpness * 1.5, blurred, -sharpness * 1.5, 0)
            
        # 6. Noise Reduction
        noise_reduction = adjustments.get("noiseReduction", 0.0)
        if noise_reduction > 0.0:
            d = int(5 + noise_reduction * 4)
            sigma_color = noise_reduction * 50
            sigma_space = noise_reduction * 50
            out = cv2.bilateralFilter(out, d, sigma_color, sigma_space)
            
        return np.clip(out, 0, 255).astype(np.uint8)

    @staticmethod
    def apply_watermark(img_pil: Image.Image, text: str = "Moldra Films") -> Image.Image:
        """Applies a watermark to the bottom-right corner of the image."""
        img_w, img_h = img_pil.size
        draw = ImageDraw.Draw(img_pil)
        
        try:
            # Default slim system fonts
            font = ImageFont.load_default()
        except Exception:
            font = ImageFont.load_default()
            
        watermark_text = f"© {datetime.now().year} {text}"
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        margin_x = int(img_w * 0.03)
        margin_y = int(img_h * 0.03)
        x = img_w - text_w - margin_x
        y = img_h - text_h - margin_y
        
        draw.text((x + 2, y + 2), watermark_text, font=font, fill=(0, 0, 0, 80))
        draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, 140))
        
        return img_pil

    @staticmethod
    def export_worker(task: dict) -> bool:
        """
        Multiprocessing task to download image from R2, apply filters/watermark,
        and upload the final output back to R2.
        """
        file_url = task["file_url"]
        r2_key_output = task["r2_key_output"]
        adjustments = task.get("adjustments", {})
        watermark_text = task.get("watermark_text", "Moldra Films")
        scale_max_dim = task.get("scale_max_dim", 0)

        # Unique temp paths based on random UUID to avoid locks and thread conflicts
        unique_id = uuid.uuid4().hex
        temp_input = f"/tmp/export_in_{unique_id}_{os.path.basename(r2_key_output)}"
        temp_output = f"/tmp/export_out_{unique_id}_{os.path.basename(r2_key_output)}"

        try:
            # 1. Download file from R2
            success = ImageProcessor.download_temp_file(file_url, temp_input)
            if not success:
                return False

            # 2. Decode raw or jpeg
            img_np = None
            is_raw = not (temp_input.lower().endswith('.jpg') or temp_input.lower().endswith('.jpeg'))
            
            if is_raw:
                with rawpy.imread(temp_input) as raw:
                    rgb = raw.postprocess(use_camera_wb=True, half_size=False)
                    img_np = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
            else:
                img_np = cv2.imread(temp_input)

            if img_np is None:
                raise ValueError("Could not decode downloaded image.")

            # 3. Apply adjustments
            adjusted_np = ImageProcessor.process_adjustment(img_np, adjustments)

            # 4. Save to PIL & Resize
            adjusted_rgb = cv2.cvtColor(adjusted_np, cv2.COLOR_BGR2RGB)
            final_img = Image.fromarray(adjusted_rgb)

            if scale_max_dim > 0:
                final_img.thumbnail((scale_max_dim, scale_max_dim))

            # 5. Watermark
            if watermark_text:
                final_img = ImageProcessor.apply_watermark(final_img, watermark_text)

            # 6. Save locally
            final_img.save(temp_output, "JPEG", quality=95)

            # 7. Upload final output back to R2
            ImageProcessor.upload_to_r2(temp_output, r2_key_output, "image/jpeg")
            return True
            
        except Exception as e:
            print(f"Export worker failed for {file_url}: {e}")
            return False
        finally:
            # Clean up local temporary files
            if os.path.exists(temp_input):
                os.remove(temp_input)
            if os.path.exists(temp_output):
                os.remove(temp_output)
