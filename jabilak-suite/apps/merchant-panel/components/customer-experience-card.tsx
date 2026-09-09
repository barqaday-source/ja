import { Image, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

import type { CustomerExperience } from "@/lib/community";
import { useColors } from "@/hooks/use-colors";

type Props = { experience: CustomerExperience };

export function CustomerExperienceCard({ experience }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}><View style={styles.stars}><Text style={{ color: colors.primary }}>{"★".repeat(Math.max(0, Math.min(5, Math.round(experience.rating))))}</Text></View><Text style={[styles.name, { color: colors.foreground }]}>{experience.customerName}</Text></View>
      {experience.videoUrl ? <ExperienceVideo url={experience.videoUrl} /> : experience.imageUrl ? <Image source={{ uri: experience.imageUrl }} style={styles.media} /> : null}
      {experience.text && <Text style={[styles.text, { color: colors.foreground }]}>{experience.text}</Text>}
    </View>
  );
}

function ExperienceVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url, (instance) => { instance.loop = true; });
  return <VideoView player={player} style={styles.media} contentFit="cover" nativeControls />;
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 11, marginBottom: 10 },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  name: { fontSize: 12, fontWeight: "900" },
  stars: { minWidth: 60, alignItems: "flex-start" },
  media: { width: "100%", height: 170, borderRadius: 13, backgroundColor: "#E8E4EA" },
  text: { fontSize: 11, lineHeight: 19, marginTop: 8, textAlign: "right" },
});
