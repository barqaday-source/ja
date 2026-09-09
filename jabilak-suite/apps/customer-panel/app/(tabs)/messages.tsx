import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import { chatRepository, type LiveChatPreview as ChatPreview } from "@/lib/supabase/chat-data";

type Filter = "all" | "merchant" | "friend" | "support";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "الكل" },
  { id: "merchant", label: "التجار" },
  { id: "friend", label: "الأصدقاء" },
  { id: "support", label: "الدعم" },
];

function matchesFilter(chat: ChatPreview, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "merchant") return chat.role === "merchant";
  if (filter === "support") return chat.role === "assistant";
  return chat.role === "customer";
}

export default function MessagesScreen() {
  const colors = useColors();
  const { t, direction } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [chatItems, setChatItems] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [pendingDeleteChat, setPendingDeleteChat] = useState<ChatPreview | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const chats = useMemo(() => chatItems.filter((chat) => {
    const search = query.trim().toLocaleLowerCase();
    const matchesSearch = !search || `${chat.name} ${chat.lastMessage}`.toLocaleLowerCase().includes(search);
    return matchesSearch && matchesFilter(chat, filter);
  }), [chatItems, query, filter]);

  useEffect(() => {
    let active = true;
    void chatRepository.listConversations().then((rows) => { if (active) setChatItems(rows); }).catch((error) => Alert.alert("تعذر تحميل المحادثات", error instanceof Error ? error.message : "تحقق من اتصال Supabase وتسجيل الدخول.")).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const closeDeleteModal = () => { setPendingDeleteChat(null); setDeleteAllOpen(false); };
  const confirmDeleteChat = async () => { if (!pendingDeleteChat) return; try { await chatRepository.deleteConversation(pendingDeleteChat.id); setChatItems((current) => current.filter((item) => item.id !== pendingDeleteChat.id)); } catch (error) { Alert.alert("تعذر حذف المحادثة", error instanceof Error ? error.message : "تحقق من الصلاحيات."); } finally { closeDeleteModal(); } };
  const confirmDeleteAll = async () => { for (const chat of chatItems) { try { await chatRepository.deleteConversation(chat.id); } catch { /* RLS protects conversations not created by this user. */ } } setChatItems([]); closeDeleteModal(); };
  const togglePin = (id: string) => setChatItems((current) => current.map((item) => item.id === id ? { ...item, pinned: !item.pinned } : item));
  const toggleMute = (id: string) => setMutedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const renderChat = ({ item }: { item: ChatPreview }) => {
    const muted = mutedIds.has(item.id);
    return <Pressable onPress={() => router.push(`/chat/${item.id}`)} style={({ pressed }) => [styles.chatRow, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.78 : 1 }]}>
      <View style={styles.avatarWrap}><Image source={{ uri: item.avatar }} style={styles.avatar} />{item.online && <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.surface }]} />}</View>
      <View style={styles.chatCopy}><View style={styles.nameLine}><Text style={[styles.chatName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>{item.role === "merchant" && <MaterialIcons name="storefront" size={14} color={colors.primary} />}{item.pinned && <MaterialIcons name="push-pin" size={13} color={colors.primary} />}</View><Text style={[styles.chatMessage, { color: item.unread ? colors.foreground : colors.muted }]} numberOfLines={1}>{item.lastMessage}</Text></View>
      <View style={styles.chatAside}><Text style={[styles.time, { color: item.unread ? colors.primary : colors.muted }]}>{item.time}</Text>{item.unread > 0 && !muted && <View style={[styles.unread, { backgroundColor: colors.primary }]}><Text style={styles.unreadText}>{item.unread}</Text></View>}<View style={styles.quickActions}><Pressable hitSlop={7} accessibilityLabel={item.pinned ? "إلغاء تثبيت المحادثة" : "تثبيت المحادثة"} onPress={(event) => { event.stopPropagation(); togglePin(item.id); }}><MaterialIcons name={item.pinned ? "push-pin" : "push-pin"} size={15} color={item.pinned ? colors.primary : colors.muted} /></Pressable><Pressable hitSlop={7} accessibilityLabel={muted ? "إلغاء كتم المحادثة" : "كتم المحادثة"} onPress={(event) => { event.stopPropagation(); toggleMute(item.id); }}><MaterialIcons name={muted ? "notifications-off" : "notifications-none"} size={16} color={muted ? colors.primary : colors.muted} /></Pressable><Pressable hitSlop={7} accessibilityLabel={t("deleteChat")} onPress={(event) => { event.stopPropagation(); setPendingDeleteChat(item); }}><MaterialIcons name="delete-outline" size={16} color={colors.error} /></Pressable></View><MaterialIcons name="chevron-left" size={18} color={colors.muted} /></View>
    </Pressable>;
  };

  return <ScreenContainer edges={["top", "left", "right"]}><View style={[styles.content, { direction }]}>
    <View style={styles.header}><View style={styles.headerCopy}><Text style={[styles.title, { color: colors.foreground }]}>المحادثات</Text><Text style={[styles.subtitle, { color: colors.muted }]}>تواصل مع التجار والأصدقاء والدعم</Text></View><Pressable disabled={!chatItems.length} accessibilityLabel={t("deleteAllChats")} onPress={() => setDeleteAllOpen(true)} style={({ pressed }) => [styles.deleteAllButton, { backgroundColor: `${colors.error}12`, opacity: !chatItems.length ? 0.35 : pressed ? 0.65 : 1 }]}><MaterialIcons name="delete-sweep" size={20} color={colors.error} /></Pressable></View>
    <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={19} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="بحث في المحادثات..." placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground, textAlign: direction === "ltr" ? "left" : "right" }]} /></View>
    <View style={styles.filters}>{FILTERS.map((item) => <Pressable key={item.id} onPress={() => setFilter(item.id)} style={({ pressed }) => [styles.filter, { backgroundColor: filter === item.id ? colors.foreground : colors.surface, borderColor: filter === item.id ? colors.foreground : colors.border, opacity: pressed ? 0.72 : 1 }]}><Text style={[styles.filterText, { color: filter === item.id ? "#FFFFFF" : colors.foreground }]}>{item.label}</Text></Pressable>)}</View>
    <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{FILTERS.find((item) => item.id === filter)?.label}</Text><Text style={[styles.sectionCount, { color: colors.muted }]}>{chats.length} محادثة</Text></View>
    <FlatList data={chats} keyExtractor={(item) => item.id} renderItem={renderChat} style={styles.listFlex} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.empty}><MaterialIcons name={loading ? "sync" : "chat-bubble-outline"} size={37} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{loading ? "جارٍ تحميل المحادثات..." : query ? "لا توجد نتائج مطابقة" : t("noConversations")}</Text><Text style={[styles.emptyText, { color: colors.muted }]}>{!loading && (query ? "جرّب كلمة بحث أخرى" : "ستظهر محادثاتك هنا عند توفرها")}</Text></View>} />
    <Modal visible={pendingDeleteChat !== null || deleteAllOpen} transparent animationType="fade" onRequestClose={closeDeleteModal}><Pressable style={styles.confirmBackdrop} onPress={closeDeleteModal}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.confirmCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.confirmIcon, { backgroundColor: `${colors.error}12` }]}><MaterialIcons name="delete-sweep" size={25} color={colors.error} /></View><Text style={[styles.confirmTitle, { color: colors.foreground }]}>{deleteAllOpen ? t("deleteAllChats") : t("deleteChat")}</Text><Text style={[styles.confirmBody, { color: colors.muted }]}>{deleteAllOpen ? t("deleteAllWarning") : t("deleteOneWarning")}</Text><View style={styles.confirmActions}><Pressable onPress={closeDeleteModal} style={({ pressed }) => [styles.confirmCancel, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.confirmCancelText, { color: colors.foreground }]}>{t("deleteCancel")}</Text></Pressable><Pressable onPress={deleteAllOpen ? confirmDeleteAll : confirmDeleteChat} style={({ pressed }) => [styles.confirmDelete, { backgroundColor: colors.error, opacity: pressed ? 0.75 : 1 }]}><Text style={styles.confirmDeleteText}>{t("confirmDelete")}</Text></Pressable></View></Pressable></Pressable></Modal>
  </View></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20 }, header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, headerCopy: { flex: 1, alignItems: "flex-end" }, title: { fontSize: 28, fontWeight: "900" }, subtitle: { fontSize: 10, marginTop: 4, textAlign: "right" }, deleteAllButton: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" }, search: { minHeight: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row-reverse", alignItems: "center", gap: 8 }, searchInput: { flex: 1, fontSize: 12, paddingVertical: 9 }, filters: { flexDirection: "row-reverse", gap: 6, marginTop: 12 }, filter: { flex: 1, minHeight: 36, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }, filterText: { fontSize: 9, fontWeight: "900" }, sectionHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 9 }, sectionTitle: { fontSize: 16, fontWeight: "900" }, sectionCount: { fontSize: 10 }, listFlex: { flex: 1, minHeight: 0 }, list: { gap: 8, paddingBottom: 28 }, chatRow: { minHeight: 70, borderRadius: 16, borderWidth: 1, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, avatarWrap: { width: 48, height: 48, position: "relative" }, avatar: { width: 48, height: 48, borderRadius: 17 }, onlineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, position: "absolute", left: -2, bottom: -1 }, chatCopy: { flex: 1, alignItems: "flex-end", gap: 4 }, nameLine: { flexDirection: "row-reverse", alignItems: "center", gap: 5, maxWidth: "100%" }, chatName: { fontSize: 12, fontWeight: "900", maxWidth: "88%" }, chatMessage: { fontSize: 10, textAlign: "right", maxWidth: "100%" }, chatAside: { alignItems: "center", gap: 5 }, time: { fontSize: 8, fontWeight: "800" }, quickActions: { flexDirection: "row-reverse", alignItems: "center", gap: 6 }, unread: { minWidth: 20, height: 20, borderRadius: 7, alignItems: "center", justifyContent: "center" }, unreadText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900" }, empty: { alignItems: "center", paddingTop: 80 }, emptyTitle: { fontSize: 16, fontWeight: "900", marginTop: 10 }, emptyText: { fontSize: 10, marginTop: 5 }, confirmBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.48)", alignItems: "center", justifyContent: "center", padding: 20 }, confirmCard: { width: "100%", maxWidth: 430, borderRadius: 24, borderWidth: 1, padding: 20, gap: 10 }, confirmIcon: { width: 52, height: 52, borderRadius: 17, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }, confirmTitle: { fontSize: 18, fontWeight: "900", textAlign: "right" }, confirmBody: { fontSize: 11, lineHeight: 20, textAlign: "right" }, confirmActions: { flexDirection: "row-reverse", gap: 9, marginTop: 7 }, confirmCancel: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" }, confirmCancelText: { fontSize: 11, fontWeight: "800" }, confirmDelete: { flex: 1.2, minHeight: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" }, confirmDeleteText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
});
