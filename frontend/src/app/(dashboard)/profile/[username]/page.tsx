"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Camera, Settings as SettingsIcon, Share2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { FriendButton } from "@/components/friends/FriendButton";
import { JournalCard } from "@/components/journal/JournalCard";
import { JournalOwnerMenu } from "@/components/journal/JournalOwnerMenu";
import { PhotoLightbox } from "@/components/profile/PhotoLightbox";
import { useProfileJournals, useProfilePhotos } from "@/hooks/useProfile";
import { api, unwrap } from "@/lib/api";
import { Profile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface ProfileStats {
  journalCount: number;
  photoCount: number;
  sharedCount: number;
  friendCount: number;
}

type Tab = "journals" | "gallery";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<Tab>("journals");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["profile", username],
    queryFn: () =>
      unwrap<{ profile: Profile; email?: string; stats: ProfileStats; isOwner: boolean }>(
        api.get(`/profile/${username}`)
      ),
  });

  const { data: journalsData, isLoading: journalsLoading } = useProfileJournals(username);
  const [year, month] = monthFilter ? monthFilter.split("-") : [undefined, undefined];
  const { data: photosData, isLoading: photosLoading, refetch: refetchPhotos } = useProfilePhotos(
    tab === "gallery" ? username : undefined,
    year,
    month
  );

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

  async function handleShareProfile() {
    const url = `${window.location.origin}/profile/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${username} on Ruth`, url });
        return;
      } catch {
        // user cancelled the share sheet — fall through to clipboard copy
      }
    }
    navigator.clipboard.writeText(url);
    show("Profile link copied.");
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

  // Build the last 12 months for the gallery filter dropdown
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { value: `${d.getFullYear()}-${d.getMonth() + 1}`, label: d.toLocaleString("default", { month: "long", year: "numeric" }) };
  });

  return (
    <div>
      <Topbar title="Profile" />
      <div className="mx-auto max-w-xl px-4 pb-24 sm:px-6 md:px-10">
        <div className="text-center">
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

          <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">
            <Stat label="Journals" value={stats.journalCount} />
            <Stat label="Photos" value={stats.photoCount} />
            <Stat label="Friends" value={stats.friendCount} />
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {isOwner ? (
              <>
                <Link href="/settings/edit-profile" className="btn-secondary">
                  Edit Profile
                </Link>
                <button onClick={handleShareProfile} className="btn-secondary">
                  <Share2 size={15} /> Share
                </button>
                <Link href="/settings" className="flex items-center justify-center rounded-pill border border-ink/15 px-3 py-3 hover:bg-ink/5" aria-label="Settings">
                  <SettingsIcon size={16} />
                </Link>
              </>
            ) : (
              <>
                <FriendButton username={username} />
                <button onClick={handleShareProfile} className="btn-secondary">
                  <Share2 size={15} /> Share
                </button>
              </>
            )}
          </div>
        </div>

        {/* ---- Tabs ---- */}
        <div className="mt-8 flex border-b border-ink/10">
          <button
            onClick={() => setTab("journals")}
            className={clsx(
              "flex-1 border-b-2 py-3 text-sm font-medium transition-colors",
              tab === "journals" ? "border-ink text-ink" : "border-transparent text-ink/40"
            )}
          >
            Journals
          </button>
          <button
            onClick={() => setTab("gallery")}
            className={clsx(
              "flex-1 border-b-2 py-3 text-sm font-medium transition-colors",
              tab === "gallery" ? "border-ink text-ink" : "border-transparent text-ink/40"
            )}
          >
            Gallery
          </button>
        </div>

        {/* ---- Journals tab ---- */}
        {tab === "journals" && (
          <div className="mt-6">
            {journalsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
              </div>
            ) : journalsData?.entries?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {journalsData.entries.map((entry) => (
                  <JournalCard
                    key={entry.id}
                    entry={entry}
                    ownerMenu={isOwner ? <JournalOwnerMenu entry={entry} /> : undefined}
                  />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-ink/40">
                {isOwner ? "You haven't written anything yet." : "No journals to show here."}
              </p>
            )}
          </div>
        )}

        {/* ---- Gallery tab ---- */}
        {tab === "gallery" && (
          <div className="mt-6">
            <div className="mb-4 flex justify-end">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="rounded-lg border border-ink/10 bg-card px-2 py-1 text-xs"
              >
                <option value="">All time</option>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {photosLoading ? (
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
              </div>
            ) : photosData?.photos?.length ? (
              <div className="grid grid-cols-3 gap-1">
                {photosData.photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightboxIndex(i)}
                    className="aspect-square overflow-hidden bg-ink/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-ink/40">No photos here yet.</p>
            )}

            {lightboxIndex !== null && photosData?.photos && (
              <PhotoLightbox
                photos={photosData.photos}
                startIndex={lightboxIndex}
                isOwner={isOwner}
                onClose={() => setLightboxIndex(null)}
                onDeleted={() => refetchPhotos()}
              />
            )}
          </div>
        )}
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
