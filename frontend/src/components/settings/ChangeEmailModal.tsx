"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChangeEmail } from "@/hooks/useAccount";
import { useToast } from "@/components/ui/Toast";

export function ChangeEmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const changeEmail = useChangeEmail();
  const { show } = useToast();

  function handleClose() {
    setNewEmail("");
    setPassword("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await changeEmail.mutateAsync({ newEmail, password });
      show("Email updated. Check your inbox to verify it.");
      handleClose();
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't change your email.", "error");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Change email">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="New email address"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <Input
          label="Confirm your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-xs text-ink/40">
          You'll need to verify your new email address before it's fully active.
        </p>
        <Button type="submit" isLoading={changeEmail.isPending} className="mt-2">
          Update email
        </Button>
      </form>
    </Modal>
  );
}
