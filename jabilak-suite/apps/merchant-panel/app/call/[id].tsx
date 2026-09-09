import { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import { getChatById } from "@/lib/chat/mock";

export default function CallScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string; type?: string }>();
  const chat = useMemo(() => getChatById(String(id ?? "alanaqa")), [id]);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const startCall = () => {
    setConnecting(true);
    setTimeout(() => { setConnecting(false); setConnected(true); }, 950);
  };

  const endCall = () => {
    setConnected(false);
    Alert.alert(t("callEnded"), "تم إنهاء المكالمة التجريبية. عند ربط Agora سيظهر سجل الاتصال هنا.", [{ text: "حسناً", onPress: () => router.back() }]);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={[styles.screen, { backgroundColor: colors.foreground }]}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.close, { backgroundColor: "rgba(255,255,255,0.13)", opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="close" size={21} color="#FFFFFF" /></Pressable><View style={styles.provider}><View style={[styles.providerDot, { backgroundColor: colors.primary }]} /><Text style={styles.providerText}>{t("voiceCall")}</Text></View><View style={{ width: 39 }} /></View>
        <View style={styles.center}><View style={[styles.avatarHalo, { borderColor: `${colors.primary}55` }]}><Image source={{ uri: chat.avatar }} style={styles.avatar} />{chat.online && <View style={[styles.online, { backgroundColor: colors.success, borderColor: colors.foreground }]} />}</View><Text style={styles.name}>{chat.name}</Text><Text style={[styles.status, { color: connected ? colors.success : "rgba(255,255,255,0.65)" }]}>{connected ? `00:24 · ${t("connectedNow")}` : connecting ? t("calling") : t("callReady")}</Text><Text style={styles.caption}>{t("localPreview")}</Text></View>
        <View style={styles.controls}>{[{ icon: muted ? "mic-off" : "mic", label: muted ? t("unmute") : t("mute"), active: muted, onPress: () => setMuted((value) => !value) }, { icon: speaker ? "volume-up" : "volume-off", label: speaker ? t("speaker") : t("phoneMode"), active: speaker, onPress: () => setSpeaker((value) => !value) }, { icon: "person-add-alt-1", label: t("addPerson"), active: false, onPress: () => Alert.alert(t("addPerson"), "المكالمات الجماعية ستتوفر عند تفعيل قناة Agora.") }].map((item) => <Pressable key={item.label} onPress={item.onPress} style={({ pressed }) => [styles.control, { backgroundColor: item.active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)", opacity: pressed ? 0.7 : 1 }]}><MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={23} color="#FFFFFF" /><Text style={styles.controlText}>{item.label}</Text></Pressable>)}</View>
        <View style={styles.bottom}><Pressable onPress={connected ? endCall : startCall} disabled={connecting} style={({ pressed }) => [styles.callButton, { backgroundColor: connected ? colors.error : colors.primary, opacity: connecting ? 0.72 : pressed ? 0.82 : 1 }]}><MaterialIcons name={connected ? "call-end" : "call"} size={26} color="#FFFFFF" /><Text style={styles.callText}>{connecting ? t("callConnecting") : connected ? t("endCall") : t("startCall")}</Text></Pressable><Text style={styles.bottomNote}>سيتم استبدال هذه الحالة التجريبية بقناة Agora وحالة Presence الحقيقية بعد الربط.</Text></View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 24 }, topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, close: { width: 39, height: 39, borderRadius: 14, alignItems: "center", justifyContent: "center" }, provider: { flexDirection: "row-reverse", alignItems: "center", gap: 7 }, providerDot: { width: 8, height: 8, borderRadius: 4 }, providerText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" }, center: { flex: 1, alignItems: "center", justifyContent: "center" }, avatarHalo: { width: 166, height: 166, borderRadius: 83, borderWidth: 1, alignItems: "center", justifyContent: "center" }, avatar: { width: 137, height: 137, borderRadius: 69 }, online: { position: "absolute", right: 15, bottom: 16, width: 22, height: 22, borderRadius: 11, borderWidth: 4 }, name: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 25, textAlign: "center" }, status: { fontSize: 12, fontWeight: "800", marginTop: 7 }, caption: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 9, textAlign: "center" }, controls: { flexDirection: "row-reverse", justifyContent: "center", gap: 13, marginBottom: 24 }, control: { width: 78, minHeight: 72, borderRadius: 21, alignItems: "center", justifyContent: "center", gap: 6 }, controlText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" }, bottom: { alignItems: "center", gap: 13 }, callButton: { minHeight: 56, minWidth: 190, borderRadius: 20, paddingHorizontal: 24, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 9 }, callText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, bottomNote: { color: "rgba(255,255,255,0.5)", fontSize: 9, lineHeight: 15, textAlign: "center", maxWidth: 290 },
});
