import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Linking, Modal, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";

type Review = { id: string; name: string; initials: string; rating: number; date: string; body: string };

const INITIAL_REVIEWS: Review[] = [];

const PRODUCTS: Array<{ id: string; name: string; price: string; rating: string; available: boolean; color: string }> = [];

export default function ShopDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saved, setSaved] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState("");
  const products = useMemo(() => PRODUCTS, []);
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => reviews.filter((review) => review.rating === star).length);
  const storageKey = `jabilak-reviews-${id ?? "alanaqa"}`;

  useEffect(() => { AsyncStorage.getItem(storageKey).then((value) => { if (value) setReviews(JSON.parse(value)); }).catch(() => undefined); }, [storageKey]);
  const submitReview = () => { if (!draftComment.trim()) return; const next = [{ id: `review-${Date.now()}`, name: "المستخدم", initials: "ج", rating: draftRating, date: "الآن", body: draftComment.trim() }, ...reviews]; setReviews(next); AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => undefined); setDraftComment(""); setDraftRating(5); setReviewOpen(false); };


  const call = () => Alert.alert("الاتصال غير متاح", "سيظهر رقم المتجر بعد ربط بياناته الحقيقية.");
  const whatsapp = () => Alert.alert("التواصل غير متاح", "ستظهر وسيلة التواصل بعد ربط بيانات المتجر.");
  const openMap = () => Alert.alert("الموقع غير متاح", "سيظهر موقع المتجر بعد ربط إحداثياته الحقيقية.");
  const share = () => Share.share({ message: `تعرّف على هذا المتجر عبر ${BRAND.name}` });
  const report = () => Alert.alert("الإبلاغ عن المتجر", "سيتم تفعيل نموذج البلاغ بعد ربط نظام البلاغات.");
  const block = () => Alert.alert("حظر المتجر", "سيتم تفعيل الحظر بعد ربط إعدادات الأمان.");

  const header = (
    <View>
      <View style={[styles.hero, { backgroundColor: colors.foreground }]}>
        <View style={[styles.heroOrb, { backgroundColor: colors.primary }]} />
        <View style={[styles.heroOrbSmall, { backgroundColor: colors.success }]} />
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}><MaterialIcons name="arrow-forward" size={21} color="#FFFFFF" /></Pressable>
        <Pressable onPress={() => setSaved((value) => !value)} style={({ pressed }) => [styles.heroSave, { opacity: pressed ? 0.6 : 1 }]}><MaterialIcons name={saved ? "favorite" : "favorite-border"} size={21} color={saved ? colors.error : "#FFFFFF"} /></Pressable>
        <Pressable onPress={() => Alert.alert("خيارات المتجر", "اختر الإجراء المطلوب", [{ text: "مشاركة الحساب", onPress: share }, { text: followed ? "إلغاء كتم التنبيهات" : "كتم التنبيهات", onPress: () => Alert.alert("التنبيهات", "سيتم حفظ تفضيل التنبيهات بعد ربط الحساب.") }, { text: "الإبلاغ عن المتجر", onPress: report }, { text: "حظر المتجر", style: "destructive", onPress: block }, { text: "إلغاء", style: "cancel" }])} style={({ pressed }) => [styles.heroOptions, { opacity: pressed ? 0.6 : 1 }]}><MaterialIcons name="more-vert" size={22} color="#FFFFFF" /></Pressable>
        <View style={styles.coverPattern}><MaterialIcons name="checkroom" size={64} color="rgba(255,255,255,0.18)" /><Text style={styles.coverWord}>JAYABLAK</Text></View>
      </View>
      <View style={[styles.profilePanel, { backgroundColor: colors.background }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary, borderColor: colors.background }]}><MaterialIcons name="storefront" size={31} color="#FFFFFF" /></View>
        <View style={styles.companyTitleRow}><View style={styles.companyTitle}><View style={styles.nameRow}><Text style={[styles.companyName, { color: colors.foreground }]}>المتجر</Text><MaterialIcons name="verified" size={17} color={colors.primary} /></View><Text style={[styles.category, { color: colors.muted }]}>بيانات المتجر غير متاحة</Text><View style={styles.ratingRow}><MaterialIcons name="star" size={15} color={colors.warning} /><Text style={[styles.rating, { color: colors.foreground }]}>{averageRating ? averageRating.toFixed(1) : "—"}</Text><Text style={[styles.reviews, { color: colors.muted }]}>({reviews.length} تقييم)</Text><View style={[styles.openBadge, { backgroundColor: `${colors.border}55` }]}><Text style={[styles.openText, { color: colors.muted }]}>الحالة غير متاحة</Text></View></View></View></View>
        <View style={styles.quickActions}>
          <QuickAction icon="place" label="الموقع" color={colors.primary} onPress={openMap} colors={colors} />
          <QuickAction icon="chat" label="رسالة" color={colors.primary} onPress={() => router.push({ pathname: "/chat/[id]", params: { id: String(id ?? "") } })} colors={colors} />
          <QuickAction icon="call" label="اتصال" color={colors.primary} onPress={call} colors={colors} />
          <QuickAction icon="share" label="مشاركة" color={colors.primary} onPress={share} colors={colors} />
          <QuickAction icon={followed ? "person" : "person-add"} label={followed ? "تتابعه" : "متابعة"} color={colors.primary} onPress={() => setFollowed((value) => !value)} colors={colors} />
          <QuickAction icon={saved ? "favorite" : "favorite-border"} label="حفظ" color={saved ? colors.error : colors.primary} onPress={() => setSaved((value) => !value)} colors={colors} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>عن المتجر</Text>
        <Text numberOfLines={expanded ? undefined : 3} style={[styles.body, { color: colors.muted }]}>وصف المتجر غير متاح حتى يتم ربط بياناته الحقيقية.</Text>
        <Pressable onPress={() => setExpanded((value) => !value)}><Text style={[styles.more, { color: colors.primary }]}>{expanded ? "عرض أقل" : "عرض المزيد"}</Text></Pressable>
      </View>
      <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>منتجات الشركة</Text><Pressable onPress={() => Alert.alert("منتجات الشركة", "سيتم عرض جميع المنتجات في الشاشة التالية.")}><Text style={[styles.more, { color: colors.primary }]}>عرض الكل</Text></Pressable></View>
    </View>
  );

  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={products} numColumns={2} keyExtractor={(item) => item.id} columnWrapperStyle={styles.productGrid} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} ListHeaderComponent={header} renderItem={({ item }) => <Pressable onPress={() => Alert.alert(item.name, `${item.price}\n${item.available ? "متوفر الآن" : "غير متوفر حالياً"}`)} style={({ pressed }) => [styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}><View style={[styles.productCover, { backgroundColor: item.color }]}><View style={styles.productOrb} /><View style={[styles.stockBadge, { backgroundColor: item.available ? "rgba(255,255,255,0.9)" : "rgba(26,24,33,0.65)" }]}><Text style={[styles.stockText, { color: item.available ? colors.success : "#FFFFFF" }]}>{item.available ? "متوفر" : "غير متوفر"}</Text></View><MaterialIcons name="checkroom" size={33} color="rgba(255,255,255,0.82)" /></View><View style={styles.productInfo}><Text numberOfLines={1} style={[styles.productName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.productPrice, { color: colors.primary }]}>{item.price}</Text><View style={styles.productMeta}><Text style={[styles.productRating, { color: colors.muted }]}>★ {item.rating}</Text><MaterialIcons name="chevron-left" size={16} color={colors.muted} /></View></View></Pressable>} ListFooterComponent={<View><View style={styles.section}><View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>تقييمات العملاء</Text><Pressable onPress={() => Alert.alert("التقييمات", "سيتم عرض جميع التقييمات قريباً.")}><Text style={[styles.more, { color: colors.primary }]}>عرض الكل</Text></Pressable></View><View style={[styles.ratingSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.ratingScore}><Text style={[styles.bigRating, { color: colors.foreground }]}>{averageRating.toFixed(1)}</Text><Text style={[styles.reviews, { color: colors.muted }]}>{reviews.length} تقييم</Text><Text style={[styles.starsText, { color: colors.warning }]}>★★★★★</Text></View><View style={styles.ratingBars}>{[5, 4, 3, 2, 1].map((star, index) => <View key={star} style={styles.barRow}><Text style={[styles.barLabel, { color: colors.muted }]}>{star}</Text><View style={[styles.barTrack, { backgroundColor: colors.border }]}><View style={[styles.barFill, { backgroundColor: colors.primary, width: `${reviews.length ? (distribution[index] / reviews.length) * 100 : 0}%` }]} /></View></View>)}</View></View><Pressable onPress={() => setReviewOpen(true)} style={({ pressed }) => [styles.reviewButton, { backgroundColor: colors.primary, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="rate-review" size={18} color="#FFFFFF" /><Text style={styles.reviewButtonText}>أضف تقييمك وتعليقك</Text></Pressable>{reviews.map((review) => <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.reviewTop}><View style={[styles.reviewerAvatar, { backgroundColor: colors.primary }]}><Text style={styles.reviewerText}>{review.initials}</Text></View><View style={styles.reviewerInfo}><Text style={[styles.reviewerName, { color: colors.foreground }]}>{review.name}</Text><Text style={[styles.reviewDate, { color: colors.muted }]}>{review.date} · {"★".repeat(review.rating)}</Text></View></View><Text style={[styles.reviewBody, { color: colors.muted }]}>{review.body}</Text></View>)}</View><View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>موقع الشركة</Text><Pressable onPress={openMap} style={[styles.mapCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.mapGrid, { backgroundColor: colors.background }]}><View style={[styles.mapRoad, styles.mapRoadOne, { backgroundColor: colors.border }]} /><View style={[styles.mapRoad, styles.mapRoadTwo, { backgroundColor: colors.border }]} /><View style={[styles.mapPin, { backgroundColor: colors.primary }]}><MaterialIcons name="location-on" size={18} color="#FFFFFF" /></View></View><View style={styles.addressRow}><View><Text style={[styles.addressTitle, { color: colors.foreground }]}>الموقع غير متاح</Text><Text style={[styles.addressText, { color: colors.muted }]}>سيظهر العنوان بعد ربط الموقع الحقيقي</Text></View><MaterialIcons name="chevron-left" size={20} color={colors.muted} /></View></Pressable><Pressable onPress={openMap} style={({ pressed }) => [styles.outlineButton, { borderColor: colors.primary, opacity: pressed ? 0.72 : 1 }]}><Text style={[styles.outlineText, { color: colors.primary }]}>عرض الموقع على الخريطة</Text><MaterialIcons name="open-in-new" size={16} color={colors.primary} /></Pressable></View><View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>تواصل مع الشركة</Text><View style={styles.contactGrid}><ContactButton icon="call" label="اتصال" onPress={call} colors={colors} /><ContactButton icon="chat" label="رسالة" onPress={() => router.push({ pathname: "/chat/[id]", params: { id: String(id ?? "") } })} colors={colors} /><ContactButton icon="language" label="الموقع الإلكتروني" onPress={() => Linking.openURL("https://")} colors={colors} /><ContactButton icon="chat" label="WhatsApp" onPress={whatsapp} colors={colors} /></View></View><View style={{ height: 105 }} /></View>} /><Modal visible={reviewOpen} transparent animationType="slide" onRequestClose={() => setReviewOpen(false)}><View style={styles.modalBackdrop}><View style={[styles.reviewModal, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.modalHeader}><Pressable onPress={() => setReviewOpen(false)}><MaterialIcons name="close" size={22} color={colors.foreground} /></Pressable><Text style={[styles.modalTitle, { color: colors.foreground }]}>قيّم تجربتك</Text><View style={{ width: 22 }} /></View><Text style={[styles.modalHint, { color: colors.muted }]}>اختر تقييمك واكتب تعليقاً يساعد الآخرين</Text><View style={styles.starPicker}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} onPress={() => setDraftRating(star)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><MaterialIcons name={star <= draftRating ? "star" : "star-border"} size={34} color={colors.warning} /></Pressable>)}</View><TextInput value={draftComment} onChangeText={setDraftComment} multiline maxLength={240} textAlign="right" placeholder="اكتب تعليقك عن جودة المنتجات والتعامل..." placeholderTextColor={colors.muted} style={[styles.reviewInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} /><Text style={[styles.characterCount, { color: colors.muted }]}>{draftComment.length}/240</Text><Pressable disabled={!draftComment.trim()} onPress={submitReview} style={({ pressed }) => [styles.submitReview, { backgroundColor: colors.primary, opacity: !draftComment.trim() ? 0.45 : pressed ? 0.72 : 1 }]}><Text style={styles.submitReviewText}>نشر التقييم</Text><MaterialIcons name="send" size={17} color="#FFFFFF" /></Pressable></View></View></Modal></ScreenContainer>;
}

function QuickAction({ icon, label, color, onPress, colors }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; color: string; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.62 : 1 }]}><View style={[styles.actionIcon, { backgroundColor: `${color}18` }]}><MaterialIcons name={icon} size={19} color={color} /></View><Text style={[styles.actionLabel, { color: colors.muted }]}>{label}</Text></Pressable>;
}

