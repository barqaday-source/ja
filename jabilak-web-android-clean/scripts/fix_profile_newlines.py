from pathlib import Path
path = Path("app/(tabs)/profile.tsx")
text = path.read_text()
text = text.replace("\\n", "\n")
path.write_text(text)
print("fixed literal newlines in", path)
