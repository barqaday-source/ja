import { Tabs } from "expo-router";
import { Platform } from "react-native";
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
        tabBarShowLabel: false,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarItemStyle: { paddingVertical: 3 },
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom,
          height: 68,
          paddingTop: 6,
          paddingBottom: 7,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: colors.surface,
          shadowColor: colors.foreground,
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: t("explore"), tabBarIcon: ({ color }) => <IconSymbol size={22} name="magnifyingglass" color={color} /> }} />
      <Tabs.Screen name="reels" options={{ title: t("reels"), tabBarIcon: ({ color }) => <IconSymbol size={22} name="play.rectangle.fill" color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: t("messagesTitle"), tabBarIcon: ({ color }) => <IconSymbol size={22} name="message.fill" color={color} /> }} />
      <Tabs.Screen name="inventory" options={{ title: t("inventory"), tabBarIcon: ({ color }) => <IconSymbol size={22} name="shippingbox.fill" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color }) => <IconSymbol size={22} name="person.crop.circle.fill" color={color} /> }} />
    </Tabs>
  );
}
