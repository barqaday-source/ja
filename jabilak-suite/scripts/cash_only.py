from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
APPS = [ROOT / "apps" / name for name in ("customer-panel", "merchant-panel", "admin-panel")]

# Make the shared admin settings explicitly cash-only: no bank account, IBAN, or wallet data.
payment_type = '''  payment: {
    method: "cash";
    label: string;
    instructions: string;
  };'''
payment_value = '''  payment: {
    method: "cash",
    label: "الدفع النقدي فقط",
    instructions: "يتم الدفع نقداً عند الاستلام أو مباشرةً مع إدارة المتجر. لا نطلب أي تحويل بنكي أو بيانات بطاقة.",
  },'''
for app in APPS:
    settings = app / "lib" / "admin-settings.ts"
    text = settings.read_text()
    text = re.sub(r'  payment: \{\n    bankName: string;.*?\n  \};', payment_type, text, count=1, flags=re.S)
    text = re.sub(r'  payment: \{\n    bankName: "مصرف الرافدين",.*?\n    \],\n  \},', payment_value, text, count=1, flags=re.S)
    settings.write_text(text)

    config = app / "lib" / "payment-config.ts"
    if config.exists():
        text = config.read_text()
        if 'export type LocalPaymentMethod' in text:
            text = re.sub(r'export type LocalPaymentMethod = .*?;\nexport const LOCAL_PAYMENT_METHODS:.*?\n\];', '''export type LocalPaymentMethod = "cash";
export const LOCAL_PAYMENT_METHODS: Array<{ id: LocalPaymentMethod; label: string; description: string; available: boolean }> = [
  { id: "cash", label: "الدفع النقدي فقط", description: "الدفع نقداً عند الاستلام أو مباشرةً مع إدارة المتجر", available: true },
];''', text, count=1, flags=re.S)
        config.write_text(text)

# Remove external-payment language and make every visible payment choice cash-only.
for app in APPS:
    for path in app.rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx", ".js", ".jsx", ".py"}:
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            continue
        original = text
        text = text.replace('useState("بطاقة إلكترونية")', 'useState("الدفع النقدي")')
        text = text.replace('setPaymentMethod("مصرف الرافدين")', 'setPaymentMethod("الدفع النقدي")')
        text = text.replace('const walletChannels = getAdminSettings().payment.walletChannels;', 'const walletChannels = [{ name: "الدفع النقدي", accountName: "", accountNumber: "" }];')
        text = text.replace('const walletChannels = getAdminSettings().payment.walletChannels;', 'const walletChannels = [{ name: "الدفع النقدي", accountName: "", accountNumber: "" }];')
        text = text.replace('اختر محفظة معتمدة، ادفع خارج التطبيق، ثم أدخل رقم المرجع أو ارفع معلومات الدفع للمراجعة.', 'اختر الدفع النقدي وأكّد جاهزيتك للدفع عند الاستلام أو مباشرةً مع إدارة المتجر.')
        text = text.replace('اختر وسيلة دفع لإكمال طلب النشر.', 'اختر الدفع النقدي لإكمال طلب النشر.')
        text = text.replace('أكمل الدفع أولاً", "أكد نجاح الدفع التجريبي قبل إرسال الإعلان للمراجعة.', 'أكّد الدفع النقدي أولاً", "أكد اختيار الدفع النقدي قبل إرسال الإعلان للمراجعة.')
        text = text.replace('تمت إضافة إيصال التحويل للمراجعة', 'تمت إضافة ملاحظة الدفع النقدي للمراجعة')
        text = text.replace('رفع صورة إيصال التحويل', 'إضافة ملاحظة الدفع النقدي')
        text = text.replace('وسيلة الدفع خارج التطبيق', 'طريقة الدفع: نقداً فقط')
        text = text.replace('المحفظة: ${walletChannels[0]?.name || "محفظة معتمدة"}', 'طريقة الدفع: الدفع النقدي')
        text = text.replace('المستفيد: ${walletChannels[0]?.accountName || PAYMENT_ACCOUNT.beneficiary}', '')
        text = text.replace('الدفع يتم خارج التطبيق عبر المحافظ المعتمدة فقط.', 'الدفع نقداً فقط عند الاستلام أو مباشرةً مع إدارة المتجر، ولا نربط التطبيق بأي بنك.')
        text = text.replace('الدفع يتم خارج التطبيق عبر المحافظ المعتمدة', 'الدفع نقداً فقط عند الاستلام أو مباشرةً مع إدارة المتجر')
        text = text.replace('const [walletIndex, setWalletIndex] = useState(0);', 'const [walletIndex, setWalletIndex] = useState(0);')
        text = text.replace('walletChannels[walletIndex]?.name || "محفظة معتمدة"', '"الدفع النقدي فقط"')
        text = text.replace('walletChannels[walletIndex]?.accountNumber || "يضاف من الإدارة"', '"عند الاستلام أو مباشرةً مع إدارة المتجر"')
        text = text.replace('الدفع الخارجي', 'الدفع النقدي')
        text = text.replace('محفظة معتمدة', 'الدفع النقدي')
        text = text.replace('تحويل عبر محفظة زين كاش', 'الدفع نقداً عند الاستلام')
        text = text.replace('تحويل عبر محفظة آسيا حوالة', 'الدفع نقداً عند الاستلام')
        text = text.replace('دفع رقمي عبر OKX', 'الدفع نقداً عند الاستلام')
        text = text.replace('OKX', 'الدفع النقدي')
        if text != original:
            path.write_text(text)

# In cash-only verification, a reference number is not required.
for app in (APPS[0], APPS[1], APPS[2]):
    path = app / "app" / "verify-account.tsx"
    text = path.read_text()
    text = text.replace('if (!paymentSubmitted || !paymentReference.trim())', 'if (!paymentSubmitted)')
    text = text.replace('رقم المرجع أو وصف معلومات الدفع', 'ملاحظات الدفع النقدي (اختياري)')
    path.write_text(text)

print("Configured all payment flows as cash-only; removed bank, wallet, card, and OKX options from the UI/config.")
