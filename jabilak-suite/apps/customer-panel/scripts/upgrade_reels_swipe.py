from pathlib import Path

path = Path("app/(tabs)/reels.tsx")
text = path.read_text()

text = text.replace(
    'import { FlatList, ImageBackground, Modal, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";',
    'import { FlatList, ImageBackground, Linking, Modal, Pressable, Share, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";'
)
text = text.replace(
    'type Post = { id: string; seller: string; title: string; subtitle: string; image: string; likes: number };',
    'type Post = { id: string; seller: string; title: string; subtitle: string; image: string; media: string[]; likes: number };'
)
text = text.replace(
    '{ id: "1", seller: "أبو علي للأقمشة", title: "وصلت التشكيلة الجديدة", subtitle: "ألوان يومية بخامات مختارة", image: REAL_IMAGES.posts.lifestyle, likes: 184 },',
    '{ id: "1", seller: "أبو علي للأقمشة", title: "وصلت التشكيلة الجديدة", subtitle: "ألوان يومية بخامات مختارة", image: REAL_IMAGES.posts.lifestyle, media: [REAL_IMAGES.posts.lifestyle, REAL_IMAGES.posts.model], likes: 184 },'
)
text = text.replace(
    '{ id: "2", seller: "زاد للمأكولات", title: "عرض اليوم من مطبخنا", subtitle: "طازج، قريب، وبسعر يفرحك", image: REAL_IMAGES.posts.retail, likes: 96 },',
    '{ id: "2", seller: "زاد للمأكولات", title: "عرض اليوم من مطبخنا", subtitle: "طازج، قريب، وبسعر يفرحك", image: REAL_IMAGES.posts.retail, media: [REAL_IMAGES.posts.retail, REAL_IMAGES.posts.lifestyle], likes: 96 },'
)
text = text.replace(
    '{ id: "3", seller: "الأمير للإلكترونيات", title: "منتجات أصلية بضمان", subtitle: "اختيارات ذكية لكل يوم", image: REAL_IMAGES.posts.model, likes: 241 },',
    '{ id: "3", seller: "الأمير للإلكترونيات", title: "منتجات أصلية بضمان", subtitle: "اختيارات ذكية لكل يوم", image: REAL_IMAGES.posts.model, media: [REAL_IMAGES.posts.model, REAL_IMAGES.posts.retail], likes: 241 },'
)
text = text.replace(
    '  const colors = useColors();\n',
    '  const colors = useColors();\n  const { width: viewportWidth } = useWindowDimensions();\n  const mediaWidth = Math.max(320, viewportWidth - 40);\n'
)
text = text.replace(
    '  const [editSubtitle, setEditSubtitle] = useState("");\n',
    '  const [editSubtitle, setEditSubtitle] = useState("");\n  const [downloadingId, setDownloadingId] = useState<string | null>(null);\n  const [notice, setNotice] = useState<string | null>(null);\n'
)
text = text.replace(
    '  const saveEdit = () => { if (!editingPost || !editTitle.trim() || !editSubtitle.trim()) return; setPosts((current) => current.map((item) => item.id === editingPost.id ? { ...item, title: editTitle.trim(), subtitle: editSubtitle.trim() } : item)); setEditingPost(null); };\n',
    '  const saveEdit = () => { if (!editingPost || !editTitle.trim() || !editSubtitle.trim()) return; setPosts((current) => current.map((item) => item.id === editingPost.id ? { ...item, title: editTitle.trim(), subtitle: editSubtitle.trim() } : item)); setEditingPost(null); setNotice("تم حفظ تعديل المنشور"); };\n  const downloadProduct = (post: Post) => { setDownloadingId(post.id); void Linking.openURL(post.image); setTimeout(() => { setDownloadingId(null); setNotice("تم تجهيز تنزيل المنتج"); }, 700); };\n'
)
text = text.replace(
    'contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}',
    'contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} snapToAlignment="start" decelerationRate="fast" snapToInterval={430}'
)
old = '<ImageBackground source={{ uri: item.image }} style={styles.cover} imageStyle={styles.coverImage}><View style={styles.coverShade} /><View style={styles.coverTop}><View style={styles.typePill}><Text style={[styles.typeText, { color: colors.foreground }]}>ريلز</Text></View><View style={styles.manageActions}><Pressable onPress={() => openEdit(item)} accessibilityLabel="تعديل المنشور" style={({ pressed }) => [styles.moreButton, { opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="edit" size={18} color="#FFFFFF" /></Pressable><Pressable onPress={() => requestDelete(item)} accessibilityLabel="حذف المنشور" style={({ pressed }) => [styles.moreButton, { opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="delete-outline" size={20} color="#FFFFFF" /></Pressable></View></View><View style={styles.coverCopy}><Text style={styles.coverTitle}>{item.title}</Text><Text style={styles.coverSubtitle}>{item.subtitle}</Text><Text style={styles.coverSeller}>من {item.seller}</Text></View></ImageBackground>'
new = '<FlatList horizontal pagingEnabled showsHorizontalScrollIndicator={false} data={item.media} keyExtractor={(uri, index) => `${item.id}-${index}-${uri}`} renderItem={({ item: uri }) => <ImageBackground source={{ uri }} style={[styles.cover, { width: mediaWidth }]} imageStyle={styles.coverImage}><View style={styles.coverShade} /><View style={styles.coverTop}><View style={styles.typePill}><Text style={[styles.typeText, { color: colors.foreground }]}>ريلز</Text></View><View style={styles.manageActions}><Pressable onPress={() => openEdit(item)} accessibilityLabel="تعديل المنشور" style={({ pressed }) => [styles.moreButton, { opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="edit" size={18} color="#FFFFFF" /></Pressable><Pressable onPress={() => requestDelete(item)} accessibilityLabel="حذف المنشور" style={({ pressed }) => [styles.moreButton, { opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="delete-outline" size={20} color="#FFFFFF" /></Pressable></View></View><View style={styles.coverCopy}><Text style={styles.coverTitle}>{item.title}</Text><Text style={styles.coverSubtitle}>{item.subtitle}</Text><Text style={styles.coverSeller}>من {item.seller}</Text></View></ImageBackground>} />'
if old not in text:
    raise SystemExit("cover block not found")
