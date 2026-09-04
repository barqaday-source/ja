import { ThemedView } from "@/components/themed-view";
import { requireSupabase } from "@/lib/supabase/client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OAuthCallback() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("اكتب البريد والرمز");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = requireSupabase();

      // تسجيل الدخول المباشر عبر Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data?.session) {
        throw new Error("لم يتم إنشاء الجلسة بنجاح");
      }

      console.log("[Auth] Supabase login successful");

      // الانتقال المباشر للواجهة الرئيسية
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("[Auth] Login error:", err);
      setErrorMessage(err?.message || "فشل تسجيل الدخول، تأكد من البريد والرمز");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
      <ThemedView className="flex-1 justify-center p-6">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">تسجيل الدخول</Text>
            <Text className="text-base text-foreground/70">
              ادخل بريدك ورمزك للوصول إلى حسابك
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">البريد الالكتروني</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="h-12 rounded-xl border border-border bg-card px-4 text-foreground"
                placeholderTextColor="#888"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">الرمز</Text>
              <View className="h-12 flex-row items-center rounded-xl border border-border bg-card px-4">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-foreground"
                  placeholderTextColor="#888"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text className="text-sm text-foreground/60">
                    {showPassword ? "اخفاء" : "اظهار"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {errorMessage && (
              <Text className="text-sm text-error">{errorMessage}</Text>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`h-12 items-center justify-center rounded-xl bg-foreground ${loading ? "opacity-70" : ""}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-background">دخول</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}