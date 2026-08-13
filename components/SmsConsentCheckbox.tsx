"use client";

import Link from "next/link";
import { Checkbox } from "./checkbox";
import { SMS_CONSENT_CHECKBOX_LABEL } from "../lib/ordering/smsConsent";

interface SmsConsentCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** Unchecked-by-default SMS opt-in shown next to the checkout phone field (A2P CTA). */
const SmsConsentCheckbox = ({ id, checked, onCheckedChange }: SmsConsentCheckboxProps) => {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-[#f7fbfd] p-3">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-0.5 h-5 w-5"
        />
        <span className="text-[13px] leading-snug text-foreground">{SMS_CONSENT_CHECKBOX_LABEL}</span>
      </label>
      <p className="pl-7 text-[11px] leading-relaxed text-muted-foreground">
        Message frequency varies by order. Message and data rates may apply. Reply STOP to opt out; HELP for help.
        Mobile numbers are not shared with third parties or affiliates for marketing.{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>
      </p>
    </div>
  );
};

export default SmsConsentCheckbox;