text = text.replace(old, new)
text = text.replace(
    '<Pressable onPress={() => toggle(saved, item.id, setSaved)} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}><MaterialIcons name={isSaved ? "bookmark" : "bookmark-border"} size={21} color={isSaved ? colors.primary : colors.foreground} /><Text style={[styles.actionText, { color: colors.foreground }]}>{isSaved ? "محفوظ" : "حفظ"}</Text></Pressable>',
    '<Pressable onPress={() => toggle(saved, item.id, setSaved)} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}><MaterialIcons name={isSaved ? "bookmark" : "bookmark-border"} size={21} color={isSaved ? colors.primary : colors.foreground} /><Text style={[styles.actionText, { color: colors.foreground }]}>{isSaved ? "تم الحفظ" : "حفظ المنتج"}</Text></Pressable><Pressable disabled={downloadingId === item.id} onPress={() => downloadProduct(item)} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : downloadingId === item.id ? 0.55 : 1 }]}><MaterialIcons name={downloadingId === item.id ? "hourglass-top" : "download"} size={20} color={colors.foreground} /><Text style={[styles.actionText, { color: colors.foreground }]}>{downloadingId === item.id ? "جارٍ التنزيل" : "تنزيل المنتج"}</Text></Pressable>'
)
text = text.replace(
    '  </ScreenContainer>;\n}',
    '    {notice && <Pressable onPress={() => setNotice(null)} style={[styles.notice, { backgroundColor: colors.foreground }]}><MaterialIcons name="check-circle" size={17} color={colors.primary} /><Text style={styles.noticeText}>{notice}</Text></Pressable>}\n  </ScreenContainer>;\n}'
)
text = text.replace(
    'card: { borderRadius: 25, borderWidth: 1, overflow: "hidden" }, cover:',
    'card: { borderRadius: 25, borderWidth: 1, overflow: "hidden" }, notice: { position: "absolute", bottom: 22, alignSelf: "center", minHeight: 42, borderRadius: 14, paddingHorizontal: 15, flexDirection: "row-reverse", alignItems: "center", gap: 7, zIndex: 20 }, noticeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, cover:'
)
path.write_text(text)
print("updated", path)
