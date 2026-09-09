import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getAdminSettings } from "@/lib/admin-settings";

type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  accent: string;
  recommended?: boolean;
  features: string[];
};

type Payment = { id: string; plan: string; date: string; amount: number; status: "مدفوع" | "قيد المعالجة" };

const PALETTE = { aero: "#81B7EC", plummy: "#655B77", plumIsland: "#443C50", riverStyx: "#1A1821" };

// Preview catalog; replace getAdminSettings() with the subscription repository when Supabase is connected.
const SUBSCRIPTION_SETTINGS = getAdminSettings().subscriptionPlans;
const INITIAL_PLAN_CATALOG: Plan[] = SUBSCRIPTION_SETTINGS.map((plan, index) => ({
  ...plan,
  accent: index === 0 ? PALETTE.plummy : index === 1 ? PALETTE.aero : PALETTE.plumIsland,
}));

const INITIAL_PAYMENTS: Payment[] = [];

const formatPrice = (value: number) => value === 0 ? "مجاناً" : `${value.toLocaleString("en-US")} د.ع`;

export default function SubscriptionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [plans] = useState(INITIAL_PLAN_CATALOG);
  const [currentPlanId, setCurrentPlanId] = useState("standard");
  const [selectedPlanId, setSelectedPlanId] = useState("standard");
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0], [plans, selectedPlanId]);
  const currentPlan = useMemo(() => plans.find((plan) => plan.id === currentPlanId) ?? plans[0], [plans, currentPlanId]);
  const isUpgrade = plans.findIndex((plan) => plan.id === selectedPlanId) > plans.findIndex((plan) => plan.id === currentPlanId);

  const activatePlan = () => {
    if (!selectedPlan || selectedPlan.id === currentPlan.id) {
      Alert.alert("الخطة الحالية", "أنت مشترك بهذه الخطة بالفعل. يمكنك إدارة تفاصيلها من هنا.");
      return;
    }
    setCurrentPlanId(selectedPlan.id);
    setPayments((history) => [{ id: `INV-${1043 + history.length}`, plan: selectedPlan.name, date: "اليوم", amount: selectedPlan.price, status: "قيد المعالجة" }, ...history]);
    Alert.alert("تم اختيار الخطة", `تم تسجيل اشتراكك في خطة ${selectedPlan.name} محلياً للمراجعة.`);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable>
          <View style={styles.headerCopy}><Text style={[styles.kicker, { color: colors.primary }]}>خطط الشركات</Text><Text style={[styles.title, { color: colors.foreground }]}>اختر خطة تناسب تجارتك</Text><Text style={[styles.subtitle, { color: colors.muted }]}>ابدأ بالأدوات التي تحتاجها ونمِّ تجارتك بثقة</Text></View>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}><MaterialIcons name="workspace-premium" size={20} color="#FFFFFF" /></View>
        </View>

        <View style={[styles.currentCard, { backgroundColor: PALETTE.plumIsland }]}><View style={styles.currentTop}><View style={[styles.currentBadge, { backgroundColor: `${colors.primary}32` }]}><MaterialIcons name="check-circle" size={15} color={colors.primary} /><Text style={[styles.currentBadgeText, { color: colors.primary }]}>نشطة</Text></View><Text style={styles.currentLabel}>خطتك الحالية</Text></View><View style={styles.currentMain}><View style={styles.currentCopy}><Text style={styles.currentName}>{currentPlan.name}</Text><Text style={styles.currentPrice}>{formatPrice(currentPlan.price)} <Text style={styles.currentPeriod}>/ {currentPlan.period}</Text></Text><Text style={styles.currentRenew}>التجديد القادم · 20 ديسمبر 2026</Text></View><View style={[styles.currentMark, { borderColor: colors.primary }]}><MaterialIcons name="workspace-premium" size={29} color={colors.primary} /></View></View><Pressable onPress={() => Alert.alert("إدارة الاشتراك", `خطة ${currentPlan.name} · التجديد القادم 20 ديسمبر 2026`)} style={({ pressed }) => [styles.manageLink, { borderTopColor: "#5D526C", opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.manageLinkText, { color: colors.primary }]}>إدارة الخطة الحالية</Text><MaterialIcons name="arrow-back" size={17} color={colors.primary} /></Pressable></View>

        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>الخطط المتاحة</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>اختر ما يناسب حجم عملك</Text></View>
        {plans.map((plan) => <PlanCard key={plan.id} plan={plan} selected={plan.id === selectedPlanId} current={plan.id === currentPlanId} onPress={() => setSelectedPlanId(plan.id)} onSubscribe={activatePlan} colors={colors} />)}

        <View style={[styles.actionPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.actionPanelCopy}><Text style={[styles.actionTitle, { color: colors.foreground }]}>{isUpgrade ? `ترقية إلى خطة ${selectedPlan.name}` : "جاهز لتطوير تجارتك؟"}</Text><Text style={[styles.actionSubtitle, { color: colors.muted }]}>{isUpgrade ? "احصل على أدوات أكثر وظهور أفضل لمنتجاتك." : "اختر خطة جديدة لتفعيل مميزاتها على حسابك."}</Text></View><Pressable onPress={activatePlan} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}><Text style={styles.primaryButtonText}>{isUpgrade ? "ترقية الخطة" : "اشترك الآن"}</Text><MaterialIcons name="arrow-back" size={17} color="#FFFFFF" /></Pressable></View>

        <View style={styles.historyHeader}><View style={styles.historyTitleWrap}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>سجل المدفوعات</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>الاشتراكات السابقة والفواتير</Text></View><View style={[styles.historyIcon, { backgroundColor: `${colors.primary}17` }]}><MaterialIcons name="receipt-long" size={18} color={colors.primary} /></View></View>
        <View style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>{payments.map((payment, index) => <View key={payment.id} style={[styles.paymentRow, index < payments.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}><View style={[styles.statusDot, { backgroundColor: payment.status === "مدفوع" ? `${colors.success}20` : `${colors.warning}25` }]}><MaterialIcons name={payment.status === "مدفوع" ? "check" : "schedule"} size={15} color={payment.status === "مدفوع" ? colors.success : colors.warning} /></View><View style={styles.paymentCopy}><Text style={[styles.paymentPlan, { color: colors.foreground }]}>خطة {payment.plan}</Text><Text style={[styles.paymentMeta, { color: colors.muted }]}>{payment.id} · {payment.date}</Text></View><View style={styles.paymentAmount}><Text style={[styles.amount, { color: colors.foreground }]}>{formatPrice(payment.amount)}</Text><Text style={[styles.paymentStatus, { color: payment.status === "مدفوع" ? colors.success : colors.warning }]}>{payment.status}</Text></View></View>)}<Pressable onPress={() => Alert.alert("سجل المدفوعات", "هذه نسخة تجريبية من السجل، ويمكن ربطها بالفواتير عند تفعيل النظام.")} style={({ pressed }) => [styles.historyFooter, { borderTopColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.historyFooterText, { color: colors.primary }]}>عرض كل السجل</Text><MaterialIcons name="arrow-back" size={16} color={colors.primary} /></Pressable></View>
        <Text style={[styles.footerNote, { color: colors.muted }]}>الأسعار قابلة للتحديث من نظام الاشتراكات · جميع المبالغ بالدينار العراقي</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function PlanCard({ plan, selected, current, onPress, onSubscribe, colors }: { plan: Plan; selected: boolean; current: boolean; onPress: () => void; onSubscribe: () => void; colors: ReturnType<typeof useColors> }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.planCard, { backgroundColor: colors.surface, borderColor: selected ? plan.accent : colors.border, borderWidth: selected ? 2 : 1, opacity: pressed ? 0.92 : 1 }]}><View style={[styles.planAccent, { backgroundColor: plan.accent }]} /><View style={styles.planHead}><View style={styles.planNameWrap}>{plan.recommended && <View style={[styles.recommended, { backgroundColor: plan.accent }]}><MaterialIcons name="star" size={11} color="#FFFFFF" /><Text style={styles.recommendedText}>موصى بها</Text></View>}<Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text></View><View style={[styles.radio, { borderColor: selected ? plan.accent : colors.border }]}>{selected && <View style={[styles.radioInner, { backgroundColor: plan.accent }]} />}</View></View><View style={styles.priceRow}><Text style={[styles.period, { color: colors.muted }]}>/ {plan.period}</Text><Text style={[styles.planPrice, { color: plan.accent }]}>{formatPrice(plan.price)}</Text></View><View style={[styles.features, { borderTopColor: colors.border }]}>{plan.features.map((feature) => <View key={feature} style={styles.featureRow}><MaterialIcons name="check" size={15} color={plan.accent} /><Text style={[styles.featureText, { color: colors.foreground }]}>{feature}</Text></View>)}</View><Pressable disabled={current} onPress={onSubscribe} style={({ pressed }) => [styles.planButton, { backgroundColor: current ? `${colors.border}75` : selected ? plan.accent : colors.background, borderColor: current ? colors.border : plan.accent, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.planButtonText, { color: current ? colors.muted : selected ? "#FFFFFF" : plan.accent }]}>{current ? "الخطة الحالية" : "اشترك الآن"}</Text>{!current && <MaterialIcons name="arrow-back" size={15} color={selected ? "#FFFFFF" : plan.accent} />}</Pressable></Pressable>;
}

const styles = StyleSheet.create({ content: { padding: 19, paddingBottom: 30 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 17 }, headerCopy: { flex: 1, alignItems: "flex-end" }, kicker: { fontSize: 10, fontWeight: "900", marginBottom: 3 }, title: { fontSize: 22, fontWeight: "900", textAlign: "right" }, subtitle: { fontSize: 10, marginTop: 4, textAlign: "right" }, iconButton: { width: 42, height: 42, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" }, headerIcon: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" }, currentCard: { borderRadius: 21, padding: 16, marginBottom: 19 }, currentTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, currentLabel: { color: "#D8D0DC", fontSize: 10, fontWeight: "700" }, currentBadge: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 }, currentBadgeText: { fontSize: 9, fontWeight: "900" }, currentMain: { flexDirection: "row-reverse", alignItems: "center", marginTop: 12, gap: 12 }, currentCopy: { flex: 1, alignItems: "flex-end" }, currentName: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" }, currentPrice: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 4 }, currentPeriod: { color: "#D8D0DC", fontSize: 10, fontWeight: "600" }, currentRenew: { color: "#D8D0DC", fontSize: 9, marginTop: 6 }, currentMark: { width: 59, height: 59, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" }, manageLink: { borderTopWidth: 1, marginTop: 15, paddingTop: 12, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 }, manageLinkText: { fontSize: 10, fontWeight: "900" }, sectionHeading: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, sectionTitle: { fontSize: 15, fontWeight: "900" }, sectionHint: { fontSize: 9, marginTop: 3, textAlign: "right" }, planCard: { borderRadius: 20, padding: 14, marginBottom: 11, overflow: "hidden" }, planAccent: { height: 4, position: "absolute", top: 0, left: 0, right: 0 }, planHead: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" }, planNameWrap: { alignItems: "flex-end", flex: 1 }, planName: { fontSize: 17, fontWeight: "900", marginTop: 4 }, recommended: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4, flexDirection: "row-reverse", alignItems: "center", gap: 3 }, recommendedText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900" }, radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" }, radioInner: { width: 11, height: 11, borderRadius: 6 }, priceRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "flex-end", gap: 5, marginTop: 11 }, planPrice: { fontSize: 20, fontWeight: "900" }, period: { fontSize: 10 }, features: { borderTopWidth: 1, marginTop: 12, paddingTop: 11, gap: 8 }, featureRow: { flexDirection: "row-reverse", alignItems: "center", gap: 7 }, featureText: { fontSize: 10, flex: 1, textAlign: "right" }, planButton: { minHeight: 41, borderRadius: 12, borderWidth: 1, marginTop: 13, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 }, planButtonText: { fontSize: 11, fontWeight: "900" }, actionPanel: { borderWidth: 1, borderRadius: 19, padding: 13, flexDirection: "row-reverse", alignItems: "center", gap: 10, marginTop: 2 }, actionPanelCopy: { flex: 1, alignItems: "flex-end" }, actionTitle: { fontSize: 12, fontWeight: "900", textAlign: "right" }, actionSubtitle: { fontSize: 9, lineHeight: 15, textAlign: "right", marginTop: 4 }, primaryButton: { minHeight: 44, borderRadius: 13, paddingHorizontal: 12, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 5 }, primaryButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" }, historyHeader: { marginTop: 20, marginBottom: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, historyTitleWrap: { flex: 1, alignItems: "flex-end" }, historyIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" }, historyCard: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 12 }, paymentRow: { minHeight: 65, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, statusDot: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center" }, paymentCopy: { flex: 1, alignItems: "flex-end" }, paymentPlan: { fontSize: 11, fontWeight: "900" }, paymentMeta: { fontSize: 8, marginTop: 4 }, paymentAmount: { alignItems: "flex-start" }, amount: { fontSize: 10, fontWeight: "900" }, paymentStatus: { fontSize: 8, fontWeight: "900", marginTop: 4 }, historyFooter: { minHeight: 43, borderTopWidth: 1, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 }, historyFooterText: { fontSize: 10, fontWeight: "900" }, footerNote: { fontSize: 8, textAlign: "center", marginTop: 12 } });
