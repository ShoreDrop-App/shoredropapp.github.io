"use client";

import { useState } from "react";
import SmsConsentCheckbox from "./SmsConsentCheckbox";

/** Interactive checkout CTA preview for the public /sms page (A2P reviewers). */
const SmsConsentPreview = () => {
  const [checked, setChecked] = useState(false);
  return <SmsConsentCheckbox id="sms-consent-preview" checked={checked} onCheckedChange={setChecked} />;
};

export default SmsConsentPreview;
