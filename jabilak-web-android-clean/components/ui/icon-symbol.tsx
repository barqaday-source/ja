// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

const MAPPING = {
  "house.fill": "home",
  "magnifyingglass": "search",
  "play.rectangle.fill": "play-circle-outline",
  "shippingbox.fill": "inventory-2",
  "person.crop.circle.fill": "account-circle",
  "person.2.fill": "people-outline",
  "heart.fill": "favorite",
  "bookmark.fill": "bookmark",
  "bell.fill": "notifications-none",
  "plus": "add",
  "phone.fill": "phone",
  "message.fill": "chat-bubble-outline",
  "abu-al-ereef": "smart-toy",
  "settings.fill": "settings",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "line.3.horizontal.decrease.circle": "tune",
  "ellipsis": "more-horiz",
  "camera.fill": "photo-camera",
} as const satisfies Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
