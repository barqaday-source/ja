import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { startOAuthLogin } from "@/constants/oauth";

const ROLES = [
  {
    id: "customer",
    title: "زبون",
    eyebrow: "اكتشف واشترِ بسهولة",
    subtitle: "تصفح المتاجر، قارن المنتجات، وتواصل مع البائعين بثقة.",
    icon: "shopping-bag",
    accent: "#2D7FF9",
  },
  {
    id: "merchant",
    title: "تاجر",
    eyebrow: "طوّر تجارتك من مكان واحد",
    subtitle: "اعرض منتجاتك، أدِر طلباتك، وابنِ علاقة أقوى مع زبائنك.",
    icon: "storefront",
    accent: "#E88922",
  },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

export default function RoleSelectScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selected, setSelected] = useState<RoleId>("customer");
  const activeRole = ROLES.find((role) => role.id === selected)!;

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} className="px-5">
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.brandMark, { backgroundColor: `${colors.primary}16` }]}>
            <MaterialIcons name="north-east" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.step, { color: colors.muted }]}>01 / 02</Text>
        </View>

        <View style={styles.intro}>
          <Text style={[styles.kicker, { color: colors.primary }]}>مرحباً بك في جايبلك</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>اختر طريقة استخدامك للتطبيق</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>سنخصص تجربتك حسب اختيارك، ويمكنك تغييره لاحقاً من الإعدادات.</Text>
        </View>

        <View style={styles.options}>
          {ROLES.map((role) => {
            const active = selected === role.id;
            return (
              <Pressable
                key={role.id}
                onPress={() => setSelected(role.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.roleCard,
                  { backgroundColor: active ? `${role.accent}10` : colors.surface, borderColor: active ? role.accent : colors.border, opacity: pressed ? 0.86 : 1 },
                ]}
              >
                <View style={[styles.cardTopLine, { backgroundColor: active ? role.accent : "transparent" }]} />
                <View style={styles.cardRow}>
                  <View style={[styles.roleIcon, { backgroundColor: active ? role.accent : `${role.accent}16` }]}>
                    <MaterialIcons name={role.icon as any} size={28} color={active ? "#FFFFFF" : role.accent} />
                  </View>
                  <View style={styles.roleCopy}>
                    <Text style={[styles.roleEyebrow, { color: active ? role.accent : colors.muted }]}>{role.eyebrow}</Text>
                    <Text style={[styles.roleTitle, { color: colors.foreground }]}>{role.title}</Text>
                    <Text style={[styles.roleSubtitle, { color: colors.muted }]}>{role.subtitle}</Text>
                  </View>
                  <View style={[styles.radio, { borderColor: active ? role.accent : colors.border }]}>
                    {active && <View style={[styles.radioDot, { backgroundColor: role.accent }]} />}
                  </View>
                </View>
                {active && <View style={[styles.selectedLabel, { backgroundColor: `${role.accent}18` }]}><MaterialIcons name="check" size={14} color={role.accent} /><Text style={[styles.selectedLabelText, { color: role.accent }]}>تم الاختيار</Text></View>}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.loginHint, { color: colors.muted }]}>بعد الاختيار، سجّل دخولك عبر جوجل أو البريد الإلكتروني فقط.</Text>
          <Pressable onPress={() => router.push({ pathname: "/email-login", params: { role: selected } })} style={({ pressed }) => [styles.continueButton, { backgroundColor: activeRole.accent, opacity: pressed ? 0.8 : 1 }]}>
            <Text style={styles.continueText}>المتابعة كـ {activeRole.title}</Text><MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => void startOAuthLogin()} style={({ pressed }) => [styles.googleButton, { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}>
            <View style={styles.googleMark}><Text style={styles.googleMarkText}>G</Text></View><Text style={[styles.googleText, { color: colors.foreground }]}>المتابعة باستخدام Google</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.55 : 1 }]}><Text style={[styles.backText, { color: colors.muted }]}>العودة</Text></Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 8, paddingBottom: 14 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", minHeight: 46 },
  brandMark: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  step: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  intro: { marginTop: 45, alignItems: "flex-end" },
  kicker: { fontSize: 13, fontWeight: "900", marginBottom: 12 },
  title: { fontSize: 29, fontWeight: "900", textAlign: "right", lineHeight: 40 },
  subtitle: { fontSize: 14, lineHeight: 23, textAlign: "right", marginTop: 12 },
  options: { gap: 14, marginTop: 33 },
  roleCard: { minHeight: 150, borderRadius: 24, borderWidth: 1.5, padding: 16, overflow: "hidden" },
  cardTopLine: { height: 3, width: 54, borderRadius: 2, alignSelf: "flex-end", marginBottom: 13 },
  cardRow: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 12 },
  roleIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  roleCopy: { flex: 1, alignItems: "flex-end", paddingTop: 1 },
  roleEyebrow: { fontSize: 11, fontWeight: "800", marginBottom: 3, textAlign: "right" },
  roleTitle: { fontSize: 22, fontWeight: "900", textAlign: "right" },
  roleSubtitle: { fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 4 },
  radio: { width: 23, height: 23, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  selectedLabel: { alignSelf: "flex-end", flexDirection: "row-reverse", alignItems: "center", gap: 4, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4, marginTop: 11 },
  selectedLabelText: { fontSize: 10, fontWeight: "900" },
  footer: { marginTop: "auto", gap: 10 },
  loginHint: { fontSize: 11, lineHeight: 17, textAlign: "right", marginBottom: 3 },
  continueButton: { minHeight: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 12 },
  continueText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  googleButton: { minHeight: 52, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 10 },
  googleMark: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  googleMarkText: { color: "#4285F4", fontSize: 17, fontWeight: "900" },
  googleText: { fontSize: 14, fontWeight: "800" },
  backLink: { alignItems: "center", padding: 7 },
  backText: { fontSize: 12, fontWeight: "700" },
});
