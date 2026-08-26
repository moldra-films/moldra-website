import os
import cv2
import numpy as np
import exifread
import imagehash
from PIL import Image
import mediapipe as mp
from datetime import datetime

# Initialize MediaPipe Face Mesh module (instantiated dynamically to prevent memory leaks)
mp_face_mesh = mp.solutions.face_mesh

class CullingAI:
    @staticmethod
    def calculate_sharpness(img_gray: np.ndarray, bbox: tuple = None) -> float:
        """
        Calculates sharpness score using Laplacian Variance.
        If a bounding box (bbox) is provided, computes focus specifically on that area (e.g., face).
        """
        try:
            target_region = img_gray
            if bbox:
                x, y, w, h = bbox
                # Clamp coordinates to image boundaries
                img_h, img_w = img_gray.shape
                x1, y1 = max(0, x), max(0, y)
                x2, y2 = min(img_w, x + w), min(img_h, y + h)
                if x2 > x1 and y2 > y1:
                    target_region = img_gray[y1:y2, x1:x2]
            
            # Variance of Laplacian (high variance = sharp, low = blurry)
            return float(cv2.Laplacian(target_region, cv2.CV_64F).var())
        except Exception as e:
            print(f"Error calculating sharpness: {e}")
            return 0.0

    @staticmethod
    def calculate_ear(landmarks, eye_indices) -> float:
        """
        Computes the Eye Aspect Ratio (EAR) to detect closed eyes.
        Formula: EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
        """
        # Landmarks: list of normalized coordinates (x, y, z)
        # eye_indices: list of landmark IDs [p1, p2, p3, p4, p5, p6]
        # p1: inner corner, p4: outer corner, p2/p3: top, p5/p6: bottom
        coords = [np.array([landmarks[idx].x, landmarks[idx].y]) for idx in eye_indices]
        
        # Euclidean distances
        d_v1 = np.linalg.norm(coords[1] - coords[5]) # p2 - p6
        d_v2 = np.linalg.norm(coords[2] - coords[4]) # p3 - p5
        d_h = np.linalg.norm(coords[0] - coords[3])  # p1 - p4
        
        if d_h < 1e-6:
            return 0.0
            
        ear = (d_v1 + d_v2) / (2.0 * d_h)
        return float(ear)

    @staticmethod
    def analyze_faces(img_bgr: np.ndarray) -> list:
        """
        Analyzes faces in the image for open eyes and smiles using MediaPipe.
        Returns a list of face analysis dicts.
        """
        h, w, _ = img_bgr.shape
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        detector = mp_face_mesh.FaceMesh(
            max_num_faces=5,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        results = None
        try:
            results = detector.process(img_rgb)
        except Exception as e:
            print(f"Error processing face mesh: {e}")
        finally:
            try:
                detector.close()
            except Exception:
                pass
        
        faces_data = []
        if not results or not results.multi_face_landmarks:
            return faces_data
            
        for face_landmarks in results.multi_face_landmarks:
            landmarks = face_landmarks.landmark
            
            # Eye indices from MediaPipe mesh
            # Left Eye: p1=362, p2=385, p3=386, p4=263, p5=374, p6=373
            left_eye_indices = [362, 385, 386, 263, 374, 373]
            # Right Eye: p1=33, p2=160, p3=158, p4=133, p5=153, p6=144
            right_eye_indices = [33, 160, 158, 133, 153, 144]
            
            left_ear = CullingAI.calculate_ear(landmarks, left_eye_indices)
            right_ear = CullingAI.calculate_ear(landmarks, right_eye_indices)
            average_ear = (left_ear + right_ear) / 2.0
            
            # EAR threshold: usually closed below 0.20-0.23
            eyes_open = average_ear > 0.22
            
            # Smile Detection based on mouth coordinates
            # Mouth corners: 61, 291
            # Lip upper: 0, lower: 17
            mouth_l = np.array([landmarks[61].x, landmarks[61].y])
            mouth_r = np.array([landmarks[291].x, landmarks[291].y])
            lip_t = np.array([landmarks[0].x, landmarks[0].y])
            lip_b = np.array([landmarks[17].x, landmarks[17].y])
            
            mouth_width = np.linalg.norm(mouth_l - mouth_r)
            mouth_height = np.linalg.norm(lip_t - lip_b)
            
            # Simple smile metric (mouth width stretched relative to height & height thin)
            is_smiling = mouth_width > 0.08 and (mouth_height / mouth_width) < 0.35
            
            # Get face bounding box for focus check
            xs = [l.x for l in landmarks]
            ys = [l.y for l in landmarks]
            min_x, max_x = int(min(xs) * w), int(max(xs) * w)
            min_y, max_y = int(min(ys) * h), int(max(ys) * h)
            bbox = (min_x, min_y, max_x - min_x, max_y - min_y)
            
            faces_data.append({
                "ear": average_ear,
                "eyes_open": eyes_open,
                "smiling": is_smiling,
                "bbox": bbox
            })
            
        return faces_data

    @staticmethod
    def extract_capture_time(img_path: str) -> datetime:
        """Reads EXIF metadata to retrieve photo capture time."""
        try:
            with open(img_path, 'rb') as f:
                tags = exifread.process_file(f, details=False)
                date_str = tags.get('EXIF DateTimeOriginal') or tags.get('Image DateTime')
                if date_str:
                    return datetime.strptime(str(date_str), "%Y:%m:%d %H:%M:%S")
        except Exception as e:
            print(f"Error reading EXIF for {img_path}: {e}")
            
        # Fallback to filesystem creation/modified time
        try:
            return datetime.fromtimestamp(os.path.getmtime(img_path))
        except Exception:
            return datetime.now()

    @staticmethod
    def run_culling_on_images(image_paths: list) -> list:
        """
        Runs culling pipeline over a list of image paths (proxies or converted JPEGs).
        Computes sharpness, face status, and groups similar/duplicate burst photos.
        """
        analyzed_list = []
        
        for path in image_paths:
            if not os.path.exists(path):
                continue
                
            img = cv2.imread(path)
            if img is None:
                continue
                
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # AI Face Analysis
            faces = CullingAI.analyze_faces(img)
            
            # Sharpness (overall center or face-specific)
            if faces:
                # Use first face bbox for sharpness
                sharpness = CullingAI.calculate_sharpness(gray, faces[0]["bbox"])
                eyes_open = all(f["eyes_open"] for f in faces)
                smiling = any(f["smiling"] for f in faces)
                faces_count = len(faces)
            else:
                # Fallback to center crop
                h, w = gray.shape
                center_bbox = (int(w * 0.25), int(h * 0.25), int(w * 0.5), int(h * 0.5))
                sharpness = CullingAI.calculate_sharpness(gray, center_bbox)
                eyes_open = True
                smiling = False
                faces_count = 0
                
            # Perceptual hash for visual similarity clustering
            try:
                pil_img = Image.open(path)
                p_hash = str(imagehash.difference_hash(pil_img))
            except Exception:
                p_hash = ""
                
            # EXIF timestamp
            capture_time = CullingAI.extract_capture_time(path)
            
            analyzed_list.append({
                "path": path,
                "filename": os.path.basename(path),
                "sharpness": sharpness,
                "faces_count": faces_count,
                "eyes_open": eyes_open,
                "smiling": smiling,
                "hash": p_hash,
                "time": capture_time,
                "group_id": None,
                "is_hero": False,
                "stars": 0,
                "color_label": "None"
            })
            
        # Group duplicates/bursts
        # Criteria: taken within 3 seconds of each other AND hash distance <= 12
        analyzed_list.sort(key=lambda x: x["time"])
        group_id_counter = 1
        
        for i, item in enumerate(analyzed_list):
            if item["group_id"] is not None:
                continue
                
            item["group_id"] = group_id_counter
            
            # Look forward to find burst matches
            for j in range(i + 1, len(analyzed_list)):
                other = analyzed_list[j]
                if other["group_id"] is not None:
                    continue
                    
                time_diff = abs((other["time"] - item["time"]).total_seconds())
                if time_diff > 4.0:
                    # Break early because list is sorted by time
                    break
                    
                # Compare hashes
                try:
                    hash1 = imagehash.hex_to_hash(item["hash"])
                    hash2 = imagehash.hex_to_hash(other["hash"])
                    hash_diff = hash1 - hash2
                except Exception:
                    hash_diff = 999
                    
                if hash_diff <= 12:
                    other["group_id"] = group_id_counter
                    
            group_id_counter += 1
            
        # Select the "Hero" photo for each group
        # The hero should be the sharpest image where eyes are open
        groups = {}
        for item in analyzed_list:
            g_id = item["group_id"]
            if g_id not in groups:
                groups[g_id] = []
            groups[g_id].append(item)
            
        for g_id, members in groups.items():
            # Filter members where eyes are open (if faces exist)
            valid_members = [m for m in members if m["eyes_open"] or m["faces_count"] == 0]
            if not valid_members:
                valid_members = members # fallback to all if everyone has eyes closed
                
            # Pick sharpest one
            hero = max(valid_members, key=lambda x: x["sharpness"])
            hero["is_hero"] = True
            hero["stars"] = 5
            hero["color_label"] = "Green"
            
            # Mark other duplicates in group with low ratings / red label if blurry
            for m in members:
                if m != hero:
                    if m["sharpness"] < (hero["sharpness"] * 0.6):
                        m["stars"] = 1
                        m["color_label"] = "Red"  # Out of focus
                    else:
                        m["stars"] = 3
                        m["color_label"] = "Blue"  # Good duplicate but not hero
                        
        return analyzed_list

    @staticmethod
    def generate_xmp_sidecar(image_path: str, stars: int, color_label: str) -> str:
        """
        Creates a Lightroom/Capture One compatible .xmp sidecar metadata file.
        Saves it in the same directory as the image with '.xmp' extension.
        """
        # Ex: image.CR2 -> image.xmp
        base_path, _ = os.path.splitext(image_path)
        xmp_path = base_path + ".xmp"
        
        # Map color label to standard Adobe label terms
        # Standard color labels in Lightroom: Red, Yellow, Green, Blue, Purple
        adobe_label = "None"
        if color_label in ["Red", "Yellow", "Green", "Blue", "Purple"]:
            adobe_label = color_label
            
        xmp_content = f"""<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c140 79.160451, 2017/05/06-01:02:15        ">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
    xmlns:xmpLightroom="http://ns.adobe.com/xap/1.0/g/led/"
   xmp:Rating="{stars}"
   xmp:Label="{adobe_label}">
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
"""
        try:
            with open(xmp_path, "w", encoding="utf-8") as f:
                f.write(xmp_content)
            return xmp_path
        except Exception as e:
            print(f"Error creating XMP file at {xmp_path}: {e}")
            return ""
