"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-2xl">
        {status === "pending" ? "Verifying your email…" : status === "success" ? "Email verified" : "Verification link expired"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink/50">
        {status === "success"
          ? "Your Ruth account is now fully set up."
          : status === "error"
          ? "This link is invalid or has expired. You can request a new one from your account settings."
          : ""}
      </p>
      <Link href="/login" className="btn-primary mt-6">Continue to Ruth</Link>
    </main>
  );
}
