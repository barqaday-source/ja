import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BRAND } from "@/constants/brand";
import { useI18n } from "@/lib/i18n";

const SLIDES = [
  {
    title: BRAND.name,
    body: "كل المتاجر\nفي مكان واحد",
    kind: 0,
    accent: "#E88922",
  },
  {
    title: "اكتشف بسهولة",
    body: "ابحث، تواصل، واشترِ بثقة",
    kind: 1,
    accent: "#6FB8AC",
  },
  {
    title: "تجارتك أقرب",
    body: "انشر وأدر متجرك من مكان واحد",
    kind: 2,
    accent: "#8B78A8",
  },
];

function OnboardingIllustration({ kind, accent }: { kind: number; accent: string }) {
  const ink = "#111827";
  const soft = "#E9E7EE";
  const cream = "#FFF8EE";
  if (kind === 1) return (
    <Svg width={260} height={270} viewBox="0 0 260 270">
      <Rect x="77" y="35" width="106" height="188" rx="23" fill={ink} />
      <Rect x="85" y="46" width="90" height="158" rx="16" fill="#FFFFFF" />
      <Circle cx="130" cy="215" r="4" fill="#FFFFFF" />
      <Rect x="101" y="75" width="58" height="42" rx="14" fill={`${accent}55`} />
      <Path d="M112 91h36M112 101h24" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <Rect x="96" y="139" width="65" height="28" rx="14" fill={accent} />
      <Path d="M109 153h34" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="48" cy="67" r="23" fill={soft} /><Path d="M36 67h24M48 55v24" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <Circle cx="214" cy="187" r="23" fill={cream} /><Path d="M202 187h24M214 175v24" stroke={accent} strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
  if (kind === 2) return (
    <Svg width={260} height={270} viewBox="0 0 260 270">
      <Rect x="42" y="113" width="176" height="104" rx="12" fill={ink} />
      <Path d="M31 113h198l-14-34H45z" fill={accent} />
      <Path d="M48 83v30M84 83v30M120 83v30M156 83v30M192 83v30" stroke="#FFFFFF" strokeWidth="12" />
      <Rect x="61" y="143" width="35" height="46" rx="7" fill="#FFFFFF" /><Rect x="112" y="145" width="37" height="72" rx="7" fill={`${accent}75`} /><Rect x="165" y="137" width="33" height="80" rx="7" fill={cream} />
      <Path d="M60 238h140M75 224l25-23 23 13 38-49 25 20" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="186" cy="185" r="5" fill={accent} />
    </Svg>
  );
  return (
    <Svg width={260} height={270} viewBox="0 0 260 270">
      <Rect x="53" y="91" width="154" height="123" rx="16" fill={ink} />
      <Path d="M42 92h176L200 61H60z" fill={accent} />
      <Path d="M65 67v25M98 67v25M131 67v25M164 67v25M197 67v25" stroke="#FFFFFF" strokeWidth="10" />
      <Rect x="78" y="119" width="42" height="60" rx="8" fill={cream} /><Rect x="138" y="119" width="43" height="60" rx="8" fill={`${accent}66`} />
      <Path d="M84 200h92" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      <Circle cx="38" cy="196" r="20" fill={soft} /><Path d="M28 196h20M38 186v20" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <Path d="M177 42l10-17 10 17 18 3-13 13 3 18-18-9-18 9 3-18-13-13z" fill={accent} />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const next = () => {
    if (isLast) router.push("/role-select");
    else setSlide((value) => value + 1);
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background" className="px-5">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push("/role-select")} style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.55 : 1 }]}><Text style={[styles.skipText, { color: colors.muted }]}>{t("skip")}</Text></Pressable>
        </View>

        <View style={styles.heroStage}>
          <OnboardingIllustration kind={current.kind} accent={current.accent} />
        </View>

        <View style={styles.copyBlock}>
          <Text style={[styles.title, { color: colors.foreground }]}>{current.title}</Text>
          <Text style={[styles.body, { color: slide === 0 ? colors.primary : colors.muted }]}>{current.body}</Text>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.dots}>{SLIDES.map((item, index) => <View key={item.title} style={[styles.dot, { backgroundColor: index === slide ? current.accent : colors.border, width: index === slide ? 30 : 8 }]} />)}</View>
          <Pressable onPress={next} style={({ pressed }) => [styles.nextButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}><Text style={styles.nextText}>{isLast ? "ابدأ الآن" : t("next")}</Text><MaterialIcons name="arrow-back" size={20} color="#FFFFFF" /></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingTop: 8, paddingBottom: 18 },
  topBar: { flexDirection: "row-reverse", alignItems: "center", minHeight: 42 },
  skip: { paddingHorizontal: 8, paddingVertical: 7 },
  skipText: { fontSize: 13, fontWeight: "700" },
  heroStage: { height: 355, alignItems: "center", justifyContent: "center" },
  illustration: { width: 260, height: 270 },
  copyBlock: { alignItems: "center", paddingHorizontal: 14 },
  title: { fontSize: 31, fontWeight: "900", lineHeight: 41, textAlign: "center", letterSpacing: -0.4 },
  body: { fontSize: 15, lineHeight: 24, textAlign: "center", marginTop: 12, fontWeight: "700" },
  bottomArea: { marginTop: "auto", paddingTop: 28, gap: 20 },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  nextButton: { minHeight: 56, borderRadius: 19, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 12 },
  nextText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});
