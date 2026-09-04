import { useMemo, useState } from "react";
import { Alert, Image, ImageBackground, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useMockAction } from "@/hooks/use-mock-action";
import { REAL_IMAGES } from "@/constants/assets";

interface InventoryItem { id: string; name: string; sku: string; quantity: number; reorderAt: number; unit: string; image: string; status: "متوفر" | "منخفض" | "نفد"; }

const INITIAL_ITEMS: InventoryItem[] = [
  { id: "i1", name: "قماش حرير إيطالي", sku: "FAB-001", quantity: 86, reorderAt: 20, unit: "لفة", image: REAL_IMAGES.products.shirt, status: "متوفر" },
  { id: "i2", name: "شاحن سريع أصلي", sku: "ELC-204", quantity: 14, reorderAt: 18, unit: "قطعة", image: REAL_IMAGES.products.watch, status: "منخفض" },
  { id: "i3", name: "علب تغليف كبيرة", sku: "PKG-089", quantity: 0, reorderAt: 12, unit: "علبة", image: REAL_IMAGES.products.bag, status: "نفد" },
  { id: "i4", name: "أحذية رياضية بيضاء", sku: "SHO-310", quantity: 32, reorderAt: 10, unit: "زوج", image: REAL_IMAGES.products.shoes, status: "متوفر" },
];

