"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WorldNavigation from "@/components/WorldNavigation";
import { api } from "@/lib/api";
import "../account/account.css";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Checking your verification link…");
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    void Promise.resolve().then(() => {
      if (!token) throw new Error("This verification link is incomplete.");
      return api<{ detail: string }>("auth/verify-email/", { method: "POST", body: JSON.stringify({ token }) });
    })
      .then((result) => setMessage(result.detail))
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "This verification link is invalid or expired."));
  }, []);
  return <div className="account-page"><WorldNavigation /><main className="account-main"><section className="account-panel"><h1>Email verification</h1><p className="account-message" role="status">{message}</p><Link href="/account">Continue to family account</Link></section></main></div>;
}
