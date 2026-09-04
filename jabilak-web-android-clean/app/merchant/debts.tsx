import { useMemo, useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useMockAction } from "@/hooks/use-mock-action";
import { normalizeArabicDigits, validateLocalizedNumber } from "@/lib/input-validation";
import { trackEvent } from "@/lib/analytics";

interface DebtEntry {
  id: string;
  name: string;
  phone: string;
  amount: number;
  paid: number;
  due: string;
  status: "متأخر" | "قريب" | "منتظم";
}

const INITIAL_DEBTS: DebtEntry[] = [
  { id: "d1", name: "محمد عبدالرزاق", phone: "0770 123 4567", amount: 185000, paid: 50000, due: "28 آب", status: "قريب" },
  { id: "d2", name: "سارة كريم", phone: "0781 832 1902", amount: 320000, paid: 0, due: "20 آب", status: "متأخر" },
  { id: "d3", name: "متجر البيت العصري", phone: "0772 445 0918", amount: 95000, paid: 95000, due: "مكتمل", status: "منتظم" },
];

const money = (value: number) => `${value.toLocaleString("en-US")} د.ع`;

export default function DebtsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { run, busy } = useMockAction(500);
  const [debts, setDebts] = useState(INITIAL_DEBTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DebtEntry["status"] | "الكل">("الكل");

  const visibleDebts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return debts.filter((entry) => {
      const matchesStatus = statusFilter === "الكل" || entry.status === statusFilter;
      const matchesQuery = !query || `${entry.name} ${entry.phone}`.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [debts, searchQuery, statusFilter]);

  const outstanding = useMemo(() => debts.reduce((sum, item) => sum + Math.max(item.amount - item.paid, 0), 0), [debts]);
  const paid = useMemo(() => debts.reduce((sum, item) => sum + item.paid, 0), [debts]);
  const overdueEntries = debts.filter((item) => item.status === "متأخر" && item.amount > item.paid);
  const overdue = overdueEntries.length;
  const priorityDebt = overdueEntries[0] ?? debts.find((item) => item.amount > item.paid);

  const addDebt = async () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert("بيانات ناقصة", "أدخل اسم العميل وقيمة الدين أولاً.");
      return;
    }
    const amountValidation = validateLocalizedNumber(amount, { label: "قيمة الدين", min: 1, integer: true });
    if (amountValidation.message || amountValidation.value === null) {
      Alert.alert("تحقق من قيمة الدين", amountValidation.message ?? "أدخل قيمة صحيحة.");
      return;
    }
    await run(async () => {
      setDebts((items) => [{ id: `d-${Date.now()}`, name: name.trim(), phone: phone.trim() || "غير مضاف", amount: amountValidation.value ?? 0, paid: 0, due: "اليوم", status: "قريب" }, ...items]);
      setName("");
      setAmount("");
      setPhone("");
      setModalVisible(false);
      void trackEvent("debt_created", { source: "merchant_debts" });
      Alert.alert("تمت الإضافة", "تم حفظ سجل الدين محلياً للمعاينة.");
    });
  };

  const remind = (entry: DebtEntry) => {
    const phone = normalizeArabicDigits(entry.phone).replace(/\D/g, "");
    if (!phone) {
      Alert.alert("رقم غير مكتمل", "أضف رقم هاتف العميل أولاً لإرسال التذكير.");
      return;
    }
    const remaining = Math.max(entry.amount - entry.paid, 0);
    const message = `السلام عليكم ${entry.name}، تذكير ودي من متجرنا عبر جايبلك. المتبقي عليكم ${money(remaining)}، ويمكننا تنسيق موعد التسديد عبر WhatsApp.`;
    void trackEvent("debt_reminder_started", { status: entry.status });
    void Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`).catch(() => Alert.alert("تعذر فتح WhatsApp", "تحقق من تثبيت WhatsApp أو افتح الرابط يدوياً."));
  };

  const removeDebt = (entry: DebtEntry) => {
    Alert.alert("حذف سجل الدين", `هل تريد حذف سجل ${entry.name}؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => {
        setDebts((items) => items.filter((item) => item.id !== entry.id));
        void trackEvent("debt_deleted", { source: "merchant_debts" });
      } },
    ]);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={21} color={colors.foreground} /></Pressable>
          <View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>ERP جَايَبْلَك</Text><Text style={[styles.title, { color: colors.foreground }]}>دفتر الديون</Text><Text style={[styles.subtitle, { color: colors.muted }]}>تابع العملاء والدفعات والتذكيرات من مكان واحد</Text></View>
          <View style={[styles.headerMark, { backgroundColor: colors.primary }]}><MaterialIcons name="menu-book" size={21} color="#FFFFFF" /></View>
        </View>

        <View style={styles.metrics}>
          <Metric label="إجمالي المستحق" value={money(outstanding)} color={colors.primary} colors={colors} icon="account-balance-wallet" />
          <Metric label="المحصّل" value={money(paid)} color={colors.success} colors={colors} icon="payments" />
          <Metric label="حالات متأخرة" value={`${overdue}`} color={colors.error} colors={colors} icon="priority-high" />
        </View>

        <View style={[styles.dailyFocus, { backgroundColor: colors.foreground }]}><View style={[styles.dailyFocusIcon, { backgroundColor: `${colors.primary}28` }]}><MaterialIcons name="today" size={20} color={colors.primary} /></View><View style={styles.dailyFocusCopy}><Text style={[styles.dailyFocusTitle, { color: "#FFFFFF" }]}>مهمتك اليوم</Text><Text style={[styles.dailyFocusText, { color: "rgba(255,255,255,0.74)" }]}>{overdue ? `${overdue} تذكيرات متأخرة تحتاج متابعة الآن` : "راجع دفتر الديون وأرسل تذكيراً ودياً للعميل بنقرة"}</Text></View>{priorityDebt && <Pressable onPress={() => remind(priorityDebt)} style={({ pressed }) => [styles.dailyFocusButton, { backgroundColor: colors.primary, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="chat" size={15} color="#FFFFFF" /><Text style={styles.dailyFocusButtonText}>ذكّر الآن</Text></Pressable>}</View>

        <View style={styles.toolbar}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>سجل العملاء</Text><Text style={[styles.sectionSub, { color: colors.muted }]}>{debts.length} سجلات محلية قابلة للاستبدال ببيانات Supabase</Text></View><Pressable onPress={() => setModalVisible(true)} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><MaterialIcons name="add" size={18} color="#FFFFFF" /><Text style={styles.addButtonText}>إضافة دين</Text></Pressable></View>

        <View style={[styles.filterBar, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={19} color={colors.muted} /><TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="ابحث عن عميل أو رقم هاتف" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} /><MaterialIcons name="tune" size={20} color={colors.primary} /></View>
        <View style={styles.statusFilters}>{(["الكل", "متأخر", "قريب", "منتظم"] as const).map((filter) => <Pressable key={filter} onPress={() => { setStatusFilter(filter); void trackEvent("debt_filter_changed", { status: filter }); }} style={({ pressed }) => [styles.statusFilter, { backgroundColor: statusFilter === filter ? colors.foreground : colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.statusFilterText, { color: statusFilter === filter ? "#FFFFFF" : colors.foreground }]}>{filter}</Text></Pressable>)}</View>

        {visibleDebts.map((entry) => {
          const remaining = Math.max(entry.amount - entry.paid, 0);
          const progress = entry.amount ? Math.min(entry.paid / entry.amount, 1) : 0;
          const statusColor = entry.status === "متأخر" ? colors.error : entry.status === "قريب" ? colors.warning : colors.success;
          return <View key={entry.id} style={[styles.debtCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardTop}><View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{entry.name.slice(0, 1)}</Text></View><View style={styles.customer}><Text style={[styles.customerName, { color: colors.foreground }]}>{entry.name}</Text><Text style={[styles.phone, { color: colors.muted }]}>{entry.phone}</Text></View><View style={[styles.status, { backgroundColor: `${statusColor}18` }]}><View style={[styles.statusDot, { backgroundColor: statusColor }]} /><Text style={[styles.statusText, { color: statusColor }]}>{entry.status}</Text></View></View>
            <View style={[styles.amountRow, { borderTopColor: colors.border }]}><View><Text style={[styles.label, { color: colors.muted }]}>المتبقي</Text><Text style={[styles.remaining, { color: remaining ? colors.error : colors.success }]}>{money(remaining)}</Text></View><View style={styles.amountSide}><Text style={[styles.label, { color: colors.muted }]}>قيمة الدين</Text><Text style={[styles.amount, { color: colors.foreground }]}>{money(entry.amount)}</Text></View><View style={styles.dueSide}><Text style={[styles.label, { color: colors.muted }]}>الاستحقاق</Text><Text style={[styles.due, { color: colors.foreground }]}>{entry.due}</Text></View></View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.success }]} /></View>
            <View style={styles.actions}><Pressable onPress={() => remind(entry)} style={({ pressed }) => [styles.whatsappButton, { backgroundColor: "#E7F7EE", opacity: pressed ? 0.7 : 1 }]}><MaterialIcons name="chat" size={16} color="#16854C" /><Text style={styles.whatsappText}>تذكير WhatsApp</Text></Pressable><Pressable onPress={() => Alert.alert("إضافة دفعة", `تسجيل دفعة جديدة للعميل ${entry.name} سيتم تفعيله عند الربط.`)} style={({ pressed }) => [styles.paymentButton, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="add-card" size={16} color={colors.primary} /><Text style={[styles.paymentText, { color: colors.foreground }]}>تسجيل دفعة</Text></Pressable><Pressable onPress={() => removeDebt(entry)} style={({ pressed }) => [styles.moreButton, { opacity: pressed ? 0.55 : 1 }]}><MaterialIcons name="delete-outline" size={20} color={colors.error} /></Pressable></View>
          </View>;
        })}
        <View style={{ height: 35 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.surface }]}><View style={styles.modalHeader}><Pressable onPress={() => setModalVisible(false)}><MaterialIcons name="close" size={22} color={colors.foreground} /></Pressable><Text style={[styles.modalTitle, { color: colors.foreground }]}>إضافة سجل دين</Text><View style={{ width: 22 }} /></View><Text style={[styles.fieldLabel, { color: colors.foreground }]}>اسم العميل</Text><TextInput value={name} onChangeText={setName} placeholder="مثال: أحمد علي" placeholderTextColor={colors.muted} style={[styles.field, { borderColor: colors.border, color: colors.foreground }]} /><Text style={[styles.fieldLabel, { color: colors.foreground }]}>رقم الهاتف</Text><TextInput value={phone} onChangeText={(value) => setPhone(normalizeArabicDigits(value))} keyboardType="phone-pad" placeholder="07XX XXX XXXX" placeholderTextColor={colors.muted} style={[styles.field, { borderColor: colors.border, color: colors.foreground }]} /><Text style={[styles.fieldLabel, { color: colors.foreground }]}>قيمة الدين بالدينار</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} style={[styles.field, { borderColor: colors.border, color: colors.foreground }]} /><Pressable disabled={busy} onPress={addDebt} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed || busy ? 0.72 : 1 }]}><Text style={styles.saveText}>{busy ? "جارٍ الحفظ..." : "حفظ سجل الدين"}</Text></Pressable></View></View></Modal>
    </ScreenContainer>
  );
}

