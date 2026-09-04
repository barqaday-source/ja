import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zanyiqoukzanskioivzr.supabase.co"; 
// الصق مفتاح anon الخالص الطويل هنا (الذي يبدأ بـ eyJ)
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnlpcW91a3phbnNraW9pdnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjI3MDMsImV4cCI6MjA5NzE5ODcwM30.gzEc_rqfApWFdetRyvK0sk3BF3kfiQn72FdNOgkcOVA"; 

console.log("==========================================");
console.log("🚀 جاري الاتصال بـ Supabase");
console.log("==========================================");

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export function requireSupabase(): SupabaseClient {
  return supabase;
}