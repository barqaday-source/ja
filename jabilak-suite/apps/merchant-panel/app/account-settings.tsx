import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";
import { ProfileAvatarEditor } from "@/components/profile-avatar-editor";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { ACCOUNT_DELETE_PHRASE, matchesConfirmationPhrase } from "@/lib/data/delete-helpers";
import * as Auth from "@/lib/_core/auth";
import { useAuth } from "@/hooks/use-auth";



export default function AccountSettingsScreen() {
  const colors = useColors();
  const { language, setLanguage, t } = useI18n();
  const router = useRouter();
  const { logout } = useAuth({ autoFetch: false });
  const [name, setName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState("");
  const [accountType, setAccountType] = useState<"user" | "business">("user");
  const [privateAccount, setPrivateAccount] = useState(false);
  const [personalized, setPersonalized] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [accountTypeOpen, setAccountTypeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [socialLinks, setSocialLinks] = useState([{ platform: "الموقع الإلكتروني", url: "" }, { platform: "Instagram", url: "" }]);
  const [socialOpen, setSocialOpen] = useState(false);
  const [socialIndex, setSocialIndex] = useState(0);
  useEffect(() => { Auth.getRememberMe().then(setRememberMe).catch(() => undefined); }, []);

  const saveProfile = () => {
    const invalidLink = socialLinks.find((link) => link.url.trim() && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(link.url.trim()));
    if (invalidLink) { Alert.alert("تحقق من الرابط", `رابط ${invalidLink.platform} غير صالح. استخدم مثالاً مثل https://example.com`); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert("لم يتم الحفظ", "سيتم حفظ بيانات الحساب بعد ربط نموذج الحساب في Supabase.");
    }, 650);
  };

  const switchAccount = (next: "user" | "business") => {
    setAccountType(next);
    Alert.alert("تبديل نوع الحساب", next === "business" ? "تم اختيار وضع صاحب المتجر تجريبياً." : "تم اختيار وضع الزبون تجريبياً.");
  };

  const changeRememberMe = (value: boolean) => { setRememberMe(value); void Auth.setRememberMe(value); };

  const requestLogout = () => {
    Alert.alert(t("confirmLogout"), t("logoutWarning"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("logout"), style: "destructive", onPress: async () => { await logout(); Alert.alert(t("loggedOut"), undefined, [{ text: "OK", onPress: () => router.replace("/onboarding") }]); } },
    ]);
  };

  const requestDeleteAccount = () => {
    Alert.alert("حذف الحساب", "سيؤدي هذا إلى إزالة بيانات الحساب والمحتوى المرتبط به. لا يمكن التراجع عن العملية.", [{ text: "إلغاء", style: "cancel" }, { text: "متابعة بحذر", style: "destructive", onPress: () => { setDeletePhrase(""); setDeleteOpen(true); } }]);
  };

  const confirmDeleteAccount = () => {
    if (!matchesConfirmationPhrase(deletePhrase)) return;
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setDeleteOpen(false);
      Alert.alert("تم حذف الحساب", "تم حذف الحساب من المعاينة المحلية. عند ربط Supabase سيُنفذ الحذف عبر إجراء محمي.", [{ text: "حسناً", onPress: () => router.replace("/") }]);
    }, 750);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable>
          <View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND.name}</Text><Text style={[styles.title, { color: colors.foreground }]}>{t("accountTitle")}</Text><Text style={[styles.subtitle, { color: colors.muted }]}>{t("accountSubtitle")}</Text></View>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.foreground }]}>
          <ProfileAvatarEditor name={name} imageUri={avatarUri} onChange={setAvatarUri} onRemove={() => setAvatarUri(undefined)} size={62} label="تغيير الصورة" />
          <View style={styles.profileCopy}><Text style={styles.profileName}>{name}</Text><Text style={styles.profileEmail}>user@jayblak.demo</Text></View>
          <MaterialIcons name="edit" size={19} color={colors.primary} />
        </View>

        <Section title={t("personalData")} colors={colors} icon="person-outline">
          <Field label={t("displayName")} value={name} onChangeText={setName} colors={colors} />
          <Field label={t("shortBio")} value={bio} onChangeText={setBio} colors={colors} multiline />
          <Pressable disabled={saving} onPress={saveProfile} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : pressed ? 0.8 : 1 }]}><MaterialIcons name={saving ? "hourglass-top" : "check"} size={18} color={colors.foreground} /><Text style={[styles.primaryText, { color: colors.foreground }]}>{saving ? t("loading") : t("saveChanges")}</Text></Pressable>
        </Section>

        <Section title={t("accountType")} colors={colors} icon="swap-horiz">
          <Text style={[styles.hint, { color: colors.muted }]}>{t("accountTypeHint")}</Text>
          <Pressable onPress={() => setAccountTypeOpen(true)} style={({ pressed }) => [styles.accountSelect, { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}><View style={[styles.accountSelectIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name={accountType === "business" ? "storefront" : "shopping-bag"} size={19} color={colors.primary} /></View><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{accountType === "business" ? t("merchant") : t("customer")}</Text><Text style={[styles.rowDescription, { color: colors.muted }]}>{t("accountTypeSelectHint")}</Text></View><MaterialIcons name="expand-more" size={23} color={colors.muted} /></Pressable>
        </Section>

        <Section title="روابطك العامة" colors={colors} icon="link">
          <Text style={[styles.hint, { color: colors.muted }]}>أضف رابطين كحد أقصى ليظهرا للزوار في ملفك الشخصي.</Text>
          {socialLinks.map((link, index) => <View key={index} style={styles.socialLinkRow}><Pressable onPress={() => { setSocialIndex(index); setSocialOpen(true); }} style={[styles.socialPlatform, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{link.platform}</Text><MaterialIcons name="expand-more" size={20} color={colors.muted} /></Pressable><TextInput value={link.url} onChangeText={(url) => setSocialLinks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url } : item))} autoCapitalize="none" keyboardType="url" placeholder="https://example.com" placeholderTextColor={colors.muted} style={[styles.socialInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} textAlign="right" /></View>)}
        </Section>

        <Section title={t("privacyExperience")} colors={colors} icon="shield">
          <ToggleRow title={t("privateAccount")} description={t("privateAccountDesc")} value={privateAccount} onValueChange={setPrivateAccount} colors={colors} />
          <ToggleRow title={t("personalized")} description={t("personalizedDesc")} value={personalized} onValueChange={setPersonalized} colors={colors} />
        </Section>

        <Section title={t("language")} colors={colors} icon="language">
          <Pressable onPress={() => setLanguageOpen(true)} style={({ pressed }) => [styles.selectRow, { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}><View style={styles.rowIcon}><MaterialIcons name="language" size={19} color={colors.primary} /></View><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{t("appLanguage")}</Text><Text style={[styles.rowDescription, { color: colors.muted }]}>{LANGUAGES.find((item) => item.code === language)?.label}</Text></View><MaterialIcons name="expand-more" size={21} color={colors.muted} /></Pressable>
        </Section>
        <Section title={t("rememberMe")} colors={colors} icon="remember-me">
          <ToggleRow title={t("rememberMe")} description={t("rememberMeDesc")} value={rememberMe} onValueChange={changeRememberMe} colors={colors} />
        </Section>
        <Pressable onPress={requestLogout} style={({ pressed }) => [styles.logoutButton, { borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}10`, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="logout" size={18} color={colors.primary} /><Text style={[styles.logoutText, { color: colors.primary }]}>{t("logout")}</Text></Pressable>
        <Pressable onPress={requestDeleteAccount} style={({ pressed }) => [styles.deleteAccountButton, { borderColor: `${colors.error}55`, backgroundColor: `${colors.error}09`, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="delete-forever" size={18} color={colors.error} /><Text style={[styles.deleteAccountText, { color: colors.error }]}>حذف الحساب نهائياً</Text></Pressable>
        <Text style={[styles.footer, { color: colors.muted }]}>{BRAND.name} · {t("localDemo")}</Text>
      </ScrollView>

      <Modal visible={accountTypeOpen} transparent animationType="slide" onRequestClose={() => setAccountTypeOpen(false)}><Pressable style={styles.modalBackdrop} onPress={() => setAccountTypeOpen(false)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modal, { backgroundColor: colors.surface }]}><View style={styles.handle} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("accountType")}</Text><Text style={[styles.deleteWarning, { color: colors.muted }]}>{t("accountTypeHint")}</Text>{[{ id: "user" as const, label: t("customer"), icon: "shopping-bag" as const }, { id: "business" as const, label: t("merchant"), icon: "storefront" as const }].map((item) => <Pressable key={item.id} onPress={() => { setAccountTypeOpen(false); switchAccount(item.id); }} style={({ pressed }) => [styles.accountOption, { backgroundColor: accountType === item.id ? `${colors.primary}12` : colors.background, borderColor: accountType === item.id ? colors.primary : colors.border, opacity: pressed ? 0.72 : 1 }]}><View style={[styles.accountSelectIcon, { backgroundColor: accountType === item.id ? `${colors.primary}22` : colors.surface }]}><MaterialIcons name={item.icon} size={19} color={accountType === item.id ? colors.primary : colors.muted} /></View><Text style={[styles.rowTitle, { color: colors.foreground }]}>{item.label}</Text>{accountType === item.id && <MaterialIcons name="check-circle" size={20} color={colors.primary} />}</Pressable>)}</Pressable></Pressable></Modal>
      <Modal visible={languageOpen} transparent animationType="slide" onRequestClose={() => setLanguageOpen(false)}><Pressable style={styles.modalBackdrop} onPress={() => setLanguageOpen(false)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modal, { backgroundColor: colors.surface }]}><View style={styles.handle} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("chooseLanguage")}</Text>{LANGUAGES.map((item) => <Pressable key={item.code} onPress={() => { setLanguage(item.code); setLanguageOpen(false); }} style={[styles.languageOption, { borderColor: colors.border }]}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{item.label}</Text>{language === item.code && <MaterialIcons name="check-circle" size={20} color={colors.primary} />}</Pressable>)}</Pressable></Pressable></Modal>
      <Modal visible={socialOpen} transparent animationType="slide" onRequestClose={() => setSocialOpen(false)}><Pressable style={styles.modalBackdrop} onPress={() => setSocialOpen(false)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modal, { backgroundColor: colors.surface }]}><View style={styles.handle} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>اختر نوع الرابط</Text>{["الموقع الإلكتروني", "Facebook", "Instagram", "TikTok", "YouTube", "WhatsApp"].map((platform) => <Pressable key={platform} onPress={() => { setSocialLinks((current) => current.map((item, index) => index === socialIndex ? { ...item, platform } : item)); setSocialOpen(false); }} style={[styles.languageOption, { borderColor: colors.border }]}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{platform}</Text><MaterialIcons name={socialLinks[socialIndex]?.platform === platform ? "check-circle" : "radio-button-unchecked"} size={20} color={socialLinks[socialIndex]?.platform === platform ? colors.primary : colors.muted} /></Pressable>)}</Pressable></Pressable></Modal>
      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteOpen(false)}><Pressable style={styles.modalBackdrop} onPress={() => !deleting && setDeleteOpen(false)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.deleteModal, { backgroundColor: colors.surface }]}><View style={[styles.deleteIcon, { backgroundColor: `${colors.error}16` }]}><MaterialIcons name="warning-amber" size={25} color={colors.error} /></View><Text style={[styles.modalTitle, { color: colors.foreground }]}>تأكيد حذف الحساب</Text><Text style={[styles.deleteWarning, { color: colors.muted }]}>للحماية من الحذف بالخطأ، اكتب العبارة التالية حرفياً:</Text><Text style={[styles.confirmPhrase, { color: colors.error }]}>{ACCOUNT_DELETE_PHRASE}</Text><TextInput value={deletePhrase} onChangeText={setDeletePhrase} editable={!deleting} autoCapitalize="none" placeholder="اكتب عبارة التأكيد" placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} textAlign="right" /><View style={styles.deleteActions}><Pressable disabled={deleting} onPress={() => setDeleteOpen(false)} style={({ pressed }) => [styles.deleteCancel, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.deleteCancelText, { color: colors.foreground }]}>إلغاء</Text></Pressable><Pressable disabled={deleting || !matchesConfirmationPhrase(deletePhrase)} onPress={confirmDeleteAccount} style={({ pressed }) => [styles.deleteConfirm, { backgroundColor: matchesConfirmationPhrase(deletePhrase) ? colors.error : colors.border, opacity: deleting ? 0.7 : pressed ? 0.8 : 1 }]}><MaterialIcons name={deleting ? "hourglass-top" : "delete-forever"} size={17} color="#FFFFFF" /><Text style={styles.deleteConfirmText}>{deleting ? "جارٍ الحذف..." : "حذف نهائياً"}</Text></Pressable></View></Pressable></Pressable></Modal>
    </ScreenContainer>
  );
}

function Section({ title, icon, children, colors }: { title: string; icon: keyof typeof MaterialIcons.glyphMap; children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.section}><View style={styles.sectionHeading}><View style={[styles.sectionIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name={icon} size={18} color={colors.primary} /></View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text></View>{children}</View>;
}

function Field({ label, value, onChangeText, colors, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; colors: ReturnType<typeof useColors>; multiline?: boolean }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.muted }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} multiline={multiline} textAlign="right" placeholderTextColor={colors.muted} style={[styles.input, multiline && styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} /></View>;
}

function ToggleRow({ title, description, value, onValueChange, colors }: { title: string; description: string; value: boolean; onValueChange: (value: boolean) => void; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.toggleRow, { backgroundColor: colors.background, borderColor: colors.border }]}><Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: `${colors.primary}88` }} thumbColor={value ? colors.primary : colors.muted} /><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.rowDescription, { color: colors.muted }]}>{description}</Text></View></View>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36, gap: 16 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 14 }, back: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" }, headerCopy: { flex: 1, alignItems: "flex-end" }, eyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 1.5 }, title: { fontSize: 28, fontWeight: "900", marginTop: 2 }, subtitle: { fontSize: 12, marginTop: 4 }, profileCard: { borderRadius: 26, padding: 18, flexDirection: "row-reverse", alignItems: "center", gap: 12 }, avatar: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" }, avatarText: { fontSize: 24, fontWeight: "900" }, profileCopy: { flex: 1, alignItems: "flex-end" }, profileName: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" }, profileEmail: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 3 }, section: { gap: 12 }, sectionHeading: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, sectionIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }, sectionTitle: { fontSize: 18, fontWeight: "900" }, field: { gap: 6 }, label: { fontSize: 11, textAlign: "right" }, input: { minHeight: 48, borderRadius: 15, borderWidth: 1, paddingHorizontal: 14, fontSize: 13 }, textarea: { minHeight: 82, paddingTop: 13, textAlignVertical: "top" }, primaryButton: { minHeight: 48, borderRadius: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 }, primaryText: { fontSize: 13, fontWeight: "900" },   hint: { fontSize: 11, lineHeight: 18, textAlign: "right" },
  socialLinkRow: { gap: 7 },
  socialPlatform: { minHeight: 45, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  socialInput: { minHeight: 47, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, fontSize: 12 }, segmented: { flexDirection: "row-reverse", gap: 9 }, segment: { flex: 1, minHeight: 49, borderRadius: 15, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, segmentText: { fontSize: 12, fontWeight: "900" }, toggleRow: { minHeight: 66, paddingHorizontal: 13, borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, rowCopy: { flex: 1, alignItems: "flex-end" }, rowTitle: { fontSize: 13, fontWeight: "800" }, rowDescription: { fontSize: 10, marginTop: 3, textAlign: "right" }, accountSelect: { minHeight: 68, borderRadius: 17, borderWidth: 1, padding: 12, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, accountSelectIcon: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" }, accountOption: { minHeight: 58, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, selectRow: { minHeight: 62, borderRadius: 17, borderWidth: 1, padding: 13, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, rowIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(215,151,75,0.12)", alignItems: "center", justifyContent: "center" }, logoutButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, logoutText: { fontSize: 12, fontWeight: "900" }, deleteAccountButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, deleteAccountText: { fontSize: 12, fontWeight: "900" }, footer: { textAlign: "center", fontSize: 10, marginTop: 2 }, deleteModal: { margin: 20, borderRadius: 24, padding: 20, gap: 12 }, deleteIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", alignSelf: "center" }, deleteWarning: { fontSize: 12, lineHeight: 20, textAlign: "right" }, confirmPhrase: { fontSize: 15, fontWeight: "900", textAlign: "right" }, deleteActions: { flexDirection: "row-reverse", gap: 9, marginTop: 4 }, deleteCancel: { flex: 1, minHeight: 48, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" }, deleteCancelText: { fontSize: 12, fontWeight: "800" }, deleteConfirm: { flex: 1.35, minHeight: 48, borderRadius: 15, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 }, deleteConfirmText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }, modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 13 }, handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.16)", alignSelf: "center", marginBottom: 4 }, modalTitle: { textAlign: "right", fontSize: 18, fontWeight: "900", marginBottom: 3 }, languageOption: { minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
});
