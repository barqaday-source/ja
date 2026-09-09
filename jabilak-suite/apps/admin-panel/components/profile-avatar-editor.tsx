import { useState } from "react";
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { REAL_IMAGES } from "@/constants/assets";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";

const MOCK_AVATARS: { id: string; uri: string; label: string }[] = [];

export function ProfileAvatarEditor({
  name,
  imageUri,
  onChange,
  onRemove,
  size = 72,
  label = "صورة البروفايل",
}: {
  name: string;
  imageUri?: string;
  onChange: (uri: string) => void;
  onRemove?: () => void;
  size?: number;
  label?: string;
}) {
  const colors = useColors();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const initial = name.trim().slice(0, 1) || "ج";

  const pickImage = async () => {
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        onChange(result.assets[0].uri);
        setVisible(false);
      }
    } catch {
      Alert.alert("تعذر اختيار الصورة", "جرّب صورة أخرى أو استخدم صورة تجريبية من القائمة.");
    } finally {
      setBusy(false);
    }
  };

  const removeImage = () => {
    if (!onRemove) return;
    Alert.alert("حذف صورة البروفايل", "هل تريد إزالة الصورة والعودة إلى الحرف الأول؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => { onRemove(); setVisible(false); } },
    ]);
  };

  return (
    <>
      <View style={styles.wrapper}>
        <Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.avatarButton, { width: size, height: size, borderRadius: size / 2, opacity: pressed ? 0.78 : 1 }]}>
          {imageUri ? <Image source={{ uri: imageUri }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary }]}><Text style={[styles.fallbackText, { color: colors.foreground, fontSize: size * 0.36 }]}>{initial}</Text></View>}
          <View style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}><MaterialIcons name="photo-camera" size={13} color="#FFFFFF" /></View>
        </Pressable>
        <Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.editLink, { opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.editLabel, { color: colors.primary }]}>{label}</Text><MaterialIcons name="edit" size={14} color={colors.primary} /></Pressable>
      </View>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable onPress={(event) => event.stopPropagation()} style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}><Pressable onPress={() => setVisible(false)}><MaterialIcons name="close" size={22} color={colors.muted} /></Pressable><View style={styles.sheetCopy}><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{t("profilePhotoTitle")}</Text><Text style={[styles.sheetSubtitle, { color: colors.muted }]}>{t("profilePhotoSubtitle")}</Text></View><View style={[styles.sheetIcon, { backgroundColor: `${colors.primary}18` }]}><MaterialIcons name="account-circle" size={21} color={colors.primary} /></View></View>
            <Pressable disabled={busy} onPress={pickImage} style={({ pressed }) => [styles.primaryAction, { backgroundColor: colors.primary, opacity: busy ? 0.7 : pressed ? 0.8 : 1 }]}><MaterialIcons name={busy ? "hourglass-top" : "photo-library"} size={19} color="#FFFFFF" /><Text style={styles.primaryActionText}>{busy ? t("loading") : t("chooseFromDevice")}</Text></Pressable>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{t("mockPhotos")}</Text>
            <View style={styles.mockGrid}>{MOCK_AVATARS.map((item) => <Pressable key={item.id} onPress={() => { onChange(item.uri); setVisible(false); }} style={({ pressed }) => [styles.mockCard, { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.74 : 1 }]}><Image source={{ uri: item.uri }} style={styles.mockImage} /><Text style={[styles.mockLabel, { color: colors.foreground }]}>{item.label}</Text></Pressable>)}</View>
            {imageUri && onRemove && <Pressable onPress={removeImage} style={({ pressed }) => [styles.removeAction, { borderColor: `${colors.error}45`, backgroundColor: `${colors.error}10`, opacity: pressed ? 0.72 : 1 }]}><MaterialIcons name="delete-outline" size={18} color={colors.error} /><Text style={[styles.removeText, { color: colors.error }]}>{t("removeCurrentPhoto")}</Text></Pressable>}
            <Text style={[styles.note, { color: colors.muted }]}>{t("avatarStorageNote")}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 7 },
  avatarButton: { position: "relative", alignItems: "center", justifyContent: "center" },
  fallback: { alignItems: "center", justifyContent: "center" },
  fallbackText: { fontWeight: "900" },
  cameraBadge: { position: "absolute", bottom: -1, right: -1, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  editLink: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  editLabel: { fontSize: 10, fontWeight: "900" },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17,24,39,0.42)" },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 31, gap: 14 },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: "rgba(17,24,39,0.16)", alignSelf: "center", marginBottom: 3 },
  sheetHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 11 },
  sheetCopy: { flex: 1, alignItems: "flex-end" },
  sheetTitle: { fontSize: 19, fontWeight: "900" },
  sheetSubtitle: { fontSize: 10, marginTop: 4, textAlign: "right" },
  sheetIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  primaryAction: { minHeight: 50, borderRadius: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  sectionLabel: { textAlign: "right", fontSize: 12, fontWeight: "900", marginTop: 2 },
  mockGrid: { flexDirection: "row-reverse", gap: 9 },
  mockCard: { flex: 1, borderRadius: 15, borderWidth: 1, padding: 7, alignItems: "center", gap: 6 },
  mockImage: { width: "100%", aspectRatio: 1, borderRadius: 11 },
  mockLabel: { fontSize: 9, fontWeight: "800" },
  removeAction: { minHeight: 44, borderWidth: 1, borderRadius: 14, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 },
  removeText: { fontSize: 11, fontWeight: "900" },
  note: { fontSize: 9, lineHeight: 15, textAlign: "right" },
});
