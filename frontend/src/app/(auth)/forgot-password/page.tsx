"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordFormSchema, ForgotPasswordFormValues } from "@/lib/validators";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const { show } = useToast();
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordFormSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", values);
      setSent(true);
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="mb-2 font-serif text-2xl">Check your email</h1>
        <p className="text-sm text-ink/60">
          If that address is registered with Ruth, a password reset link is on its way.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-1 font-serif text-2xl">Reset your password</h1>
      <p className="mb-6 text-sm text-ink/50">We'll email you a link to get back in.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/50">
        <Link href="/login" className="text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
