import { useLocalSearchParams } from "expo-router";
import { AdminSectionScreen } from "@/components/admin-section-screen";

type SectionKey = "verification" | "payments" | "ads" | "orders" | "complaints" | "users" | "stores";
const VALID: SectionKey[] = ["verification", "payments", "ads", "orders", "complaints", "users", "stores"];

export default function AdminSectionRoute() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const selected = VALID.includes(section as SectionKey) ? (section as SectionKey) : "verification";
  return <AdminSectionScreen section={selected} />;
}
