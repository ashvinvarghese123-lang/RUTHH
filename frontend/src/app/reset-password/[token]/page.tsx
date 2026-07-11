"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { show } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      show("Password updated. Please sign in.");
      router.push("/login");
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't reset your password. The link may have expired.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-serif text-2xl">Set a new password</h1>
        <p className="mb-6 text-center text-sm text-ink/50">Choose something you haven't used before.</p>
        <form onSubmit={handleSubmit} className="paper-card flex flex-col gap-4 p-6">
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isSubmitting}>Update password</Button>
        </form>
      </div>
    </main>
  );
}
