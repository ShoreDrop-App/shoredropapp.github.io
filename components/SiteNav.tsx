"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { FaApple } from "react-icons/fa";
import CartDrawer from "./CartDrawer";
import { IOS_APP_STORE_URL } from "../lib/app-links";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import { useAuthModal } from "../contexts/AuthModalContext";

const PRIMARY_LINKS = [
  { href: "/#packages", label: "Packages" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/food", label: "Food & Drinks" },
  { href: "/private-events", label: "Private Events" },
  { href: "/kiosk", label: "For Hotels" },
  { href: "/blog", label: "Blog" },
] as const;

const SECONDARY_LINKS = [
  { href: "/orders", label: "Orders" },
  { href: "/mission", label: "Our mission" },
  { href: "/support", label: "Support" },
] as const;

const SiteNav = () => {
  const { user, initialized, authRequiredMode, signOut } = useCustomerAuth();
  const { openAuthModal } = useAuthModal();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  const showAccount = authRequiredMode && initialized;

  const accountControl = showAccount ? (
    user ? (
      <div className="hidden items-center gap-3 sm:flex">
        <span className="max-w-[9rem] truncate text-xs text-ink-muted" title={user.email ?? undefined}>
          {user.email}
        </span>
        <button
          type="button"
          className="text-sm font-medium text-ink hover:text-navy"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    ) : (
      <button
        type="button"
        className="hidden text-sm font-medium text-ink hover:text-navy sm:inline"
        onClick={() => openAuthModal({ title: "Sign in to ShoreDrop" })}
      >
        Log in
      </button>
    )
  ) : null;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-line/80 bg-sand-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[1280px] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <img src="/assets/logo-mark.png" alt="" className="h-9 w-auto" />
          <span className="font-display text-[1.6rem] leading-none tracking-[-0.01em] text-ink">ShoreDrop</span>
        </Link>

        <div className="ml-6 hidden items-center gap-7 xl:flex">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[14px] text-ink/80 transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link href="/orders" className="hidden text-sm text-ink/80 hover:text-ink xl:inline">
            Orders
          </Link>
          <a
            href={IOS_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get the ShoreDrop iOS app"
            className="hidden rounded-full p-2 text-ink hover:bg-sand md:inline-flex"
          >
            <FaApple size={17} />
          </a>
          <CartDrawer triggerClassName="text-ink hover:bg-sand" />
          {accountControl}
          <Link
            href="/booking"
            className="whitespace-nowrap rounded-[4px] bg-navy px-4 py-2.5 text-sm font-medium text-sand-surface transition-colors hover:bg-navy-deep sm:px-5"
          >
            Book now
          </Link>
          <button
            type="button"
            className="-mr-2 rounded-full p-2 text-ink hover:bg-sand xl:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="site-mobile-menu"
          className="h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-line bg-sand-bg xl:hidden"
        >
          <div className="mx-auto flex max-w-[1280px] flex-col px-5 pb-10 pt-4 sm:px-8">
            <ul>
              {PRIMARY_LINKS.map((l) => (
                <li key={l.href} className="border-b border-line">
                  <Link
                    href={l.href}
                    className="block py-4 font-display text-[1.6rem] text-ink"
                    onClick={() => setMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-[15px] text-ink-muted">
              {SECONDARY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-ink" onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={IOS_APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
                  <FaApple size={15} /> Get the app
                </a>
              </li>
            </ul>
            {showAccount ? (
              <div className="mt-8 border-t border-line pt-6 text-[15px]">
                {user ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="truncate text-ink-muted">{user.email}</span>
                    <button
                      type="button"
                      className="font-medium text-ink"
                      onClick={() => {
                        setMenuOpen(false);
                        void signOut();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="font-medium text-ink"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal({ title: "Sign in to ShoreDrop" });
                    }}
                  >
                    Log in
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default SiteNav;