function ContactButton({ icon, label, onPress, colors }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.contactButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name={icon} size={20} color={colors.primary} /><Text style={[styles.contactText, { color: colors.foreground }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 20 },
  hero: { height: 218, overflow: "hidden", position: "relative" },
  heroOrb: { position: "absolute", width: 280, height: 280, borderRadius: 150, right: -90, top: -110, opacity: 0.28 },
  heroOrbSmall: { position: "absolute", width: 145, height: 145, borderRadius: 80, left: -42, bottom: -54, opacity: 0.18 },
  back: { position: "absolute", right: 20, top: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", zIndex: 2 },
  heroSave: { position: "absolute", left: 20, top: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", zIndex: 2 },
  heroOptions: { position: "absolute", right: 20, top: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", zIndex: 2 },
  coverPattern: { flex: 1, alignItems: "center", justifyContent: "center", gap: 7 },
  coverWord: { color: "rgba(255,255,255,0.48)", fontSize: 12, fontWeight: "900", letterSpacing: 5 },
  profilePanel: { borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -25, paddingHorizontal: 20, paddingTop: 0, position: "relative" },
  avatar: { width: 74, height: 74, borderRadius: 38, borderWidth: 4, marginTop: -37, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  avatarText: { color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  companyTitleRow: { alignItems: "flex-end", marginTop: 9 },
  companyTitle: { alignItems: "flex-end" },
  nameRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  companyName: { fontSize: 21, fontWeight: "900" },
  category: { fontSize: 11, marginTop: 4 },
  ratingRow: { flexDirection: "row-reverse", alignItems: "center", gap: 4, marginTop: 8 },
  rating: { fontSize: 11, fontWeight: "900" },
  reviews: { fontSize: 10 },
  openBadge: { borderRadius: 11, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4 },
  openText: { fontSize: 9, fontWeight: "800" },
  quickActions: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 20, paddingBottom: 18 },
  quickAction: { alignItems: "center", gap: 6, width: "23%" },
  actionIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 10, fontWeight: "700" },
  section: { paddingHorizontal: 20, marginTop: 19 },
  sectionHeader: { paddingHorizontal: 20, marginTop: 20, marginBottom: 11, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontWeight: "900", textAlign: "right" },
  body: { fontSize: 12, lineHeight: 21, textAlign: "right", marginTop: 9 },
  more: { fontSize: 11, fontWeight: "800", marginTop: 8 },
  productGrid: { paddingHorizontal: 20, justifyContent: "space-between", gap: 13, marginBottom: 13 },
  productCard: { width: "48.3%", borderRadius: 21, overflow: "hidden", borderWidth: 1 },
  productCover: { height: 142, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  productOrb: { position: "absolute", width: 140, height: 140, borderRadius: 80, right: -45, bottom: -65, backgroundColor: "rgba(255,255,255,0.13)" },
  stockBadge: { position: "absolute", right: 9, top: 9, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 },
  stockText: { fontSize: 9, fontWeight: "900" },
  productInfo: { padding: 11, alignItems: "flex-end" },
  productName: { width: "100%", fontSize: 12, fontWeight: "900", textAlign: "right" },
  productPrice: { width: "100%", fontSize: 11, fontWeight: "900", textAlign: "right", marginTop: 6 },
  productMeta: { width: "100%", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 7 },
  productRating: { fontSize: 10 },
  ratingSummary: { borderWidth: 1, borderRadius: 20, padding: 14, marginTop: 11, flexDirection: "row-reverse", alignItems: "center", gap: 13 },
  bigRating: { fontSize: 30, fontWeight: "900" },
  ratingScore: { alignItems: "center", minWidth: 78, gap: 2 },
  stars: { alignItems: "center", gap: 4 },
  starsText: { fontSize: 15, letterSpacing: 1 },
  ratingBars: { flex: 1, gap: 4 },
  barRow: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  barLabel: { fontSize: 9, width: 10, textAlign: "center" },
  barTrack: { height: 5, flex: 1, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  reviewButton: { minHeight: 46, borderRadius: 15, marginTop: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 },
  reviewButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.46)", justifyContent: "flex-end" },
  reviewModal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 20, gap: 10 },
  modalHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "900" },
  modalHint: { fontSize: 11, textAlign: "right" },
  starPicker: { flexDirection: "row", justifyContent: "center", gap: 5, paddingVertical: 7 },
  reviewInput: { minHeight: 105, borderRadius: 15, borderWidth: 1, padding: 12, fontSize: 12, textAlignVertical: "top" },
  characterCount: { fontSize: 9, textAlign: "left" },
  submitReview: { minHeight: 48, borderRadius: 15, flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 7 },
  submitReviewText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  reviewCard: { borderWidth: 1, borderRadius: 20, padding: 13, marginTop: 10 },
  reviewTop: { flexDirection: "row-reverse", alignItems: "center", gap: 9 },
  reviewerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  reviewerText: { color: "#FFFFFF", fontWeight: "900" },
  reviewerInfo: { alignItems: "flex-end" },
  reviewerName: { fontSize: 11, fontWeight: "800" },
  reviewDate: { fontSize: 9, marginTop: 2 },
  reviewBody: { textAlign: "right", fontSize: 11, lineHeight: 19, marginTop: 10 },
  mapCard: { borderWidth: 1, borderRadius: 22, overflow: "hidden", marginTop: 11 },
  mapGrid: { height: 142, overflow: "hidden", position: "relative" },
  mapRoad: { position: "absolute", height: 18, width: "130%", opacity: 0.4 },
  mapRoadOne: { top: 66, left: -20, transform: [{ rotate: "18deg" }] },
  mapRoadTwo: { top: 48, left: -25, transform: [{ rotate: "-35deg" }] },
  mapPin: { width: 35, height: 35, borderRadius: 18, alignItems: "center", justifyContent: "center", position: "absolute", top: 54, left: "48%" },
  addressRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: 13 },
  addressTitle: { fontSize: 12, fontWeight: "900", textAlign: "right" },
  addressText: { fontSize: 9, marginTop: 4, textAlign: "right" },
  outlineButton: { height: 43, borderRadius: 15, borderWidth: 1, marginTop: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 },
  outlineText: { fontSize: 11, fontWeight: "800" },
  contactGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 9, marginTop: 11 },
  contactButton: { width: "48%", minHeight: 52, borderWidth: 1, borderRadius: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 },
  contactText: { fontSize: 10, fontWeight: "800" },
});
