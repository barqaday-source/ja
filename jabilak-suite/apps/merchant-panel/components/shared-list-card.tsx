import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SharedList } from "@/lib/community";
import { shareList } from "@/lib/community";
import { useColors } from "@/hooks/use-colors";

type Props = { list: SharedList; shareBaseUrl: string };

export function SharedListCard({ list, shareBaseUrl }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.copy}><Text style={[styles.title, { color: colors.foreground }]}>{list.title}</Text><Text style={[styles.meta, { color: colors.muted }]}>{list.productIds.length} منتجات محفوظة · تُعرض بيانات الأسعار عند فتحها</Text></View>
      <Pressable onPress={() => void shareList(list, shareBaseUrl)} style={({ pressed }) => [styles.share, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}><Text style={styles.shareText}>مشاركة القائمة</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 76, borderRadius: 17, borderWidth: 1, padding: 11, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  copy: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 12, fontWeight: "900", textAlign: "right" },
  meta: { fontSize: 9, marginTop: 4, textAlign: "right" },
  share: { minHeight: 38, borderRadius: 12, paddingHorizontal: 11, alignItems: "center", justifyContent: "center" },
  shareText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
});
