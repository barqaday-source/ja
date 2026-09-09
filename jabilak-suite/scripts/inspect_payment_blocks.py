from pathlib import Path
for path in Path('apps').glob('*/app/create-ad.tsx'):
    text = path.read_text()
    start = text.find('{isPromotional && <View style={[styles.bankDetails')
    end = text.find('<View style={styles.consentRow}', start)
    print(path, start, end)
    print(text[start:end][:5000])
