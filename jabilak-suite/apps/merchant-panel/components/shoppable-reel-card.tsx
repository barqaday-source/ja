import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

import type { ShoppableReel } from "@/lib/community";
import { formatCommunityPrice } from "@/lib/community";
import { useColors } from "@/hooks/use-colors";

type Props = {
  reel: ShoppableReel;
  onOpenProduct?: (productId: string) => void;
};

export function ShoppableReelCard({ reel, onOpenProduct }: Props) {
  const colors = useColors();
  const player = useVideoPlayer(reel.videoUrl, (instance) => { instance.loop = true; });
  const hasProduct = Boolean(reel.productId && reel.productName);

  return (
    <View style={[styles.card, { backgroundColor: colors.foreground }]}>
      <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
      <View style={styles.overlay}>
        <Text style={styles.creator}>{reel.creatorName}</Text>
        {reel.caption && <Text style={styles.caption}>{reel.caption}</Text>}
        {hasProduct && <Pressable disabled={!onOpenProduct} onPress={() => reel.productId && onOpenProduct?.(reel.productId)} style={({ pressed }) => [styles.productCard, { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 }]}>
          {reel.productImageUrl && <Image source={{ uri: reel.productImageUrl }} style={styles.productImage} />}
          <View style={styles.productCopy}><Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>{reel.productName}</Text><Text style={[styles.productPrice, { color: colors.primary }]}>{formatCommunityPrice(reel.productPrice)}</Text></View>
          <Text style={[styles.buyText, { color: colors.primary }]}>عرض المنتج</Text>
        </Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 480, borderRadius: 22, overflow: "hidden", position: "relative", marginBottom: 12 },
  video: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, minHeight: 480, justifyContent: "flex-end", padding: 16, backgroundColor: "rgba(0,0,0,0.18)" },
  creator: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", textAlign: "right" },
  caption: { color: "rgba(255,255,255,0.88)", fontSize: 11, marginTop: 5, textAlign: "right" },
  productCard: { minHeight: 62, borderRadius: 15, marginTop: 12, padding: 8, flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  productImage: { width: 46, height: 46, borderRadius: 10 },
  productCopy: { flex: 1, alignItems: "flex-end" },
  productName: { fontSize: 11, fontWeight: "900", textAlign: "right" },
  productPrice: { fontSize: 10, fontWeight: "900", marginTop: 4 },
  buyText: { fontSize: 9, fontWeight: "900" },
});
