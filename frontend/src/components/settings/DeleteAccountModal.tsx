"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useDeleteAccount } from "@/hooks/useAccount";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";

export function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const deleteAccount = useDeleteAccount();
  const { show } = useToast();
  const { logout } = useAuth();

  function handleClose() {
    setStep("warning");
    setPassword("");
    setReason("");
    onClose();
  }

  async function handleDelete() {
    if (!password) {
      show("Enter your password to confirm.", "error");
      return;
    }
    try {
      await deleteAccount.mutateAsync({ password, reason: reason || undefined });
      show("Your account has been permanently deleted.");
      logout();
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't delete your account. Please try again.", "error");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Delete account">
      {step === "warning" ? (
        <>
          <p className="text-sm leading-relaxed text-ink/70">
            Deleting your account is <strong>permanent</strong>. Your journals, photos, comments, likes,
            and profile will be permanently removed and cannot be recovered.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="danger" onClick={() => setStep("confirm")}>Continue</Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <Input
              label="Confirm your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Textarea
              label="Why are you leaving? (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteAccount.isPending}>
              Permanently delete my account
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
