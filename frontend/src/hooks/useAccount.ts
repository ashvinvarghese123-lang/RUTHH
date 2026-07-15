"use client";

import { useMutation } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      unwrap(api.post("/auth/change-password", payload)),
  });
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: (payload: { newEmail: string; password: string }) =>
      unwrap(api.post("/auth/change-email", payload)),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (payload: { password: string; reason?: string }) =>
      unwrap(api.delete("/settings/account", { data: payload })),
  });
}
