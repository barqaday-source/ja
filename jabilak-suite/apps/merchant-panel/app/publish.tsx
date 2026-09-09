import { useMemo, useState } from "react";
import { ActivityIndicator, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";
import { useAsyncAction } from "@/hooks/use-async-action";
import { validateMediaSelection, type MediaAssetInput } from "@/lib/data/upload-validation";

type Kind = "product" | "post" | "video";
type MediaItem = MediaAssetInput & { uri: string };

const MEDIA_POOL: string[] = [];

export default function PublishScreen() {
  const router = useRouter();
  const colors = useColors();
  const { run, busy } = useAsyncAction(700);
  const [kind, setKind] = useState<Kind>("product");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [price, setPrice] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [studioVisible, setStudioVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [status, setStatus] = useState<"مسودة" | "جاهز للمعاينة" | "تم التجهيز">("مسودة");
  const [toast, setToast] = useState("");

  const canPreview = Boolean(title.trim() || caption.trim()) && media.length > 0;
  const typeLabel = useMemo(() => ({ product: "منتج", post: "منشور", video: "ريلز" }[kind]), [kind]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast((current) => current === message ? "" : current), 2800);
  };

  const changeKind = (next: Kind) => {
    if (next === kind) return;
    setKind(next);
    setMedia([]);
    setPreviewIndex(0);
    setStudioVisible(false);
    setStatus("مسودة");
  };

  const chooseMedia = async (assetKind: "photo" | "video" = kind === "video" ? "video" : "photo") => {
    if (!MEDIA_POOL.length) { showToast("اختر ملفاً حقيقياً من جهازك لرفعه إلى Supabase Storage."); return; }
    const incoming: MediaItem = { uri: MEDIA_POOL[media.length % MEDIA_POOL.length], kind: assetKind, sizeBytes: assetKind === "video" ? 5 * 1024 * 1024 : 1 * 1024 * 1024 };
    const validation = validateMediaSelection(kind, media, [incoming]);
    if (!validation.valid) {
      showToast(validation.message);
      return;
    }
    await run(async () => {
      setMedia((current) => [...current, incoming]);
      setPreviewIndex(media.length);
      setStatus("جاهز للمعاينة");
      setStudioVisible(true);
    });
  };

  const removeMedia = (index: number) => {
    setMedia((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPreviewIndex((current) => Math.max(0, Math.min(current, media.length - 2)));
    if (media.length <= 1) setStudioVisible(false);
  };

  const publish = async () => {
    if (!canPreview) {
      showToast("أضف وسائط واكتب عنواناً أو وصفاً قبل النشر.");
      return;
    }
    await run(async () => {
      setStatus("تم التجهيز");
      setStudioVisible(false);
      showToast("تم تجهيز المحتوى بنجاح. سيظهر بعد الربط الفعلي.");
      setTimeout(() => {
        setMedia([]);
        setPreviewIndex(0);
        setTitle("");
        setCaption("");
        setPrice("");
        setStatus("مسودة");
      }, 450);
    });
  };

  return <ScreenContainer edges={["top", "left", "right"]}><View style={styles.screen}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable><View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND.name}</Text><Text style={[styles.title, { color: colors.foreground }]}>إنشاء محتوى جديد</Text><Text style={[styles.subtitle, { color: colors.muted }]}>صورة، فيديو أو منتج جاهز للنشر</Text></View><View style={[styles.headerMark, { backgroundColor: colors.primary }]}><MaterialIcons name="add-a-photo" size={20} color="#FFFFFF" /></View></View>

    <View style={[styles.statusBar, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.statusDot, { backgroundColor: status === "تم التجهيز" ? colors.success : colors.primary }]} /><Text style={[styles.statusText, { color: colors.foreground }]}>{status}</Text><Text style={[styles.statusHint, { color: colors.muted }]}>حالة المحتوى</Text></View>
    <View style={styles.kindRow}>{([{ id: "product" as const, label: "منتج", icon: "inventory-2" as const }, { id: "post" as const, label: "منشور", icon: "article" as const }, { id: "video" as const, label: "فيديو / ريلز", icon: "movie" as const }]).map((item) => <Pressable key={item.id} onPress={() => changeKind(item.id)} style={({ pressed }) => [styles.kind, { backgroundColor: kind === item.id ? colors.primary : colors.surface, borderColor: kind === item.id ? colors.primary : colors.border, opacity: pressed ? 0.75 : 1 }]}><MaterialIcons name={item.icon} size={19} color={kind === item.id ? "#FFFFFF" : colors.muted} /><Text style={[styles.kindText, { color: kind === item.id ? "#FFFFFF" : colors.foreground }]}>{item.label}</Text></Pressable>)}</View>

    {kind === "video" ? <Pressable disabled={busy} onPress={() => chooseMedia("video")} style={({ pressed }) => [styles.mediaPicker, { backgroundColor: colors.surface, borderColor: colors.primary, opacity: busy ? 0.7 : pressed ? 0.8 : 1 }]}><View style={[styles.mediaIcon, { backgroundColor: `${colors.primary}18` }]}>{busy ? <ActivityIndicator size="small" color={colors.primary} /> : <MaterialIcons name="videocam" size={25} color={colors.primary} />}</View><Text style={[styles.mediaTitle, { color: colors.foreground }]}>{busy ? "جارٍ تجهيز الفيديو..." : "أضف فيديو واحداً"}</Text><Text style={[styles.mediaHint, { color: colors.muted }]}>فيديو واحد فقط · الحد الأقصى 10MB · {media.length ? "مضاف" : "لم تتم الإضافة بعد"}</Text></Pressable> : <View style={[styles.mediaOptions, { backgroundColor: colors.surface, borderColor: colors.primary }]}><Pressable disabled={busy} onPress={() => chooseMedia("photo")} style={({ pressed }) => [styles.mediaOption, { backgroundColor: `${colors.primary}12`, opacity: busy ? 0.7 : pressed ? 0.75 : 1 }]}><MaterialIcons name="add-photo-alternate" size={22} color={colors.primary} /><Text style={[styles.mediaOptionText, { color: colors.foreground }]}>إضافة صورة</Text><Text style={[styles.mediaOptionHint, { color: colors.muted }]}>حتى 10 صور</Text></Pressable><Pressable disabled={busy} onPress={() => chooseMedia("video")} style={({ pressed }) => [styles.mediaOption, { backgroundColor: `${colors.foreground}08`, opacity: busy ? 0.7 : pressed ? 0.75 : 1 }]}><MaterialIcons name="videocam" size={22} color={colors.foreground} /><Text style={[styles.mediaOptionText, { color: colors.foreground }]}>إضافة فيديو</Text><Text style={[styles.mediaOptionHint, { color: colors.muted }]}>فيديو واحد · 10MB</Text></Pressable></View>}

    {media.length > 0 && <View style={styles.mediaGrid}>{media.map((item, index) => <View key={`${item.uri}-${index}`} style={styles.mediaTile}><Pressable onPress={() => { setPreviewIndex(index); setStudioVisible(true); }} style={styles.mediaImage}><ImageBackground source={{ uri: item.uri }} style={styles.mediaImageFill} imageStyle={styles.mediaImageStyle}><View style={styles.mediaShade} />{item.kind === "video" && <MaterialIcons name="play-circle-outline" size={28} color="#FFFFFF" />}<View style={styles.mediaIndex}><Text style={styles.mediaIndexText}>{index + 1}</Text></View></ImageBackground></Pressable><Pressable accessibilityLabel="حذف الوسيط" onPress={() => removeMedia(index)} style={styles.removeMedia}><MaterialIcons name="close" size={13} color="#FFFFFF" /></Pressable></View>)}</View>}

    <View style={styles.form}><Field label={kind === "product" ? "اسم المنتج" : "عنوان المحتوى"} value={title} onChangeText={setTitle} placeholder={kind === "product" ? "مثال: قميص كلاسيك" : "اكتب عنواناً جذاباً"} colors={colors} /><Field label="الوصف أو التعليق" value={caption} onChangeText={setCaption} placeholder="اكتب وصفاً قصيراً ومفيداً" colors={colors} multiline />{kind === "product" && <Field label="السعر بالدينار العراقي" value={price} onChangeText={(value) => setPrice(value.replace(/[^0-9]/g, ""))} placeholder="45000" colors={colors} keyboardType="numeric" />}</View>
    <View style={styles.tagRow}><Tag label="محتوى أصلي" icon="verified" colors={colors} /><Tag label={kind === "video" ? "فيديو ≤ 10MB" : "حتى 10 صور"} icon="high-quality" colors={colors} /><Tag label="قابل للتعديل" icon="edit" colors={colors} /></View>
    <Pressable onPress={() => { if (!media.length) { showToast("أضف وسائط أولاً لفتح استوديو المعاينة."); return; } setPreviewIndex(0); setStudioVisible(true); }} style={({ pressed }) => [styles.previewButton, { backgroundColor: canPreview ? colors.foreground : colors.border, opacity: pressed ? 0.8 : 1 }]}><MaterialIcons name="visibility" size={19} color="#FFFFFF" /><Text style={styles.previewText}>فتح استوديو المعاينة</Text></Pressable>
  </ScrollView>

  {toast && <View accessibilityLiveRegion="polite" style={[styles.toast, { backgroundColor: colors.foreground, borderColor: colors.primary }]}><MaterialIcons name="info" size={19} color={colors.primary} /><Text style={styles.toastText}>{toast}</Text></View>}

  <Modal visible={studioVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setStudioVisible(false)}><View style={styles.studio}><View style={styles.studioTop}><Pressable onPress={() => setStudioVisible(false)} style={styles.studioCircle}><MaterialIcons name="close" size={22} color="#FFFFFF" /></Pressable><View style={styles.studioHeading}><Text style={styles.studioKicker}>استوديو المعاينة</Text><Text style={styles.studioTitle}>{typeLabel} · {media.length} {kind === "video" ? "فيديو" : "صور"}</Text></View><View style={styles.studioCircle}><MaterialIcons name="tune" size={20} color="#FFFFFF" /></View></View>{media.length > 0 && <View style={styles.carousel}><Pressable disabled={media.length < 2} onPress={() => setPreviewIndex((current) => (current - 1 + media.length) % media.length)} style={[styles.carouselArrow, media.length < 2 && styles.disabledArrow]}><MaterialIcons name="chevron-left" size={28} color="#FFFFFF" /></Pressable><View style={styles.studioFrame}><ImageBackground source={{ uri: media[previewIndex]?.uri }} style={styles.studioImage} imageStyle={styles.studioImageStyle}><View style={styles.studioShade} />{media[previewIndex]?.kind === "video" && <MaterialIcons name="play-circle-outline" size={66} color="#FFFFFF" />}<View style={styles.studioCounter}><Text style={styles.studioCounterText}>{previewIndex + 1} / {media.length}</Text></View></ImageBackground><Pressable onPress={() => removeMedia(previewIndex)} style={styles.studioDelete}><MaterialIcons name="delete-outline" size={19} color="#FFFFFF" /><Text style={styles.studioDeleteText}>حذف</Text></Pressable></View><Pressable disabled={media.length < 2} onPress={() => setPreviewIndex((current) => (current + 1) % media.length)} style={[styles.carouselArrow, media.length < 2 && styles.disabledArrow]}><MaterialIcons name="chevron-right" size={28} color="#FFFFFF" /></Pressable></View>}<View style={styles.studioDots}>{media.map((_, index) => <View key={index} style={[styles.studioDot, { backgroundColor: index === previewIndex ? colors.primary : "rgba(255,255,255,0.38)" }]} />)}</View><View style={styles.studioCopy}><Text style={styles.studioPreviewLabel}>معاينة كما ستظهر للمشترين</Text><Text style={styles.studioContentTitle}>{title || "عنوان المحتوى"}</Text><Text style={styles.studioContentBody}>{caption || "سيظهر وصف المحتوى هنا بعد كتابته."}</Text>{price && <Text style={[styles.studioPrice, { color: colors.primary }]}>{Number(price).toLocaleString("ar-IQ")} د.ع</Text>}</View><Pressable disabled={busy} onPress={publish} style={({ pressed }) => [styles.studioPublish, { backgroundColor: colors.primary, opacity: busy ? 0.7 : pressed ? 0.8 : 1 }]}>{busy ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="publish" size={19} color="#FFFFFF" />}<Text style={styles.studioPublishText}>{busy ? "جارٍ تجهيز النشر..." : "تأكيد ونشر"}</Text></Pressable></View></Modal>
  </View></ScreenContainer>;
}

function Field({ label, value, onChangeText, placeholder, colors, multiline = false, keyboardType = "default" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; colors: ReturnType<typeof useColors>; multiline?: boolean; keyboardType?: "default" | "numeric" }) { return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} keyboardType={keyboardType} textAlign="right" style={[styles.input, multiline && styles.textarea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} /></View>; }
function Tag({ label, icon, colors }: { label: string; icon: keyof typeof MaterialIcons.glyphMap; colors: ReturnType<typeof useColors> }) { return <View style={[styles.tag, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}32` }]}><MaterialIcons name={icon} size={13} color={colors.primary} /><Text style={[styles.tagText, { color: colors.foreground }]}>{label}</Text></View>; }

const styles = StyleSheet.create({ screen: { flex: 1 }, content: { padding: 20, paddingBottom: 40, gap: 15 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 10 }, back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" }, headerCopy: { flex: 1, alignItems: "flex-end" }, headerMark: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" }, eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5 }, title: { fontSize: 27, fontWeight: "900", marginTop: 2 }, subtitle: { fontSize: 11, marginTop: 4 }, statusBar: { borderWidth: 1, minHeight: 40, borderRadius: 14, paddingHorizontal: 12, flexDirection: "row-reverse", alignItems: "center", gap: 6 }, statusDot: { width: 8, height: 8, borderRadius: 4 }, statusText: { fontSize: 10, fontWeight: "900" }, statusHint: { fontSize: 9, marginLeft: "auto" }, kindRow: { flexDirection: "row-reverse", gap: 7 }, kind: { flex: 1, minHeight: 49, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 5 }, kindText: { fontSize: 10, fontWeight: "900" }, mediaPicker: { minHeight: 145, borderRadius: 23, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 7 }, mediaOptions: { minHeight: 145, borderRadius: 23, borderWidth: 1.5, borderStyle: "dashed", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 9, padding: 12 }, mediaOption: { flex: 1, minHeight: 105, borderRadius: 17, alignItems: "center", justifyContent: "center", gap: 5 }, mediaOptionText: { fontSize: 12, fontWeight: "900" }, mediaOptionHint: { fontSize: 9 }, mediaIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" }, mediaTitle: { fontSize: 14, fontWeight: "900" }, mediaHint: { fontSize: 9 }, mediaGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }, mediaTile: { width: "23.7%", aspectRatio: 0.82, borderRadius: 13, overflow: "visible" }, mediaImage: { flex: 1, borderRadius: 13, overflow: "hidden" }, mediaImageFill: { flex: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" }, mediaImageStyle: { borderRadius: 13 }, mediaShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(17,24,39,0.25)" }, mediaIndex: { position: "absolute", bottom: 5, left: 5, width: 19, height: 19, borderRadius: 10, backgroundColor: "rgba(17,24,39,0.65)", alignItems: "center", justifyContent: "center" }, mediaIndexText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" }, removeMedia: { position: "absolute", top: -5, right: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: "#B42318", alignItems: "center", justifyContent: "center" }, form: { gap: 11 }, field: { gap: 6 }, label: { fontSize: 11, fontWeight: "800", textAlign: "right" }, input: { minHeight: 49, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, fontSize: 12 }, textarea: { minHeight: 88, paddingTop: 13, textAlignVertical: "top" }, tagRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 }, tag: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 7, flexDirection: "row-reverse", alignItems: "center", gap: 4 }, tagText: { fontSize: 9, fontWeight: "800" }, previewButton: { minHeight: 51, borderRadius: 17, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 }, previewText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, toast: { position: "absolute", top: 18, left: 18, right: 18, minHeight: 53, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, flexDirection: "row-reverse", alignItems: "center", gap: 8, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 }, toastText: { flex: 1, color: "#FFFFFF", fontSize: 12, fontWeight: "900", textAlign: "right" }, studio: { flex: 1, backgroundColor: "#0B1020", padding: 20, paddingTop: 58 }, studioTop: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, studioCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }, studioHeading: { alignItems: "center" }, studioKicker: { color: "rgba(255,255,255,0.58)", fontSize: 10, fontWeight: "800" }, studioTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginTop: 3 }, carousel: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 9, marginTop: 27 }, carouselArrow: { width: 38, height: 54, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }, disabledArrow: { opacity: 0.25 }, studioFrame: { flex: 1, position: "relative" }, studioImage: { height: 425, borderRadius: 24, overflow: "hidden", alignItems: "center", justifyContent: "center" }, studioImageStyle: { borderRadius: 24 }, studioShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" }, studioCounter: { position: "absolute", top: 13, right: 13, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: "rgba(0,0,0,0.56)" }, studioCounterText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" }, studioDelete: { position: "absolute", bottom: 13, left: 13, flexDirection: "row-reverse", alignItems: "center", gap: 5, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "rgba(180,35,24,0.88)" }, studioDeleteText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" }, studioDots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 14 }, studioDot: { width: 7, height: 7, borderRadius: 4 }, studioCopy: { alignItems: "flex-end", marginTop: 23 }, studioPreviewLabel: { color: "rgba(255,255,255,0.56)", fontSize: 10 }, studioContentTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginTop: 6, textAlign: "right" }, studioContentBody: { color: "rgba(255,255,255,0.68)", fontSize: 11, lineHeight: 18, textAlign: "right", marginTop: 5 }, studioPrice: { fontSize: 15, fontWeight: "900", marginTop: 8 }, studioPublish: { minHeight: 53, borderRadius: 17, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, marginTop: "auto" }, studioPublishText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" } });
