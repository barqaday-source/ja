from pathlib import Path
from io import BytesIO
import base64
import urllib.request
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT_URL = "https://github.com/google/fonts/raw/main/ofl/alexbrush/AlexBrush-Regular.ttf"
font_path = ROOT / "scripts" / "AlexBrush-Regular.ttf"
if not font_path.exists():
    urllib.request.urlretrieve(FONT_URL, font_path)

for app_name in ("customer-panel", "merchant-panel", "admin-panel"):
    images = ROOT / "apps" / app_name / "assets" / "images"
    source = Image.open(images / "splash-icon.png").convert("RGBA")
    canvas = Image.new("RGBA", (1024, 1220), (255, 255, 255, 255))
    # Keep the app icon prominent and reserve a clear, balanced lockup below it.
    icon = source.resize((620, 620), Image.Resampling.LANCZOS)
    canvas.alpha_composite(icon, ((1024 - icon.width) // 2, 60))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(str(font_path), 144)
    label = "Salix"
    box = draw.textbbox((0, 0), label, font=font)
    x = (1024 - (box[2] - box[0])) // 2
    y = 760
    draw.text((x, y), label, font=font, fill=(76, 123, 67, 255), stroke_width=0)
    # Expo's contain mode preserves the transparent-safe composition; the white background
    # matches the configured splash background on every platform.
    canvas.save(images / "splash-icon.png", optimize=True)
print("Created Salix splash lockups for customer, merchant, and admin apps.")
