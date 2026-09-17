"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthModalOptions {
  title?: string;
}

interface AuthModalContextValue {
  open: boolean;
  title: string;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

const DEFAULT_TITLE = "Sign in to continue";

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(DEFAULT_TITLE);

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    setTitle(options?.title?.trim() || DEFAULT_TITLE);
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, title, openAuthModal, closeAuthModal }),
    [open, title, openAuthModal, closeAuthModal],
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
