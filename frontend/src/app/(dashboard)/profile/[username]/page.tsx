"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, unwrap } from "@/lib/api";
import { Profile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["profile", username],
    queryFn: () =>
      unwrap<{ profile: Profile; stats: { journalCount: number; photoCount: number; sharedCount: number }; isOwner: boolean }>(
        api.get(`/profile/${username}`)
      ),
  });

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      await api.post("/profile/photo", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await refetch();
      show("Profile photo updated.");
    } catch {
      show("Couldn't update your photo. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-10 sm:px-6">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }
  if (!data) return null;

  const { profile, stats, isOwner } = data;

  return (
    <div>
      <Topbar title="Profile" />
      <div className="mx-auto max-w-xl px-4 pb-24 text-center sm:px-6 md:px-10">
        <div className="relative mx-auto w-fit">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-accent text-3xl font-serif text-ink">
            {profile.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              profile.displayName.charAt(0).toUpperCase()
            )}
          </div>
          {isOwner && (
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full bg-ink p-1.5 text-paper"
              aria-label="Change profile photo"
              disabled={uploading}
            >
              <Camera size={13} />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
        </div>

        <h1 className="mt-4 font-serif text-2xl">{profile.displayName}</h1>
        <p className="text-sm text-ink/45">@{username}</p>
        {profile.bio && <p className="mx-auto mt-3 max-w-sm text-sm text-ink/60">{profile.bio}</p>}

        <div className="mx-auto mt-8 grid max-w-xs grid-cols-3 gap-4">
          <Stat label="Journals" value={stats.journalCount} />
          <Stat label="Photos" value={stats.photoCount} />
          <Stat label="Shared" value={stats.sharedCount} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-serif text-xl">{value}</p>
      <p className="text-xs text-ink/45">{label}</p>
    </div>
  );
}