function Metric({ label, value, color, colors, icon }: { label: string; value: string; color: string; colors: ReturnType<typeof useColors>; icon: keyof typeof MaterialIcons.glyphMap }) { return <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}><MaterialIcons name={icon} size={16} color={color} /></View><Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text><Text numberOfLines={1} style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text></View>; }

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 10 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 11, marginBottom: 19 }, headerCopy: { flex: 1, alignItems: "flex-end" }, eyebrow: { fontSize: 10, fontWeight: "800", marginBottom: 4 }, title: { fontSize: 27, fontWeight: "900" }, subtitle: { fontSize: 10, marginTop: 4, textAlign: "right" }, iconButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" }, headerMark: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" }, metrics: { flexDirection: "row-reverse", gap: 8, marginBottom: 24 }, metric: { flex: 1, minHeight: 113, padding: 11, borderRadius: 18, borderWidth: 1, alignItems: "flex-end" }, metricIcon: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 }, metricLabel: { fontSize: 9, textAlign: "right" }, metricValue: { fontSize: 13, fontWeight: "900", marginTop: 5, textAlign: "right" }, toolbar: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }, sectionTitle: { fontSize: 18, fontWeight: "900", textAlign: "right" }, sectionSub: { fontSize: 9, marginTop: 3, textAlign: "right" }, addButton: { flexDirection: "row-reverse", alignItems: "center", gap: 5, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 11 }, addButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, filterBar: { minHeight: 46, borderRadius: 15, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 13, marginBottom: 9 }, statusFilters: { flexDirection: "row-reverse", gap: 7, marginBottom: 13, flexWrap: "wrap" }, statusFilter: { borderRadius: 11, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 }, statusFilterText: { fontSize: 10, fontWeight: "800" }, searchInput: { flex: 1, textAlign: "right", fontSize: 11, paddingVertical: 8 }, debtCard: { borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 11 }, cardTop: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, avatar: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" }, avatarText: { fontSize: 17, fontWeight: "900" }, customer: { flex: 1, alignItems: "flex-end" }, customerName: { fontSize: 13, fontWeight: "900", textAlign: "right" }, phone: { fontSize: 9, marginTop: 3 }, status: { flexDirection: "row-reverse", gap: 4, alignItems: "center", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5 }, statusDot: { width: 5, height: 5, borderRadius: 3 }, statusText: { fontSize: 8, fontWeight: "900" }, amountRow: { borderTopWidth: 1, marginTop: 13, paddingTop: 12, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" }, amountSide: { alignItems: "flex-end" }, dueSide: { alignItems: "flex-end" }, label: { fontSize: 9 }, remaining: { fontSize: 14, fontWeight: "900", marginTop: 4 }, amount: { fontSize: 11, fontWeight: "800", marginTop: 6 }, due: { fontSize: 11, fontWeight: "800", marginTop: 6 }, progressTrack: { height: 5, borderRadius: 4, overflow: "hidden", marginTop: 14 }, progressFill: { height: "100%", borderRadius: 4 }, actions: { flexDirection: "row-reverse", alignItems: "center", gap: 7, marginTop: 13 }, whatsappButton: { flexDirection: "row-reverse", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 8 }, whatsappText: { color: "#16854C", fontSize: 9, fontWeight: "900" }, paymentButton: { flexDirection: "row-reverse", alignItems: "center", gap: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 }, paymentText: { fontSize: 9, fontWeight: "800" }, moreButton: { marginLeft: "auto", padding: 5 }, dailyFocus: { minHeight: 76, borderRadius: 19, padding: 12, flexDirection: "row-reverse", alignItems: "center", gap: 9, marginBottom: 20 }, dailyFocusIcon: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center" }, dailyFocusCopy: { flex: 1, alignItems: "flex-end" }, dailyFocusTitle: { fontSize: 11, fontWeight: "900" }, dailyFocusText: { fontSize: 9, lineHeight: 15, textAlign: "right", marginTop: 3 }, dailyFocusButton: { minHeight: 36, borderRadius: 11, paddingHorizontal: 9, flexDirection: "row-reverse", alignItems: "center", gap: 4 }, dailyFocusButtonText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" }, modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.42)", justifyContent: "flex-end" }, modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 21, paddingBottom: 34 }, modalHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }, modalTitle: { fontSize: 20, fontWeight: "900" }, fieldLabel: { fontSize: 11, fontWeight: "800", textAlign: "right", marginBottom: 7, marginTop: 9 }, field: { minHeight: 46, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13, textAlign: "right", fontSize: 12 }, saveButton: { minHeight: 52, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 22 }, saveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" } });
