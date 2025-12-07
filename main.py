import os
import re
from pathlib import Path
from PIL import Image
import torch
from torchvision import transforms
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from transformers import AutoModelForObjectDetection, AutoProcessor

# --- Configuration ---
INPUT_FOLDER = "/vol/bitbucket/nc624/paperHub/nature-insights-hub/data/PDFimages"
OUTPUT_FOLDER = "/vol/bitbucket/nc624/paperHub/nature-insights-hub/data/output_tables"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# 1️⃣ Force CPU
device = torch.device("cpu")

# 2️⃣ Load model and processor on CPU
model_name = "microsoft/table-transformer-detection"
model = AutoModelForObjectDetection.from_pretrained(model_name, revision="no_timm")
model.to(device)
processor = AutoProcessor.from_pretrained(model_name)

# 3️⃣ Update id2label
id2label = model.config.id2label
id2label[len(id2label)] = "no object"

# --- Image preprocessing ---
class MaxResize:
    def __init__(self, max_size=800):
        self.max_size = max_size
    def __call__(self, image):
        w, h = image.size
        scale = self.max_size / max(w, h)
        return image.resize((int(round(scale*w)), int(round(scale*h))))

detection_transform = transforms.Compose([
    MaxResize(800),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# --- Utility functions ---
def box_cxcywh_to_xyxy(x):
    x_c, y_c, w, h = x.unbind(-1)
    return torch.stack([x_c - 0.5*w, y_c - 0.5*h, x_c + 0.5*w, y_c + 0.5*h], dim=1)

def rescale_bboxes(out_bbox, size):
    img_w, img_h = size
    b = box_cxcywh_to_xyxy(out_bbox)
    return b * torch.tensor([img_w, img_h, img_w, img_h], dtype=torch.float32)

def outputs_to_objects(outputs, img_size, id2label, score_threshold=0.5):
    # Softmax to get predicted labels and scores
    probs = outputs.logits.softmax(-1)
    pred_scores, pred_labels = probs.max(-1)
    pred_labels = pred_labels[0].cpu().numpy()
    pred_scores = pred_scores[0].cpu().numpy()
    
    pred_bboxes = outputs.pred_boxes[0].cpu()
    pred_bboxes = [bbox.tolist() for bbox in rescale_bboxes(pred_bboxes, img_size)]

    objects = []
    for label, score, bbox in zip(pred_labels, pred_scores, pred_bboxes):
        class_label = id2label[int(label)]
        if class_label != "no object" and score >= score_threshold:
            objects.append({"label": class_label, "score": float(score), "bbox": [float(v) for v in bbox]})
    return objects

def visualize_detected_tables(img, objects, out_path=None):
    plt.imshow(img)
    ax = plt.gca()
    for obj in objects:
        bbox = obj["bbox"]
        color = (1, 0, 0.45) if obj["label"]=="table" else (0.95, 0.6, 0.1)
        rect = patches.Rectangle(
            (bbox[0], bbox[1]), bbox[2]-bbox[0], bbox[3]-bbox[1],
            linewidth=2, edgecolor=color, facecolor=color, alpha=0.2
        )
        ax.add_patch(rect)
    plt.axis("off")
    if out_path:
        plt.savefig(out_path, bbox_inches="tight", dpi=150)
    plt.close()

def objects_to_crops(img, objects, padding=10):
    crops = []
    for obj in objects:
        bbox = obj["bbox"]
        x0, y0, x1, y1 = [max(0, v) for v in (bbox[0]-padding, bbox[1]-padding, bbox[2]+padding, bbox[3]+padding)]
        crop_img = img.crop((x0, y0, x1, y1))
        if obj["label"] == "table rotated":
            crop_img = crop_img.rotate(270, expand=True)
        crops.append(crop_img)
    return crops

def sort_pages(files):
    def extract_number(f):
        match = re.search(r'page_(\d+)\.png', f.name)
        return int(match.group(1)) if match else 0
    return sorted(files, key=extract_number)

# --- Main processing ---
image_files = sort_pages(list(Path(INPUT_FOLDER).glob("page_*.png")))

for img_file in image_files:
    image = Image.open(img_file).convert("RGB")
    img_size = image.size
    
    # Preprocess
    pixel_values = detection_transform(image).unsqueeze(0).to(device)

    # Forward pass
    with torch.no_grad():
        outputs = model(pixel_values)
    
    # Extract detected objects
    objects = outputs_to_objects(outputs, img_size, id2label, score_threshold=0.7)

    # Visualization
    vis_path = Path(OUTPUT_FOLDER) / f"{img_file.stem}_boxes.png"
    visualize_detected_tables(image, objects, vis_path)

    # Crop tables
    crops = objects_to_crops(image, objects, padding=10)
    for i, crop_img in enumerate(crops, start=1):
        crop_path = Path(OUTPUT_FOLDER) / f"{img_file.stem}_table_{i}.jpg"
        crop_img.save(crop_path)

    print(f"Processed {img_file.name}: {len(objects)} tables detected")
