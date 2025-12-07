import fitz  # PyMuPDF
from pathlib import Path

# Path to your PDF
pdf_path = "/vol/bitbucket/nc624/paperHub/nature-insights-hub/data/SAMMED2D.pdf"

# Folder to save images
output_folder = Path("/vol/bitbucket/nc624/paperHub/nature-insights-hub/data/PDFimages")
output_folder.mkdir(exist_ok=True)

# Open the PDF
doc = fitz.open(pdf_path)

for i, page in enumerate(doc):
    # Render page at default resolution (no zoom)
    pix = page.get_pixmap()
    
    # Save image directly
    final_image_path = output_folder / f"page_{i+1}.png"
    pix.save(final_image_path)

print(f"Saved {len(doc)} pages to {output_folder}/")
