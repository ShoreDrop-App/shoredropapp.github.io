"use client";

import type { ReactNode } from "react";
import { AuthModalProvider } from "../contexts/AuthModalContext";
import { CustomerAuthProvider } from "../contexts/CustomerAuthContext";
import { FoodBagProvider } from "../contexts/FoodBagContext";
import CustomerAuthModal from "./auth/CustomerAuthModal";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <AuthModalProvider>
        <FoodBagProvider>
          {children}
          <CustomerAuthModal />
        </FoodBagProvider>
      </AuthModalProvider>
    </CustomerAuthProvider>
  );
}
