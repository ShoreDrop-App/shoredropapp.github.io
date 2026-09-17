"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog";
import { useAuthModal } from "../../contexts/AuthModalContext";
import CustomerAuthPanel from "./CustomerAuthPanel";

export default function CustomerAuthModal() {
  const { open, title, closeAuthModal } = useAuthModal();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAuthModal();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-md sm:rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Sign in or create a ShoreDrop account. Same login works in the iOS app.
          </DialogDescription>
        </DialogHeader>
        <CustomerAuthPanel title={title} onAuthenticated={closeAuthModal} />
      </DialogContent>
    </Dialog>
  );
}
