import { Platform, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";

export default function TabLayout() {
  const colors = useColors();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 14 : Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: -2 },
        tabBarItemStyle: { paddingVertical: 3 },
        tabBarStyle: {
          position: "absolute", left: 18, right: 18, bottom, height: 72,
          paddingTop: 7, paddingBottom: 7, borderTopWidth: 0, borderRadius: 26,
          backgroundColor: colors.surface, shadowColor: colors.foreground,
          shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 7,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: ({ color }) => <IconSymbol size={21} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: "استكشف", tabBarIcon: ({ color }) => <IconSymbol size={21} name="magnifyingglass" color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: "الشات", tabBarIcon: ({ color, focused }) => <View style={[styles.chatButton, { backgroundColor: focused ? colors.primary : colors.surface, borderColor: focused ? colors.primary : colors.border }]}><IconSymbol size={22} name="message.fill" color={focused ? "#FFFFFF" : color} /></View> }} />
      <Tabs.Screen name="inventory" options={{ title: "المخزون", tabBarIcon: ({ color }) => <IconSymbol size={21} name="shippingbox.fill" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "حسابي", tabBarIcon: ({ color }) => <IconSymbol size={21} name="person.crop.circle.fill" color={color} /> }} />
      <Tabs.Screen name="abu-al-ereef" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  chatButton: { width: 45, height: 45, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, marginTop: -9, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
});
