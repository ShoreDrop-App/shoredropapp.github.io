"use client";

import Link from "next/link";
import { FaApple } from "react-icons/fa";
import { Button } from "./button";
import CartDrawer from "./CartDrawer";
import { IOS_APP_STORE_URL } from "../lib/app-links";

const SiteNav = () => {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-white/85 backdrop-blur-md">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/lovable-uploads/dbf79a37-c86d-49c9-af90-9fe7b44058fc.jpg"
            alt="ShoreDrop logo"
            className="h-11 w-11 rounded-full"
          />
          <span className="text-xl font-semibold text-[#083b6c]">ShoreDrop</span>
        </Link>

        <div className="ml-auto hidden items-center gap-5 lg:flex">
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-[#083b6c]">
            Features
          </a>
          <a href="/#services" className="text-sm font-medium text-muted-foreground hover:text-[#083b6c]">
            Services
          </a>
          <Link href="/private-events" className="text-sm font-medium text-muted-foreground hover:text-[#083b6c]">
            Private Events
          </Link>
          <Link href="/kiosk" className="text-sm font-medium text-muted-foreground hover:text-[#083b6c]">
            Kiosk
          </Link>
          <Link
            href="/food"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#083b6c]"
          >
            Food & Drinks
            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#083b6c]">
              New
            </span>
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-[#083b6c]">
            Blog
          </Link>
          <Link href="/mission" className="text-sm font-medium text-muted-foreground hover:text-[#083b6c]">
            Mission
          </Link>
          <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-[#083b6c]">
            Orders
          </Link>
          <a
            href={IOS_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#083b6c]"
          >
            <FaApple size={15} />
            Get App
          </a>
          <CartDrawer />
          <Button asChild size="sm" className="rounded-full bg-[#083b6c] px-5 hover:bg-[#0a4a85]">
            <Link href="/#services">Book Now</Link>
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <a
            href={IOS_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get the ShoreDrop iOS app"
            className="rounded-full p-2 text-[#083b6c] hover:bg-[#e6f9ff]"
          >
            <FaApple size={18} />
          </a>
          <Link
            href="/orders"
            className="rounded-full px-2 py-2 text-xs font-semibold text-[#083b6c] hover:bg-[#e6f9ff]"
          >
            Orders
          </Link>
          <CartDrawer />
          <Button asChild size="sm" className="rounded-full bg-[#083b6c] hover:bg-[#0a4a85]">
            <Link href="/#services">Book Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default SiteNav;
