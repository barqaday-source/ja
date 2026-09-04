import { Image, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

export default function SplashScreen() {
  const router = useRouter();
  const colors = useColors();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      router.replace(isAuthenticated ? "/(tabs)" : "/onboarding");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, loading, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} accessibilityLabel="شاشة بداية جَايَبْلَك">
      <Image source={require("../assets/images/icon.png")} accessibilityLabel="أيقونة جَايَبْلَك" style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  logo: { width: 132, height: 132 },
});
