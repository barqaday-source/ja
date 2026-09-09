import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";
import { useI18n } from "@/lib/i18n";

const PROMOTIONAL_CAMPAIGNS = [
  { id: "campaign-1", title: "حملة التشكيلة الجديدة", meta: "إعلان ترويجي · 7 أيام · $200", status: "قيد المراجعة", icon: "schedule" as const, tone: "warning" as const },
  { id: "campaign-2", title: "عرض نهاية الأسبوع", meta: "إعلان ترويجي · 3 أيام · $15", status: "فعالة", icon: "check-circle" as const, tone: "success" as const },
];

const ITEMS = [
  { icon: "person.2.fill" as const, labelKey: "following" as const, description: "متاجرك وحساباتك ومنشوراتهم اليومية", route: "/following", accent: "primary" },
  { icon: "message.fill" as const, labelKey: "messagesTitle" as const, description: "تواصل مع المتاجر والزبائن مباشرة", route: "/messages", accent: "primary" },
  { icon: "settings.fill" as const, labelKey: "settings" as const, description: "اللغة والخصوصية وإعدادات الحساب", route: "/settings", accent: "primary" },
  { icon: "bell.fill" as const, labelKey: "notifications" as const, description: "تابع آخر الطلبات والتنبيهات", route: "/notifications", accent: "warning" },
  { icon: "bookmark.fill" as const, labelKey: "explore" as const, description: "المتاجر والمنشورات المحفوظة", route: "/explore", accent: "primary" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  useEffect(() => { AsyncStorage.getItem("jabilak-social-links").then((value) => { if (value) setSocialLinks(JSON.parse(value).filter((link: { url?: string }) => link.url?.trim())); }).catch(() => undefined); }, []);
  const openSocialLink = (url: string) => { const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`; Linking.openURL(normalized).catch(() => undefined); };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push("/notifications")} style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
              <IconSymbol name="bell.fill" size={19} color={colors.foreground} />
              <View style={[styles.notificationDot, { backgroundColor: colors.primary, borderColor: colors.surface }]} />
            </Pressable>
          </View>
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND.name}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>حسابي</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>ملفك وإعدادات تجربتك في مكان واحد</Text>
          </View>
        </View>

        <Pressable onPress={() => router.push("/account-settings")} style={({ pressed }) => [styles.profileCard, { backgroundColor: colors.foreground, opacity: pressed ? 0.9 : 1 }]}>
          <View style={styles.profileTopLine}>
            <View style={[styles.profileStatus, { backgroundColor: `${colors.success}20` }]}><View style={[styles.statusDot, { backgroundColor: colors.success }]} /><Text style={[styles.profileStatusText, { color: colors.success }]}>نشط الآن</Text></View>
            <View style={[styles.profileType, { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}55` }]}><Text style={[styles.profileTypeText, { color: colors.primary }]}>زبون</Text></View>
          </View>
          <View style={styles.profileMain}>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>المستخدم</Text>
              <Text style={styles.profileMeta}>—</Text>
              <Text style={styles.profileBio}>تصفح، تابع، وتواصل مع كل المتاجر التي تهمك.</Text>
            </View>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: "" }} style={styles.avatar} />
              <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.foreground }]}><IconSymbol name="camera.fill" size={15} color="#FFFFFF" /></View>
            </View>
          </View>
          <View style={[styles.profileFooter, { borderTopColor: "rgba(255,255,255,0.12)" }]}><Text style={styles.editHint}>اضغط لتعديل الملف والصورة</Text><IconSymbol name="chevron.left" size={17} color={colors.primary} /></View>
        </Pressable>

        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[{ value: "12", label: "منشور" }, { value: "24", label: "محفوظ" }, { value: "48", label: "متابعة" }].map((stat, index) => <View key={stat.label} style={[styles.stat, index < 2 && { borderLeftColor: colors.border, borderLeftWidth: 1 }]}><Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text></View>)}
        </View>

        <View style={[styles.campaignSection, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.sectionHeading}><View style={[styles.sectionIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name="campaign" size={17} color={colors.primary} /></View><View style={styles.sectionHeadingCopy}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>إعلاناتي الترويجية</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>تابع حالة حملاتك بعد إرسال الدفع</Text></View></View><View style={styles.campaignList}>{PROMOTIONAL_CAMPAIGNS.map((campaign) => <View key={campaign.id} style={[styles.campaignRow, { borderTopColor: colors.border }]}><View style={[styles.campaignStatus, { backgroundColor: campaign.tone === "success" ? `${colors.success}15` : `${colors.warning}18` }]}><MaterialIcons name={campaign.icon} size={16} color={campaign.tone === "success" ? colors.success : colors.warning} /><Text style={[styles.campaignStatusText, { color: campaign.tone === "success" ? colors.success : colors.warning }]}>{campaign.status}</Text></View><View style={styles.campaignCopy}><Text style={[styles.campaignTitle, { color: colors.foreground }]}>{campaign.title}</Text><Text style={[styles.campaignMeta, { color: colors.muted }]}>{campaign.meta}</Text></View></View>)}</View><Pressable onPress={() => router.push("/create-ad")} style={({ pressed }) => [styles.campaignLink, { borderTopColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.campaignLinkText, { color: colors.primary }]}>إنشاء إعلان ترويجي جديد</Text><MaterialIcons name="arrow-back" size={17} color={colors.primary} /></Pressable></View>

        {socialLinks.length > 0 && <View style={styles.socialSection}><View style={styles.sectionHeading}><View style={[styles.sectionIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name="link" size={17} color={colors.primary} /></View><View style={styles.sectionHeadingCopy}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>روابطي العامة</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>مواقعك ومنصاتك للتواصل</Text></View></View><View style={styles.socialGrid}>{socialLinks.map((link) => <Pressable key={`${link.platform}-${link.url}`} onPress={() => openSocialLink(link.url)} style={({ pressed }) => [styles.socialCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><View style={[styles.socialIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name={link.platform === "Instagram" ? "photo-camera" : link.platform === "Facebook" ? "facebook" : link.platform === "TikTok" ? "music-note" : "language"} size={19} color={colors.primary} /></View><View style={styles.socialCopy}><Text style={[styles.socialPlatform, { color: colors.foreground }]}>{link.platform}</Text><Text numberOfLines={1} style={[styles.socialUrl, { color: colors.muted }]}>{link.url}</Text></View><MaterialIcons name="open-in-new" size={16} color={colors.muted} /></Pressable>)}</View></View>}

        <View style={styles.sectionHeading}><View style={[styles.sectionIcon, { backgroundColor: `${colors.primary}18` }]}><IconSymbol name="settings.fill" size={17} color={colors.primary} /></View><View style={styles.sectionHeadingCopy}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>الوصول السريع</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>كل ما تحتاجه لإدارة تجربتك</Text></View></View>

        <View style={styles.items}>
          {ITEMS.map((item) => <Pressable key={item.route} onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.item, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}><View style={[styles.itemIcon, { backgroundColor: `${colors.primary}18` }]}><IconSymbol name={item.icon} size={19} color={item.accent === "warning" ? colors.warning : colors.primary} /></View><View style={styles.itemCopy}><Text style={[styles.itemLabel, { color: colors.foreground }]}>{t(item.labelKey)}</Text><Text style={[styles.itemDescription, { color: colors.muted }]}>{item.description}</Text></View><View style={[styles.itemArrow, { backgroundColor: colors.background }]}><IconSymbol name="chevron.left" size={16} color={colors.muted} /></View></Pressable>)}
        </View>

        <Pressable onPress={() => router.push("/account-settings")} style={({ pressed }) => [styles.manageCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}45`, opacity: pressed ? 0.75 : 1 }]}><View style={[styles.manageIcon, { backgroundColor: colors.primary }]}><IconSymbol name="person.crop.circle.fill" size={20} color={colors.foreground} /></View><View style={styles.manageCopy}><Text style={[styles.manageTitle, { color: colors.foreground }]}>تحكم كامل بحسابك</Text><Text style={[styles.manageText, { color: colors.muted }]}>عدّل نوع الحساب واللغة والخصوصية من الإعدادات</Text></View><IconSymbol name="chevron.left" size={18} color={colors.primary} /></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 120, gap: 16 },
  header: { flexDirection: "row-reverse", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  heading: { flex: 1, alignItems: "flex-end" },
  headerActions: { paddingTop: 4 },
  headerButton: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  notificationDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, position: "absolute", top: 8, right: 9 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  title: { fontSize: 31, fontWeight: "900", marginTop: 5 },
  subtitle: { fontSize: 12, marginTop: 4, textAlign: "right" },
  profileCard: { borderRadius: 27, padding: 18, gap: 14 },
  profileTopLine: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  profileStatus: { flexDirection: "row-reverse", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  profileStatusText: { fontSize: 9, fontWeight: "800" },
  profileType: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  profileTypeText: { fontSize: 10, fontWeight: "900" },
  profileMain: { flexDirection: "row-reverse", alignItems: "center", gap: 13 },
  avatarWrap: { width: 78, height: 78, position: "relative" },
  avatar: { width: 78, height: 78, borderRadius: 26, borderWidth: 3, borderColor: "rgba(255,255,255,0.2)" },
  editBadge: { position: "absolute", left: -4, bottom: -4, width: 29, height: 29, borderRadius: 11, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  profileCopy: { flex: 1, alignItems: "flex-end" },
  profileName: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  profileMeta: { color: "rgba(255,255,255,0.62)", fontSize: 10, marginTop: 4 },
  profileBio: { color: "rgba(255,255,255,0.78)", fontSize: 10, lineHeight: 17, marginTop: 10, textAlign: "right" },
  profileFooter: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, paddingTop: 12 },
  editHint: { color: "rgba(255,255,255,0.58)", fontSize: 10 },
  statsCard: { minHeight: 79, borderWidth: 1, borderRadius: 21, flexDirection: "row-reverse", alignItems: "center", paddingVertical: 10 },
  campaignSection: { borderWidth: 1, borderRadius: 21, padding: 13, gap: 10 },
  campaignList: { gap: 0 },
  campaignRow: { minHeight: 64, borderTopWidth: 1, paddingTop: 10, marginTop: 10, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  campaignCopy: { flex: 1, alignItems: "flex-end", gap: 4 },
  campaignTitle: { fontSize: 12, fontWeight: "900", textAlign: "right" },
  campaignMeta: { fontSize: 9, textAlign: "right" },
  campaignStatus: { minWidth: 82, minHeight: 32, borderRadius: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 7 },
  campaignStatusText: { fontSize: 9, fontWeight: "900" },
  campaignLink: { minHeight: 42, borderTopWidth: 1, paddingTop: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  campaignLinkText: { fontSize: 10, fontWeight: "900" },
  stat: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  statValue: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, fontWeight: "700" },
  sectionHeading: { flexDirection: "row-reverse", alignItems: "center", gap: 9, marginTop: 4 },
  socialSection: { gap: 10 },
  socialGrid: { gap: 9 },
  socialCard: { minHeight: 61, borderRadius: 18, borderWidth: 1, padding: 11, flexDirection: "row-reverse", alignItems: "center", gap: 9 },
  socialIcon: { width: 35, height: 35, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  socialCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  socialPlatform: { fontSize: 11, fontWeight: "900" },
  socialUrl: { maxWidth: "100%", fontSize: 9 },
  sectionHeadingCopy: { flex: 1, alignItems: "flex-end" },
  sectionIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "900" },
  sectionSubtitle: { fontSize: 10, marginTop: 3 },
  items: { gap: 10 },
  item: { minHeight: 73, borderRadius: 20, borderWidth: 1, padding: 12, flexDirection: "row-reverse", alignItems: "center", gap: 11 },
  itemIcon: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  itemCopy: { flex: 1, alignItems: "flex-end", gap: 4 },
  itemLabel: { fontSize: 13, fontWeight: "900", textAlign: "right" },
  itemDescription: { fontSize: 10, textAlign: "right" },
  itemArrow: { width: 30, height: 30, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  manageCard: { minHeight: 76, borderRadius: 21, borderWidth: 1, padding: 12, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  manageIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  manageCopy: { flex: 1, alignItems: "flex-end", gap: 4 },
  manageTitle: { fontSize: 13, fontWeight: "900" },
  manageText: { fontSize: 10, textAlign: "right", lineHeight: 16 },
});
