import fitz  # PyMuPDF
from PIL import Image
from pathlib import Path

# Path to your PDF
pdf_path = "/vol/bitbucket/nc624/paperHub/nature-insights-hub/data/SAMMED2D.pdf"

# Folder to save images
output_folder = Path("/vol/bitbucket/nc624/paperHub/nature-insights-hub/data/PDFimages")
output_folder.mkdir(exist_ok=True)

# Open the PDF
doc = fitz.open(pdf_path)

for i, page in enumerate(doc):
    # Render page to an image (pixmap)
    pix = page.get_pixmap()
    
    # Save pixmap to a temporary PNG
    temp_image_path = output_folder / f"page_{i+1}_temp.png"
    pix.save(temp_image_path)
    
    # Open with PIL to resize
    image = Image.open(temp_image_path)
    width, height = image.size
    image_resized = image.resize((int(width*0.5), int(height*0.5)))
    
    # Save resized image
    final_image_path = output_folder / f"page_{i+1}.png"
    image_resized.save(final_image_path)
    
    # Remove the temporary image if you want
    temp_image_path.unlink()

print(f"Saved {len(doc)} pages to {output_folder}/")