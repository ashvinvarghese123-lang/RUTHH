"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Mail, Ban, Link2, LogOut } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api, unwrap } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal";
import { ChangeEmailModal } from "@/components/settings/ChangeEmailModal";
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";
import { VISIBILITY_OPTIONS, Visibility } from "@/types";

interface SettingsShape {
  language: string;
  darkMode: boolean;
  writingReminder: boolean;
  reminderHour: number;
  memoryReminders: boolean;
  emailNotifications: boolean;
  defaultVisibility: Visibility;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { show } = useToast();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: () => unwrap<{ settings: SettingsShape }>(api.get("/settings")),
  });

  const [settings, setSettings] = useState<SettingsShape | null>(null);
  useEffect(() => { if (data?.settings) setSettings(data.settings); }, [data]);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  async function save(patch: Partial<SettingsShape>) {
    const next = { ...settings!, ...patch };
    setSettings(next);
    await api.patch("/settings", patch);
  }

  async function handleExport() {
    const res = await api.get("/settings/export");
    const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ruth-export.json";
    a.click();
    URL.revokeObjectURL(url);
    show("Your data export has started downloading.");
  }

  return (
    <div>
      <Topbar title="Settings" />
      <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 md:px-10">
        <Card className="mb-5">
          <h3 className="mb-1 font-serif text-lg">Account</h3>
          <p className="mb-4 text-sm text-ink/50">{user?.email} · @{user?.username}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setPasswordModalOpen(true)}>
              <Lock size={14} /> Change password
            </Button>
            <Button variant="secondary" onClick={() => setEmailModalOpen(true)}>
              <Mail size={14} /> Change email
            </Button>
          </div>
        </Card>

        <Card className="mb-5">
          <h3 className="mb-4 font-serif text-lg">Preferences</h3>

          {settings && (
            <div className="flex flex-col gap-4 text-sm">
              <RowToggle
                label="Writing reminders"
                checked={settings.writingReminder}
                onChange={(v) => save({ writingReminder: v })}
              />
              <RowToggle
                label="Memory reminders"
                checked={settings.memoryReminders}
                onChange={(v) => save({ memoryReminders: v })}
              />
              <RowToggle
                label="Email notifications"
                checked={settings.emailNotifications}
                onChange={(v) => save({ emailNotifications: v })}
              />
              <div className="flex items-center justify-between">
                <span>Dark mode</span>
                <span className="text-xs text-ink/35">Coming soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Language</span>
                <select
                  value={settings.language}
                  onChange={(e) => save({ language: e.target.value })}
                  className="rounded-lg border border-ink/10 bg-card px-2 py-1 text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </div>
          )}
        </Card>

        <Card className="mb-5">
          <h3 className="mb-1 font-serif text-lg">Privacy</h3>
          <p className="mb-4 text-sm text-ink/50">Default privacy for new journal entries.</p>
          {settings && (
            <div className="flex flex-wrap gap-2">
              {VISIBILITY_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  onClick={() => save({ defaultVisibility: v.value })}
                  className={`rounded-pill border px-3 py-1.5 text-xs transition-colors ${
                    settings.defaultVisibility === v.value
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 text-ink/60 hover:bg-ink/5"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="mb-5">
          <h3 className="mb-4 font-serif text-lg">More</h3>
          <div className="flex flex-col divide-y divide-ink/8 text-sm">
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-ink/70"><Ban size={15} /> Blocked users</span>
              <span className="text-xs text-ink/35">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-ink/70"><Link2 size={15} /> Linked accounts</span>
              <span className="text-xs text-ink/35">Coming soon</span>
            </div>
          </div>
        </Card>

        <Card className="mb-5">
          <h3 className="mb-1 font-serif text-lg">Privacy &amp; data</h3>
          <p className="mb-4 text-sm text-ink/50">Export a copy of everything you've written on Ruth.</p>
          <Button variant="secondary" onClick={handleExport}>Export my data</Button>
        </Card>

        <Card className="mb-5">
          <Button variant="secondary" onClick={logout} className="w-full">
            <LogOut size={15} /> Log out
          </Button>
        </Card>

        <Card className="border-red-200">
          <h3 className="mb-1 font-serif text-lg text-red-600">Delete account</h3>
          <p className="mb-4 text-sm text-ink/50">
            This permanently deletes your account and every journal entry. There's no undo.
          </p>
          <Button onClick={() => setDeleteModalOpen(true)} variant="danger">
            Delete my account
          </Button>
        </Card>
      </div>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <ChangeEmailModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}

function RowToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-pill transition-colors ${checked ? "bg-ink" : "bg-ink/15"}`}
        aria-pressed={checked}
      >
        <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-paper transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
