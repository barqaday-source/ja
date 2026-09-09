from PIL import Image

source = Image.open("assets/images/icon.png").convert("RGBA")
pixels = source.load()
for y in range(source.height):
    for x in range(source.width):
        r, g, b, a = pixels[x, y]
        # White background becomes fully transparent; anti-aliased edges fade naturally.
        luminance = (r + g + b) / 3
        if luminance >= 245:
            pixels[x, y] = (r, g, b, 0)
        else:
            alpha = max(0, min(255, int((245 - luminance) * 5.1)))
            pixels[x, y] = (17, 24, 39, alpha)

for path in (
    "assets/images/icon.png",
    "assets/images/splash-icon.png",
    "assets/images/favicon.png",
    "assets/images/android-icon-foreground.png",
    "assets/images/android-icon-monochrome.png",
):
    source.save(path, "PNG", optimize=True)
