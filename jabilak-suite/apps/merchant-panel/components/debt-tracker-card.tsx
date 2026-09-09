import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

interface DebtItemProps {
  customerName: string;
  amount: string;
  dueDate: string;
  onSendReminder: () => void;
  children?: ReactNode;
}

export function DebtTrackerCard({ customerName, amount, dueDate, onSendReminder, children }: DebtItemProps) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.foreground }]}> 
      <View style={styles.topRow}>
        <Text style={styles.customerName}>{customerName}</Text>
        <Text style={[styles.amount, { color: colors.primary }]}>{amount} د.ع</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.dueDate}>استحقاق: {dueDate}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`إرسال تذكير إلى ${customerName}`}
          onPress={onSendReminder}
          style={({ pressed }) => [styles.reminderButton, { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.reminderText}>إرسال تذكير 🔔</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, marginBottom: 12 },
  topRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 8 },
  customerName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", textAlign: "right" },
  amount: { fontSize: 16, fontWeight: "bold" },
  bottomRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  dueDate: { color: "#968A98", fontSize: 12, textAlign: "right" },
  reminderButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  reminderText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
