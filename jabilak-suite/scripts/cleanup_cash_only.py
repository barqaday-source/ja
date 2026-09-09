from pathlib import Path
import re
root = Path('/home/ubuntu/work/jabilak')
p = root / 'apps/merchant-panel/lib/payment-config.ts'
text = p.read_text()
text = re.sub(r'export type LocalPaymentMethod = .*?;\nexport const LOCAL_PAYMENT_METHODS:.*?\n\];', '''export type LocalPaymentMethod = "cash";
export const LOCAL_PAYMENT_METHODS: Array<{ id: LocalPaymentMethod; label: string; description: string; available: boolean }> = [
  { id: "cash", label: "الدفع النقدي فقط", description: "الدفع نقداً عند الاستلام أو مباشرةً مع إدارة المتجر", available: true },
];''', text, count=1, flags=re.S)
p.write_text(text)
for p in root.glob('apps/*/components/admin-workboard.tsx'):
    text = p.read_text()
    text = text.replace('زين كاش', 'الدفع النقدي').replace('آسيا حوالة', 'الدفع النقدي')
    text = text.replace('مرجع ZC-1042 · إيصال مرفق', 'تأكيد دفع نقدي · بانتظار التدقيق')
    text = text.replace('مرجع AH-7781 · إيصال مرفق', 'تأكيد دفع نقدي · بانتظار التدقيق')
    p.write_text(text)
print('Removed remaining external payment method labels.')
