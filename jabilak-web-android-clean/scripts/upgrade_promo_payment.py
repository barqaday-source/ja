from pathlib import Path

path = Path("app/create-ad.tsx")
text = path.read_text()

text = text.replace(
    'import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";',
    'import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";'
)
text = text.replace(
    'const SELECT_OPTIONS: Record<SelectKey, string[]> = {',
    'const PROMO_DAILY_USD = 5;\nconst PROMO_DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7];\n\nconst SELECT_OPTIONS: Record<SelectKey, string[]> = {'
)
text = text.replace(
    '  const totalBudget = calculateCampaignTotal(budgetNumber, duration);\n',
    '  const totalBudget = calculateCampaignTotal(budgetNumber, duration);\n  const isPromotional = adType === "إعلان ترويجي";\n  const promoTotalUsd = PROMO_DAILY_USD * duration;\n'
)
text = text.replace(
    '  const publishAd = () => {',
    '  const openWhatsApp = () => {\n    const details = `طلب إعلان ترويجي عبر جَايَبْلَك\\nالمدة: ${duration} أيام\\nالإجمالي: $${promoTotalUsd}\\nوسيلة الدفع: مصرف الرافدين`;\n    void Linking.openURL(`https://wa.me/?text=${encodeURIComponent(details)}`);\n    setCampaignStatus("تم تجهيز تفاصيل الدفع لفتح WhatsApp");\n  };\n  const publishAd = () => {'
)
text = text.replace(
    'onPress={() => setAdType(type.name)}',
    'onPress={() => { setAdType(type.name); if (type.name === "إعلان ترويجي") { setPaymentMethod("مصرف الرافدين"); setDuration(1); } }}'
)
text = text.replace(
    '{step === 4 && <View style={styles.stack}><View style={[styles.budgetHero, { backgroundColor: PALETTE.plumIsland }]}><View style={styles.budgetHeroCopy}><Text style={styles.budgetHeroLabel}>إجمالي الميزانية المتوقعة</Text><Text style={styles.budgetHeroValue}>{totalBudget.toLocaleString("en-US")} <Text style={styles.budgetHeroCurrency}>د.ع</Text></Text><Text style={styles.budgetHeroHint}>{duration} أيام · {budgetNumber.toLocaleString("en-US")} د.ع يومياً</Text></View>',
    '{step === 4 && <View style={styles.stack}><View style={[styles.budgetHero, { backgroundColor: PALETTE.plumIsland }]}><View style={styles.budgetHeroCopy}><Text style={styles.budgetHeroLabel}>إجمالي الميزانية المتوقعة</Text><Text style={styles.budgetHeroValue}>{isPromotional ? `$${promoTotalUsd}` : totalBudget.toLocaleString("en-US")} <Text style={styles.budgetHeroCurrency}>{isPromotional ? "دولار" : "د.ع"}</Text></Text><Text style={styles.budgetHeroHint}>{duration} {duration === 1 ? "يوم" : "أيام"} · {isPromotional ? `$${PROMO_DAILY_USD} دولار يومياً` : `${budgetNumber.toLocaleString("en-US")} د.ع يومياً`}</Text></View>',
)
text = text.replace(
    '<Input label="الميزانية اليومية" value={dailyBudget} onChangeText={setDailyBudget} colors={colors} keyboardType="numeric" suffix="د.ع" />',
    '{isPromotional ? <View style={[styles.promoRate, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` }]}><MaterialIcons name="campaign" size={20} color={colors.primary} /><View style={styles.promoRateCopy}><Text style={[styles.promoRateTitle, { color: colors.foreground }]}>سعر الإعلان الترويجي</Text><Text style={[styles.promoRateText, { color: colors.primary }]}>$5 لليوم الواحد · من يوم إلى أسبوع</Text></View></View> : <Input label="الميزانية اليومية" value={dailyBudget} onChangeText={setDailyBudget} colors={colors} keyboardType="numeric" suffix="د.ع" />}'
)
text = text.replace(
    '{[3, 7, 14, 30].map((value) => <Pressable',
    '{(isPromotional ? PROMO_DURATION_OPTIONS : [3, 7, 14, 30]).map((value) => <Pressable'
)
text = text.replace(
    '<Text style={[styles.durationText, { color: duration === value ? "#FFFFFF" : colors.foreground }]}>{value} أيام</Text>',
    '<Text style={[styles.durationText, { color: duration === value ? "#FFFFFF" : colors.foreground }]}>{value} {value === 1 ? "يوم" : "أيام"}</Text>'
)
text = text.replace(
    '{["بطاقة إلكترونية", "رصيد جَايَبْلَك", "تحويل مصرفي"].map((method) =>',
    '{(isPromotional ? ["مصرف الرافدين", "واتساب لإرسال تفاصيل الدفع"] : ["بطاقة إلكترونية", "رصيد جَايَبْلَك", "تحويل مصرفي"]).map((method) =>'
)
text = text.replace(
    'method === "بطاقة إلكترونية" ? "credit-card" : method === "رصيد جَايَبْلَك" ? "account-balance-wallet" : "account-balance"',
    'method === "بطاقة إلكترونية" ? "credit-card" : method === "رصيد جَايَبْلَك" ? "account-balance-wallet" : method === "واتساب لإرسال تفاصيل الدفع" ? "chat" : "account-balance"'
)
text = text.replace(
    '<SummaryRow label="الميزانية اليومية" value={`${budgetNumber.toLocaleString("en-US")} د.ع`} colors={colors} />',
    '<SummaryRow label="الميزانية اليومية" value={isPromotional ? "$5 دولار / يوم" : `${budgetNumber.toLocaleString("en-US")} د.ع`} colors={colors} />'
)
text = text.replace(
    '<SummaryRow label="مدة الحملة" value={`${duration} أيام`} colors={colors} />',
    '<SummaryRow label="مدة الحملة" value={`${duration} ${duration === 1 ? "يوم" : "أيام"}`} colors={colors} />'
)
text = text.replace(
    '<Text style={[styles.totalValue, { color: colors.primary }]}>{totalBudget.toLocaleString("en-US")} د.ع</Text>',
    '<Text style={[styles.totalValue, { color: colors.primary }]}>{isPromotional ? `$${promoTotalUsd} دولار` : `${totalBudget.toLocaleString("en-US")} د.ع`}</Text>'
)
text = text.replace(
    '<View style={styles.consentRow}><Switch',
    '<View style={[styles.bankNote, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}><MaterialIcons name="account-balance" size={19} color={colors.primary} /><Text style={[styles.bankNoteText, { color: colors.foreground }]}>{isPromotional ? "الدفع يتم عبر مصرف الرافدين بعد التواصل مع فريق جَايَبْلَك في WhatsApp." : "اختر وسيلة الدفع المناسبة لإكمال الطلب."}</Text></View><View style={styles.consentRow}><Switch'
)
text = text.replace(
    '</Pressable>{campaignStatus &&',
    '</Pressable>{isPromotional && <Pressable onPress={openWhatsApp} style={({ pressed }) => [styles.whatsappAction, { borderColor: colors.success, backgroundColor: `${colors.success}12`, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="chat" size={19} color={colors.success} /><Text style={[styles.whatsappActionText, { color: colors.success }]}>إرسال تفاصيل الدفع عبر WhatsApp</Text></Pressable>}{campaignStatus &&'
)
text = text.replace(
    '  budgetHero: {',
    '  promoRate: { minHeight: 62, borderWidth: 1, borderRadius: 15, padding: 11, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, promoRateCopy: { flex: 1, alignItems: "flex-end" }, promoRateTitle: { fontSize: 11, fontWeight: "900" }, promoRateText: { fontSize: 10, fontWeight: "900", marginTop: 4 }, bankNote: { minHeight: 58, borderWidth: 1, borderRadius: 14, padding: 11, flexDirection: "row-reverse", alignItems: "center", gap: 8 }, bankNoteText: { flex: 1, fontSize: 10, lineHeight: 17, textAlign: "right" }, whatsappAction: { minHeight: 49, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, whatsappActionText: { fontSize: 11, fontWeight: "900" }, budgetHero: {'
)
path.write_text(text)
print("updated", path)
