"use client";

import { useState } from "react";
import { Link2, Mail, User, Copy, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateShare, useSharesForEntry, useRevokeShare } from "@/hooks/useShare";
import { useToast } from "@/components/ui/Toast";
import { PermissionLevel } from "@/types";

const PERMISSIONS: { value: PermissionLevel; label: string }[] = [
  { value: "VIEW_ONLY", label: "View only" },
  { value: "COMMENT", label: "Can comment" },
  { value: "CLOSE_FRIEND", label: "Close friend" },
  { value: "FAMILY", label: "Family" },
  { value: "PARTNER", label: "Partner" },
];

export function ShareModal({ open, onClose, journalEntryId }: { open: boolean; onClose: () => void; journalEntryId: string }) {
  const [mode, setMode] = useState<"username" | "email" | "link">("username");
  const [identifier, setIdentifier] = useState("");
  const [permission, setPermission] = useState<PermissionLevel>("VIEW_ONLY");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const { data } = useSharesForEntry(journalEntryId);
  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();
  const { show } = useToast();

  async function handleShare() {
    try {
      const payload: any = { journalEntryId, permission };
      if (mode === "username") payload.username = identifier;
      if (mode === "email") payload.email = identifier;
      if (mode === "link") payload.generateLink = true;

      const result = await createShare.mutateAsync(payload);
      if (result.shareLink) {
        setGeneratedLink(result.shareLink);
      } else {
        show("This page has been shared.");
        setIdentifier("");
      }
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't share this page. Please try again.", "error");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Share this page">
      <div className="mb-4 flex flex-wrap gap-2">
        <TabButton active={mode === "username"} onClick={() => setMode("username")} icon={<User size={14} />} label="Username" />
        <TabButton active={mode === "email"} onClick={() => setMode("email")} icon={<Mail size={14} />} label="Email" />
        <TabButton active={mode === "link"} onClick={() => setMode("link")} icon={<Link2 size={14} />} label="Private link" />
      </div>

      {mode !== "link" ? (
        <Input
          placeholder={mode === "username" ? "their_username" : "them@example.com"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      ) : generatedLink ? (
        <div className="flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 text-sm">
          <span className="truncate">{generatedLink}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedLink);
              show("Link copied.");
            }}
            aria-label="Copy link"
          >
            <Copy size={14} />
          </button>
        </div>
      ) : (
        <p className="text-sm text-ink/50">Generate a private link only people you send it to can open.</p>
      )}

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-ink/60">Permission level</p>
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as PermissionLevel)}
          className="input-field"
        >
          {PERMISSIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <Button onClick={handleShare} isLoading={createShare.isPending} className="mt-4 w-full">
        {mode === "link" ? "Generate link" : "Share page"}
      </Button>

      {!!data?.shares?.length && (
        <div className="mt-6 border-t border-ink/8 pt-4">
          <p className="mb-2 text-xs font-medium text-ink/60">Shared with</p>
          <div className="flex flex-col gap-2">
            {data.shares.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.recipient?.profile?.displayName ?? s.recipientEmail ?? "Private link"}</span>
                <button
                  onClick={() => revokeShare.mutate(s.id)}
                  className="text-ink/40 hover:text-red-500"
                  aria-label="Revoke access"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs transition-colors " +
        (active ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:bg-ink/5")
      }
    >
      {icon}
      {label}
    </button>
  );
}
