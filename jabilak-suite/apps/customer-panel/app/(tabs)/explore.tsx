import { useMemo, useState } from "react";
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { type ProductType } from "@/lib/product-taxonomy";

const CATEGORIES = [
  { name: "ملابس", icon: "checkroom" },
  { name: "إلكترونيات", icon: "devices" },
  { name: "أثاث", icon: "chair" },
  { name: "أحذية", icon: "steps" },
  { name: "مجوهرات", icon: "diamond" },
  { name: "مستلزمات منزلية", icon: "home" },
  { name: "مواد غذائية", icon: "local-grocery-store" },
  { name: "سيارات", icon: "directions-car" },
  { name: "خدمات", icon: "storefront" },
] as const;

type StoreResult = {
  kind: "store";
  id: string;
  name: string;
  detail: string;
  product: string;
  productType: ProductType;
  price: string;
  rating: string;
  verified: boolean;
  color: string;
};

type PostResult = {
  kind: "post";
  id: string;
  productId: string;
  shopId: string;
  shop: string;
  title: string;
  caption: string;
  product: string;
  productType: ProductType;
  price: string;
  rating: string;
  location: string;
  image: string;
  verified: boolean;
  likes: string;
};

const STORES: StoreResult[] = [];

const POSTS: PostResult[] = [];

const LOCATIONS = ["كل المواقع", "بغداد", "البصرة", "أربيل", "النجف", "كربلاء"];
const SORTS = ["الأكثر صلة", "الأحدث", "الأعلى تقييماً", "الأقل سعراً"];
type CategoryIcon = keyof typeof MaterialIcons.glyphMap;

