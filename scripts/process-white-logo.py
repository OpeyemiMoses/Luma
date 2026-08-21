import os
from PIL import Image, ImageOps, ImageEnhance

input_path = r"C:\Users\2tynm\.gemini\antigravity-ide\brain\66d9f3fc-6e90-463a-9750-bb81d73b5a5f\.user_uploaded\media_1787300822391.png"
output_dir = r"C:\Users\2tynm\.gemini\antigravity-ide\scratch\luma-finance\apps\web\public"

img = Image.open(input_path).convert("RGBA")
width, height = img.size

# Extract alpha channel directly from original PNG
r, g, b, alpha = img.split()
rgb = Image.merge("RGB", (r, g, b))
gray = ImageOps.grayscale(rgb)
gray_norm = ImageOps.autocontrast(gray, cutoff=1)

# 1. Pure White / Luminous Silver Logo on 100% Transparent Background
# The user wants "just the logo in white no background"
white_logo = Image.new("RGBA", (width, height), (0, 0, 0, 0))
pixels_white = white_logo.load()
pixels_gray = gray_norm.load()
pixels_alpha = alpha.load()

for y in range(height):
    for x in range(width):
        a = pixels_alpha[x, y]
        if a > 0:
            gv = pixels_gray[x, y]
            # Map grayscale so highlights are pure 255 white and shadows are silver (200-240)
            # This creates a crisp, gorgeous white logo with subtle 3D depth
            shading = int(210 + (gv / 255.0) * 45)
            pixels_white[x, y] = (shading, shading, shading, a)

# Crop tight bounding box and center in square with pure transparent padding
bbox = alpha.getbbox()
if bbox:
    cropped_white = white_logo.crop(bbox)
    max_side = max(cropped_white.width, cropped_white.height)
    
    square_white = Image.new("RGBA", (max_side, max_side), (0, 0, 0, 0))
    offset_x = (max_side - cropped_white.width) // 2
    offset_y = (max_side - cropped_white.height) // 2
    
    square_white.paste(cropped_white, (offset_x, offset_y), cropped_white)
    
    # Save to all logo files
    square_white.save(os.path.join(output_dir, "luma-logo-white.png"), "PNG")
    square_white.save(os.path.join(output_dir, "luma-logo-square-white.png"), "PNG")
    square_white.save(os.path.join(output_dir, "luma-logo-square-bw.png"), "PNG")
    square_white.save(os.path.join(output_dir, "luma-logo-bw.png"), "PNG")
    square_white.save(os.path.join(output_dir, "luma-logo.png"), "PNG")

print("Generated 100% transparent pure white Luma logo successfully!")