export default function InventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { run, busy } = useMockAction(500);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"الكل" | "منخفض" | "نفد">("الكل");
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reorderAt, setReorderAt] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const filtered = useMemo(() => items.filter((item) => (!query.trim() || `${item.name} ${item.sku}`.toLowerCase().includes(query.trim().toLowerCase())) && (filter === "الكل" || item.status === filter)), [items, query, filter]);
  const alerts = items.filter((item) => item.status !== "متوفر").length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const permission = await MediaLibrary.requestPermissionsAsync(false, ["photo"]);
      if (!permission.granted) { Alert.alert("الإذن مطلوب", "اسمح بالوصول إلى الصور حتى تختار صورة المادة من الاستوديو."); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) { Alert.alert("حجم الصورة كبير", "اختر صورة بحجم 10MB أو أقل."); return; }
    setImage(asset.uri);
  };

  const addItem = async () => {
    if (!name.trim() || !quantity.trim()) return;
    await run(async () => {
      const amount = Number(quantity) || 0;
      const threshold = Number(reorderAt) || 10;
      setItems((current) => [{ id: `new-${Date.now()}`, name: name.trim(), sku: sku.trim() || "بدون SKU", quantity: amount, reorderAt: threshold, unit: "قطعة", image: image || REAL_IMAGES.products.shirt, status: amount === 0 ? "نفد" : amount <= threshold ? "منخفض" : "متوفر" }, ...current]);
      setName(""); setSku(""); setQuantity(""); setReorderAt(""); setImage(null); setModalVisible(false);
    });
  };

  const openItem = (item: InventoryItem) => {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1, status: entry.quantity + 1 <= entry.reorderAt ? "منخفض" : "متوفر" } : entry));
  };

  return <ScreenContainer edges={["top", "left", "right"]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}><View style={[styles.headerMark, { backgroundColor: colors.primary }]}><MaterialIcons name="inventory-2" size={21} color="#FFFFFF" /></View><View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>لوحة جَايَبْلَك</Text><Text style={[styles.title, { color: colors.foreground }]}>المخزن</Text><Text style={[styles.subtitle, { color: colors.muted }]}>تابع الكميات والتنبيهات وحركة البضاعة</Text></View><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable></View>

      <View style={styles.metrics}><Metric label="إجمالي الأصناف" value={`${items.length}`} icon="category" color={colors.primary} colors={colors} /><Metric label="الوحدات" value={totalUnits.toLocaleString("en-US")} icon="all-inbox" color={colors.success} colors={colors} /><Metric label="تنبيهات" value={`${alerts}`} icon="warning-amber" color={colors.error} colors={colors} /></View>

      <View style={styles.toolbar}><View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>مخزون الشركة</Text><Text style={[styles.sectionSub, { color: colors.muted }]}>اضغط على مادة لتسجيل حركة استلام تجريبية</Text></View><Pressable onPress={() => setModalVisible(true)} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><MaterialIcons name="add" size={18} color="#FFFFFF" /><Text style={styles.addButtonText}>إضافة مادة</Text></Pressable></View>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={19} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث بالاسم أو SKU" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} /><Pressable onPress={() => router.push("/inventory-settings")}><MaterialIcons name="tune" size={20} color={colors.primary} /></Pressable></View>
      <View style={styles.filters}>{(["الكل", "منخفض", "نفد"] as const).map((value) => <Pressable key={value} onPress={() => setFilter(value)} style={({ pressed }) => [styles.filterPill, { backgroundColor: filter === value ? colors.foreground : colors.surface, borderColor: filter === value ? colors.foreground : colors.border, opacity: pressed ? 0.72 : 1 }]}><Text style={[styles.filterText, { color: filter === value ? "#FFFFFF" : colors.foreground }]}>{value}</Text></Pressable>)}</View>

      {filtered.map((item) => { const statusColor = item.status === "نفد" ? colors.error : item.status === "منخفض" ? colors.warning : colors.success; return <Pressable key={item.id} onPress={() => openItem(item)} style={({ pressed }) => [styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}><View style={styles.itemHeader}><View style={[styles.status, { backgroundColor: `${statusColor}18` }]}><View style={[styles.statusDot, { backgroundColor: statusColor }]} /><Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text></View><View style={styles.itemCopy}><Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.itemSku, { color: colors.muted }]}>SKU · {item.sku}</Text></View><ImageBackground source={{ uri: item.image }} style={styles.itemImage} imageStyle={styles.itemImageStyle} /></View><View style={[styles.itemFooter, { borderTopColor: colors.border }]}><View style={styles.quantityBlock}><Text style={[styles.quantityLabel, { color: colors.muted }]}>الكمية الحالية</Text><Text style={[styles.quantityValue, { color: statusColor }]}>{item.quantity} <Text style={[styles.unit, { color: colors.muted }]}>{item.unit}</Text></Text></View><View style={styles.reorderBlock}><Text style={[styles.quantityLabel, { color: colors.muted }]}>حد إعادة الطلب</Text><Text style={[styles.reorderValue, { color: colors.foreground }]}>{item.reorderAt} {item.unit}</Text></View><View style={[styles.receiveHint, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name="add" size={15} color={colors.primary} /><Text style={[styles.receiveText, { color: colors.primary }]}>استلام</Text></View></View></Pressable>; })}
      {!filtered.length && <View style={styles.empty}><MaterialIcons name="inventory-2" size={34} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>لا توجد مواد مطابقة</Text><Text style={[styles.emptyText, { color: colors.muted }]}>غيّر الفلتر أو أضف مادة جديدة للمخزن.</Text></View>}
      <View style={{ height: 28 }} />
    </ScrollView>

    <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}><View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.surface }]}><View style={styles.modalHeader}><Pressable onPress={() => setModalVisible(false)}><MaterialIcons name="close" size={22} color={colors.foreground} /></Pressable><Text style={[styles.modalTitle, { color: colors.foreground }]}>إضافة مادة للمخزن</Text><View style={{ width: 22 }} /></View><Field label="اسم المادة" value={name} onChangeText={setName} placeholder="مثال: قماش قطني" colors={colors} /><Text style={[styles.fieldLabel, { color: colors.foreground }]}>صورة المادة</Text><Pressable onPress={pickImage} style={({ pressed }) => [styles.imagePicker, { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><View style={[styles.imagePickerIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name={image ? "image" : "add-a-photo"} size={22} color={colors.primary} /></View><View style={styles.imagePickerCopy}><Text style={[styles.imagePickerTitle, { color: colors.foreground }]}>{image ? "تم اختيار صورة المادة" : "إضافة صورة للمادة"}</Text><Text style={[styles.imagePickerHint, { color: colors.muted }]}>اختياري الآن · تُستخدم لاحقاً للتعرّف على المنتج</Text></View>{image && <Image source={{ uri: image }} style={styles.imagePreview} />}</Pressable>{image && <Pressable onPress={() => setImage(null)} style={({ pressed }) => [styles.removeImage, { opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="close" size={14} color={colors.error} /><Text style={[styles.removeImageText, { color: colors.error }]}>إزالة الصورة</Text></Pressable>}<Field label="SKU" value={sku} onChangeText={setSku} placeholder="مثال: FAB-004" colors={colors} /><View style={styles.fieldRow}><View style={styles.half}><Field label="الكمية" value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="numeric" colors={colors} /></View><View style={styles.half}><Field label="حد التنبيه" value={reorderAt} onChangeText={setReorderAt} placeholder="10" keyboardType="numeric" colors={colors} /></View></View><Pressable disabled={busy} onPress={addItem} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed || busy ? 0.72 : 1 }]}><Text style={styles.saveText}>{busy ? "جارٍ الحفظ..." : "حفظ المادة"}</Text></Pressable></View></View></Modal>
  </ScreenContainer>;
}

function Metric({ label, value, icon, color, colors }: { label: string; value: string; icon: keyof typeof MaterialIcons.glyphMap; color: string; colors: ReturnType<typeof useColors> }) { return <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}><MaterialIcons name={icon} size={16} color={color} /></View><Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text><Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text></View>; }

function Field({ label, value, onChangeText, placeholder, colors, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; colors: ReturnType<typeof useColors>; keyboardType?: "numeric" }) { return <View><Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType} style={[styles.field, { borderColor: colors.border, color: colors.foreground }]} /></View>; }

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 10 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 20 }, headerCopy: { flex: 1, alignItems: "flex-end" }, headerMark: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" }, iconButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" }, eyebrow: { fontSize: 10, fontWeight: "800", marginBottom: 3 }, title: { fontSize: 28, fontWeight: "900" }, subtitle: { fontSize: 10, marginTop: 4, textAlign: "right" }, metrics: { flexDirection: "row-reverse", gap: 8, marginBottom: 23 }, metric: { flex: 1, minHeight: 102, borderRadius: 18, borderWidth: 1, padding: 11, alignItems: "flex-end" }, metricIcon: { width: 27, height: 27, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 9 }, metricLabel: { fontSize: 9 }, metricValue: { fontSize: 20, fontWeight: "900", marginTop: 4 }, toolbar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }, sectionTitle: { fontSize: 18, fontWeight: "900", textAlign: "right" }, sectionSub: { fontSize: 9, marginTop: 3, textAlign: "right" }, addButton: { flexDirection: "row-reverse", alignItems: "center", gap: 4, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 11 }, addButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" }, search: { minHeight: 46, borderRadius: 15, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row-reverse", alignItems: "center", gap: 8 }, searchInput: { flex: 1, textAlign: "right", fontSize: 11, paddingVertical: 8 }, filters: { flexDirection: "row-reverse", gap: 8, marginVertical: 12 }, filterPill: { borderRadius: 10, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 14 }, filterText: { fontSize: 10, fontWeight: "800" }, itemCard: { borderRadius: 20, borderWidth: 1, padding: 13, marginBottom: 10 }, itemHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, itemImage: { width: 62, height: 62, borderRadius: 16, overflow: "hidden" }, itemImageStyle: { borderRadius: 16 }, itemCopy: { flex: 1, alignItems: "flex-end" }, itemName: { fontSize: 13, fontWeight: "900", textAlign: "right" }, itemSku: { fontSize: 9, marginTop: 4 }, status: { flexDirection: "row-reverse", gap: 4, alignItems: "center", paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8 }, statusDot: { width: 5, height: 5, borderRadius: 3 }, statusText: { fontSize: 8, fontWeight: "900" }, itemFooter: { borderTopWidth: 1, marginTop: 12, paddingTop: 11, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, quantityBlock: { alignItems: "flex-end" }, reorderBlock: { alignItems: "flex-end" }, quantityLabel: { fontSize: 8 }, quantityValue: { fontSize: 15, fontWeight: "900", marginTop: 4 }, unit: { fontSize: 8, fontWeight: "700" }, reorderValue: { fontSize: 10, fontWeight: "800", marginTop: 6 }, receiveHint: { flexDirection: "row-reverse", alignItems: "center", gap: 2, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 8 }, receiveText: { fontSize: 9, fontWeight: "900" }, empty: { alignItems: "center", justifyContent: "center", paddingVertical: 65 }, emptyTitle: { fontSize: 16, fontWeight: "900", marginTop: 10 }, emptyText: { fontSize: 10, marginTop: 4 }, modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.45)", justifyContent: "flex-end" }, modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 21, paddingBottom: 34 }, modalHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 17 }, modalTitle: { fontSize: 19, fontWeight: "900" }, fieldRow: { flexDirection: "row-reverse", gap: 9 }, half: { flex: 1 }, fieldLabel: { textAlign: "right", fontSize: 10, fontWeight: "800", marginTop: 10, marginBottom: 6 }, field: { borderWidth: 1, borderRadius: 12, minHeight: 45, paddingHorizontal: 12, textAlign: "right", fontSize: 11 }, saveButton: { minHeight: 51, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 22 }, saveText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, imagePicker: { minHeight: 76, borderRadius: 15, borderWidth: 1, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, imagePickerIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" }, imagePickerCopy: { flex: 1, alignItems: "flex-end" }, imagePickerTitle: { fontSize: 11, fontWeight: "900" }, imagePickerHint: { fontSize: 8, marginTop: 4, textAlign: "right" }, imagePreview: { width: 54, height: 54, borderRadius: 12 }, removeImage: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "flex-start", gap: 4, marginTop: 7, paddingVertical: 2 }, removeImageText: { fontSize: 9, fontWeight: "800" } });
