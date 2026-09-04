import { useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { REAL_IMAGES } from "@/constants/assets";
import { useI18n, type Language } from "@/lib/i18n";

type IconName = keyof typeof MaterialIcons.glyphMap;

type Order = {
  id: string;
  customer: string;
  total: string;
  status: string;
  date: string;
};

type OperatingModule = {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  route?: string;
};

const ORDERS: Order[] = [
  { id: "1256", customer: "أحمد محمد", total: "250,000 د.ع", status: "جديد", date: "اليوم، 10:42" },
  { id: "1255", customer: "سارة علي", total: "180,000 د.ع", status: "قيد التجهيز", date: "اليوم، 09:18" },
  { id: "1254", customer: "محمد حسن", total: "75,000 د.ع", status: "تم التسليم", date: "أمس، 18:25" },
];

const OPERATING_MODULES: Record<Language, OperatingModule[]> = {
  ar: [
    { id: "analytics", label: "الإحصائيات", icon: "insights", description: "اقرأ أداء متجرك" },
    { id: "orders", label: "الطلبات", icon: "receipt-long", description: "تابع حالات الشحن", route: "/orders" },
    { id: "inventory", label: "المخزون", icon: "inventory-2", description: "راقب الكميات", route: "/inventory" },
    { id: "debts", label: "الديون", icon: "account-balance-wallet", description: "سجّل المستحقات", route: "/merchant/debts" },
    { id: "chat", label: "الدردشة", icon: "forum", description: "تواصل مع الزبائن", route: "/messages" },
    { id: "notifications", label: "التنبيهات", icon: "notifications-none", description: "لا تفوّت نشاطاً", route: "/notifications" },
    { id: "settings", label: "إعدادات المتجر", icon: "storefront", description: "حدّث بياناتك", route: "/merchant-settings" },
  ],
  ku: [
    { id: "analytics", label: "ئامارەکان", icon: "insights", description: "ئەدای فرۆشگاکەت بخوێنەوە" },
    { id: "orders", label: "داواکارییەکان", icon: "receipt-long", description: "دۆخی ناردن بەدوادا بچۆ", route: "/orders" },
    { id: "inventory", label: "کۆگا", icon: "inventory-2", description: "بڕەکان چاودێری بکە", route: "/inventory" },
    { id: "debts", label: "قەرزەکان", icon: "account-balance-wallet", description: "شایستەکان تۆمار بکە", route: "/merchant/debts" },
    { id: "chat", label: "گفتوگۆ", icon: "forum", description: "لەگەڵ کڕیاران پەیوەندی بکە", route: "/messages" },
    { id: "notifications", label: "ئاگادارکردنەوەکان", icon: "notifications-none", description: "هیچ چالاکییەک لەدەست مەدە", route: "/notifications" },
    { id: "settings", label: "ڕێکخستنی فرۆشگا", icon: "storefront", description: "زانیارییەکان نوێ بکەرەوە", route: "/merchant-settings" },
  ],
  en: [
    { id: "analytics", label: "Analytics", icon: "insights", description: "Read store performance" },
    { id: "orders", label: "Orders", icon: "receipt-long", description: "Track shipping status", route: "/orders" },
    { id: "inventory", label: "Inventory", icon: "inventory-2", description: "Monitor quantities", route: "/inventory" },
    { id: "debts", label: "Debts", icon: "account-balance-wallet", description: "Record outstanding dues", route: "/merchant/debts" },
    { id: "chat", label: "Chat", icon: "forum", description: "Talk to customers", route: "/messages" },
    { id: "notifications", label: "Alerts", icon: "notifications-none", description: "Keep up with activity", route: "/notifications" },
    { id: "settings", label: "Store settings", icon: "storefront", description: "Update store details", route: "/merchant-settings" },
  ],
};

export default function MerchantScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, language } = useI18n();
  const operatingModules = OPERATING_MODULES[language];
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState("هذا الشهر");

  const isWide = width >= 960;
  const isTablet = width >= 640;
  const metricWidth = isWide ? "23.5%" : isTablet ? "31.7%" : "48.3%";
  const actionWidth = isWide || isTablet ? "23.5%" : "48.3%";

  const openModule = (module: OperatingModule) => {
    if (module.route) {
      router.push(module.route as never);
      return;
    }
    router.replace("/merchant");
  };

  const quickActions = [
    { label: "إضافة منتج", icon: "add-box" as IconName, onPress: () => router.push("/products") },
    { label: "المخزون", icon: "warehouse" as IconName, onPress: () => router.push("/inventory") },
    { label: "الطلبات", icon: "receipt-long" as IconName, onPress: () => router.push("/orders") },
    { label: "دفتر الديون", icon: "account-balance-wallet" as IconName, onPress: () => router.push("/merchant/debts") },
  ];
  const metrics = [
    ["الطلبات", "156", "receipt-long" as IconName],
    ["المنتجات", "42", "inventory-2" as IconName],
    ["المشاهدات", "2,458", "visibility" as IconName],
    ["الأرباح", "8,420,000", "payments" as IconName],
  ] as const;

  const header = (
    <View style={styles.headerWrap}>
      <View style={[styles.hero, { backgroundColor: colors.foreground }]}>
        <View style={[styles.heroOrb, { backgroundColor: colors.primary }]} />
        <View style={styles.heroTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("notifications")}
            onPress={() => router.push("/notifications")}
            style={({ pressed }) => [styles.heroIcon, { opacity: pressed ? 0.65 : 1 }]}
          >
            <MaterialIcons name="notifications-none" size={21} color="#FFFFFF" />
          </Pressable>
          <View style={styles.heroGreeting}>
            <Text style={styles.heroKicker}>{t("merchantSpace")}</Text>
            <Text style={styles.heroTitle}>شركة الأناقة للملابس</Text>
            <View style={styles.heroMeta}>
              <MaterialIcons name="verified" size={15} color={colors.success} />
              <Text style={styles.heroMetaText}>حساب تجاري موثق</Text>
            </View>
          </View>
          <Image source={{ uri: REAL_IMAGES.stores.boutique }} style={styles.companyAvatar} />
        </View>
        <View style={[styles.salesCard, { backgroundColor: colors.primary }]}>
          <View style={styles.salesHeader}>
            <Text style={styles.salesLabel}>إجمالي المبيعات</Text>
            <Text style={styles.salesPeriod}>{period}</Text>
          </View>
          <Text style={styles.salesValue}>25,680,000</Text>
          <Text style={styles.salesCurrency}>دينار عراقي</Text>
          <View style={styles.salesFooter}>
            <Text style={styles.salesGrowth}>+12% من الشهر الماضي</Text>
            <MaterialIcons name="trending-up" size={18} color={colors.success} />
          </View>
        </View>
        <View style={styles.heroBottom}>
          <View style={styles.subscription}>
            <MaterialIcons name="workspace-premium" size={16} color={colors.success} />
            <Text style={styles.subscriptionText}>اشتراك مميز</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPeriod(period === "هذا الشهر" ? "هذا الأسبوع" : "هذا الشهر")}
            style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
          >
            <Text style={styles.changePeriod}>تغيير الفترة</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>مراكز التشغيل</Text>
          <Text style={[styles.sectionHint, { color: colors.muted }]}>كل أدوات متجرك في مساحة واحدة</Text>
        </View>
        <View style={[styles.sectionMarker, { backgroundColor: `${colors.primary}18` }]}>
          <MaterialIcons name="tune" size={17} color={colors.primary} />
        </View>
      </View>
      <FlatList
        data={operatingModules}
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.moduleRail}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => openModule(item)}
            style={({ pressed }) => [
              styles.moduleCard,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <View style={[styles.moduleIcon, { backgroundColor: `${colors.primary}15` }]}>
              <MaterialIcons name={item.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.moduleLabel, { color: colors.foreground }]} numberOfLines={1}>{item.label}</Text>
            <Text style={[styles.moduleDescription, { color: colors.muted }]} numberOfLines={1}>{item.description}</Text>
          </Pressable>
        )}
      />

      <View style={styles.metricsGrid}>
        {metrics.map(([label, value, icon]) => (
          <View key={label} style={[styles.metricCard, { width: metricWidth, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.metricIcon, { backgroundColor: `${colors.primary}14` }]}>
              <MaterialIcons name={icon} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>الإجراءات السريعة</Text>
          <Text style={[styles.sectionHint, { color: colors.muted }]}>{t("manageProducts")}</Text>
        </View>
        <View style={[styles.sectionMarker, { backgroundColor: `${colors.primary}18` }]}>
          <MaterialIcons name="bolt" size={17} color={colors.primary} />
        </View>
      </View>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            onPress={action.onPress}
            style={({ pressed }) => [styles.actionCard, { width: actionWidth, backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}14` }]}>
              <MaterialIcons name={action.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: colors.foreground }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.ordersHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>آخر الطلبات</Text>
          <Text style={[styles.sectionHint, { color: colors.muted }]}>آخر نشاط تشغيلي لمتجرك</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push("/orders")} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>{t("seeAll")}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <FlatList
        data={ORDERS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`الطلب ${item.id}`}
            onPress={() => router.push(`/orders?selected=${item.id}`)}
            style={({ pressed }) => [styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={[styles.orderAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.orderAvatarText}>{item.customer.slice(0, 1)}</Text>
            </View>
            <View style={styles.orderInfo}>
              <View style={styles.orderTop}>
                <Text style={[styles.orderCustomer, { color: colors.foreground }]}>{item.customer}</Text>
                <Text style={[styles.orderId, { color: colors.muted }]}>#{item.id}</Text>
              </View>
              <View style={styles.orderBottom}>
                <Text style={[styles.orderDate, { color: colors.muted }]}>{item.date}</Text>
                <Text style={[styles.orderTotal, { color: colors.primary }]}>{item.total}</Text>
              </View>
            </View>
            <View style={[styles.status, { backgroundColor: item.status === "تم التسليم" ? `${colors.success}20` : `${colors.primary}15` }]}>
              <Text style={[styles.statusText, { color: item.status === "تم التسليم" ? colors.success : colors.primary }]}>{item.status}</Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={<View style={{ height: 105 }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 20 },
  contentWide: { width: "100%", maxWidth: 1180, alignSelf: "center" },
  headerWrap: { width: "100%" },
  hero: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 18, overflow: "hidden", borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroOrb: { position: "absolute", width: 240, height: 240, borderRadius: 130, left: -100, top: 30, opacity: 0.18 },
  heroTop: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 10, zIndex: 1 },
  heroGreeting: { flex: 1, alignItems: "flex-end" },
  heroKicker: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "700" },
  heroTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginTop: 5 },
  heroMeta: { flexDirection: "row-reverse", alignItems: "center", gap: 4, marginTop: 7 },
  heroMetaText: { color: "rgba(255,255,255,0.74)", fontSize: 10 },
  companyAvatar: { width: 46, height: 46, borderRadius: 23 },
  heroIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.13)", alignItems: "center", justifyContent: "center" },
  salesCard: { borderRadius: 21, marginTop: 20, padding: 15, zIndex: 1 },
  salesHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  salesLabel: { color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "800" },
  salesPeriod: { color: "rgba(255,255,255,0.62)", fontSize: 10 },
  salesValue: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: 7, textAlign: "right" },
  salesCurrency: { color: "rgba(255,255,255,0.62)", fontSize: 9, textAlign: "right", marginTop: 2 },
  salesFooter: { flexDirection: "row-reverse", alignItems: "center", gap: 5, marginTop: 12 },
  salesGrowth: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  heroBottom: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 13, zIndex: 1 },
  subscription: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  subscriptionText: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "700" },
  changePeriod: { color: "rgba(255,255,255,0.62)", fontSize: 10 },
  sectionHeader: { paddingHorizontal: 20, marginTop: 23, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "900", textAlign: "right" },
  sectionHint: { fontSize: 10, marginTop: 4, textAlign: "right" },
  sectionMarker: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  moduleRail: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 2, gap: 9 },
  moduleCard: { width: 142, minHeight: 104, borderWidth: 1, borderRadius: 18, padding: 12, alignItems: "flex-end", justifyContent: "space-between" },
  moduleIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  moduleLabel: { width: "100%", fontSize: 12, fontWeight: "900", textAlign: "right", marginTop: 9 },
  moduleDescription: { width: "100%", fontSize: 9, textAlign: "right", marginTop: 4 },
  metricsGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginTop: 14 },
  metricCard: { minHeight: 104, borderRadius: 19, borderWidth: 1, padding: 13, alignItems: "flex-end" },
  metricIcon: { width: 31, height: 31, borderRadius: 16, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  metricLabel: { fontSize: 10, marginTop: 7 },
  metricValue: { fontSize: 21, fontWeight: "900", marginTop: 3 },
  actionsGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 9, paddingHorizontal: 20, marginTop: 12 },
  actionCard: { minHeight: 83, borderWidth: 1, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 8 },
  actionIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 10, fontWeight: "800" },
  ordersHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 10, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  seeAll: { fontSize: 11, fontWeight: "800" },
  orderCard: { marginHorizontal: 20, minHeight: 76, borderRadius: 18, borderWidth: 1, marginBottom: 9, padding: 11, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  orderAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  orderAvatarText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },
  orderInfo: { flex: 1, alignItems: "flex-end" },
  orderTop: { width: "100%", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  orderCustomer: { fontSize: 12, fontWeight: "900" },
  orderId: { fontSize: 10 },
  orderBottom: { width: "100%", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 7 },
  orderDate: { fontSize: 9 },
  orderTotal: { fontSize: 11, fontWeight: "900" },
  status: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: "800" },
});
