import { type RefObject } from "react";
import { View } from "react-native";
type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

type Company = { id: string; name: string; category: string; rating: string; distance: string; latitude: number; longitude: number; verified: boolean; open: boolean; color: string };
type Props = { mapRef: RefObject<unknown>; region: Region; companies: Company[]; onSelect: (id: string) => void; onRegionChangeComplete: (region: Region) => void };

export function NativeMap(_: Props) {
  return <View />;
}
