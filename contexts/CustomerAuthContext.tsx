"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "../lib/services/supabaseBrowser";
import { isSupabaseConfigured } from "../lib/services/supabase";
import { clearSavedWebOrders } from "../lib/ordering/webOrders";

interface CustomerAuthContextValue {
  user: User | null;
  initialized: boolean;
  authRequiredMode: boolean;
  signUp: (
    email: string,
    password: string,
    acceptTos: boolean,
  ) => Promise<{ error: string | null; sessionCreated: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const authRequiredMode = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(!authRequiredMode);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setInitialized(true);
      return;
    }
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setInitialized(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, acceptTos: boolean) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return { error: "Sign up unavailable — configure Supabase.", sessionCreated: false };
    }
    if (!acceptTos) {
      return { error: "Please agree to the Terms of Service to create an account.", sessionCreated: false };
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password || password.length < 6) {
      return {
        error: "Enter a valid email and a password with at least 6 characters.",
        sessionCreated: false,
      };
    }

    const { data, error } = await supabase.auth.signUp({ email: trimmed, password });
    if (error) return { error: error.message, sessionCreated: false };

    const isNewAccount = (data.user?.identities?.length ?? 0) > 0;
    let sessionCreated = Boolean(data.session);

    if (!sessionCreated) {
      if (!isNewAccount) {
        return { error: "An account with this email already exists. Sign in instead.", sessionCreated: false };
      }
      const signInAttempt = await supabase.auth.signInWithPassword({ email: trimmed, password });
      if (!signInAttempt.error && signInAttempt.data.session) {
        sessionCreated = true;
      } else if (signInAttempt.error) {
        return { error: signInAttempt.error.message, sessionCreated: false };
      }
    }

    return { error: null, sessionCreated };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Sign in unavailable — configure Supabase." };
    const trimmed = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    clearSavedWebOrders();
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initialized, authRequiredMode, signUp, signIn, signOut }),
    [user, initialized, authRequiredMode, signUp, signIn, signOut],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
