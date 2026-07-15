"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Lock, Mail } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal";
import { ChangeEmailModal } from "@/components/settings/ChangeEmailModal";

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.profile.displayName ?? "");
      setUsername(user.username ?? "");
      setBio(user.profile.bio ?? "");
      setPhotoPreview(user.profile.profilePhoto ?? null);
    }
  }, [user]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("photo", file);
      await api.post("/profile/photo", formData, { headers: { "Content-Type": "multipart/form-data" } });
      show("Profile photo updated.");
    } catch {
      show("Couldn't update your photo. Please try again.", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch("/profile", { displayName, bio, username });
      show("Profile updated.");
      if (username !== user?.username) {
        router.push(`/profile/${username}`);
      } else {
        router.back();
      }
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't update your profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Topbar title="Edit Profile" />
      <div className="mx-auto max-w-lg px-4 pb-24 sm:px-6 md:px-10">
        <Card>
          <div className="mb-6 flex flex-col items-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-accent text-2xl font-serif text-ink">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-ink p-1.5 text-paper"
                aria-label="Change profile photo"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} />
            <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={280} />

            <Button type="submit" isLoading={isSubmitting} className="mt-2">
              Save changes
            </Button>
          </form>
        </Card>

        <Card className="mt-5">
          <h3 className="mb-4 font-serif text-lg">Account</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setPasswordModalOpen(true)}>
              <Lock size={14} /> Change password
            </Button>
            <Button variant="secondary" onClick={() => setEmailModalOpen(true)}>
              <Mail size={14} /> Change email
            </Button>
          </div>
        </Card>
      </div>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <ChangeEmailModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  );
}
