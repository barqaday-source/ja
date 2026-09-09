import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type UseAuthOptions = { autoFetch?: boolean };

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rememberMe, setRememberMeState] = useState(true);
  const [rememberLoaded, setRememberLoaded] = useState(Platform.OS === "web");

  useEffect(() => {
    if (Platform.OS === "web") return;
    Auth.getRememberMe()
      .then((value) => { setRememberMeState(value); setRememberLoaded(true); })
      .catch(() => setRememberLoaded(true));
  }, []);

  const setRememberMe = useCallback(async (value: boolean) => {
    setRememberMeState(value);
    await Auth.setRememberMe(value);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (Platform.OS === "web") {
        const apiUser = await Api.getMe();
        if (apiUser) {
          const userInfo: Auth.User = { id: apiUser.id, openId: apiUser.openId, name: apiUser.name, email: apiUser.email, loginMethod: apiUser.loginMethod, lastSignedIn: new Date(apiUser.lastSignedIn) };
          setUser(userInfo);
          await Auth.setUserInfo(userInfo);
        } else {
          const cachedUser = rememberMe ? await Auth.getUserInfo() : null;
          setUser(cachedUser);
          if (!rememberMe) await Auth.clearUserInfo();
        }
        return;
      }
      if (!rememberMe) {
        await Auth.removeSessionToken();
        await Auth.clearUserInfo();
        setUser(null);
        return;
      }
      const sessionToken = await Auth.getSessionToken();
      if (!sessionToken) { setUser(null); return; }
      setUser(await Auth.getUserInfo());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch user"));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [rememberMe]);

  const logout = useCallback(async () => {
    try { await Api.logout(); } catch (err) { console.error("[Auth] Logout API call failed:", err); }
    finally {
      await Auth.removeSessionToken();
      await Auth.clearRememberedSession();
      setUser(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    if (!autoFetch) { setLoading(false); return; }
    if (Platform.OS !== "web" && !rememberLoaded) return;
    void fetchUser();
  }, [autoFetch, fetchUser, rememberLoaded]);

  return { user, loading, error, isAuthenticated, refresh: fetchUser, logout, rememberMe, setRememberMe };
}
