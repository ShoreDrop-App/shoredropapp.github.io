"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { format, parseISO } from "date-fns";
import { Eye, Layers, Loader2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { cn } from "../../lib/utils";
import { easternDateKey } from "../../lib/ordering/time";
import {
  INVENTORY_BUCKET_LABEL,
  INVENTORY_MAX,
  type InventoryBucket,
} from "../../lib/ordering/inventory";
import { fetchOutstandingGearPoolCounts } from "../../lib/services/outstandingGearPool";
import {
  driverGetGearHolds,
  driverListOrders,
  type DriverItemRow,
  type DriverOrderRow,
} from "../../lib/services/driverPortal";
import {
  getStaffSupabase,
  isAllowedStaffEmail,
  STAFF_ALLOWED_EMAIL,
} from "../../lib/services/staffSupabase";

const REFRESH_MS = 20_000;

const DONE_STATUSES = new Set(["completed", "picked-up"]);
const BUCKETS = Object.keys(INVENTORY_MAX) as InventoryBucket[];

const EMPTY_HOLDS: Record<InventoryBucket, number> = {
  chairs: 0,
  umbrellas: 0,
  smallCoolers: 0,
  largeCoolers: 0,
  beachTents: 0,
};

function statusTone(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === "cancelled") return "bg-destructive/10 text-destructive border-destructive/25";
  if (DONE_STATUSES.has(s)) return "bg-muted text-muted-foreground border-border";
  if (s === "pickup-requested" || s === "pickup-scheduled")
    return "bg-amber-100 text-amber-900 border-amber-300";
  if (s === "ready") return "bg-emerald-100 text-emerald-900 border-emerald-300";
  return "bg-[#e6f9ff] text-[#083b6c] border-[#083b6c]/25";
}

function dayLabel(dateKey: string): string {
  try {
    return format(parseISO(`${dateKey}T12:00:00`), "EEEE, MMM d");
  } catch {
    return dateKey;
  }
}

