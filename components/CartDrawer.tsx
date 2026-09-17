"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";
import { Separator } from "./separator";
import { useFoodBag } from "../contexts/FoodBagContext";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import { useAuthModal } from "../contexts/AuthModalContext";
import { cn } from "../lib/utils";

type CartDrawerProps = {
  triggerClassName?: string;
};

export default function CartDrawer({ triggerClassName }: CartDrawerProps) {
  const { lines, setQty, subtotal, bagCount } = useFoodBag();
  const { user, authRequiredMode } = useCustomerAuth();
  const { openAuthModal } = useAuthModal();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const requireAuthThenGo = (href: string, title: string) => {
    if (authRequiredMode && !user) {
      setOpen(false);
      openAuthModal({ title });
      return;
    }
    go(href);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative rounded-full p-2 text-[#083b6c] hover:bg-[#e6f9ff]",
            triggerClassName,
          )}
          aria-label={`Your cart${bagCount ? `, ${bagCount} items` : ""}`}
        >
          <ShoppingBag className="h-5 w-5" />
          {bagCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#083b6c] px-1 text-[10px] font-bold text-white">
              {bagCount > 99 ? "99+" : bagCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[#083b6c]">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({bagCount} {bagCount === 1 ? "item" : "items"})
          </SheetTitle>
          <SheetDescription>Review food and continue to packages or checkout.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          {bagCount === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4e8]">
                <ShoppingBag className="h-8 w-8 text-[#083b6c]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#083b6c]">Your cart is empty</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Add beach packages or food from local partners to get started with your perfect beach day.
              </p>
              <div className="flex w-full max-w-xs flex-col gap-2">
                <Button
                  className="rounded-full bg-[#083b6c] hover:bg-[#0a4a85]"
                  onClick={() => go("/#services")}
                >
                  Browse Packages
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => go("/food")}>
                  Browse Food & Drinks
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Food & drinks
                </p>
                {lines.map((line) => (
                  <div
                    key={line.key}
                    className="flex gap-3 rounded-2xl border border-border bg-white p-3 shadow-soft"
                  >
                    <img
                      src={line.image}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#083b6c]">{line.name}</p>
                          <p className="text-xs text-muted-foreground">{line.restaurantName}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-[#083b6c]">
                          ${(line.price * line.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                          onClick={() => setQty(line.key, line.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          {line.quantity <= 1 ? (
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Minus className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                          onClick={() => setQty(line.key, line.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Food subtotal</span>
                  <span className="font-semibold text-[#083b6c]">${subtotal.toFixed(2)}</span>
                </div>
                <Separator />
                <Button
                  className="w-full rounded-full bg-[#083b6c] hover:bg-[#0a4a85]"
                  onClick={() => requireAuthThenGo("/food/checkout", "Sign in to order food")}
                >
                  Checkout food
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[#083b6c] text-[#083b6c]"
                  onClick={() => go("/#services")}
                >
                  Add beach packages
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Packages + food can checkout together in booking.{" "}
                  <button
                    type="button"
                    className="font-semibold text-[#3b82b6] underline-offset-2 hover:underline"
                    onClick={() => requireAuthThenGo("/booking", "Sign in to book")}
                  >
                    Continue to booking
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
