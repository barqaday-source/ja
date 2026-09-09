import { Platform, StyleSheet, useWindowDimensions, View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer className="p-4">
 *   <Text className="text-2xl font-bold text-foreground">
 *     Welcome
 *   </Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const responsiveWidth = width >= 768 ? Math.min(width - 32, 1280) : width;

  return (
    <View
      className={cn(
        "flex-1",
        "bg-background",
        containerClassName
      )}
      {...props}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.glowTop, { backgroundColor: `${colors.primary}1A` }]} />
        <View style={[styles.glowBottom, { backgroundColor: `${colors.muted}18` }]} />
      </View>
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={style}
      >
        <View
          style={Platform.OS === "web" ? [styles.webFrame, { width: responsiveWidth, maxWidth: "100%" }] : styles.nativeFrame}
          className="flex-1 self-center"
        >
          <View className={cn("flex-1", className)}>{children}</View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webFrame: { alignSelf: "center", minWidth: 0 },
  nativeFrame: { flex: 1 },
  glowTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -150,
    left: -90,
  },
  glowBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: -130,
    right: -80,
  },
});
