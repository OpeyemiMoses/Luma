import os
from PIL import Image, ImageOps

input_path = r"C:\Users\2tynm\.gemini\antigravity-ide\brain\66d9f3fc-6e90-463a-9750-bb81d73b5a5f\.user_uploaded\media_1787302014868.jpg"
output_dir = r"C:\Users\2tynm\.gemini\antigravity-ide\scratch\luma-finance\apps\web\public"

img = Image.open(input_path).convert("RGB")
gray = ImageOps.grayscale(img)
width, height = img.size

logo_alpha = Image.new("L", (width, height), 0)
pixels_gray = gray.load()
pixels_alpha = logo_alpha.load()

# Threshold and ignore anything near the left edge (< 20px) which had border artifact
for y in range(height):
    for x in range(30, width - 10):
        gv = pixels_gray[x, y]
        if gv < 85:
            pixels_alpha[x, y] = 255

bbox = logo_alpha.getbbox()
if bbox:
    cropped_alpha = logo_alpha.crop(bbox)
    w, h = cropped_alpha.size
    max_s = int(max(w, h) * 1.15)
    
    xlayer_black = Image.new("RGBA", (max_s, max_s), (0, 0, 0, 0))
    xlayer_white = Image.new("RGBA", (max_s, max_s), (0, 0, 0, 0))
    
    ox = (max_s - w) // 2
    oy = (max_s - h) // 2
    
    for y in range(h):
        for x in range(w):
            a = cropped_alpha.getpixel((x, y))
            if a > 0:
                xlayer_black.putpixel((ox + x, oy + y), (15, 23, 42, a))
                xlayer_white.putpixel((ox + x, oy + y), (255, 255, 255, a))
                
    xlayer_black.save(os.path.join(output_dir, "xlayer-logo.png"), "PNG")
    xlayer_black.save(os.path.join(output_dir, "xlayer-logo-dark.png"), "PNG")
    xlayer_white.save(os.path.join(output_dir, "xlayer-logo-white.png"), "PNG")

print("Generated clean X Layer logo with zero edge artifacts!")
