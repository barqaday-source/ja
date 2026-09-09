from pathlib import Path

path = Path("app/create-ad.tsx")
text = path.read_text()

text = text.replace(
    'import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";',
    'import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";\nimport * as Clipboard from "expo-clipboard";\nimport * as ImagePicker from "expo-image-picker";'
)
text = text.replace(
    'import { calculateCampaignTotal, normalizeBudget, validateCampaignSubmission } from "@/lib/ad-campaign";',
    'import { calculateCampaignTotal, normalizeBudget, validateCampaignSubmission } from "@/lib/ad-campaign";\nimport { formatPromotionalAmount, getPromotionalPlan, PAYMENT_ACCOUNT, PROMOTIONAL_PLANS } from "@/lib/payment-config";'
)
text = text.replace(
    'const PROMO_DAILY_USD = 5;\nconst PROMO_DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7];\n\n',
    ''
)
text = text.replace(
    '  const [campaignStatus, setCampaignStatus] = useState<string | null>(null);',
    '  const [campaignStatus, setCampaignStatus] = useState<string | null>(null);\n  const [receiptUri, setReceiptUri] = useState<string | null>(null);\n  const [receiptStatus, setReceiptStatus] = useState<string | null>(null);'
)
text = text.replace(
    '  const promoTotalUsd = PROMO_DAILY_USD * duration;\n',
    '  const promoPlan = getPromotionalPlan(duration);\n'
)
text = text.replace(
    '    const details = `طلب إعلان ترويجي عبر تاجر\\nالمدة: ${duration} أيام\\nالإجمالي: $${promoTotalUsd}\\nوسيلة الدفع: مصرف الرافدين`;',
    '    const details = `طلب إعلان ترويجي عبر تاجر\\nالمدة: ${promoPlan.label}\\nالإجمالي: ${formatPromotionalAmount(promoPlan)}\\nالمستفيد: ${PAYMENT_ACCOUNT.beneficiary}\\nوسيلة الدفع: ${PAYMENT_ACCOUNT.bankName}`;'
)
text = text.replace(
    '    setCampaignStatus("تم تجهيز تفاصيل الدفع لفتح WhatsApp");\n  };\n',
    '    setCampaignStatus("تم تجهيز تفاصيل الدفع لفتح WhatsApp");\n  };\n  const copyPaymentValue = async (value: string, label: string) => {\n    await Clipboard.setStringAsync(value);\n    setReceiptStatus(`تم نسخ ${label}`);\n  };\n  const pickReceipt = async () => {\n    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.85 });\n    if (!result.canceled && result.assets[0]) {\n      setReceiptUri(result.assets[0].uri);\n      setReceiptStatus("تمت إضافة ملاحظة الدفع النقدي للمراجعة");\n    }\n  };\n'
)
text = text.replace(
    'isPromotional ? `$${promoTotalUsd}` : totalBudget.toLocaleString("en-US")',
    'isPromotional ? formatPromotionalAmount(promoPlan) : totalBudget.toLocaleString("en-US")'
)
text = text.replace(
    '{isPromotional ? `$5 دولار / يوم` : `${budgetNumber.toLocaleString("en-US")} د.ع`}',
    '{isPromotional ? `${formatPromotionalAmount(getPromotionalPlan(1))} / يوم` : `${budgetNumber.toLocaleString("en-US")} د.ع`}'
)
text = text.replace(
    '{(isPromotional ? PROMO_DURATION_OPTIONS : [3, 7, 14, 30]).map((value) =>',
    '{(isPromotional ? PROMOTIONAL_PLANS.map((plan) => plan.days) : [3, 7, 14, 30]).map((value) =>'
)
text = text.replace(
    '{isPromotional ? `$${promoTotalUsd} دولار` : `${totalBudget.toLocaleString("en-US")} د.ع`}',
    '{isPromotional ? formatPromotionalAmount(promoPlan) : `${totalBudget.toLocaleString("en-US")} د.ع`}'
)
old_bank = '<View style={[styles.bankNote, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}><MaterialIcons name="account-balance" size={19} color={colors.primary} /><Text style={[styles.bankNoteText, { color: colors.foreground }]}>{isPromotional ? "الدفع يتم عبر مصرف الرافدين بعد التواصل مع فريق تاجر في WhatsApp." : "اختر وسيلة الدفع المناسبة لإكمال الطلب."}</Text></View>'
new_bank = '<View style={[styles.bankNote, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}><MaterialIcons name="account-balance" size={19} color={colors.primary} /><Text style={[styles.bankNoteText, { color: colors.foreground }]}>{isPromotional ? "الدفع يتم عبر مصرف الرافدين بعد التواصل مع فريق تاجر في WhatsApp." : "اختر وسيلة الدفع المناسبة لإكمال الطلب."}</Text></View>{isPromotional && <View style={[styles.bankDetails, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.bankDetailsHeader}><Text style={[styles.bankDetailsTitle, { color: colors.foreground }]}>بيانات التحويل البنكي</Text><MaterialIcons name="verified-user" size={18} color={colors.primary} /></View><SummaryRow label="المصرف" value={PAYMENT_ACCOUNT.bankName} colors={colors} /><SummaryRow label="المستفيد" value={PAYMENT_ACCOUNT.beneficiary} colors={colors} /><View style={styles.copyRow}><View style={styles.copyValue}><Text style={[styles.copyLabel, { color: colors.muted }]}>رقم الحساب</Text><Text style={[styles.copyText, { color: colors.foreground }]}>{PAYMENT_ACCOUNT.accountNumber}</Text></View><Pressable onPress={() => void copyPaymentValue(PAYMENT_ACCOUNT.accountNumber, "رقم الحساب")} style={({ pressed }) => [styles.copyAction, { borderColor: colors.primary, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="content-copy" size={16} color={colors.primary} /><Text style={[styles.copyActionText, { color: colors.primary }]}>نسخ</Text></Pressable></View><View style={styles.copyRow}><View style={styles.copyValue}><Text style={[styles.copyLabel, { color: colors.muted }]}>IBAN</Text><Text style={[styles.copyText, { color: colors.foreground }]}>{PAYMENT_ACCOUNT.iban}</Text></View><Pressable onPress={() => void copyPaymentValue(PAYMENT_ACCOUNT.iban, "IBAN")} style={({ pressed }) => [styles.copyAction, { borderColor: colors.primary, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="content-copy" size={16} color={colors.primary} /><Text style={[styles.copyActionText, { color: colors.primary }]}>نسخ</Text></Pressable></View></View>}'
if old_bank not in text:
    raise SystemExit("bank note block not found")
