"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormValues } from "@/lib/validators";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const { login } = useAuth();
  const { show } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await login(values.identifier, values.password);
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't sign you in. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-1 font-serif text-2xl">Welcome back</h1>
      <p className="mb-6 text-sm text-ink/50">Sign in to keep documenting yourself.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email or username" {...register("identifier")} error={errors.identifier?.message} />
        <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-ink/50 hover:text-ink">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/50">
        New to Ruth?{" "}
        <Link href="/signup" className="text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </>
  );
}
