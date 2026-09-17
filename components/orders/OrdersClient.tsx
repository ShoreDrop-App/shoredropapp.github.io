"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Clock, MessageCircle, Package } from "lucide-react";
import SiteNav from "../SiteNav";
import SiteFooter from "../SiteFooter";
import { Button } from "../button";
import { Input } from "../input";
import { cn } from "../../lib/utils";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { getSupabaseBrowser } from "../../lib/services/supabaseBrowser";
import {
  fetchCustomerCloudOrders,
  fetchOrderTracker,
  parseOrderStatus,
  postOrderChat,
  type CloudOrderSummary,
  type OrderStatus,
  type TrackerMessage,
} from "../../lib/services/orderTracker";
import {
  clearSavedWebOrders,
  crewLabel,
  getStatusSteps,
  isPastStatus,
  readSavedWebOrders,
  rememberWebOrder,
  type SavedWebOrder,
} from "../../lib/ordering/webOrders";
import {
  canOfferOrderExtension,
  parseServiceDateLabel,
} from "../../lib/ordering/orderExtension";
import ExtendOrderTimeModal from "./ExtendOrderTimeModal";

type DisplayOrder = {
  id: string;
  trackingToken: string;
  title: string;
  detailLines: string[];
  locationLabel: string;
  serviceDateLabel: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  createdAt: string;
  foodOnly: boolean;
  status: OrderStatus;
  crewClaimed: boolean;
  messages: TrackerMessage[];
  setupPhotoUrl?: string;
  foodEta?: string;
};

