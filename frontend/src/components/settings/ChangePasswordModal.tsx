"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChangePassword } from "@/hooks/useAccount";
import { useToast } from "@/components/ui/Toast";

export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const changePassword = useChangePassword();
  const { show } = useToast();

  function handleClose() {
    setCurrentPassword("");
    setNewPassword("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      show("Password updated. You've been signed out of other devices.");
      handleClose();
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't change your password.", "error");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Change password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Button type="submit" isLoading={changePassword.isPending} className="mt-2">
          Update password
        </Button>
      </form>
    </Modal>
  );
}
