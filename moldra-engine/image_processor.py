import os
import shutil
import rawpy
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import exifread
from concurrent.futures import ProcessPoolExecutor
from datetime import datetime

# Root directory for Moldra Engine projects
PROJECTS_ROOT = os.path.expanduser("~/Documents/meus projetos antigravity/moldra-films/Moldra_Projects")

class ImageProcessor:
    @staticmethod
    def create_project_structure(project_name: str) -> dict:
        """
        Creates directory structure for a project:
        Moldra_Projects/[Project_Name]/[Original | Proxies | Editadas | Prontas]
        """
        if not project_name:
            project_name = datetime.now().strftime("%Y-%m-%d_Project")
            
        proj_dir = os.path.join(PROJECTS_ROOT, project_name)
        paths = {
            "root": proj_dir,
            "original": os.path.join(proj_dir, "Original"),
            "proxies": os.path.join(proj_dir, "Proxies"),
            "editadas": os.path.join(proj_dir, "Editadas"),
            "prontas": os.path.join(proj_dir, "Prontas")
        }
        
        for name, path_dir in paths.items():
            os.makedirs(path_dir, exist_ok=True)
            
        return paths

    @staticmethod
    def extract_embedded_jpeg(raw_path: str, output_jpg_path: str) -> bool:
        """
        Quickly extracts the embedded JPEG preview from a RAW file.
        Falls back to rawpy postprocess if no embedded thumbnail is found.
        """
        # Try rawpy's built-in thumbnail extractor first (extremely fast)
        try:
            with rawpy.imread(raw_path) as raw:
                try:
                    thumb = raw.extract_thumb()
                    if thumb.format == rawpy.ThumbFormat.JPEG:
                        with open(output_jpg_path, 'wb') as f:
                            f.write(thumb.data)
                        # Resize to standard proxy size (max 1920 width/height)
                        ImageProcessor.resize_to_proxy(output_jpg_path)
                        return True
                except (rawpy.LibRawNoThumbnailError, rawpy.LibRawUnsupportedThumbnailTypeError):
                    pass
                
                # If extract_thumb fails or format is not JPEG, render a half-size thumbnail (fast)
                rgb = raw.postprocess(half_size=True, use_camera_wb=True)
                img = Image.fromarray(rgb)
                img.thumbnail((1920, 1920))
                img.save(output_jpg_path, "JPEG", quality=85)
                return True
        except Exception as e:
            print(f"Error extracting preview from raw {raw_path}: {e}")
            
        # Try exifread fallback if rawpy failed completely
        try:
            with open(raw_path, 'rb') as f:
                tags = exifread.process_file(f, details=False)
                if 'JPEGThumbnail' in tags:
                    with open(output_jpg_path, 'wb') as out_f:
                        out_f.write(tags['JPEGThumbnail'])
                    ImageProcessor.resize_to_proxy(output_jpg_path)
                    return True
        except Exception as e:
            print(f"Exifread fallback extraction error for {raw_path}: {e}")
            
        return False

    @staticmethod
    def resize_to_proxy(jpg_path: str, max_size=1920):
        """Resizes a JPEG image to max_size preserving aspect ratio for proxy loading."""
        try:
            with Image.open(jpg_path) as img:
                img.thumbnail((max_size, max_size))
                img.save(jpg_path, "JPEG", quality=85)
        except Exception as e:
            print(f"Error resizing proxy {jpg_path}: {e}")

    @staticmethod
    def process_adjustment(img_np: np.ndarray, adjustments: dict) -> np.ndarray:
        """
        Applies batch adjustments (Exposure, Contrast, WB, Sharpness, Noise) to an image.
        Uses optimized OpenCV operations.
        """
        # Copy image to avoid mutating original
        out = img_np.copy()
        
        # 1. Exposure (Brightness)
        exposure = adjustments.get("exposure", 0.0) # range -3.0 to 3.0
        if exposure != 0.0:
            scale = 2.0 ** exposure
            out = cv2.multiply(out, np.array([scale]))
            
        # 2. Contrast
        contrast = adjustments.get("contrast", 0.0) # range -1.0 to 1.0
        if contrast != 0.0:
            factor = (259 * (contrast * 128 + 255)) / (255 * (259 - contrast * 128))
            out = cv2.addWeighted(out, factor, out, 0, 128 * (1 - factor))
            
        # 3. White Balance (Temp/Tint adjustments via color gains)
        temp = adjustments.get("temp", 0.0) # range -1.0 to 1.0 (blue to amber)
        tint = adjustments.get("tint", 0.0) # range -1.0 to 1.0 (green to magenta)
        if temp != 0.0 or tint != 0.0:
            # Simple color balance matrix multiplication
            r_gain = 1.0 + temp * 0.15 - tint * 0.05
            g_gain = 1.0 + tint * 0.15
            b_gain = 1.0 - temp * 0.15 - tint * 0.05
            
            # Clamp gains to positive values
            r_gain, g_gain, b_gain = max(0.1, r_gain), max(0.1, g_gain), max(0.1, b_gain)
            
            # Split and multiply channels
            b, g, r = cv2.split(out)
            b = cv2.multiply(b, np.array([b_gain]))
            g = cv2.multiply(g, np.array([g_gain]))
            r = cv2.multiply(r, np.array([r_gain]))
            out = cv2.merge([b, g, r])

        # 4. Saturation
        saturation = adjustments.get("saturation", 0.0) # range -1.0 to 1.0
        if saturation != 0.0:
            hsv = cv2.cvtColor(out, cv2.COLOR_BGR2HSV).astype(np.float32)
            h, s, v = cv2.split(hsv)
            s = s * (1.0 + saturation)
            s = np.clip(s, 0, 255)
            hsv = cv2.merge([h, s, v])
            out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
            
        # 5. Sharpness (Unsharp Mask)
        sharpness = adjustments.get("sharpness", 0.0) # range 0.0 to 1.0
        if sharpness > 0.0:
            blurred = cv2.GaussianBlur(out, (5, 5), 1.0)
            out = cv2.addWeighted(out, 1.0 + sharpness * 1.5, blurred, -sharpness * 1.5, 0)
            
        # 6. Noise Reduction (Bilateral Filter)
        noise_reduction = adjustments.get("noiseReduction", 0.0) # range 0.0 to 1.0
        if noise_reduction > 0.0:
            d = int(5 + noise_reduction * 4) # diameter
            sigma_color = noise_reduction * 50
            sigma_space = noise_reduction * 50
            out = cv2.bilateralFilter(out, d, sigma_color, sigma_space)
            
        # Ensure values stay in 0-255 range and type is uint8
        out = np.clip(out, 0, 255).astype(np.uint8)
        return out

    @staticmethod
    def apply_watermark(img_pil: Image.Image, text: str = "Moldra Films") -> Image.Image:
        """Applies a subtle, elegant watermark to the bottom-right corner of the image."""
        img_w, img_h = img_pil.size
        draw = ImageDraw.Draw(img_pil)
        
        # Load default font or fallback
        try:
            # Try to load a premium sans font if it exists on macOS
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(img_h * 0.025))
        except IOError:
            font = ImageFont.load_default()
            
        # Watermark text customization
        watermark_text = f"© {datetime.now().year} {text}"
        
        # Calculate bounding box
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        # Bottom-right padding
        margin_x = int(img_w * 0.03)
        margin_y = int(img_h * 0.03)
        x = img_w - text_w - margin_x
        y = img_h - text_h - margin_y
        
        # Draw a semi-transparent drop shadow
        draw.text((x + 2, y + 2), watermark_text, font=font, fill=(0, 0, 0, 80))
        # Draw main watermark in elegant white/off-white with opacity
        draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, 140))
        
        return img_pil

    @staticmethod
    def export_worker(task: dict) -> bool:
        """
        Isolated worker task meant to run in a separate process for multi-threaded performance.
        Renders RAW, applies adjustments, adds watermark, and saves final JPEG.
        """
        raw_path = task["raw_path"]
        output_path = task["output_path"]
        adjustments = task.get("adjustments", {})
        watermark_text = task.get("watermark_text", "Moldra Films")
        scale_max_dim = task.get("scale_max_dim", 0) # 0 means full res

        try:
            # 1. Read RAW image
            img_np = None
            is_raw = not (raw_path.lower().endswith('.jpg') or raw_path.lower().endswith('.jpeg'))
            
            if is_raw:
                with rawpy.imread(raw_path) as raw:
                    # Render raw at high quality
                    rgb = raw.postprocess(use_camera_wb=True, half_size=False)
                    # Convert to BGR for OpenCV
                    img_np = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
            else:
                img_np = cv2.imread(raw_path)

            if img_np is None:
                raise ValueError(f"Could not load image {raw_path}")

            # 2. Apply exposure, contrast, white balance adjustments
            adjusted_np = ImageProcessor.process_adjustment(img_np, adjustments)

            # 3. Convert back to RGB for PIL watermarking
            adjusted_rgb = cv2.cvtColor(adjusted_np, cv2.COLOR_BGR2RGB)
            final_img = Image.fromarray(adjusted_rgb)

            # 4. Scale down if custom size requested
            if scale_max_dim > 0:
                final_img.thumbnail((scale_max_dim, scale_max_dim))

            # 5. Apply watermark
            if watermark_text:
                final_img = ImageProcessor.apply_watermark(final_img, watermark_text)

            # 6. Save final JPEG
            final_img.save(output_path, "JPEG", quality=95)
            return True
        except Exception as e:
            print(f"Failed exporting raw {raw_path} to {output_path}: {e}")
            return False
