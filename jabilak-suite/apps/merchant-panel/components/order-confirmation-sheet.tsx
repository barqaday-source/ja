import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { calculateCartTotals, type CartLine, type DeliveryRegion, type DeliverySettings } from "@/lib/cart-calculations";
import { submitOrder, type OrderCustomerDetails } from "@/lib/order-service";
import { useColors } from "@/hooks/use-colors";

type Props = {
  visible: boolean;
  companyId: string;
  items: CartLine[];
  deliverySettings?: DeliverySettings;
  onClose: () => void;
  onSubmitted?: (orderId: string) => void;
};

export function OrderConfirmationSheet({ visible, companyId, items, deliverySettings, onClose, onSubmitted }: Props) {
  const colors = useColors();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<DeliveryRegion>("inside_province");
  const [submitting, setSubmitting] = useState(false);
  const totals = useMemo(() => calculateCartTotals(items, region, deliverySettings), [items, region, deliverySettings]);

  const confirm = async () => {
    if (name.trim().length < 2 || phone.trim().length < 7) {
      Alert.alert("بيانات ناقصة", "أدخل الاسم ورقم الهاتف بشكل صحيح.");
      return;
    }
    setSubmitting(true);
    try {
      const customer: OrderCustomerDetails = { name, phone, region, deliveryAddress: address };
      const result = await submitOrder({ companyId, customer, items, deliverySettings });
      onClose();
      onSubmitted?.(result.order_id);
      Alert.alert("تم إرسال الطلب", "تم حفظ الطلب وإرسال إشعار للتاجر.");
    } catch (error) {
      Alert.alert("تعذر إرسال الطلب", error instanceof Error ? error.message : "حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}><View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>تأكيد الطلب</Text>
        <Text style={[styles.hint, { color: colors.muted }]}>أدخل بيانات الاستلام فقط، وسيتولى التطبيق الحساب والإرسال.</Text>
        <TextInput value={name} onChangeText={setName} placeholder="الاسم" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} textAlign="right" />
        <TextInput value={phone} onChangeText={setPhone} placeholder="رقم الهاتف" keyboardType="phone-pad" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} textAlign="right" />
        <TextInput value={address} onChangeText={setAddress} placeholder="عنوان التوصيل (اختياري)" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} textAlign="right" />
        <View style={styles.regionRow}>{(["inside_province", "outside_province"] as const).map((item) => <Pressable key={item} onPress={() => setRegion(item)} style={[styles.regionChip, { backgroundColor: region === item ? colors.primary : colors.background, borderColor: region === item ? colors.primary : colors.border }]}><Text style={{ color: region === item ? "#FFFFFF" : colors.foreground, fontSize: 10, fontWeight: "800" }}>{item === "inside_province" ? "داخل المحافظة" : "باقي المحافظات"}</Text></Pressable>)}</View>
        <View style={[styles.totalBox, { backgroundColor: `${colors.primary}12` }]}><Text style={[styles.totalLabel, { color: colors.muted }]}>الإجمالي شامل التوصيل</Text><Text style={[styles.totalValue, { color: colors.primary }]}>{totals.total === null ? "غير متاح" : `${totals.total.toLocaleString("en-US")} د.ع`}</Text><Text style={[styles.totalHint, { color: colors.muted }]}>التوصيل: {totals.delivery === null ? "لم يحدده التاجر بعد" : `${totals.delivery.toLocaleString("en-US")} د.ع`}</Text></View>
        <View style={styles.actions}><Pressable onPress={onClose} style={[styles.cancel, { borderColor: colors.border }]}><Text style={{ color: colors.foreground, fontWeight: "800" }}>إلغاء</Text></Pressable><Pressable disabled={submitting} onPress={() => void confirm()} style={[styles.confirm, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}><Text style={styles.confirmText}>{submitting ? "جارٍ الإرسال..." : "تأكيد الطلب"}</Text></Pressable></View>
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.42)" },
  sheet: { padding: 20, paddingBottom: 30, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  title: { fontSize: 19, fontWeight: "900", textAlign: "right" },
  hint: { fontSize: 10, lineHeight: 17, textAlign: "right", marginTop: 5, marginBottom: 12 },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 9, fontSize: 12 },
  regionRow: { flexDirection: "row-reverse", gap: 8, marginBottom: 12 },
  regionChip: { flex: 1, minHeight: 40, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  totalBox: { borderRadius: 15, padding: 12, alignItems: "flex-end", marginBottom: 14 },
  totalLabel: { fontSize: 10 },
  totalValue: { fontSize: 22, fontWeight: "900", marginTop: 3 },
  totalHint: { fontSize: 9, marginTop: 3 },
  actions: { flexDirection: "row-reverse", gap: 8 },
  cancel: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  confirm: { flex: 1.4, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
});
