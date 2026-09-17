"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "../button";
import { useAuthModal } from "../../contexts/AuthModalContext";

/** Full-page gate when account is required before checkout. */
export default function AuthRequiredGate({
  title,
  description,
  backHref = "/",
  backLabel = "← Back to home",
  autoOpen = true,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  autoOpen?: boolean;
}) {
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (autoOpen) openAuthModal({ title });
  }, [autoOpen, openAuthModal, title]);

  return (
    <div className="mx-auto max-w-md px-4 py-8 text-center">
      <Link href={backHref} className="text-sm font-semibold text-[#3b82b6] hover:underline">
        {backLabel}
      </Link>
      <div className="mt-8 rounded-3xl border border-border bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-[#083b6c]">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {description ??
            "Sign in or create an account first. Use the same email and password as the ShoreDrop app so your orders stay in sync."}
        </p>
        <Button
          type="button"
          className="mt-6 w-full rounded-full bg-[#083b6c]"
          onClick={() => openAuthModal({ title })}
        >
          Log in / Create account
        </Button>
      </div>
    </div>
  );
}
