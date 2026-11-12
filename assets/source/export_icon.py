"""Build the browser favicon from the approved transparent logo (Pillow)."""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parents[1]
with Image.open(assets / 'logo.png') as image:
    if image.mode != 'RGBA' or image.size != (1024, 1024):
        raise ValueError('Expected the approved 1024 x 1024 RGBA logo')
    image.save(assets / 'favicon.ico', format='ICO',
               sizes=[(size, size) for size in (16, 24, 32, 48, 64, 128, 256)])
print('Saved assets/favicon.ico')
