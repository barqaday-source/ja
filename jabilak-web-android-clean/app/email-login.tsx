import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { requireSupabase } from "@/lib/supabase/client";

export default function EmailLoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams<{ role?: string }>();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleAuth = async () => {
    console.log("======================================");
    console.log("[Auth] Button clicked successfully!");
    console.log("[Auth] Email value:", email);
    console.log("[Auth] Password length:", password?.length);
    console.log("[Auth] Mode (isSignUp):", isSignUp);
    console.log("======================================");

    const valueEmail = email.trim();
    const valuePassword = password.trim();

    if (!valueEmail || !valueEmail.includes("@")) {
      Alert.alert("تنبيه", "يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    if (!valuePassword || valuePassword.length < 6) {
      Alert.alert("تنبيه", "كلمة المرور يجب أن تكون 6 أحرف أو رموز على الأقل.");
      return;
    }

    setLoading(true);

    try {
      const supabase = requireSupabase();
      let res;

      if (isSignUp) {
        console.log("[Auth] Executing signUp...");
        res = await supabase.auth.signUp({
          email: valueEmail,
          password: valuePassword,
        });
      } else {
        console.log("[Auth] Executing signInWithPassword...");
        res = await supabase.auth.signInWithPassword({
          email: valueEmail,
          password: valuePassword,
        });
      }

      const { data, error } = res;

      if (error) {
        console.error("[Auth] Supabase returned error:", error);
        throw error;
      }

      console.log("[Auth] Success! Data received:", data);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("[Auth] Exception caught during auth:", err);
      Alert.alert("خطأ في العملية", err?.message || "حدث خطأ غير متوقع، تأكد من الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} className="px-5">
      <View style={styles.content}>
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.55 : 1 }]}
        >
          <MaterialIcons name="arrow-forward" size={22} color={colors.foreground} />
        </Pressable>

        <View style={[styles.icon, { backgroundColor: `${colors.primary}15` }]}>
          <MaterialIcons name="lock-outline" size={31} color={colors.primary} />
        </View>

        <Text style={[styles.kicker, { color: colors.primary }]}>
          {isSignUp ? "إنشاء حساب جديد" : "تسجيل دخول آمن"}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {isSignUp ? "سجل حسابك الآن" : "أدخل بريدك ورمزك"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {isSignUp ? "أدخل بريدك وكلمة مرور جديدة للبدء فوراً." : "سجل دخولك مباشرة دون الحاجة لأي روابط أو تأكيد."}
        </Text>

        <View style={styles.form}>
          {/* حقل البريد الإلكتروني */}
          <Text style={[styles.label, { color: colors.foreground }]}>البريد الإلكتروني</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: focusedField === 'email' ? colors.primary : colors.border }]}>
            <MaterialIcons name="alternate-email" size={20} color={focusedField === 'email' ? colors.primary : colors.muted} />
            <TextInput 
              value={email} 
              onChangeText={setEmail} 
              onFocus={() => setFocusedField('email')} 
              onBlur={() => setFocusedField(null)} 
              placeholder="name@example.com" 
              placeholderTextColor={colors.muted} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              autoCorrect={false} 
              style={[styles.input, { color: colors.foreground }]} 
            />
          </View>

          {/* حقل كلمة المرور مع زر العين */}
          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>كلمة المرور</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: focusedField === 'password' ? colors.primary : colors.border }]}>
            <MaterialIcons name="lock-outline" size={20} color={focusedField === 'password' ? colors.primary : colors.muted} />
            <TextInput 
              value={password} 
              onChangeText={setPassword} 
              onFocus={() => setFocusedField('password')} 
              onBlur={() => setFocusedField(null)} 
              placeholder="••••••••" 
              placeholderTextColor={colors.muted} 
              secureTextEntry={!showPassword} 
              autoCapitalize="none" 
              autoCorrect={false} 
              style={[styles.input, { color: colors.foreground }]} 
              onSubmitEditing={handleAuth}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              <MaterialIcons 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color={colors.muted} 
              />
            </Pressable>
          </View>

          <Text style={[styles.helper, { color: colors.muted }]}>طريقة الاستخدام: {params.role === "merchant" ? "تاجر" : "زبون"}</Text>
        </View>

        {/* تم تعديل الـ footer لضمان تفاعل الزر بنسبة 100% على الويب */}
        <View style={styles.footer}>
          <Pressable 
            onPress={handleAuth} 
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton, 
              { 
                backgroundColor: colors.primary, 
                opacity: pressed || loading ? 0.8 : 1,
                cursor: 'pointer' 
              }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryText}>{isSignUp ? "إنشاء الحساب" : "تسجيل الدخول"}</Text>
                <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          <Pressable onPress={() => setIsSignUp(!isSignUp)} style={{ padding: 8, alignItems: 'center', cursor: 'pointer' }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold' }}>
              {isSignUp ? "لديك حساب بالفعل؟ سجل دخولك" : "ليس لديك حساب؟ إنشاء حساب جديد"}
            </Text>
          </Pressable>

          <Text style={[styles.privacy, { color: colors.muted }]}>بمتابعة الدخول، أنت توافق على شروط الاستخدام وسياسة الخصوصية.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 8, paddingBottom: 18 },
  back: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  icon: { width: 70, height: 70, borderRadius: 24, alignItems: "center", justifyContent: "center", alignSelf: "flex-end", marginTop: 25 },
  kicker: { fontSize: 13, fontWeight: "900", textAlign: "right", marginTop: 20 },
  title: { fontSize: 30, fontWeight: "900", lineHeight: 41, textAlign: "right", marginTop: 6 },
  subtitle: { fontSize: 14, lineHeight: 23, textAlign: "right", marginTop: 8 },
  form: { marginTop: 24 },
  label: { fontSize: 13, fontWeight: "900", textAlign: "right", marginBottom: 8 },
  inputWrap: { minHeight: 56, borderWidth: 1.5, borderRadius: 17, paddingHorizontal: 15, flexDirection: "row-reverse", alignItems: "center", gap: 9 },
  input: { flex: 1, fontSize: 15, textAlign: "right", paddingVertical: 3 },
  helper: { fontSize: 11, textAlign: "right", marginTop: 8 },
  footer: { marginTop: 20, gap: 10 }, // إزالة auto لتجنب حجب اللمس على الويب
  primaryButton: { minHeight: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 12 },
  primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  privacy: { fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 12 },
});