import MapView, { Marker, type Region } from "react-native-maps";
import { type RefObject } from "react";
import { StyleSheet } from "react-native";

type Company = { id: string; name: string; category: string; rating: string; distance: string; latitude: number; longitude: number; verified: boolean; open: boolean; color: string };

type MapController = { animateToRegion: (region: Region, duration?: number) => void };
type Props = { mapRef: RefObject<MapController | null>; region: Region; companies: Company[]; onSelect: (id: string) => void; onRegionChangeComplete: (region: Region) => void };

export function NativeMap({ mapRef, region, companies, onSelect, onRegionChangeComplete }: Props) {
  return <MapView ref={mapRef as RefObject<MapView | null>} style={styles.map} initialRegion={region} region={region} onRegionChangeComplete={onRegionChangeComplete} showsUserLocation showsMyLocationButton={false} showsCompass={false}>{companies.map((company) => <Marker key={company.id} coordinate={{ latitude: company.latitude, longitude: company.longitude }} pinColor={company.color} onPress={() => onSelect(company.id)} title={company.name} description={`${company.category} · ${company.distance}`} />)}</MapView>;
}

const styles = StyleSheet.create({ map: { flex: 1 } });
