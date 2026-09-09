import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/lib/_core/theme";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>!</Text>
        <Text style={styles.title}>حدث خطأ غير متوقع</Text>
        <Text style={styles.body}>لم نفقد بياناتك. أعد المحاولة للعودة إلى التطبيق.</Text>
        <Pressable onPress={this.reset} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.75 : 1 }]}>
          <Text style={styles.buttonText}>إعادة المحاولة</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: Colors.light.background },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: Colors.light.error, color: "#FFFFFF", textAlign: "center", paddingTop: 9, fontSize: 26, fontWeight: "900" },
  title: { marginTop: 16, color: Colors.light.foreground, fontSize: 20, fontWeight: "900", textAlign: "center" },
  body: { marginTop: 8, color: Colors.light.muted, fontSize: 12, textAlign: "center" },
  button: { marginTop: 20, minWidth: 150, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, backgroundColor: Colors.light.primary, alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
});
