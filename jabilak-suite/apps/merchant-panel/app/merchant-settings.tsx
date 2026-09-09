import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAsyncAction } from "@/hooks/use-async-action";
import { BRAND } from "@/constants/brand";
import { ProfileAvatarEditor } from "@/components/profile-avatar-editor";

type SelectKey = "category" | "province" | "district";
type Day = { id: string; name: string; open: boolean; from: string; to: string };

const SELECT_OPTIONS: Record<SelectKey, string[]> = {
  category: ["ملابس وأزياء", "أغذية ومشروبات", "إلكترونيات", "منزل وأثاث", "خدمات"],
  province: ["بغداد", "البصرة", "أربيل", "النجف", "كربلاء", "نينوى"],
  district: ["الكرادة", "المنصور", "الأعظمية", "زيونة", "الجادرية"],
};

const PLUM_ISLAND = "#443C50";

const INITIAL_DAYS: Day[] = [];

export default function MerchantSettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | undefined>("");
  const [company, setCompany] = useState({
    name: "المتجر",
    description: "أزياء عصرية بجودة عالية وأسعار مناسبة للجميع.",
    category: "ملابس وأزياء",
    phone: "0770 123 4567",
    whatsapp: "0770 123 4567",
    email: "hello@alanaqa.iq",
    website: "alanaqa.iq",
    instagram: "@alanaqa.iq",
    province: "بغداد",
    district: "الكرادة",
    address: "شارع 62، قرب ساحة الأندلس",
  });
  const [days, setDays] = useState(INITIAL_DAYS);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("العربية");
  const [locationAdded, setLocationAdded] = useState(true);
  const [selecting, setSelecting] = useState<SelectKey | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { busy: saving, run: runSave } = useAsyncAction();
  const { busy: uploading, run: runUpload } = useAsyncAction(500);
  const { busy: savingPassword, run: runSavePassword } = useAsyncAction();

  const updateCompany = (key: keyof typeof company, value: string) => setCompany((current) => ({ ...current, [key]: value }));
  const toggleDay = (id: string) => setDays((current) => current.map((day) => day.id === id ? { ...day, open: !day.open } : day));
  const cycleTime = (id: string, key: "from" | "to") => setDays((current) => current.map((day) => day.id === id ? { ...day, [key]: day[key] === "09:00 ص" ? "10:00 ص" : day[key] === "10:00 ص" ? "12:00 م" : "09:00 ص" } : day));
  const chooseOption = (value: string) => { if (!selecting) return; updateCompany(selecting, value); setSelecting(null); };
  const saveSettings = () => { void runSave(() => Alert.alert("تم حفظ التغييرات", "تم تحديث إعدادات الشركة محلياً بنجاح.")); };
  const editMedia = (type: string) => { void runUpload(() => Alert.alert(`تم تجهيز ${type}`, "تم قبول الوسائط التجريبية. عند الربط سيبدأ الرفع إلى Storage.")); };
  const savePassword = () => {
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      Alert.alert("تعذر الحفظ", "تأكد من أن كلمة المرور 6 أحرف على الأقل ومتطابقة.");
      return;
    }
    void runSavePassword(() => {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordModal(false);
      Alert.alert("تم تحديث كلمة المرور", "تم حفظ كلمة المرور الجديدة محلياً.");
    });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={20} color={colors.foreground} /></Pressable>
          <View style={styles.headerCopy}><Text style={[styles.title, { color: colors.foreground }]}>إعدادات الشركة</Text><Text style={[styles.subtitle, { color: colors.muted }]}>تحكم كامل بواجهة متجرك وحسابك</Text></View>
          <View style={[styles.settingsIcon, { backgroundColor: colors.primary }]}><MaterialIcons name="business" size={20} color="#FFFFFF" /></View>
        </View>

        <View style={[styles.profileCard, { backgroundColor: PLUM_ISLAND, borderColor: PLUM_ISLAND }]}>
          <View style={styles.cover}><Pressable disabled={uploading} onPress={() => editMedia("صورة الغلاف")} style={({ pressed }) => [styles.coverEdit, { opacity: pressed ? 0.7 : uploading ? 0.8 : 1 }]}>{uploading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />}</Pressable></View>
          <View style={styles.profileRow}><ProfileAvatarEditor name={company.name} imageUri={avatarUri} onChange={setAvatarUri} onRemove={() => setAvatarUri(undefined)} size={66} label="تغيير الشعار" /><View style={styles.profileText}><Text style={styles.profileName}>{company.name}</Text><Text style={styles.profileMeta}>حساب موثق · خطة الأعمال</Text></View></View>
        </View>

        <Section title="معلومات الشركة" icon="store" colors={colors}>
          <Field label="اسم الشركة" value={company.name} onChangeText={(value) => updateCompany("name", value)} colors={colors} />
          <Field label="الوصف" value={company.description} onChangeText={(value) => updateCompany("description", value)} colors={colors} multiline />
          <SelectField label="التصنيف" value={company.category} onPress={() => setSelecting("category")} colors={colors} />
        </Section>

        <Section title="معلومات التواصل" icon="contact-phone" colors={colors}>
          <Field label="الهاتف" value={company.phone} onChangeText={(value) => updateCompany("phone", value)} colors={colors} keyboardType="phone-pad" />
          <Field label="WhatsApp" value={company.whatsapp} onChangeText={(value) => updateCompany("whatsapp", value)} colors={colors} keyboardType="phone-pad" />
          <Field label="البريد الإلكتروني" value={company.email} onChangeText={(value) => updateCompany("email", value)} colors={colors} keyboardType="email-address" />
          <Field label="الموقع الإلكتروني" value={company.website} onChangeText={(value) => updateCompany("website", value)} colors={colors} />
          <Field label="Instagram" value={company.instagram} onChangeText={(value) => updateCompany("instagram", value)} colors={colors} />
        </Section>

        <Section title="الموقع" icon="location-on" colors={colors}>
          <View style={styles.twoColumns}><SelectField label="المحافظة" value={company.province} onPress={() => setSelecting("province")} colors={colors} compact /><SelectField label="المنطقة" value={company.district} onPress={() => setSelecting("district")} colors={colors} compact /></View>
          <Field label="العنوان التفصيلي" value={company.address} onChangeText={(value) => updateCompany("address", value)} colors={colors} />
          <Pressable onPress={() => setLocationAdded((value) => !value)} style={({ pressed }) => [styles.mapButton, { borderColor: colors.border, backgroundColor: colors.background, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.mapPin, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name={locationAdded ? "check" : "add-location-alt"} size={18} color={colors.primary} /></View><View style={styles.mapCopy}><Text style={[styles.mapTitle, { color: colors.foreground }]}>{locationAdded ? "تم تحديد موقع الشركة" : "أضف موقع الشركة على الخريطة"}</Text><Text style={[styles.mapSubtitle, { color: colors.muted }]}>{locationAdded ? "الموقع ظاهر للعملاء على الخريطة" : "يساعد العملاء في الوصول إليك"}</Text></View><MaterialIcons name="chevron-left" size={20} color={colors.muted} /></Pressable>
        </Section>

        <Section title="ساعات العمل" icon="schedule" colors={colors}>
          {days.map((day) => <View key={day.id} style={[styles.dayRow, { borderBottomColor: colors.border }]}><Switch value={day.open} onValueChange={() => toggleDay(day.id)} trackColor={{ false: colors.border, true: `${colors.primary}70` }} thumbColor={day.open ? colors.primary : colors.muted} /><View style={styles.dayTimes}><Pressable disabled={!day.open} onPress={() => cycleTime(day.id, "to")} style={[styles.timeChip, { backgroundColor: day.open ? colors.background : `${colors.border}70`, borderColor: colors.border }]}><Text style={[styles.timeText, { color: day.open ? colors.foreground : colors.muted }]}>{day.open ? day.to : "مغلق"}</Text></Pressable><Text style={[styles.timeDash, { color: colors.muted }]}>—</Text><Pressable disabled={!day.open} onPress={() => cycleTime(day.id, "from")} style={[styles.timeChip, { backgroundColor: day.open ? colors.background : `${colors.border}70`, borderColor: colors.border }]}><Text style={[styles.timeText, { color: day.open ? colors.foreground : colors.muted }]}>{day.open ? day.from : "مغلق"}</Text></Pressable></View><Text style={[styles.dayName, { color: colors.foreground }]}>{day.name}</Text></View>)}
        </Section>

        <Section title="الحساب والأمان" icon="security" colors={colors}>
          <ActionRow title="تغيير كلمة المرور" subtitle="تحديث كلمة مرور الحساب" icon="lock-outline" onPress={() => setPasswordModal(true)} colors={colors} />
          <ActionRow title="رقم الهاتف" subtitle={company.phone} icon="phone-iphone" onPress={() => Alert.alert("رقم الهاتف", "يمكنك تعديل الرقم من قسم معلومات التواصل.")} colors={colors} />
          <ActionRow title="البريد الإلكتروني" subtitle={company.email} icon="mail-outline" onPress={() => Alert.alert("البريد الإلكتروني", "يمكنك تعديل البريد من قسم معلومات التواصل.")} colors={colors} />
        </Section>

        <Section title="التوثيق والاشتراك" icon="verified" colors={colors}>
          <View style={[styles.statusCard, { backgroundColor: `${colors.success}12`, borderColor: `${colors.success}35` }]}><View style={[styles.statusIcon, { backgroundColor: `${colors.success}22` }]}><MaterialIcons name="verified" size={20} color={colors.success} /></View><View style={styles.statusCopy}><Text style={[styles.statusTitle, { color: colors.foreground }]}>الحساب موثق</Text><Text style={[styles.statusSubtitle, { color: colors.muted }]}>تم توثيق بيانات شركتك بنجاح</Text></View><Text style={[styles.statusBadge, { color: colors.success }]}>موثق</Text></View>
          <Pressable onPress={() => Alert.alert("توثيق الحساب", "حسابك موثق حالياً ولا توجد خطوات إضافية.")} style={({ pressed }) => [styles.outlineAction, { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}><MaterialIcons name="verified-user" size={18} color={colors.primary} /><Text style={[styles.outlineText, { color: colors.primary }]}>توثيق الحساب</Text></Pressable>
          <View style={[styles.subscription, { backgroundColor: PLUM_ISLAND }]}><View style={[styles.planIcon, { backgroundColor: `${colors.primary}30` }]}><MaterialIcons name="workspace-premium" size={21} color={colors.primary} /></View><View style={styles.planCopy}><Text style={styles.planTitle}>خطة الأعمال</Text><Text style={styles.planSubtitle}>صالحة حتى 20 ديسمبر 2026</Text></View><Pressable onPress={() => Alert.alert("إدارة الاشتراك", "سيتم فتح خيارات الاشتراك عند ربط الدفع.")} style={({ pressed }) => [styles.manageButton, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}><Text style={styles.manageText}>إدارة</Text></Pressable></View>
        </Section>

        <Section title="خيارات أخرى" icon="tune" colors={colors}>
          <ToggleRow title="الإشعارات" subtitle="تنبيهات الطلبات والرسائل" icon="notifications-none" value={notifications} onChange={setNotifications} colors={colors} />
          <ActionRow title="اللغة" subtitle={language} icon="language" onPress={() => setLanguage((value) => value === "العربية" ? "English" : "العربية")} colors={colors} />
          <ActionRow title="الخصوصية" subtitle="إدارة بيانات الشركة" icon="privacy-tip" onPress={() => Alert.alert("الخصوصية", "إعدادات الخصوصية متاحة للتحكم بالبيانات المشتركة.")} colors={colors} />
          <ActionRow title="الشروط والأحكام" subtitle="اطلع على شروط الاستخدام" icon="description" onPress={() => Alert.alert("الشروط والأحكام", "الشروط التجريبية محفوظة محلياً ضمن النسخة الحالية.")} colors={colors} />
          <Pressable onPress={() => Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج من حساب الشركة؟", [{ text: "إلغاء", style: "cancel" }, { text: "تسجيل الخروج", style: "destructive", onPress: () => router.replace("/") }])} style={({ pressed }) => [styles.logout, { backgroundColor: `${colors.error}10`, opacity: pressed ? 0.7 : 1 }]}><MaterialIcons name="logout" size={19} color={colors.error} /><Text style={[styles.logoutText, { color: colors.error }]}>تسجيل الخروج</Text></Pressable>
        </Section>

        <Pressable disabled={saving} onPress={saveSettings} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : saving ? 0.8 : 1 }]}>{saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialIcons name="check" size={20} color="#FFFFFF" />}<Text style={styles.saveText}>{saving ? "جارٍ حفظ التغييرات..." : "حفظ التغييرات"}</Text></Pressable>
        <Text style={[styles.version, { color: colors.muted }]}>{BRAND.name} · إعدادات الشركة · نسخة تجريبية محلية</Text>
      </ScrollView>

      <Modal transparent visible={passwordModal} animationType="slide" onRequestClose={() => setPasswordModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPasswordModal(false)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.surface }]}><View style={styles.modalHandle} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>تغيير كلمة المرور</Text><Text style={[styles.modalHint, { color: colors.muted }]}>اكتب كلمة مرور جديدة لحساب الشركة</Text><TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry textAlign="right" placeholder="كلمة المرور الجديدة" placeholderTextColor={colors.muted} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} /><TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry textAlign="right" placeholder="تأكيد كلمة المرور" placeholderTextColor={colors.muted} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} /><Pressable disabled={savingPassword} onPress={savePassword} style={({ pressed }) => [styles.modalSave, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : savingPassword ? 0.8 : 1 }]}>{savingPassword ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.manageText}>حفظ كلمة المرور</Text>}{savingPassword && <Text style={styles.manageText}>جارٍ الحفظ...</Text>}</Pressable></Pressable></Pressable>
      </Modal>

      <Modal transparent visible={!!selecting} animationType="slide" onRequestClose={() => setSelecting(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelecting(null)}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.surface }]}><View style={styles.modalHandle} /><Text style={[styles.modalTitle, { color: colors.foreground }]}>{selecting === "category" ? "اختر التصنيف" : selecting === "province" ? "اختر المحافظة" : "اختر المنطقة"}</Text>{selecting && SELECT_OPTIONS[selecting].map((option) => <Pressable key={option} onPress={() => chooseOption(option)} style={({ pressed }) => [styles.option, { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 }]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>{company[selecting] === option && <MaterialIcons name="check" size={19} color={colors.primary} />}</Pressable>)}</Pressable></Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function Section({ title, icon, colors, children }: { title: string; icon: keyof typeof MaterialIcons.glyphMap; colors: ReturnType<typeof useColors>; children: React.ReactNode }) { return <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text><View style={[styles.sectionIcon, { backgroundColor: `${colors.primary}17` }]}><MaterialIcons name={icon} size={17} color={colors.primary} /></View></View>{children}</View>; }
function Field({ label, value, onChangeText, colors, multiline, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; colors: ReturnType<typeof useColors>; multiline?: boolean; keyboardType?: "default" | "phone-pad" | "email-address" }) { return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} multiline={multiline} keyboardType={keyboardType} textAlign="right" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }, multiline && styles.multiline]} /></View>; }
function SelectField({ label, value, onPress, colors, compact }: { label: string; value: string; onPress: () => void; colors: ReturnType<typeof useColors>; compact?: boolean }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.field, compact && styles.compactField, { opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text><View style={[styles.input, styles.selectInput, { borderColor: colors.border, backgroundColor: colors.background }]}><MaterialIcons name="unfold-more" size={17} color={colors.muted} /><Text style={[styles.selectText, { color: colors.foreground }]}>{value}</Text></View></Pressable>; }
function ActionRow({ title, subtitle, icon, onPress, colors }: { title: string; subtitle: string; icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void; colors: ReturnType<typeof useColors> }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="chevron-left" size={20} color={colors.muted} /><View style={styles.actionCopy}><Text style={[styles.actionTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.actionSubtitle, { color: colors.muted }]}>{subtitle}</Text></View><View style={[styles.actionIcon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name={icon} size={18} color={colors.primary} /></View></Pressable>; }
function ToggleRow({ title, subtitle, icon, value, onChange, colors }: { title: string; subtitle: string; icon: keyof typeof MaterialIcons.glyphMap; value: boolean; onChange: (value: boolean) => void; colors: ReturnType<typeof useColors> }) { return <View style={[styles.actionRow, { borderBottomColor: colors.border }]}><Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: `${colors.primary}70` }} thumbColor={value ? colors.primary : colors.muted} /><View style={styles.actionCopy}><Text style={[styles.actionTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.actionSubtitle, { color: colors.muted }]}>{subtitle}</Text></View><View style={[styles.actionIcon, { backgroundColor: `${colors.primary}14` }]}><MaterialIcons name={icon} size={18} color={colors.primary} /></View></View>; }

const styles = StyleSheet.create({ content: { padding: 19, paddingBottom: 30 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 11, marginBottom: 17 }, headerCopy: { flex: 1, alignItems: "flex-end" }, title: { fontSize: 24, fontWeight: "900" }, subtitle: { fontSize: 10, marginTop: 4 }, iconButton: { width: 42, height: 42, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" }, settingsIcon: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center" }, profileCard: { borderRadius: 22, overflow: "hidden", marginBottom: 13 }, cover: { height: 72, backgroundColor: "#5D526C", alignItems: "flex-start", justifyContent: "flex-start", padding: 10 }, coverEdit: { width: 31, height: 31, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.24)", alignItems: "center", justifyContent: "center" }, profileRow: { minHeight: 78, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, gap: 12 }, logo: { width: 58, height: 58, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF" }, logoText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" }, cameraBadge: { position: "absolute", bottom: -2, left: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, profileText: { flex: 1, alignItems: "flex-end" }, profileName: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" }, profileMeta: { color: "#D4CBDC", fontSize: 10, marginTop: 5 }, section: { borderWidth: 1, borderRadius: 21, padding: 14, marginBottom: 12 }, sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }, sectionTitle: { fontSize: 15, fontWeight: "900", textAlign: "right" }, sectionIcon: { width: 31, height: 31, borderRadius: 10, alignItems: "center", justifyContent: "center" }, field: { marginBottom: 10 }, compactField: { flex: 1 }, fieldLabel: { fontSize: 10, textAlign: "right", marginBottom: 5 }, input: { minHeight: 42, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 12 }, multiline: { minHeight: 70, paddingTop: 11, textAlignVertical: "top" }, selectInput: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 11 }, selectText: { fontSize: 12, fontWeight: "700" }, twoColumns: { flexDirection: "row-reverse", gap: 10 }, mapButton: { borderWidth: 1, borderRadius: 14, minHeight: 62, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, mapPin: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" }, mapCopy: { flex: 1, alignItems: "flex-end" }, mapTitle: { fontSize: 11, fontWeight: "900" }, mapSubtitle: { fontSize: 9, marginTop: 3 }, dayRow: { minHeight: 48, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, dayName: { width: 67, fontSize: 11, fontWeight: "800", textAlign: "right" }, dayTimes: { flexDirection: "row", alignItems: "center", gap: 5 }, timeChip: { borderWidth: 1, borderRadius: 8, minWidth: 67, paddingVertical: 6, alignItems: "center" }, timeText: { fontSize: 9, fontWeight: "700" }, timeDash: { fontSize: 12 }, actionRow: { minHeight: 58, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", gap: 10 }, actionCopy: { flex: 1, alignItems: "flex-end" }, actionTitle: { fontSize: 12, fontWeight: "800" }, actionSubtitle: { fontSize: 9, marginTop: 4 }, actionIcon: { width: 35, height: 35, borderRadius: 11, alignItems: "center", justifyContent: "center" }, statusCard: { borderWidth: 1, borderRadius: 15, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, statusIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" }, statusCopy: { flex: 1, alignItems: "flex-end" }, statusTitle: { fontSize: 12, fontWeight: "900" }, statusSubtitle: { fontSize: 9, marginTop: 3 }, statusBadge: { fontSize: 10, fontWeight: "900" }, outlineAction: { height: 42, borderWidth: 1, borderRadius: 12, marginTop: 9, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, outlineText: { fontSize: 11, fontWeight: "900" }, subscription: { marginTop: 10, borderRadius: 15, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, planIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" }, planCopy: { flex: 1, alignItems: "flex-end" }, planTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, planSubtitle: { color: "#D4CBDC", fontSize: 9, marginTop: 3 }, manageButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 }, manageText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" }, logout: { height: 45, marginTop: 11, borderRadius: 13, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, logoutText: { fontSize: 12, fontWeight: "900" }, saveButton: { height: 54, borderRadius: 17, marginTop: 1, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 }, saveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, version: { textAlign: "center", fontSize: 9, marginTop: 12 }, modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" }, modalCard: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 28 }, modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: "#C9C3CC", alignSelf: "center", marginBottom: 17 }, modalTitle: { fontSize: 17, fontWeight: "900", textAlign: "right", marginBottom: 8 }, option: { minHeight: 48, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },   optionText: { fontSize: 12, fontWeight: "700", textAlign: "right" }, modalHint: { fontSize: 10, textAlign: "right", marginBottom: 10 }, modalInput: { height: 45, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 12, marginBottom: 9 }, modalSave: { height: 45, borderRadius: 13, alignItems: "center", justifyContent: "center", marginTop: 3 } });