export default function ExploreScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [location, setLocation] = useState("كل المواقع");
  const [sort, setSort] = useState("الأكثر صلة");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const isPostMode = category !== "الكل";
  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((item) => {
      const text = `${item.shop} ${item.title} ${item.caption} ${item.product}`.toLowerCase();
      return item.productType === category && (!q || text.includes(q)) && (location === "كل المواقع" || item.location.includes(location)) && (!verifiedOnly || item.verified);
    });
  }, [category, location, query, verifiedOnly]);
  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STORES.filter((item) => {
      const text = `${item.name} ${item.detail} ${item.product}`.toLowerCase();
      return (!q || text.includes(q)) && (category === "الكل" || item.productType === category || item.detail.includes(category)) && (location === "كل المواقع" || item.detail.includes(location)) && (!verifiedOnly || item.verified);
    });
  }, [category, location, query, verifiedOnly]);
  const displayResults: (PostResult | StoreResult)[] = isPostMode ? filteredPosts : filteredStores;

  const resetFilters = () => { setQuery(""); setCategory("الكل"); setLocation("كل المواقع"); setSort("الأكثر صلة"); setVerifiedOnly(false); setApplied(false); };

  const header = (
    <View>
      <View style={styles.topBar}>
        <Pressable onPress={() => setFiltersOpen((value) => !value)} accessibilityLabel="فتح الفلاتر" style={({ pressed }) => [styles.filterIcon, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
          <MaterialIcons name="tune" size={21} color={colors.foreground} />
        </Pressable>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.foreground }]}>ابحث عن ما تريد</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>اختر نوع المنتج لتصفح منشوراته، أو اتركه على الكل لاكتشاف المتاجر</Text>
        </View>
      </View>
      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable onPress={() => setApplied(true)} hitSlop={8} style={({ pressed }) => [styles.searchAction, { backgroundColor: colors.primary, opacity: pressed ? 0.72 : 1 }]}>
          <MaterialIcons name="search" size={18} color="#FFFFFF" />
        </Pressable>
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => setApplied(true)} placeholder={isPostMode ? `ابحث في منشورات ${category}` : "ماذا تريد أن تبحث عنه؟"} placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" />
      </View>
      <View style={styles.sectionRow}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>الفئات الشائعة</Text><Text style={[styles.helper, { color: colors.muted }]}>اختر لتضييق النتائج</Text></View>
      <FlatList data={[{ name: "الكل", icon: "apps" }, ...CATEGORIES]} horizontal inverted showsHorizontalScrollIndicator={false} keyExtractor={(item) => item.name} contentContainerStyle={styles.categoryStrip} renderItem={({ item }) => {
        const active = item.name === category;
        return <Pressable onPress={() => { setCategory(item.name); setApplied(true); }} style={({ pressed }) => [styles.categoryCard, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border, opacity: pressed ? 0.72 : 1 }]}><View style={[styles.categoryIcon, { backgroundColor: active ? "rgba(255,255,255,0.18)" : colors.background }]}><MaterialIcons name={item.icon as CategoryIcon} size={19} color={active ? "#FFFFFF" : colors.primary} /></View><Text style={[styles.categoryText, { color: active ? "#FFFFFF" : colors.foreground }]}>{item.name}</Text></Pressable>;
      }} />
      {filtersOpen && <View style={[styles.filters, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.filterHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>فلترة البحث</Text><Pressable onPress={resetFilters}><Text style={[styles.reset, { color: colors.primary }]}>إعادة تعيين</Text></Pressable></View>
        <Text style={[styles.filterLabel, { color: colors.muted }]}>الموقع</Text>
        <View style={styles.optionRow}>{LOCATIONS.map((item) => <Pressable key={item} onPress={() => setLocation(item)} style={[styles.option, { borderColor: location === item ? colors.primary : colors.border, backgroundColor: location === item ? colors.primary : colors.background }]}><Text style={[styles.optionText, { color: location === item ? "#FFFFFF" : colors.foreground }]}>{item}</Text></Pressable>)}</View>
        <Text style={[styles.filterLabel, { color: colors.muted }]}>الترتيب</Text>
        <View style={styles.optionRow}>{SORTS.map((item) => <Pressable key={item} onPress={() => setSort(item)} style={[styles.option, { borderColor: sort === item ? colors.primary : colors.border, backgroundColor: sort === item ? colors.primary : colors.background }]}><Text style={[styles.optionText, { color: sort === item ? "#FFFFFF" : colors.foreground }]}>{item}</Text></Pressable>)}</View>
        <Pressable onPress={() => setVerifiedOnly((value) => !value)} style={[styles.verifiedToggle, { borderColor: verifiedOnly ? colors.primary : colors.border, backgroundColor: verifiedOnly ? colors.primary : colors.background }]}><MaterialIcons name={verifiedOnly ? "check-circle" : "radio-button-unchecked"} size={18} color={verifiedOnly ? "#FFFFFF" : colors.muted} /><Text style={[styles.optionText, { color: verifiedOnly ? "#FFFFFF" : colors.foreground }]}>المتاجر الموثقة فقط</Text></Pressable>
        <Pressable onPress={() => { setApplied(true); setFiltersOpen(false); }} style={({ pressed }) => [styles.applyButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Text style={styles.applyText}>تطبيق الفلاتر</Text><MaterialIcons name="arrow-back" size={18} color="#FFFFFF" /></Pressable>
      </View>}
      <View style={styles.resultsHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{isPostMode ? `منشورات ${category}` : (applied || query ? "نتائج البحث" : "شركات مقترحة")}</Text><Text style={[styles.count, { color: colors.muted }]}>{displayResults.length} نتيجة · {sort}</Text></View>
    </View>
  );

  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={displayResults} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} ListHeaderComponent={header} renderItem={({ item }) => item.kind === "post" ? <PostCard post={item} colors={colors} onOpen={() => router.push(`/product/${item.productId}`)} /> : <StoreCard store={item} colors={colors} onOpen={() => router.push(`/shop/${item.id}`)} />} ListEmptyComponent={<View style={styles.empty}><MaterialIcons name={isPostMode ? "article" : "search-off"} size={32} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{isPostMode ? `لا توجد منشورات في قسم ${category}` : "لم نجد ما تبحث عنه"}</Text><Text style={[styles.emptyText, { color: colors.muted }]}>{isPostMode ? "جرّب تغيير الموقع أو كلمات البحث." : "جرّب تغيير كلمات البحث أو الفلاتر."}</Text></View>} ListFooterComponent={<View style={{ height: 100 }} />} /></ScreenContainer>;
}

function PostCard({ post, colors, onOpen }: { post: PostResult; colors: ReturnType<typeof useColors>; onOpen: () => void }) {
  return <Pressable onPress={onOpen} style={({ pressed }) => [styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.84 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
    <ImageBackground source={{ uri: post.image }} style={styles.postImage} imageStyle={styles.postImageStyle}><View style={styles.postOverlay} /><View style={styles.postTag}><MaterialIcons name="article" size={13} color="#FFFFFF" /><Text style={styles.postTagText}>منشور {post.verified ? "موثق" : "جديد"}</Text></View><View style={styles.postImageCopy}><Text style={styles.postShop}>{post.shop}</Text><Text style={styles.postImageTitle}>{post.title}</Text></View></ImageBackground>
    <View style={styles.postBody}><View style={styles.postShopRow}><Text style={[styles.postShopName, { color: colors.foreground }]}>{post.shop}</Text>{post.verified && <MaterialIcons name="verified" size={15} color={colors.primary} />}</View><Text style={[styles.postCaption, { color: colors.muted }]} numberOfLines={2}>{post.caption}</Text><View style={styles.postMeta}><Text style={[styles.postPrice, { color: colors.primary }]}>{post.price}</Text><View style={styles.postRating}><MaterialIcons name="star" size={14} color={colors.warning} /><Text style={[styles.ratingText, { color: colors.muted }]}>{post.rating}</Text></View></View><View style={[styles.postActions, { borderTopColor: colors.border }]}><View style={styles.postAction}><MaterialIcons name="favorite-border" size={18} color={colors.muted} /><Text style={[styles.actionText, { color: colors.muted }]}>{post.likes}</Text></View><View style={styles.postAction}><MaterialIcons name="bookmark-border" size={18} color={colors.muted} /><Text style={[styles.actionText, { color: colors.muted }]}>حفظ</Text></View><View style={styles.postAction}><MaterialIcons name="share" size={18} color={colors.muted} /><Text style={[styles.actionText, { color: colors.muted }]}>مشاركة</Text></View><Text style={[styles.openPost, { color: colors.primary }]}>عرض المنشور</Text></View></View>
  </Pressable>;
}

function StoreCard({ store, colors, onOpen }: { store: StoreResult; colors: ReturnType<typeof useColors>; onOpen: () => void }) {
  return <Pressable onPress={onOpen} style={({ pressed }) => [styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.84 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}><View style={[styles.resultCover, { backgroundColor: store.color }]}><View style={styles.resultOrb} /><MaterialIcons name={store.verified ? "verified" : "storefront"} size={20} color="#FFFFFF" /></View><View style={styles.resultInfo}><View style={styles.resultTitleRow}><Text numberOfLines={1} style={[styles.resultName, { color: colors.foreground }]}>{store.name}</Text>{store.verified && <MaterialIcons name="verified" size={15} color={colors.primary} />}</View><Text style={[styles.resultDetail, { color: colors.muted }]}>{store.detail}</Text><Text style={[styles.product, { color: colors.foreground }]}>{store.product}</Text><Text style={[styles.productType, { color: colors.primary }]}>النوع: {store.productType}</Text><View style={styles.meta}><Text style={[styles.price, { color: colors.primary }]}>{store.price}</Text><View style={styles.rating}><MaterialIcons name="star" size={14} color={colors.warning} /><Text style={[styles.ratingText, { color: colors.muted }]}>{store.rating}</Text></View></View></View><MaterialIcons name="chevron-left" size={20} color={colors.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 12 },
  topBar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 18 },
  heading: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 29, fontWeight: "900", lineHeight: 35, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 4, textAlign: "right" },
  filterIcon: { width: 43, height: 43, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 5 },
  search: { height: 54, borderRadius: 19, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 7, gap: 9 },
  searchAction: { width: 40, height: 40, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  searchInput: { flex: 1, textAlign: "right", fontSize: 13, paddingVertical: 0 },
  sectionRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "900" },
  helper: { fontSize: 10 },
  categoryStrip: { gap: 9, paddingVertical: 13 },
  categoryCard: { width: 88, height: 86, borderWidth: 1, borderRadius: 20, alignItems: "center", justifyContent: "center", gap: 7 },
  categoryIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  categoryText: { fontSize: 10, fontWeight: "800", textAlign: "center" },
  filters: { borderWidth: 1, borderRadius: 23, padding: 14, marginTop: 4 },
  filterHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  reset: { fontSize: 11, fontWeight: "800" },
  filterLabel: { fontSize: 11, fontWeight: "800", textAlign: "right", marginBottom: 8, marginTop: 4 },
  optionRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7, marginBottom: 10 },
  option: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  optionText: { fontSize: 10, fontWeight: "700" },
  verifiedToggle: { minHeight: 40, borderWidth: 1, borderRadius: 14, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 3 },
  applyButton: { height: 45, borderRadius: 15, marginTop: 13, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 },
  applyText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  resultsHeader: { marginTop: 10, marginBottom: 2, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  count: { fontSize: 10 },
  postCard: { borderWidth: 1, borderRadius: 22, overflow: "hidden" },
  postImage: { height: 205, justifyContent: "space-between" },
  postImageStyle: { borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  postOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10, 12, 18, 0.22)" },
  postTag: { alignSelf: "flex-end", flexDirection: "row-reverse", alignItems: "center", gap: 4, margin: 12, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(17,24,39,0.68)" },
  postTagText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  postImageCopy: { alignItems: "flex-end", padding: 14 },
  postShop: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  postImageTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginTop: 4, textAlign: "right" },
  postBody: { padding: 13 },
  postShopRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  postShopName: { fontSize: 13, fontWeight: "900" },
  postCaption: { fontSize: 11, lineHeight: 18, marginTop: 7, textAlign: "right" },
  postMeta: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  postPrice: { fontSize: 13, fontWeight: "900" },
  postRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  postActions: { flexDirection: "row-reverse", alignItems: "center", gap: 13, borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
  postAction: { flexDirection: "row-reverse", alignItems: "center", gap: 3 },
  actionText: { fontSize: 9 },
  openPost: { marginStart: "auto", fontSize: 10, fontWeight: "900" },
  resultCard: { minHeight: 104, borderWidth: 1, borderRadius: 22, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  resultCover: { width: 78, height: 84, borderRadius: 17, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  resultOrb: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.13)", right: -24, bottom: -25 },
  resultInfo: { flex: 1, alignItems: "flex-end" },
  resultTitleRow: { maxWidth: "100%", flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  resultName: { fontSize: 13, fontWeight: "900", maxWidth: "90%" },
  resultDetail: { fontSize: 10, marginTop: 3 },
  product: { fontSize: 11, fontWeight: "700", marginTop: 7 },
  productType: { fontSize: 9, fontWeight: "800", marginTop: 4 },
  meta: { width: "100%", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 7 },
  price: { fontSize: 11, fontWeight: "900" },
  rating: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 10 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 55 },
  emptyTitle: { fontSize: 16, fontWeight: "900", marginTop: 12 },
  emptyText: { fontSize: 11, marginTop: 5 },
});
