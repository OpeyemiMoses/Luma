import os
from PIL import Image, ImageOps, ImageEnhance

input_path = r"C:\Users\2tynm\.gemini\antigravity-ide\brain\66d9f3fc-6e90-463a-9750-bb81d73b5a5f\.user_uploaded\media_1787300822391.png"
output_dir = r"C:\Users\2tynm\.gemini\antigravity-ide\scratch\luma-finance\apps\web\public"

# Open original transparent image
img = Image.open(input_path).convert("RGBA")
r, g, b, alpha = img.split()

# Convert RGB to Grayscale
rgb_img = Image.merge("RGB", (r, g, b))
gray = ImageOps.grayscale(rgb_img)

# Auto contrast for crisp dynamic range
gray_enhanced = ImageOps.autocontrast(gray, cutoff=0.5)

# 1. Black & White / Grayscale version for Light Backgrounds (with original transparency)
bw_img = Image.merge("RGBA", (gray_enhanced, gray_enhanced, gray_enhanced, alpha))

# 2. White & Silver version for Dark/Black Backgrounds (e.g. solid black footer)
# Invert tones so the logo becomes luminous white/silver on dark backgrounds
gray_inv = ImageOps.invert(gray_enhanced)
# Boost brightness for dark mode
enhancer = ImageEnhance.Brightness(gray_inv)
gray_white = enhancer.enhance(1.15)
white_img = Image.merge("RGBA", (gray_white, gray_white, gray_white, alpha))

# Trim transparent padding if desired, or keep square
bbox = alpha.getbbox()
if bbox:
    cropped_bw = bw_img.crop(bbox)
    cropped_white = white_img.crop(bbox)
    
    max_side = max(cropped_bw.width, cropped_bw.height)
    square_bw = Image.new("RGBA", (max_side, max_side), (0, 0, 0, 0))
    square_white = Image.new("RGBA", (max_side, max_side), (0, 0, 0, 0))
    
    offset_x = (max_side - cropped_bw.width) // 2
    offset_y = (max_side - cropped_bw.height) // 2
    
    square_bw.paste(cropped_bw, (offset_x, offset_y), cropped_bw)
    square_white.paste(cropped_white, (offset_x, offset_y), cropped_white)
    
    square_bw.save(os.path.join(output_dir, "luma-logo-square-bw.png"), "PNG")
    square_white.save(os.path.join(output_dir, "luma-logo-square-white.png"), "PNG")
    square_bw.save(os.path.join(output_dir, "luma-logo-bw.png"), "PNG")
    square_white.save(os.path.join(output_dir, "luma-logo-white.png"), "PNG")
    square_bw.save(os.path.join(output_dir, "luma-logo.png"), "PNG")

print("Generated clean, 100% transparent B&W logos preserving exact original alpha!")
