import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const PRODUCTS: Array<{ id: string; name: string; price: number; rating: number; sold: number; created: number; available: boolean; color: string }> = [];

const TABS = ["الكل", "الأحدث", "الأكثر مبيعاً", "الأعلى تقييماً"];
const SORTS = ["الأكثر صلة", "السعر الأقل", "السعر الأعلى", "الأحدث", "الأكثر مبيعاً"];

export default function CompanyProductsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("الكل");
  const [sort, setSort] = useState("الأكثر صلة");
  const [sortOpen, setSortOpen] = useState(false);

  const products = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = PRODUCTS.filter((item) => !search || item.name.toLowerCase().includes(search));
    const tabbed = filtered.filter((item) => tab === "الكل" || (tab === "الأحدث" ? item.created <= 3 : tab === "الأكثر مبيعاً" ? item.sold >= 150 : item.rating >= 4.8));
    return [...tabbed].sort((a, b) => sort === "السعر الأقل" ? a.price - b.price : sort === "السعر الأعلى" ? b.price - a.price : sort === "الأحدث" ? a.created - b.created : sort === "الأكثر مبيعاً" ? b.sold - a.sold : 0);
  }, [query, sort, tab]);

  const formatPrice = (price: number) => `${price.toLocaleString("en-US")} د.ع`;

  const header = (
    <View>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable>
        <View style={styles.companyHeading}><View style={styles.companyNameRow}><Text style={[styles.companyName, { color: colors.foreground }]}>المتجر</Text><MaterialIcons name="verified" size={16} color={colors.primary} /></View><Text style={[styles.companySub, { color: colors.muted }]}>بيانات المتجر غير متاحة</Text></View><View style={[styles.companyAvatar, { backgroundColor: colors.primary }]}><MaterialIcons name="storefront" size={22} color="#FFFFFF" /></View>
      </View>
      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={19} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث داخل منتجات الشركة" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} textAlign="right" returnKeyType="search" /></View>
      <FlatList data={TABS} horizontal inverted showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} contentContainerStyle={styles.tabs} renderItem={({ item }) => <Pressable onPress={() => setTab(item)} style={({ pressed }) => [styles.tab, { backgroundColor: tab === item ? colors.primary : colors.surface, borderColor: tab === item ? colors.primary : colors.border, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.tabText, { color: tab === item ? "#FFFFFF" : colors.foreground }]}>{item}</Text></Pressable>} />
      <View style={styles.resultBar}><Text style={[styles.resultCount, { color: colors.muted }]}>{products.length} منتجات</Text><Pressable onPress={() => setSortOpen((value) => !value)} style={({ pressed }) => [styles.sortButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.sortText, { color: colors.foreground }]}>{sort}</Text><MaterialIcons name={sortOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={18} color={colors.primary} /></Pressable></View>
      {sortOpen && <View style={[styles.sortMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>{SORTS.map((item) => <Pressable key={item} onPress={() => { setSort(item); setSortOpen(false); }} style={[styles.sortOption, { borderBottomColor: colors.border }]}><Text style={[styles.sortOptionText, { color: item === sort ? colors.primary : colors.foreground }]}>{item}</Text>{item === sort && <MaterialIcons name="check" size={17} color={colors.primary} />}</Pressable>)}</View>}
      <View style={[styles.notice, { backgroundColor: `${colors.primary}10` }]}><MaterialIcons name="storefront" size={17} color={colors.primary} /><Text style={[styles.noticeText, { color: colors.muted }]}>منتجات أصلية من متجر موثق</Text></View>
    </View>
  );

  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={products} numColumns={2} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} columnWrapperStyle={styles.grid} showsVerticalScrollIndicator={false} ListHeaderComponent={header} renderItem={({ item }) => <Pressable onPress={() => Alert.alert(item.name, `${formatPrice(item.price)}\n${item.available ? "متوفر الآن" : "غير متوفر حالياً"}\n\nسيتم فتح صفحة المنتج في الشاشة التالية.`)} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}><View style={[styles.cover, { backgroundColor: item.color }]}><View style={styles.orb} /><View style={[styles.stock, { backgroundColor: item.available ? "rgba(255,255,255,0.9)" : "rgba(26,24,33,0.72)" }]}><Text style={[styles.stockText, { color: item.available ? colors.success : "#FFFFFF" }]}>{item.available ? "متوفر" : "غير متوفر"}</Text></View><MaterialIcons name="checkroom" size={34} color="rgba(255,255,255,0.82)" /></View><View style={styles.info}><View style={styles.nameLine}><Text numberOfLines={1} style={[styles.productName, { color: colors.foreground }]}>{item.name}</Text><MaterialIcons name="verified" size={13} color={colors.primary} /></View><Text style={[styles.price, { color: colors.primary }]}>{formatPrice(item.price)}</Text><View style={styles.meta}><Text style={[styles.rating, { color: colors.muted }]}>★ {item.rating}</Text><Text style={[styles.sold, { color: colors.muted }]}>{item.sold} مبيع</Text></View></View></Pressable>} ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="inventory-2" size={34} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>لا توجد منتجات</Text><Text style={[styles.emptyText, { color: colors.muted }]}>جرّب كلمة بحث أو تبويباً آخر.</Text></View>} ListFooterComponent={<View style={{ height: 105 }} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 18 },
  topBar: { paddingHorizontal: 20, paddingTop: 17, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  companyHeading: { flex: 1, alignItems: "flex-end" },
  companyNameRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  companyName: { fontSize: 17, fontWeight: "900" },
  companySub: { fontSize: 10, marginTop: 4 },
  companyAvatar: { width: 45, height: 45, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  search: { height: 52, marginHorizontal: 20, marginTop: 18, borderWidth: 1, borderRadius: 18, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 14, gap: 9 },
  searchInput: { flex: 1, fontSize: 12, paddingVertical: 0 },
  tabs: { gap: 8, paddingHorizontal: 20, paddingVertical: 17 },
  tab: { paddingHorizontal: 15, minHeight: 38, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  tabText: { fontSize: 10, fontWeight: "800" },
  resultBar: { paddingHorizontal: 20, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  resultCount: { fontSize: 10 },
  sortButton: { minHeight: 37, borderRadius: 13, borderWidth: 1, paddingHorizontal: 10, flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  sortText: { fontSize: 10, fontWeight: "800" },
  sortMenu: { marginHorizontal: 20, marginTop: 8, borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  sortOption: { minHeight: 40, paddingHorizontal: 13, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1 },
  sortOptionText: { fontSize: 10, fontWeight: "700" },
  notice: { marginHorizontal: 20, marginTop: 14, borderRadius: 14, padding: 9, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 },
  noticeText: { fontSize: 10, fontWeight: "700" },
  grid: { paddingHorizontal: 20, justifyContent: "space-between", gap: 12, marginTop: 13 },
  card: { width: "48.3%", borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  cover: { height: 148, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  orb: { position: "absolute", width: 145, height: 145, borderRadius: 80, right: -45, bottom: -64, backgroundColor: "rgba(255,255,255,0.13)" },
  stock: { position: "absolute", right: 8, top: 8, borderRadius: 9, paddingHorizontal: 6, paddingVertical: 4 },
  stockText: { fontSize: 9, fontWeight: "900" },
  info: { padding: 11, alignItems: "flex-end" },
  nameLine: { width: "100%", flexDirection: "row-reverse", alignItems: "center", gap: 3 },
  productName: { flex: 1, fontSize: 11, fontWeight: "900", textAlign: "right" },
  price: { width: "100%", fontSize: 11, fontWeight: "900", textAlign: "right", marginTop: 6 },
  meta: { width: "100%", flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 7 },
  rating: { fontSize: 9 },
  sold: { fontSize: 9 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 70 },
  emptyTitle: { fontSize: 17, fontWeight: "900", marginTop: 12 },
  emptyText: { fontSize: 11, marginTop: 5 },
});
