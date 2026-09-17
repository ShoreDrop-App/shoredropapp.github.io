"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { toast } from "sonner";

export default function CustomerAuthPanel({
  title = "Sign in to continue",
  onAuthenticated,
}: {
  title?: string;
  onAuthenticated?: () => void;
}) {
  const { signIn, signUp } = useCustomerAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTos, setAcceptTos] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "signUp") {
        const res = await signUp(email, password, acceptTos);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success(
          res.sessionCreated
            ? "Account created — you're signed in. Same login works in the ShoreDrop app."
            : "Check your email to confirm, then sign in.",
        );
        if (res.sessionCreated) onAuthenticated?.();
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Signed in — your orders sync with the ShoreDrop app.");
        onAuthenticated?.();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-[#083b6c]">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the same email and password as the ShoreDrop app so your orders show up in both places.
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "signIn" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setMode("signIn")}
        >
          Sign in
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "signUp" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setMode("signUp")}
        >
          Create account
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="username"
            className="h-12 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            className="h-12 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {mode === "signUp" ? (
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-1"
              checked={acceptTos}
              onChange={(e) => setAcceptTos(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-[#3b82b6] underline" target="_blank">
                Terms of Service
              </Link>
            </span>
          </label>
        ) : null}
        <Button
          type="button"
          className="w-full rounded-full bg-[#083b6c]"
          disabled={busy}
          onClick={() => void submit()}
        >
          {busy ? "…" : mode === "signUp" ? "Create account" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}
