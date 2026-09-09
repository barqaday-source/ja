from PIL import Image, ImageDraw

SIZE = 1024
image = Image.new("RGB", (SIZE, SIZE), "#FFFFFF")
draw = ImageDraw.Draw(image)
black = "#111827"

# Bold geometric storefront silhouette.
# Roof and awning.
draw.polygon([(170, 360), (854, 360), (790, 205), (234, 205)], fill=black)
draw.rectangle((150, 360, 874, 440), fill=black)

# Minimal awning cut-outs to preserve a flat icon silhouette.
for x in (205, 350, 495, 640, 785):
    draw.rectangle((x, 360, x + 70, 440), fill="#FFFFFF")

# Store body and centered door.
draw.rounded_rectangle((185, 440, 839, 790), radius=28, fill=black)
draw.rounded_rectangle((455, 520, 569, 790), radius=14, fill="#FFFFFF")

# Two clean windows.
draw.rounded_rectangle((250, 520, 385, 650), radius=16, fill="#FFFFFF")
draw.rounded_rectangle((639, 520, 774, 650), radius=16, fill="#FFFFFF")

# Ground line.
draw.rounded_rectangle((170, 820, 854, 858), radius=19, fill=black)

for path in (
    "assets/images/icon.png",
    "assets/images/splash-icon.png",
    "assets/images/favicon.png",
    "assets/images/android-icon-foreground.png",
):
    image.save(path, "PNG", optimize=True)
