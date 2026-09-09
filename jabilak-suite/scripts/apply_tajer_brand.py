from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APPS = [ROOT / "apps" / name for name in ("customer-panel", "merchant-panel", "admin-panel")]

# Apply the requested Arabic font to every web entrypoint.
font_import = "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');\n"
for app in APPS:
    css = app / "global.css"
    text = css.read_text()
    if "fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic" not in text:
        text = font_import + text
    text = text.replace("font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;", "font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;")
    if "font-family: 'IBM Plex Sans Arabic'" not in text:
        text = text.replace("body {\n  margin: 0;", "body {\n  margin: 0;\n  font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;")
    text = text.replace("font-family: 'IBM Plex Sans Arabic', sans-serif;", "font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;")
    if "--font-main" not in text:
        text += "\n:root {\n  --font-main: 'IBM Plex Sans Arabic', system-ui, sans-serif;\n}\n"
    css.write_text(text)

# Rename visible brand references while preserving technical bundle/package identifiers.
replacements = {
    "جَايَبْلَك": "تاجر",
    "جَايَبْلَك": "تاجر",
    "جايبلك": "تاجر",
    "جَايَبْلَك": "تاجر",
    "JabilakRepositories": "TajerRepositories",
}
for app in APPS:
    for path in app.rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx", ".js", ".jsx", ".json", ".py", ".md"}:
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            continue
        updated = text
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        if updated != text:
            path.write_text(updated)

# Update Expo display names and permission copy in all app configurations.
for app in APPS:
    config = app / "app.config.ts"
    text = config.read_text()
    text = text.replace('appName: "جَايَبْلَك"', 'appName: "تاجر"')
    text = text.replace('photosPermission: "اسمح لتاجر', 'photosPermission: "اسمح لتاجر')
    text = text.replace('savePhotosPermission: "اسمح لتاجر', 'savePhotosPermission: "اسمح لتاجر')
    text = text.replace('photosPermission: "اسمح لجايبلك', 'photosPermission: "اسمح لتاجر')
    text = text.replace('savePhotosPermission: "اسمح لجايبلك', 'savePhotosPermission: "اسمح لتاجر')
    # Avoid a stale remote logo path; Expo now uses the checked-in Tajer store icon.
    text = text.replace('logoUrl: "/manus-storage/icon_a1b73ba5.png"', 'logoUrl: "./assets/images/icon.png"')
    config.write_text(text)

print("Applied IBM Plex Sans Arabic web typography and Tajer branding to 3 Expo apps.")