text = text.replace(old_bank, new_bank)
text = text.replace(
    '</Pressable>{isPromotional && <Pressable onPress={openWhatsApp}',
    '</Pressable>{isPromotional && <Pressable onPress={openWhatsApp}'
)
old_whatsapp = '<Pressable onPress={openWhatsApp} style={({ pressed }) => [styles.whatsappAction, { borderColor: colors.success, backgroundColor: `${colors.success}12`, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="chat" size={19} color={colors.success} /><Text style={[styles.whatsappActionText, { color: colors.success }]}>إرسال تفاصيل الدفع عبر WhatsApp</Text></Pressable>}'
new_whatsapp = '<Pressable onPress={openWhatsApp} style={({ pressed }) => [styles.whatsappAction, { borderColor: colors.success, backgroundColor: `${colors.success}12`, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="chat" size={19} color={colors.success} /><Text style={[styles.whatsappActionText, { color: colors.success }]}>إرسال تفاصيل الدفع عبر WhatsApp</Text></Pressable>}{isPromotional && <Pressable onPress={() => void pickReceipt()} style={({ pressed }) => [styles.receiptAction, { borderColor: colors.primary, backgroundColor: receiptUri ? `${colors.success}12` : colors.surface, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name={receiptUri ? "check-circle" : "receipt-long"} size={19} color={receiptUri ? colors.success : colors.primary} /><Text style={[styles.receiptActionText, { color: receiptUri ? colors.success : colors.primary }]}>{receiptUri ? "تم رفع الإيصال للمراجعة" : "إضافة ملاحظة الدفع النقدي"}</Text></Pressable>}{receiptStatus && <Text style={[styles.receiptStatus, { color: colors.primary }]}>{receiptStatus}</Text>}'
if old_whatsapp not in text:
    raise SystemExit("whatsapp block not found")
text = text.replace(old_whatsapp, new_whatsapp)
text = text.replace(
    'whatsappActionText: { fontSize: 11, fontWeight: "900" },',
    'whatsappActionText: { fontSize: 11, fontWeight: "900" }, receiptAction: { minHeight: 49, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, receiptActionText: { fontSize: 11, fontWeight: "900" }, receiptStatus: { fontSize: 10, fontWeight: "800", textAlign: "right" }, bankDetails: { borderWidth: 1, borderRadius: 16, padding: 13, gap: 8 }, bankDetailsHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }, bankDetailsTitle: { fontSize: 12, fontWeight: "900" }, copyRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: "rgba(128,128,128,0.12)", paddingTop: 8 }, copyValue: { flex: 1, alignItems: "flex-end" }, copyLabel: { fontSize: 9 }, copyText: { fontSize: 11, fontWeight: "800", marginTop: 3, textAlign: "right" }, copyAction: { minWidth: 54, minHeight: 34, borderWidth: 1, borderRadius: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 4 }, copyActionText: { fontSize: 10, fontWeight: "900" },'
)
path.write_text(text)
print("updated", path)
