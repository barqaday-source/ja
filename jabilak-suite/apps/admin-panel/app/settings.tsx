import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";
import { LANGUAGES, useI18n } from "@/lib/i18n";

const SETTINGS = [
  { key: "account", icon: "person-outline" as const, route: "/account-settings" },
  { key: "notifications", icon: "notifications-none" as const, route: "/notifications" },
  { key: "privacy", icon: "shield" as const, route: "/account-settings" },
  { key: "language", icon: "language" as const, route: "/language-appearance" },
  { key: "help", icon: "help-outline" as const, route: "/help-support" },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { language, setLanguage, t } = useI18n();
  const labels: Record<(typeof SETTINGS)[number]["key"], { label: string; subtitle: string }> = {
    account: { label: t("account"), subtitle: language === "ar" ? "الاسم، النوع، الخصوصية" : language === "ku" ? "ناو، جۆر، تایبەتمەندی" : "Name, type, privacy" },
    notifications: { label: t("notifications"), subtitle: language === "ar" ? "التنبيهات والرسائل" : language === "ku" ? "ئاگادارکردنەوە و پەیامەکان" : "Alerts and messages" },
    privacy: { label: t("privacy"), subtitle: language === "ar" ? "إدارة ظهورك وتفضيلاتك" : language === "ku" ? "بەڕێوەبردنی دەرکەوتن و هەڵبژاردەکان" : "Visibility and preferences" },
    language: { label: t("language"), subtitle: t("chooseLanguage") },
    help: { label: t("help"), subtitle: language === "ar" ? "الأسئلة الشائعة والتواصل" : language === "ku" ? "پرسیارە باوەکان و پەیوەندی" : "FAQs and contact" },
  };

  const openItem = (item: (typeof SETTINGS)[number]) => router.push(item.route as never);

  return <ScreenContainer edges={["top", "left", "right"]}><View style={styles.container}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable>
    <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND.name}</Text><Text style={[styles.title, { color: colors.foreground }]}>{t("settings")}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{language === "ar" ? "تحكم كامل في حسابك وتجربتك" : language === "ku" ? "کۆنترۆڵی تەواوی هەژمار و ئەزموونەکەت" : "Full control of your account and experience"}</Text></View>
    <View style={styles.languageSection}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("chooseLanguage")}</Text><View style={styles.languageRow}>{LANGUAGES.map((item) => <Pressable key={item.code} onPress={() => setLanguage(item.code)} style={({ pressed }) => [styles.languageChip, { backgroundColor: language === item.code ? colors.primary : colors.surface, borderColor: language === item.code ? colors.primary : colors.border, opacity: pressed ? 0.72 : 1 }]}><Text style={[styles.languageShort, { color: language === item.code ? colors.foreground : colors.muted }]}>{item.short}</Text><Text style={[styles.languageLabel, { color: language === item.code ? colors.foreground : colors.foreground }]}>{item.label}</Text></Pressable>)}</View></View>
    <View style={styles.list}>{SETTINGS.map((item) => <Pressable key={item.key} onPress={() => openItem(item)} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.76 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}><View style={[styles.icon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name={item.icon} size={19} color={colors.primary} /></View><View style={styles.copy}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{labels[item.key].label}</Text><Text style={[styles.cardSubtitle, { color: colors.muted }]}>{labels[item.key].subtitle}</Text></View><MaterialIcons name="chevron-left" size={20} color={colors.muted} /></Pressable>)}</View>
  </View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 20 }, back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }, header: { alignItems: "flex-end", marginTop: 18 }, eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2 }, title: { fontSize: 31, fontWeight: "900", marginTop: 4 }, subtitle: { fontSize: 12, marginTop: 4, textAlign: "right" }, languageSection: { marginTop: 24, gap: 10 }, sectionTitle: { fontSize: 14, fontWeight: "900", textAlign: "right" }, languageRow: { flexDirection: "row-reverse", gap: 8 }, languageChip: { flex: 1, minHeight: 62, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 3 }, languageShort: { fontSize: 13, fontWeight: "900" }, languageLabel: { fontSize: 10, fontWeight: "800" }, list: { marginTop: 20, gap: 10 }, card: { minHeight: 75, borderRadius: 22, borderWidth: 1, padding: 14, flexDirection: "row-reverse", alignItems: "center", gap: 11 }, icon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" }, copy: { flex: 1, alignItems: "flex-end" }, cardTitle: { fontSize: 13, fontWeight: "900", textAlign: "right" }, cardSubtitle: { fontSize: 10, marginTop: 4, textAlign: "right" } });
