"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, DraftingCompass, LockKeyhole } from "lucide-react";

export default function ResetPasswordPage() {
  const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || "" : "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (password !== confirm) { setError("Passwords do not match."); return; } setLoading(true); try { const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setMessage(result.message); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to reset your password."); } finally { setLoading(false); } }
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 blueprint-grid p-4"><div className="w-full max-w-md"><Link href="/" className="inline-flex items-center gap-2 mb-4 text-sm font-semibold text-blueprint-700">← Back to home</Link><div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"><div className="text-center mb-8"><div className="w-14 h-14 bg-gradient-to-br from-blueprint-600 to-blueprint-800 rounded-xl flex items-center justify-center mx-auto mb-4"><DraftingCompass className="w-7 h-7 text-white" /></div><h1 className="font-display text-2xl font-bold text-gray-900">Create a new password</h1><p className="text-gray-500 text-sm mt-1">Secure your Blueprints Club account.</p></div>{message ? <div className="text-center py-4"><CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" /><p className="text-gray-700">{message}</p><Link href="/login" className="inline-block mt-5 text-blueprint-600 font-semibold">Back to sign in</Link></div> : <form onSubmit={submit} className="space-y-4"><input required minLength={8} type="password" placeholder="New password (8+ characters)" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200" /><input required minLength={8} type="password" placeholder="Confirm new password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200" />{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={loading || !token} className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"><LockKeyhole className="w-5 h-5" />{loading ? "Updating..." : "Update password"}</button></form>}</div></div></div>;
}
