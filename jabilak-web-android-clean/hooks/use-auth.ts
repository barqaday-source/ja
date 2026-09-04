import { useCallback, useEffect, useMemo, useState } from "react";
import { requireSupabase } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب الجلسة الحقيقية من Supabase
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = requireSupabase();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setUser(null);
      } else {
        // إرجاع بيانات المستخدم الحقيقي المسجل في Supabase
        setUser(session.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // متابعة تغير حالة الجلسة تلقائياً (تسجيل دخول / خروج)
  useEffect(() => {
    fetchUser();
    
    const supabase = requireSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      const supabase = requireSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Auth] Logout failed:", err);
    } finally {
      setUser(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  return { 
    user, 
    loading, 
    isAuthenticated, 
    refresh: fetchUser, 
    logout 
  };
}