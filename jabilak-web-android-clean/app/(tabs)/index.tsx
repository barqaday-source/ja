import { useMemo, useState } from "react";
import { Dimensions, FlatList, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { useColors } from "@/hooks/use-colors";
import { REAL_IMAGES } from "@/constants/assets";
import { useI18n } from "@/lib/i18n";
import { getAdminSettings } from "@/lib/admin-settings";
import { MVP_CONFIG } from "@/lib/mvp-config";

const CATEGORIES = ["الكل", "ملابس", "إلكترونيات", "أثاث", "أطعمة", "خدمات"];

const SPONSORED_PLAN = getAdminSettings().promotionalPlans[0];
const PROMOTED_POSTS = [
  { id: "sponsored-shirt", shopId: "abu-ali", shop: "أبو علي للأقمشة", title: "تشكيلة القمصان الجديدة", detail: "يظهر أولاً في أعلى التغذية", image: REAL_IMAGES.products.shirt },
  { id: "sponsored-shoes", shopId: "step-style", shop: "ستايـل سبورت", title: "أحذية رياضية للمدينة", detail: SPONSORED_PLAN.rankingLabel, image: REAL_IMAGES.products.shoes },
];

const SHOPS = [
  { id: "abu-ali", name: "أبو علي للأقمشة", category: "ملابس", location: "الكرادة، بغداد", badge: "موثق", color: "#443C50", image: REAL_IMAGES.stores.fashion, product: "أقمشة وملابس يومية" },
  { id: "al-amir", name: "الأمير للإلكترونيات", category: "إلكترونيات", location: "الكرادة، بغداد", badge: "متجر نشط", color: "#655B77", image: REAL_IMAGES.stores.electronics, product: "أجهزة وإكسسوارات" },
  { id: "zad", name: "زاد للمأكولات", category: "أطعمة", location: "الجادريّة، بغداد", badge: "قريب منك", color: "#81B7EC", image: REAL_IMAGES.stores.food, product: "مواد غذائية طازجة" },
  { id: "noor", name: "نور للذهب", category: "خدمات", location: "المنصور، بغداد", badge: "مختارات", color: "#968A98", image: REAL_IMAGES.stores.jewelry, product: "مصوغات وهدايا" },
];

function ShopCard({ shop, width, saved, onSave, onOpen }: { shop: (typeof SHOPS)[number]; width: number; saved: boolean; onSave: () => void; onOpen: () => void }) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.duration(280)} style={{ width }}>
      <Pressable onPress={onOpen} style={({ pressed }) => [styles.shopCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.86 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
        <View style={[styles.cover, { backgroundColor: shop.color }]}>
          <ImageBackground source={{ uri: shop.image }} style={StyleSheet.absoluteFillObject} imageStyle={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <View style={styles.coverGlow} />
          <Pressable onPress={(event) => { event.stopPropagation(); onSave(); }} hitSlop={10} style={({ pressed }) => [styles.favorite, { opacity: pressed ? 0.6 : 1 }]}>
            <MaterialIcons name={saved ? "favorite" : "favorite-border"} size={18} color={saved ? colors.error : "#FFFFFF"} />
          </Pressable>
          <View style={styles.badge}><Text style={[styles.badgeText, { color: colors.foreground }]}>{shop.badge}</Text></View>
          <View style={styles.coverCopy}>
            <Text numberOfLines={1} style={styles.shopName}>{shop.name}</Text>
            <Text numberOfLines={1} style={styles.shopLocation}>{shop.location}</Text>
          </View>
        </View>
        <View style={styles.shopFooter}>
          <View style={styles.shopFooterText}>
            <Text numberOfLines={1} style={[styles.productText, { color: colors.foreground }]}>{shop.product}</Text>
            <Text style={[styles.categoryText, { color: colors.muted }]}>{shop.category}</Text>
          </View>
          <MaterialIcons name="chevron-left" size={18} color={colors.muted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function SponsoredCarousel({ onOpen }: { onOpen: (shopId: string) => void }) {
  const colors = useColors();
  return <View style={styles.sponsoredSection}><View style={styles.sponsoredHeading}><View style={styles.sponsoredPrice}><Text style={[styles.sponsoredPriceText, { color: colors.primary }]}>{SPONSORED_PLAN.amount.toLocaleString("en-US")} د.ع · {SPONSORED_PLAN.label}</Text></View><View style={styles.sponsoredHeadingCopy}><Text style={[styles.sponsoredTitle, { color: colors.foreground }]}>ظهور مميز في الصفحة الأولى</Text><Text style={[styles.sponsoredHint, { color: colors.muted }]}>ترويج واضح في Top Carousel، وليس إعلاناً مبهماً</Text></View></View><FlatList data={PROMOTED_POSTS} horizontal inverted showsHorizontalScrollIndicator={false} keyExtractor={(item) => item.id} contentContainerStyle={styles.sponsoredList} renderItem={({ item }) => <Pressable onPress={() => onOpen(item.shopId)} style={({ pressed }) => [styles.sponsoredCard, { opacity: pressed ? 0.84 : 1 }]}><ImageBackground source={{ uri: item.image }} style={styles.sponsoredImage} imageStyle={styles.sponsoredImageStyle}><View style={styles.sponsoredOverlay} /><View style={styles.sponsoredTag}><MaterialIcons name="campaign" size={12} color={colors.primary} /><Text style={[styles.sponsoredTagText, { color: colors.foreground }]}>منشور برعاية</Text></View><View style={styles.sponsoredCopy}><Text style={styles.sponsoredShop}>{item.shop}</Text><Text style={styles.sponsoredPostTitle}>{item.title}</Text><Text style={styles.sponsoredDetail}>{item.detail}</Text></View></ImageBackground></Pressable>} /></View>;
}

export default function HomeScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [saved, setSaved] = useState<string[]>([]);
  const width = Math.max(150, (Dimensions.get("window").width - 56) / 2);

  const shops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHOPS.filter((shop) => {
      const matchesCategory = category === "الكل" || shop.category === category;
      const matchesQuery = !q || `${shop.name} ${shop.category} ${shop.location} ${shop.product}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const toggleSaved = (id: string) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Pressable accessibilityLabel={t("notificationsLabel")} onPress={() => router.push("/notifications")} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
                <MaterialIcons name="notifications-none" size={21} color={colors.foreground} />
              </Pressable>
              <View style={styles.heading}>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND.name}</Text>
                <Text style={[styles.title, { color: colors.foreground }]}>{t("discover")}</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>{t("tagline")}</Text>
              </View>
            </View>
            <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="search" size={21} color={colors.muted} />
              <TextInput value={query} onChangeText={setQuery} placeholder={t("searchStoreProduct")} placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" />
            </View>
            <FlatList data={CATEGORIES} horizontal inverted showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} contentContainerStyle={styles.categories} renderItem={({ item }) => {
              const active = item === category;
              return <Pressable onPress={() => setCategory(item)} style={({ pressed }) => [styles.categoryPill, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border, opacity: pressed ? 0.72 : 1 }]}><Text style={[styles.categoryPillText, { color: active ? "#FFFFFF" : colors.muted }]}>{item}</Text></Pressable>;
            }} />
            {MVP_CONFIG.showPromotionsOnHome && <SponsoredCarousel onOpen={(shopId) => router.push(`/shop/${shopId}`)} />}
            <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}> 
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("suggestedStores")}</Text>
              <Pressable onPress={() => router.push("/explore")}><Text style={[styles.seeAll, { color: colors.primary }]}>{t("seeAll")}</Text></Pressable>
            </View>
            {MVP_CONFIG.showMerchantBannerOnCustomerHome && <Pressable onPress={() => router.push("/merchant")} style={({ pressed }) => [styles.merchantBanner, { backgroundColor: colors.foreground, opacity: pressed ? 0.9 : 1 }]}>
              <View style={[styles.bannerOrb, { backgroundColor: colors.primary }]} />
              <View style={styles.bannerText}><Text style={[styles.bannerEyebrow, { color: colors.success }]}>{t("merchantSpace")}</Text><Text style={styles.bannerTitle}>{t("manageProducts")}</Text><Text style={styles.bannerSubtitle}>{t("openTools")}</Text></View>
              <View style={[styles.bannerArrow, { backgroundColor: colors.primary }]}><MaterialIcons name="arrow-back" size={20} color="#FFFFFF" /></View>
            </Pressable>}
          </View>
        }
        renderItem={({ item }) => <ShopCard shop={item} width={width} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} onOpen={() => router.push(`/shop/${item.id}`)} />}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.muted }]}>{t("noResults")}</Text>}
        ListFooterComponent={<View style={{ height: 92 }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 12 },
  topBar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 18 },
  heading: { flex: 1, alignItems: "flex-end" },
  eyebrow: { fontSize: 12, fontWeight: "800", marginBottom: 2 },
  title: { fontSize: 29, fontWeight: "900", letterSpacing: -0.5, lineHeight: 35 },
  subtitle: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  iconButton: { width: 43, height: 43, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 5 },
  search: { height: 51, borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row-reverse", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, textAlign: "right", fontSize: 13, paddingVertical: 0 },
  categories: { gap: 8, paddingVertical: 17, paddingHorizontal: 1 },
  categoryPill: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 17, paddingVertical: 9 },
  categoryPillText: { fontSize: 11, fontWeight: "800" },
  sectionHeader: { borderBottomWidth: 1, paddingBottom: 11, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  sectionTitle: { fontSize: 17, fontWeight: "900" },
  seeAll: { fontSize: 11, fontWeight: "800" },
  merchantBanner: { height: 122, borderRadius: 24, padding: 18, marginBottom: 14, overflow: "hidden", flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  bannerText: { flex: 1, alignItems: "flex-end", zIndex: 1 },
  bannerEyebrow: { fontSize: 10, fontWeight: "800", marginBottom: 3 },
  bannerTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  bannerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 4 },
  bannerOrb: { position: "absolute", width: 155, height: 155, borderRadius: 80, left: -60, bottom: -84, opacity: 0.22 },
  bannerArrow: { width: 42, height: 42, borderRadius: 22, alignItems: "center", justifyContent: "center", zIndex: 1 },
  grid: { justifyContent: "space-between", gap: 16, marginBottom: 14 },
  shopCard: { borderRadius: 23, borderWidth: 1, overflow: "hidden" },
  cover: { height: 146, padding: 11, justifyContent: "space-between", overflow: "hidden" },
  coverImage: { borderRadius: 0 },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(17,17,17,0.42)" },
  coverGlow: { position: "absolute", width: 135, height: 135, borderRadius: 70, right: -42, bottom: -60, backgroundColor: "rgba(255,255,255,0.14)" },
  favorite: { width: 29, height: 29, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(26,24,33,0.18)", alignSelf: "flex-start" },
  badge: { alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 9, fontWeight: "900" },
  coverCopy: { alignItems: "flex-end" },
  shopName: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  shopLocation: { color: "rgba(255,255,255,0.72)", fontSize: 9, marginTop: 3 },
  shopFooter: { minHeight: 60, paddingHorizontal: 11, paddingVertical: 9, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  shopFooterText: { flex: 1, alignItems: "flex-end" },
  productText: { fontSize: 11, fontWeight: "800" },
  categoryText: { fontSize: 9, marginTop: 3 },
  empty: { textAlign: "center", paddingVertical: 42, fontSize: 13 },
  sponsoredSection: { marginBottom: 15 }, sponsoredHeading: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 9 }, sponsoredHeadingCopy: { flex: 1, alignItems: "flex-end" }, sponsoredTitle: { fontSize: 14, fontWeight: "900", textAlign: "right" }, sponsoredHint: { fontSize: 9, marginTop: 3, textAlign: "right" }, sponsoredPrice: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: "rgba(194,98,67,0.12)" }, sponsoredPriceText: { fontSize: 9, fontWeight: "900" }, sponsoredList: { gap: 10 }, sponsoredCard: { width: 264, height: 172, borderRadius: 21, overflow: "hidden" }, sponsoredImage: { flex: 1, justifyContent: "space-between", padding: 11 }, sponsoredImageStyle: { borderRadius: 21 }, sponsoredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(17,17,17,0.4)" }, sponsoredTag: { alignSelf: "flex-end", flexDirection: "row-reverse", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.93)", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 }, sponsoredTagText: { fontSize: 9, fontWeight: "900" }, sponsoredCopy: { alignItems: "flex-end" }, sponsoredShop: { color: "rgba(255,255,255,0.78)", fontSize: 9, fontWeight: "800" }, sponsoredPostTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginTop: 2 }, sponsoredDetail: { color: "rgba(255,255,255,0.82)", fontSize: 9, marginTop: 3 },
});
