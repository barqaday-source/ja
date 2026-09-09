import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";
import { useI18n } from "@/lib/i18n";
import { clearRememberedSession, clearUserInfo, getUserInfo, removeSessionToken, type User } from "@/lib/_core/auth";

type ProfileAction = {
  key: string;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
};

const PROFILE_ACTIONS: ProfileAction[] = [
  { key: "account", label: "معلومات الحساب", description: "الاسم والبريد ورقم الهاتف", icon: "person-outline", route: "/account-settings" },
  { key: "orders", label: "سجل الطلبات", description: "تابع طلباتك الحالية والسابقة", icon: "receipt-long", route: "/orders" },
  { key: "notifications", label: "التنبيهات", description: "تحديثات الطلبات والنشاطات المهمة", icon: "notifications-none", route: "/notifications" },
  { key: "settings", label: "الإعدادات والتفضيلات", description: "اللغة والمظهر والخصوصية", icon: "tune", route: "/settings" },
  { key: "help", label: "المساعدة والدعم", description: "الأسئلة الشائعة وطلب المساعدة", icon: "help-outline", route: "/help-support" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    void getUserInfo().then((value) => { if (active) setUser(value); });
    return () => { active = false; };
  }, []);

  const displayName = user?.name?.trim() || "الاسم غير متاح";
  const initials = useMemo(() => {
    const value = user?.name?.trim();
    return value ? value.slice(0, 1).toUpperCase() : "؟";
  }, [user?.name]);

  const signOut = () => {
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج من هذا الحساب؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "تسجيل الخروج", style: "destructive", onPress: () => { void Promise.all([removeSessionToken(), clearUserInfo(), clearRememberedSession()]).finally(() => router.replace("/")); } },
    ]);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="رجوع" style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
            <MaterialIcons name="arrow-forward" size={20} color={colors.foreground} />
          </Pressable>
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND.name}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>الملف الشخصي</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>بياناتك وإعدادات تجربتك</Text>
          </View>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={[styles.avatarText, { color: colors.foreground }]}>{initials}</Text></View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{displayName}</Text>
            <Text style={[styles.profileStatus, { color: colors.success }]}>حساب عميل</Text>
            <Text style={[styles.profileMeta, { color: colors.muted }]}>{user?.email || "البريد الإلكتروني غير متاح"}</Text>
          </View>
          <Pressable onPress={() => router.push("/account-settings")} accessibilityRole="button" accessibilityLabel="تعديل معلومات الحساب" style={({ pressed }) => [styles.editButton, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
            <MaterialIcons name="edit" size={17} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>إدارة الحساب</Text><Text style={[styles.sectionSubtitle, { color: colors.muted }]}>الوصول السريع إلى أهم الخيارات</Text></View>
        <View style={styles.actionList}>
          {PROFILE_ACTIONS.map((item) => <Pressable key={item.key} onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.action, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
            <MaterialIcons name="chevron-left" size={21} color={colors.muted} />
            <View style={styles.actionCopy}><Text style={[styles.actionLabel, { color: colors.foreground }]}>{item.key === "settings" ? t("settings") : item.label}</Text><Text style={[styles.actionDescription, { color: colors.muted }]}>{item.description}</Text></View>
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}16` }]}><MaterialIcons name={item.icon} size={19} color={colors.primary} /></View>
          </Pressable>)}
        </View>

        <View style={[styles.legal, { borderTopColor: colors.border }]}>
          <Text style={[styles.legalText, { color: colors.muted }]}>باستخدام التطبيق، أنت توافق على الشروط والأحكام وسياسة الخصوصية.</Text>
        </View>
        <Pressable onPress={signOut} style={({ pressed }) => [styles.signOut, { borderColor: `${colors.error}55`, backgroundColor: `${colors.error}0D`, opacity: pressed ? 0.65 : 1 }]}>
          <MaterialIcons name="logout" size={18} color={colors.error} /><Text style={[styles.signOutText, { color: colors.error }]}>تسجيل الخروج</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 110, gap: 16 },
  header: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 12 },
  heading: { flex: 1, alignItems: "flex-end" },
  backButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  title: { fontSize: 29, fontWeight: "900", marginTop: 4, textAlign: "right" },
  subtitle: { fontSize: 11, marginTop: 4, textAlign: "right" },
  profileCard: { minHeight: 122, borderRadius: 20, borderWidth: 1, padding: 15, flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  avatar: { width: 66, height: 66, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 25, fontWeight: "900" },
  profileCopy: { flex: 1, alignItems: "flex-end" },
  profileName: { fontSize: 17, fontWeight: "900", textAlign: "right" },
  profileStatus: { fontSize: 10, fontWeight: "800", marginTop: 5 },
  profileMeta: { fontSize: 10, marginTop: 5, textAlign: "right" },
  editButton: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sectionHeader: { alignItems: "flex-end", marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: "900" },
  sectionSubtitle: { fontSize: 10, marginTop: 3 },
  actionList: { gap: 9 },
  action: { minHeight: 70, borderRadius: 16, borderWidth: 1, padding: 11, flexDirection: "row-reverse", alignItems: "center", gap: 11 },
  actionIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  actionCopy: { flex: 1, alignItems: "flex-end" },
  actionLabel: { fontSize: 12, fontWeight: "900", textAlign: "right" },
  actionDescription: { fontSize: 9, marginTop: 4, textAlign: "right" },
  legal: { borderTopWidth: 1, paddingTop: 14, marginTop: 3 },
  legalText: { fontSize: 9, lineHeight: 16, textAlign: "right" },
  signOut: { minHeight: 48, borderWidth: 1, borderRadius: 14, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 },
  signOutText: { fontSize: 11, fontWeight: "900" },
});