function mergeOrders(local: SavedWebOrder[], cloud: CloudOrderSummary[]): DisplayOrder[] {
  const map = new Map<string, DisplayOrder>();
  for (const o of local) {
    map.set(o.id, {
      id: o.id,
      trackingToken: o.trackingToken,
      title: o.title,
      detailLines: o.detailLines ?? [],
      locationLabel: o.locationLabel || "Virginia Beach",
      serviceDateLabel: o.serviceDateLabel || "",
      startTime: o.startTime || "",
      endTime: o.endTime || "",
      totalAmount: o.totalAmount || 0,
      createdAt: o.createdAt,
      foodOnly: o.foodOnly,
      status: "confirmed",
      crewClaimed: false,
      messages: [],
    });
  }
  for (const c of cloud) {
    const prev = map.get(c.id);
    const detailLines =
      c.detailLines?.length > 0 ? c.detailLines : prev?.detailLines?.length ? prev.detailLines : [];
    map.set(c.id, {
      id: c.id,
      trackingToken: c.trackingToken || prev?.trackingToken || "",
      title: c.title || prev?.title || "Order",
      detailLines,
      locationLabel: c.locationLabel || prev?.locationLabel || "Virginia Beach",
      serviceDateLabel: c.serviceDateLabel || prev?.serviceDateLabel || "",
      startTime: c.startTime || prev?.startTime || "",
      endTime: c.endTime || prev?.endTime || "",
      totalAmount: c.totalAmount || prev?.totalAmount || 0,
      createdAt: c.createdAt || prev?.createdAt || new Date().toISOString(),
      foodOnly: c.foodOnly,
      status: c.status,
      crewClaimed: c.crewClaimed,
      messages: prev?.messages ?? [],
      setupPhotoUrl: prev?.setupPhotoUrl,
      foodEta: prev?.foodEta,
    });
  }
  return Array.from(map.values())
    .filter((o) => o.trackingToken)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function OrdersClient() {
  const search = useSearchParams();
  const focusId = search.get("focus");
  const { user, initialized, authRequiredMode } = useCustomerAuth();
  const { openAuthModal } = useAuthModal();
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [extendOrderId, setExtendOrderId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!focusId || loading) return;
    const el = document.getElementById(`order-${focusId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusId, loading, orders.length]);

  const refreshList = useCallback(async () => {
    // When accounts are required, never show another user's browser-cached orders while logged out.
    if (authRequiredMode && !user) {
      clearSavedWebOrders();
      setOrders([]);
      setLoading(false);
      return;
    }

    const local = authRequiredMode ? [] : readSavedWebOrders();
    let cloud: CloudOrderSummary[] = [];
    if (user) {
      const supabase = getSupabaseBrowser();
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      if (session?.access_token) {
        cloud = await fetchCustomerCloudOrders(session.access_token);
        for (const c of cloud) {
          rememberWebOrder({
            id: c.id,
            trackingToken: c.trackingToken,
            title: c.title,
            detailLines: c.detailLines,
            locationLabel: c.locationLabel,
            serviceDateLabel: c.serviceDateLabel,
            startTime: c.startTime,
            endTime: c.endTime,
            totalAmount: c.totalAmount,
            createdAt: c.createdAt,
            foodOnly: c.foodOnly,
          });
        }
      }
    }
    setOrders(mergeOrders(user ? readSavedWebOrders() : local, cloud));
    setLoading(false);
  }, [user, authRequiredMode]);

  useEffect(() => {
    if (!initialized) return;
    void refreshList();
  }, [initialized, refreshList]);

  const pollTargets = useMemo(
    () =>
      orders
        .filter((o) => o.trackingToken && (!isPastStatus(o.status) || o.id === chatOrderId))
        .map((o) => ({ id: o.id, trackingToken: o.trackingToken })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only rebind when ids/tokens/active set change
    [
      orders
        .map((o) => `${o.id}:${o.trackingToken}:${isPastStatus(o.status) ? "p" : "a"}`)
        .join("|"),
      chatOrderId,
    ],
  );

  /** Live poll active orders (+ open chat order). */
  useEffect(() => {
    if (!pollTargets.length) return;
    let cancelled = false;
    const tick = async () => {
      const updates = await Promise.all(
        pollTargets.map(async (o) => {
          const snap = await fetchOrderTracker(o.id, o.trackingToken);
          if (!snap) return null;
          return {
            id: o.id,
            status: parseOrderStatus(snap.order.status),
            crewClaimed: Boolean(snap.order.driver_claim_user_id),
            messages: snap.messages,
            setupPhotoUrl:
              typeof snap.order.setup_photo_url === "string" ? snap.order.setup_photo_url : undefined,
            foodEta: typeof snap.order.food_staff_eta === "string" ? snap.order.food_staff_eta : undefined,
            locationLabel:
              typeof snap.order.location_display_name === "string" && snap.order.location_display_name
                ? snap.order.location_display_name
                : undefined,
            endTime: typeof snap.order.end_time === "string" ? snap.order.end_time : undefined,
            totalAmount:
              typeof snap.order.total_amount === "number"
                ? snap.order.total_amount
                : Number(snap.order.total_amount) || undefined,
          };
        }),
      );
      if (cancelled) return;
      setOrders((prev) =>
        prev.map((o) => {
          const u = updates.find((x) => x?.id === o.id);
          if (!u) return o;
          return {
            ...o,
            status: u.status,
            crewClaimed: u.crewClaimed,
            messages: u.messages,
            setupPhotoUrl: u.setupPhotoUrl || o.setupPhotoUrl,
            foodEta: u.foodEta || o.foodEta,
            locationLabel: u.locationLabel || o.locationLabel,
            endTime: u.endTime || o.endTime,
            totalAmount: u.totalAmount && u.totalAmount > 0 ? u.totalAmount : o.totalAmount,
          };
        }),
      );
    };

    void tick();
    const id = window.setInterval(() => void tick(), chatOrderId ? 4000 : 3500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollTargets, chatOrderId]);

  const active = useMemo(() => orders.filter((o) => !isPastStatus(o.status)), [orders]);
  const past = useMemo(
    () =>
      orders
        .filter((o) => isPastStatus(o.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );
  const chatOrder = orders.find((o) => o.id === chatOrderId) ?? null;
  const extendOrder = orders.find((o) => o.id === extendOrderId) ?? null;

  const handleOrderExtended = (orderId: string, endTime: string, totalAmount: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, endTime, totalAmount }
          : o,
      ),
    );
    const local = readSavedWebOrders().find((o) => o.id === orderId);
    if (local) {
      rememberWebOrder({ ...local, endTime, totalAmount });
    }
    setExtendOrderId(null);
  };

  const sendChat = async () => {
    if (!chatOrder || !draft.trim()) return;
    setSending(true);
    const res = await postOrderChat({
      orderId: chatOrder.id,
      trackingToken: chatOrder.trackingToken,
      message: draft,
    });
    setSending(false);
    if (!res.ok) return;
    setDraft("");
    const snap = await fetchOrderTracker(chatOrder.id, chatOrder.trackingToken);
    if (snap) {
      setOrders((prev) =>
        prev.map((o) => (o.id === chatOrder.id ? { ...o, messages: snap.messages, status: parseOrderStatus(snap.order.status) } : o)),
      );
    }
  };

  if (initialized && authRequiredMode && !user && readSavedWebOrders().length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(200,20%,98%)]">
        <SiteNav />
        <main className="mx-auto max-w-lg px-4 pb-16 pt-28">
          <h1 className="mb-2 text-3xl font-semibold text-[#083b6c]">Your orders</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign in with the same account as the ShoreDrop app to see website and app orders, live tracking, and crew
            chat.
          </p>
          <div className="rounded-3xl border border-border bg-white p-6 text-center shadow-soft">
            <p className="text-sm text-muted-foreground">
              Use the same email and password as the iOS app so everything stays in sync.
            </p>
            <Button
              type="button"
              className="mt-4 w-full rounded-full bg-[#083b6c]"
              onClick={() => openAuthModal({ title: "Sign in to view orders" })}
            >
              Log in / Create account
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(200,20%,98%)]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-[#083b6c]">Your orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live status and crew chat — same as the ShoreDrop app.
            </p>
          </div>
          {!user && authRequiredMode ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => openAuthModal({ title: "Sign in to sync orders" })}
            >
              Log in
            </Button>
          ) : null}
        </div>

        {!user && authRequiredMode && orders.length > 0 ? (
          <div className="mb-8 rounded-3xl border border-border bg-white p-5 text-center shadow-soft">
            <p className="text-sm text-muted-foreground">
              Sign in with your ShoreDrop app account to sync full order history.
            </p>
            <Button
              type="button"
              className="mt-3 rounded-full bg-[#083b6c]"
              onClick={() => openAuthModal({ title: "Sign in to sync all orders" })}
            >
              Log in / Create account
            </Button>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-soft">
            <Package className="mx-auto mb-3 h-10 w-10 text-[#083b6c]/50" />
            <p className="font-semibold text-[#083b6c]">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Book a setup or order food, then track it here.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild className="rounded-full bg-[#083b6c]">
                <Link href="/#services">Browse packages</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/food">Food & drinks</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {active.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Active</h2>
                {active.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onChat={() => setChatOrderId(o.id)}
                    onExtend={() => setExtendOrderId(o.id)}
                  />
                ))}
              </section>
            ) : null}
            {past.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Past</h2>
                {past.map((o) => (
                  <OrderCard key={o.id} order={o} onChat={() => setChatOrderId(o.id)} compact />
                ))}
              </section>
            ) : null}
          </div>
        )}
      </main>

      {chatOrder ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="flex h-[min(85vh,640px)] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-wave sm:rounded-3xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="font-bold text-[#083b6c]">Crew chat</p>
                <p className="text-xs text-muted-foreground">{crewLabel(chatOrder.crewClaimed)}</p>
              </div>
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setChatOrderId(null)}>
                Close
              </Button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {chatOrder.messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Say hi to your crew — they’ll reply here.</p>
              ) : (
                chatOrder.messages.map((m) => {
                  const mine = m.sender_type === "customer";
                  const system = m.sender_type === "system";
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        system
                          ? "mx-auto bg-muted text-center text-muted-foreground"
                          : mine
                            ? "ml-auto bg-[#083b6c] text-white"
                            : "mr-auto bg-[#e6f9ff] text-[#083b6c]",
                      )}
                    >
                      {m.message}
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex gap-2 border-t p-3">
              <Input
                className="h-11 rounded-full"
                placeholder="Message crew…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void sendChat();
                }}
              />
              <Button
                type="button"
                className="rounded-full bg-[#083b6c] px-5"
                disabled={sending || !draft.trim()}
                onClick={() => void sendChat()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ExtendOrderTimeModal
        open={extendOrder !== null}
        onClose={() => setExtendOrderId(null)}
        order={
          extendOrder
            ? {
                id: extendOrder.id,
                trackingToken: extendOrder.trackingToken,
                endTime: extendOrder.endTime,
                serviceDateLabel: extendOrder.serviceDateLabel,
                status: extendOrder.status,
                foodOnly: extendOrder.foodOnly,
              }
            : null
        }
        onExtended={handleOrderExtended}
      />

      <SiteFooter />
    </div>
  );
}

function OrderCard({
  order,
  onChat,
  onExtend,
  compact,
}: {
  order: DisplayOrder;
  onChat: () => void;
  onExtend?: () => void;
  compact?: boolean;
}) {
  const steps = getStatusSteps(order.status, order.foodOnly);
  const serviceDate = parseServiceDateLabel(order.serviceDateLabel);
  const canExtend =
    Boolean(onExtend) &&
    Boolean(serviceDate) &&
    canOfferOrderExtension({
      foodOnly: order.foodOnly,
      status: order.status,
      endTime: order.endTime,
      serviceDate: serviceDate ?? new Date(),
    }).ok;
  return (
    <div
      id={`order-${order.id}`}
      className="rounded-3xl border border-border bg-white p-5 shadow-soft scroll-mt-28"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[#083b6c]">{order.title}</p>
          {order.detailLines.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
              {order.detailLines.map((line, i) => {
                const isPrimary = /^\d+×\s/.test(line);
                return (
                  <li key={`${line}-${i}`} className={cn(isPrimary ? "font-medium text-[#083b6c]" : "pl-3")}>
                    {isPrimary ? line : `· ${line}`}
                  </li>
                );
              })}
            </ul>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {order.serviceDateLabel}
            {order.startTime ? ` · ${order.startTime}` : ""}
            {order.endTime ? ` – ${order.endTime}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">{order.locationLabel}</p>
          <p className="mt-1 text-xs font-medium text-[#3b82b6]">{crewLabel(order.crewClaimed)}</p>
          {order.foodEta ? (
            <p className="mt-1 text-xs text-muted-foreground">ETA: {order.foodEta}</p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-muted-foreground">#{order.id.slice(0, 8)}</p>
          {order.totalAmount > 0 ? (
            <p className="font-semibold text-[#083b6c]">${order.totalAmount.toFixed(2)}</p>
          ) : null}
        </div>
      </div>

      {!compact ? (
        <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.id}
              className={cn(
                "rounded-xl border px-2 py-2 text-center text-[11px] font-semibold",
                s.completed || s.current
                  ? "border-[#083b6c]/30 bg-[#e6f9ff] text-[#083b6c]"
                  : "border-border text-muted-foreground",
              )}
            >
              <span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px]">
                {s.completed ? <Check className="h-3 w-3" /> : s.current ? "•" : ""}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{order.status}</p>
      )}

      {order.setupPhotoUrl ? (
        <img
          src={order.setupPhotoUrl}
          alt="Setup photo"
          className="mt-4 h-40 w-full rounded-2xl object-cover"
        />
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" className="rounded-full bg-[#083b6c]" onClick={onChat}>
          <MessageCircle className="mr-1.5 h-4 w-4" />
          Crew chat
          {order.messages.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">{order.messages.length}</span>
          ) : null}
        </Button>
        {canExtend ? (
          <Button type="button" variant="outline" className="rounded-full border-[#083b6c] text-[#083b6c]" onClick={onExtend}>
            <Clock className="mr-1.5 h-4 w-4" />
            Add more beach time
          </Button>
        ) : null}
      </div>
    </div>
  );
}