export default function AdminClient() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const [serviceDate, setServiceDate] = useState(() => easternDateKey(new Date()));
  const [orders, setOrders] = useState<DriverOrderRow[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, DriverItemRow[]>>({});
  const [poolTotal, setPoolTotal] = useState<Record<InventoryBucket, number> | null>(null);
  const [holds, setHolds] = useState<Record<InventoryBucket, number>>(EMPTY_HOLDS);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [dateOnly, setDateOnly] = useState(true);

  useEffect(() => {
    setSupabase(getStaffSupabase());
  }, []);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session ?? null;
      if (s && !isAllowedStaffEmail(s.user.email)) {
        await supabase.auth.signOut();
        if (active) setSession(null);
      } else if (active) {
        setSession(s);
      }
      if (active) setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s && !isAllowedStaffEmail(s.user.email)) {
        void supabase.auth.signOut();
        setSession(null);
        return;
      }
      setSession(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!supabase || !session) return;
      if (!opts?.silent) setLoading(true);
      try {
        const [list, pool, held] = await Promise.all([
          driverListOrders(supabase),
          fetchOutstandingGearPoolCounts(serviceDate),
          driverGetGearHolds(supabase, serviceDate).catch(() => EMPTY_HOLDS),
        ]);
        setOrders(list.orders);
        setItemsByOrder(list.itemsByOrder);
        setPoolTotal(pool);
        setHolds(held);
        setUpdatedAt(new Date());
        setLoadError("");
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Could not load admin data.");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [supabase, session, serviceDate],
  );

  useEffect(() => {
    if (!session) return;
    void load();
    const id = window.setInterval(() => void load({ silent: true }), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [session, load]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const trimmed = email.trim();
    if (!isAllowedStaffEmail(trimmed)) {
      setAuthError(`Admin access is limited to ${STAFF_ALLOWED_EMAIL}.`);
      return;
    }
    setSigningIn(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
      if (error) throw error;
      setPassword("");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setSigningIn(false);
    }
  };

  const visibleOrders = useMemo(() => {
    const scoped = dateOnly ? orders.filter((o) => o.service_date === serviceDate) : orders;
    return [...scoped].sort((a, b) => {
      const d = (a.service_date || "").localeCompare(b.service_date || "");
      if (d !== 0) return d;
      return (a.start_time || "").localeCompare(b.start_time || "");
    });
  }, [orders, dateOnly, serviceDate]);

  const grouped = useMemo(() => {
    const live: DriverOrderRow[] = [];
    const done: DriverOrderRow[] = [];
    const cancelled: DriverOrderRow[] = [];
    for (const o of visibleOrders) {
      const s = (o.status || "").trim().toLowerCase();
      if (s === "cancelled") cancelled.push(o);
      else if (DONE_STATUSES.has(s)) done.push(o);
      else live.push(o);
    }
    return { live, done, cancelled };
  }, [visibleOrders]);

  if (!supabase) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <p className="text-sm text-muted-foreground">
          Supabase isn&apos;t configured for this build, so the admin view has no data source.
        </p>
      </main>
    );
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#083b6c]" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <h1 className="text-2xl font-semibold text-[#083b6c]">ShoreDrop admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only view of orders and the gear pool. Sign in with the staff account.
        </p>
        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              className="h-12 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="h-12 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[#083b6c] hover:bg-[#0a4a85]"
            disabled={signingIn || !email.trim() || !password}
          >
            {signingIn ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(200,20%,98%)]">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-[#083b6c]">ShoreDrop admin</h1>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Eye className="h-3 w-3" />
              Read only
              {updatedAt ? ` · updated ${format(updatedAt, "h:mm:ss a")}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={loading}
            onClick={() => void load()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() => void supabase.auth.signOut()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        {loadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        <section className="rounded-3xl border border-[#083b6c]/20 bg-white p-4 shadow-soft">
          <div className="mb-3 flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f9ff]">
              <Layers className="h-5 w-5 text-[#083b6c]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground">Gear pool</h2>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Online orders plus staff walk-up holds for the selected day.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="admin-day" className="text-xs font-semibold text-muted-foreground">
              Service date
            </Label>
            <Input
              id="admin-day"
              type="date"
              value={serviceDate}
              onChange={(e) => {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) return;
                setHolds(EMPTY_HOLDS);
                setPoolTotal(null);
                setServiceDate(e.target.value);
              }}
              className="mt-1 h-11 rounded-xl"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Showing {dayLabel(serviceDate)}
              {serviceDate === easternDateKey(new Date()) ? " (today)" : ""}
            </p>
          </div>

          {!poolTotal ? (
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading gear counts…" : "Gear counts unavailable right now."}
            </p>
          ) : (
            <ul className="space-y-3">
              {BUCKETS.map((key) => {
                const max = INVENTORY_MAX[key];
                const total = poolTotal[key] ?? 0;
                const held = holds[key] ?? 0;
                const onlineOut = Math.max(0, total - held);
                const left = Math.max(0, max - total);
                const usedPct = max > 0 ? Math.min(100, Math.round((total / max) * 100)) : 0;
                const low = left <= Math.max(1, Math.floor(max * 0.08));
                return (
                  <li key={key}>
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
                      <span className="truncate font-semibold text-foreground">
                        {INVENTORY_BUCKET_LABEL[key]}
                      </span>
                      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                        {onlineOut} online / {max} max
                      </span>
                    </div>
                    <div className="mb-1 text-[12px] tabular-nums">
                      <span
                        className={cn(
                          low ? "font-bold text-destructive" : "font-semibold text-foreground",
                        )}
                      >
                        {left} available
                      </span>
                      {held > 0 ? (
                        <span className="ml-1.5 font-medium text-[#3b82b6]">· {held} walk-up</span>
                      ) : null}
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-300 ease-out",
                          low ? "bg-destructive" : "bg-[#083b6c]",
                        )}
                        style={{ width: `${usedPct}%` }}
                        role="presentation"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-foreground">
              Orders · {grouped.live.length} live · {grouped.done.length} done ·{" "}
              {grouped.cancelled.length} cancelled
            </h2>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={dateOnly ? "default" : "outline"}
                className={cn("rounded-full", dateOnly && "bg-[#083b6c] hover:bg-[#0a4a85]")}
                onClick={() => setDateOnly(true)}
              >
                This day
              </Button>
              <Button
                type="button"
                size="sm"
                variant={dateOnly ? "outline" : "default"}
                className={cn("rounded-full", !dateOnly && "bg-[#083b6c] hover:bg-[#0a4a85]")}
                onClick={() => setDateOnly(false)}
              >
                All dates
              </Button>
            </div>
          </div>

          {visibleOrders.length === 0 ? (
            <div className="rounded-3xl border border-border bg-white p-6 text-center text-sm text-muted-foreground shadow-soft">
              {loading ? "Loading orders…" : "No orders to show."}
            </div>
          ) : (
            <div className="space-y-2.5">
              {visibleOrders.map((o) => {
                const lines = itemsByOrder[o.id] ?? [];
                return (
                  <article
                    key={o.id}
                    className="rounded-3xl border border-border bg-white p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#083b6c]">{o.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dayLabel(o.service_date)} · {o.start_time} – {o.end_time}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          statusTone(o.status),
                        )}
                      >
                        {o.status}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {o.location_display_name}
                    </p>

                    {lines.length > 0 ? (
                      <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                        {lines.map((l, i) => (
                          <li
                            key={l.id ?? `${o.id}-${i}`}
                            className={cn(l.fulfillment_status === "waived" && "line-through")}
                          >
                            · {l.quantity}× {l.item_name}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        ${Number(o.total_amount ?? 0).toFixed(2)}
                      </span>
                      <span>{o.driver_claim_user_id ? "Claimed" : "Unclaimed"}</span>
                      {o.cancellation_reason ? (
                        <span className="text-destructive">Reason: {o.cancellation_reason}</span>
                      ) : null}
                      {o.crew_notes ? <span>Notes: {o.crew_notes}</span> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
