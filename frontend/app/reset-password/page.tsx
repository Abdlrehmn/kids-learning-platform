"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import WorldNavigation from "@/components/WorldNavigation";
import { api } from "@/lib/api";
import "../account/account.css";

export default function ResetPasswordPage() {
  const [uid] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.hash.slice(1)).get("uid") || "");
  const [token] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await api<{ detail: string }>("auth/password-reset/confirm/", { method: "POST", body: JSON.stringify({ uid, token, password }) });
      setMessage(response.detail); setDone(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update the password."); }
  }
  return <div className="account-page"><WorldNavigation /><main className="account-main"><section className="account-panel"><h1>Choose a new password</h1>{!done && <form className="account-form" onSubmit={submit}><label>New password<input type="password" minLength={8} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="account-primary">Update password</button></form>}{message && <p className="account-message" role="status">{message}</p>}<Link href="/account">Back to sign in</Link></section></main></div>;
}
