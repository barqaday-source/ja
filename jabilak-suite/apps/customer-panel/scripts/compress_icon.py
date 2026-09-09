from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/tajer-mobile/assets/images')
source = root / 'icon.png'
image = Image.open(source).convert('RGBA')
image.thumbnail((512, 512), Image.Resampling.LANCZOS)
for name in ('icon.png', 'splash-icon.png', 'favicon.png', 'android-icon-foreground.png'):
    image.save(root / name, format='PNG', optimize=True, compress_level=9)
print(source.stat().st_size)
