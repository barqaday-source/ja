import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";

type Notice = { id: string; title: string; body: string; time: string; kind: "order" | "promo" | "system"; read: boolean; icon: keyof typeof MaterialIcons.glyphMap };
const INITIAL: Notice[] = [
  { id: "1", title: "طلب جديد ينتظر تأكيدك", body: "لديك طلب بقيمة 85,000 د.ع من محمد علي.", time: "منذ 8 دقائق", kind: "order", read: false, icon: "shopping-bag" },
  { id: "2", title: "وصلت منتجات جديدة", body: "تصفح تشكيلات الموسم من المتاجر القريبة منك.", time: "منذ ساعتين", kind: "promo", read: false, icon: "local-offer" },
  { id: "3", title: "تم تحديث إعدادات الحساب", body: "تأكد من مراجعة إعدادات الخصوصية والإشعارات.", time: "أمس", kind: "system", read: true, icon: "settings" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [items, setItems] = useState(INITIAL);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Notice | "all" | null>(null);
  const visible = useMemo(() => filter === "unread" ? items.filter((item) => !item.read) : items, [filter, items]);
  const unread = items.filter((item) => !item.read).length;

  const markRead = (id: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  const markAll = () => setItems((current) => current.map((item) => ({ ...item, read: true })));
  const deleteNotice = (item: Notice) => setPendingDelete(item);
  const clear = () => setPendingDelete("all");
  const confirmDelete = () => {
    if (pendingDelete === "all") setItems([]);
    else if (pendingDelete) setItems((current) => current.filter((entry) => entry.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return <ScreenContainer edges={["top", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable><View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND.name}</Text><Text style={[styles.title, { color: colors.foreground }]}>الإشعارات</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{unread ? `لديك ${unread} إشعارات جديدة` : "أنت على اطلاع بكل جديد"}</Text></View></View>
    <View style={[styles.actions, { borderColor: colors.border, backgroundColor: colors.surface }]}><Pressable onPress={clear} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}><MaterialIcons name="delete-sweep" size={18} color={colors.error} /><Text style={[styles.actionText, { color: colors.error }]}>مسح الكل</Text></Pressable><Pressable onPress={markAll} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}><MaterialIcons name="done-all" size={18} color={colors.primary} /><Text style={[styles.actionText, { color: colors.primary }]}>تحديد كمقروء</Text></Pressable></View>
    <View style={styles.filters}>{[{ id: "all" as const, label: "الكل" }, { id: "unread" as const, label: `غير مقروءة ${unread ? `(${unread})` : ""}` }].map((item) => <Pressable key={item.id} onPress={() => setFilter(item.id)} style={[styles.filter, { backgroundColor: filter === item.id ? colors.primary : colors.surface, borderColor: filter === item.id ? colors.primary : colors.border }]}><Text style={[styles.filterText, { color: filter === item.id ? colors.foreground : colors.muted }]}>{item.label}</Text></Pressable>)}</View>
    <View style={styles.list}>{visible.length ? visible.map((item) => <Pressable key={item.id} onPress={() => markRead(item.id)} style={({ pressed }) => [styles.notice, { backgroundColor: item.read ? colors.surface : `${colors.primary}12`, borderColor: item.read ? colors.border : `${colors.primary}55`, opacity: pressed ? 0.78 : 1 }]}><View style={[styles.noticeIcon, { backgroundColor: item.read ? colors.background : `${colors.primary}22` }]}><MaterialIcons name={item.icon} size={20} color={item.read ? colors.muted : colors.primary} /></View><View style={styles.noticeCopy}><View style={styles.noticeTop}><Text style={[styles.noticeTime, { color: colors.muted }]}>{item.time}</Text>{!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}</View><Text style={[styles.noticeTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.noticeBody, { color: colors.muted }]}>{item.body}</Text></View><Pressable onPress={(event) => { event.stopPropagation(); deleteNotice(item); }} hitSlop={8} style={({ pressed }) => [styles.noticeDelete, { backgroundColor: `${colors.error}10`, opacity: pressed ? 0.55 : 1 }]}><MaterialIcons name="delete-outline" size={17} color={colors.error} /></Pressable></Pressable>) : <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="notifications-off" size={40} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>لا توجد إشعارات</Text><Text style={[styles.emptyBody, { color: colors.muted }]}>ستظهر التنبيهات الجديدة هنا.</Text></View>}</View>
    <View style={styles.settingsTitle}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>إعدادات التنبيهات</Text><MaterialIcons name="tune" size={19} color={colors.primary} /></View>
    <Modal transparent visible={pendingDelete !== null} animationType="fade" onRequestClose={() => setPendingDelete(null)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.confirmModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.confirmIcon, { backgroundColor: `${colors.error}12` }]}><MaterialIcons name="delete-outline" size={25} color={colors.error} /></View>
          <Text style={[styles.confirmTitle, { color: colors.foreground }]}>{pendingDelete === "all" ? "مسح كل الإشعارات" : "حذف الإشعار"}</Text>
          <Text style={[styles.confirmBody, { color: colors.muted }]}>{pendingDelete === "all" ? "سيتم حذف كل الإشعارات من هذه القائمة. هل تريد المتابعة؟" : `هل تريد حذف «${pendingDelete?.title ?? "هذا الإشعار"}»؟`}</Text>
          <View style={styles.confirmActions}>
            <Pressable onPress={() => setPendingDelete(null)} style={({ pressed }) => [styles.confirmCancel, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.confirmCancelText, { color: colors.foreground }]}>إلغاء</Text></Pressable>
            <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.confirmDelete, { backgroundColor: colors.error, opacity: pressed ? 0.75 : 1 }]}><Text style={styles.confirmDeleteText}>تأكيد الحذف</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
    <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Toggle title="إشعارات التطبيق" description="تنبيهات الطلبات والرسائل داخل جايبلك" value={push} onValueChange={setPush} colors={colors} /><View style={[styles.divider, { backgroundColor: colors.border }]} /><Toggle title="التنبيهات البريدية" description="ملخصات وتحديثات على بريدك الإلكتروني" value={email} onValueChange={setEmail} colors={colors} /></View>
  </ScrollView></ScreenContainer>;
}

function Toggle({ title, description, value, onValueChange, colors }: { title: string; description: string; value: boolean; onValueChange: (value: boolean) => void; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.toggle}><Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: `${colors.primary}88` }} thumbColor={value ? colors.primary : colors.muted} /><View style={styles.toggleCopy}><Text style={[styles.toggleTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.toggleBody, { color: colors.muted }]}>{description}</Text></View></View>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34, gap: 16 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 14 }, back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" }, headerCopy: { flex: 1, alignItems: "flex-end" }, eyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 1.5 }, title: { fontSize: 28, fontWeight: "900", marginTop: 2 }, subtitle: { fontSize: 12, marginTop: 4 }, actions: { flexDirection: "row-reverse", justifyContent: "space-between", borderWidth: 1, borderRadius: 18, padding: 5 }, action: { flex: 1, minHeight: 41, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 }, actionText: { fontSize: 11, fontWeight: "800" }, filters: { flexDirection: "row-reverse", gap: 9 }, filter: { borderWidth: 1, borderRadius: 15, minHeight: 39, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" }, filterText: { fontSize: 11, fontWeight: "800" }, list: { gap: 10 }, notice: { borderWidth: 1, borderRadius: 20, padding: 14, flexDirection: "row-reverse", gap: 11 }, noticeIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" }, noticeCopy: { flex: 1, alignItems: "flex-end" }, noticeTop: { flexDirection: "row-reverse", alignItems: "center", gap: 7, width: "100%" }, dot: { width: 7, height: 7, borderRadius: 4 }, noticeTime: { marginLeft: "auto", fontSize: 10 }, noticeTitle: { width: "100%", fontSize: 13, fontWeight: "900", textAlign: "right", marginTop: 5 }, noticeBody: { width: "100%", fontSize: 11, lineHeight: 18, textAlign: "right", marginTop: 4 }, noticeDelete: { width: 32, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", alignSelf: "center" }, empty: { minHeight: 180, borderWidth: 1, borderRadius: 22, alignItems: "center", justifyContent: "center", gap: 7 }, emptyTitle: { fontSize: 17, fontWeight: "900" }, emptyBody: { fontSize: 11 }, modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.42)", justifyContent: "center", alignItems: "center", padding: 20 }, confirmModal: { width: "100%", maxWidth: 440, borderRadius: 24, borderWidth: 1, padding: 20, gap: 11 }, confirmIcon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }, confirmTitle: { fontSize: 19, fontWeight: "900", textAlign: "right" }, confirmBody: { fontSize: 12, lineHeight: 20, textAlign: "right" }, confirmActions: { flexDirection: "row-reverse", gap: 9, marginTop: 6 }, confirmCancel: { flex: 1, minHeight: 48, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" }, confirmCancelText: { fontSize: 12, fontWeight: "800" }, confirmDelete: { flex: 1.25, minHeight: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" }, confirmDeleteText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, settingsTitle: { flexDirection: "row-reverse", alignItems: "center", gap: 8, justifyContent: "flex-start" }, sectionTitle: { fontSize: 18, fontWeight: "900" }, settingsCard: { borderWidth: 1, borderRadius: 22, paddingHorizontal: 14 }, toggle: { minHeight: 76, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, toggleCopy: { flex: 1, alignItems: "flex-end" }, toggleTitle: { fontSize: 13, fontWeight: "900" }, toggleBody: { fontSize: 10, textAlign: "right", marginTop: 4 }, divider: { height: 1 }, });
