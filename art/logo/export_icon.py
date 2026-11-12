"""Convert the Blender RGBA render into a multi-resolution Windows icon."""
from pathlib import Path
import hashlib
import json

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parents[1] / "apps" / "web" / "assets"
png = ASSETS / "icon.png"
ico = ASSETS / "icon.ico"

with Image.open(png) as source:
    source.load()
    if source.mode != "RGBA" or source.size != (1024, 1024):
        raise ValueError("Expected a square 1024-pixel RGBA Blender render")
    alpha = source.getchannel("A")
    if alpha.getextrema() != (0, 255):
        raise ValueError("Expected transparent background and opaque cell pixels")
    bounds = alpha.getbbox()
    if bounds is None or bounds[0] == 0 or bounds[1] == 0 or bounds[2] == 1024 or bounds[3] == 1024:
        raise ValueError("The cell must have a transparent margin on all four sides")
    margins = [bounds[0], bounds[1], 1024 - bounds[2], 1024 - bounds[3]]
    center = [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2]
    occupancy = max(bounds[2] - bounds[0], bounds[3] - bounds[1]) / 1024
    if max(abs(center[0] - 512), abs(center[1] - 512)) > 20.48:
        raise ValueError("Cell bounds must be centered within two percent of the square")
    if not 0.84 <= occupancy <= 0.90:
        raise ValueError(f"Expected 84–90 percent maximum-dimension occupancy: {occupancy}")
    sizes = [(s, s) for s in (16, 24, 32, 48, 64, 128, 256)]
    source.save(ico, format="ICO", sizes=sizes)

with Image.open(ico) as icon:
    actual_sizes = sorted(icon.ico.sizes())
    if actual_sizes != sorted(sizes):
        raise ValueError(f"Missing icon sizes: {actual_sizes}")
    sheet = Image.new("RGB", (1200, 640), "white")
    draw = ImageDraw.Draw(sheet)
    draw.rectangle((0, 320, 1199, 639), fill="#111b24")
    for index, size in enumerate((16, 32, 48, 256)):
        frame = icon.ico.getimage((size, size)).convert("RGBA")
        for row in range(2):
            center_x, center_y = 150 + index * 300, 150 + row * 320
            sheet.paste(frame, (center_x - size // 2, center_y - size // 2), frame)
            draw.text((center_x - 20, row * 320 + 295), f"{size} x {size}", fill="#111b24" if row == 0 else "white")
    sheet.save(HERE / "icon-contact-sheet.png")

report = {
    "png_dimensions": [1024, 1024],
    "png_mode": "RGBA",
    "alpha_range": [0, 255],
    "alpha_bounds": list(bounds),
    "margins_left_top_right_bottom": margins,
    "bounds_center": center,
    "maximum_dimension_occupancy": occupancy,
    "ico_sizes": [list(size) for size in actual_sizes],
    "sha256": {
        "icon.png": hashlib.sha256(png.read_bytes()).hexdigest(),
        "icon.ico": hashlib.sha256(ico.read_bytes()).hexdigest(),
    },
}
(HERE / "icon-validation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
