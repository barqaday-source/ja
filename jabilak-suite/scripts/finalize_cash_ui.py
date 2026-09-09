from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

# Rewrite the promotional ad payment UI to show one cash-only method.
p = ROOT / "apps/merchant-panel/app/create-ad.tsx"
text = p.read_text()
text = text.replace('  const walletChannels = [{ name: "الدفع النقدي", accountName: "", accountNumber: "" }];\n', '')
text = text.replace('    const details = `طلب إعلان ترويجي عبر تاجر\\nالمدة: ${promoPlan.label}\\nالإجمالي: ${formatPromotionalAmount(promoPlan)}\\nالمحفظة: الدفع النقدي\\n\\nوسيلة الدفع خارج التطبيق`;', '    const details = `طلب إعلان ترويجي عبر تاجر\\nالمدة: ${promoPlan.label}\\nالإجمالي: ${formatPromotionalAmount(promoPlan)}\\nطريقة الدفع: نقداً فقط\\nلا نربط التطبيق بأي بنك أو محفظة إلكترونية`;' )
text = text.replace('    setCampaignStatus("تم تجهيز تفاصيل الدفع لفتح WhatsApp");', '    setCampaignStatus("تم تجهيز تفاصيل الدفع النقدي للتواصل مع الإدارة");')
text = re.sub(r'\{isPromotional && <View style=\{\[styles\.bankDetails.*?</View>\}', '{isPromotional && <View style={[styles.cashNotice, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}35` }]}><MaterialIcons name="payments" size={21} color={colors.primary} /><View style={styles.cashNoticeCopy}><Text style={[styles.cashNoticeTitle, { color: colors.foreground }]}>الدفع النقدي فقط</Text><Text style={[styles.cashNoticeText, { color: colors.muted }]}>يتم الدفع نقداً عند الاستلام أو مباشرةً مع إدارة المتجر. لا نربط التطبيق بأي بنك أو محفظة إلكترونية.</Text></View></View>}', text, count=1, flags=re.S)
text = text.replace('الدفع خارج التطبيق · لا نطلب إدخال بيانات البطاقة أو تحويل مباشر داخل تاجر', 'الدفع نقداً فقط · لا نطلب إدخال بيانات البطاقة أو أي تحويل بنكي داخل تاجر')
text = text.replace('أرسلت معلومات الدفع للمراجعة', 'أكّدت الدفع النقدي للمراجعة')
text = text.replace('تأكيد نجاح الدفع', 'تأكيد الدفع النقدي')
text = text.replace('إرسال تفاصيل الدفع عبر WhatsApp', 'التواصل مع الإدارة عبر WhatsApp')
# Ensure the method list is a single explicit cash option.
text = re.sub(r'\{walletChannels\.map\(\(wallet\) => wallet\.name\)\.map\(\(method\) => .*?</View>\}</View>', '{["الدفع النقدي فقط"].map((method) => <Pressable key={method} onPress={() => setPaymentMethod(method)} style={({ pressed }) => [styles.paymentChoice, { backgroundColor: colors.surface, borderColor: paymentMethod === method ? colors.primary : colors.border, opacity: pressed ? 0.75 : 1 }]}><View style={[styles.radio, { borderColor: paymentMethod === method ? colors.primary : colors.border }]}>{paymentMethod === method && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}</View><Text style={[styles.paymentText, { color: colors.foreground }]}>{method}</Text><MaterialIcons name="payments" size={19} color={colors.primary} /></Pressable>)}</View>', text, count=1, flags=re.S)
text = text.replace('  paymentConfirm: {', '  cashNotice: { minHeight: 62, borderWidth: 1, borderRadius: 14, padding: 11, flexDirection: "row-reverse", alignItems: "center", gap: 8 }, cashNoticeCopy: { flex: 1, alignItems: "flex-end" }, cashNoticeTitle: { fontSize: 12, fontWeight: "900" }, cashNoticeText: { fontSize: 10, lineHeight: 16, textAlign: "right", marginTop: 3 }, paymentConfirm: {')
p.write_text(text)

# Update admin payment queue copy and remove references to external payment channels.
for p in ROOT.glob("apps/*/components/admin-section-screen.tsx"):
    text = p.read_text()
    text = text.replace("المدفوعات الخارجية", "المدفوعات النقدية")
    text = text.replace("مراجعة معلومات المحافظ والإيصالات قبل التفعيل", "مراجعة تأكيدات الدفع النقدي قبل التفعيل")
    text = text.replace("محفظة زين كاش · مرجع 88420", "الدفع النقدي عند الاستلام")
    text = text.replace("آسيا حوالة · مرجع 77104", "الدفع النقدي مباشرةً مع المتجر")
    text = text.replace("كي كارد · مرجع 66508", "الدفع النقدي بانتظار المراجعة")
    p.write_text(text)

print("Finalized cash-only payment UI and admin payment queue.")
