"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Lock, Users, Globe, X } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MoodSelector } from "@/components/journal/MoodSelector";
import { PhotoUploader } from "@/components/journal/PhotoUploader";
import { AIWriterPanel } from "@/components/journal/AIWriterPanel";
import { RichTextEditor } from "@/components/journal/RichTextEditor";
import { useToast } from "@/components/ui/Toast";
import { api, unwrap } from "@/lib/api";
import { JournalEntry, Mood, Photo, Visibility } from "@/types";

const AUTOSAVE_DELAY = 1500;

const VISIBILITY_CHOICES: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: "PUBLIC", label: "Public", icon: <Globe size={14} /> },
  { value: "FRIENDS", label: "Friends", icon: <Users size={14} /> },
  { value: "PRIVATE", label: "Private", icon: <Lock size={14} /> },
];

export function JournalEditor({ existingEntry }: { existingEntry?: JournalEntry }) {
  const router = useRouter();
  const { show } = useToast();

  const [id, setId] = useState<string | undefined>(existingEntry?.id);
  const [title, setTitle] = useState(existingEntry?.title ?? "");
  const [entryDate, setEntryDate] = useState(
    (existingEntry?.entryDate ?? new Date().toISOString()).slice(0, 10)
  );
  const [mood, setMood] = useState<Mood>(existingEntry?.mood ?? "NEUTRAL");
  const [location, setLocation] = useState(existingEntry?.location ?? "");
  const [weather, setWeather] = useState(existingEntry?.weather ?? "");
  const [rawContent, setRawContent] = useState(existingEntry?.rawContent ?? "");
  const [content, setContent] = useState(existingEntry?.content ?? "");
  const [tags, setTags] = useState<string[]>(existingEntry?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isFavorite, setIsFavorite] = useState(existingEntry?.isFavorite ?? false);
  const [visibility, setVisibility] = useState<Visibility>(existingEntry?.visibility ?? "PUBLIC");
  const [photos, setPhotos] = useState<Photo[]>(existingEntry?.photos ?? []);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRender = useRef(true);

  // ---- Autosave (only once the entry exists) ----
  useEffect(() => {
    if (!id) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveState("saving");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await api.patch(`/journals/${id}`, {
          title, rawContent, content, mood, location, weather, tags, isFavorite, visibility,
          entryDate: new Date(entryDate).toISOString(),
        });
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, rawContent, content, mood, location, weather, tags, isFavorite, visibility, entryDate]);

  async function handleSave() {
    if (!title.trim() || !rawContent.trim()) {
      show("Add a title and a few notes before saving.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      if (!id) {
        const { entry } = await unwrap<{ entry: JournalEntry }>(
          api.post("/journals", {
            title, rawContent, content: content || rawContent, mood, location, weather, tags,
            isFavorite, visibility, entryDate: new Date(entryDate).toISOString(),
          })
        );
        setId(entry.id);

        if (stagedFiles.length) {
          const formData = new FormData();
          formData.append("journalEntryId", entry.id);
          stagedFiles.forEach((f) => formData.append("photos", f));
          const { photos: uploaded } = await unwrap<{ photos: Photo[] }>(
            api.post("/photos", formData, { headers: { "Content-Type": "multipart/form-data" } })
          );
          setPhotos(uploaded);
        }

        show("Your entry has been saved.");
        router.push(`/journal/${entry.id}`);
      } else {
        await api.patch(`/journals/${id}`, {
          title, rawContent, content, mood, location, weather, tags, isFavorite, visibility,
          entryDate: new Date(entryDate).toISOString(),
        });
        show("Your entry has been saved.");
        router.push(`/journal/${id}`);
      }
    } catch {
      show("Couldn't save your entry. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6 md:px-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this page a title…"
          className="w-full bg-transparent font-serif text-2xl outline-none placeholder:text-ink/30 sm:text-3xl"
        />
        <span className="shrink-0 pt-1 text-xs text-ink/35">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        <Input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input placeholder="Weather (optional)" value={weather} onChange={(e) => setWeather(e.target.value)} />
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-ink/70">Mood</p>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-ink/70">Your rough notes</p>
        <textarea
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
          rows={5}
          placeholder="Write freely — don't worry about grammar or structure. Ruth will help with the rest."
          className="input-field resize-none leading-relaxed"
        />
      </div>

      <div className="mb-6">
        <AIWriterPanel
          rawContent={rawContent}
          mood={mood}
          location={location}
          weather={weather}
          photoCount={photos.length + stagedFiles.length}
          onApply={(result) => {
            setContent(result.content);
          }}
        />
      </div>

      {content && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-ink/70">Your journal entry</p>
          <RichTextEditor value={content} onChange={setContent} placeholder="Your beautifully written entry will appear here…" />
        </div>
      )}

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-ink/70">Photos</p>
        <PhotoUploader
          journalEntryId={id}
          photos={photos}
          onPhotosChange={setPhotos}
          onStagedFilesChange={setStagedFiles}
        />
      </div>

      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-ink/70">Tags</p>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-pill bg-ink/5 px-3 py-1 text-xs text-ink/70">
              #{t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add a tag…"
            className="w-28 bg-transparent text-xs outline-none placeholder:text-ink/35"
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-ink/70">Who can see this</p>
        <div className="flex flex-wrap gap-3">
          <ToggleChip active={isFavorite} onClick={() => setIsFavorite(!isFavorite)} icon={<Star size={14} />} label="Favorite" />
          {VISIBILITY_CHOICES.map((v) => (
            <ToggleChip
              key={v.value}
              active={visibility === v.value}
              onClick={() => setVisibility(v.value)}
              icon={v.icon}
              label={v.label}
            />
          ))}
        </div>
      </div>

      <Button onClick={handleSave} isLoading={isSubmitting} className="w-full sm:w-auto">
        Save entry
      </Button>
    </div>
  );
}

function ToggleChip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:bg-ink/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
