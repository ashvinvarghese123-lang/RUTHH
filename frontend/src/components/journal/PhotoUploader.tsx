"use client";

import { useRef, useState, DragEvent } from "react";
import { ImagePlus, X, GripVertical } from "lucide-react";
import { api, unwrap } from "@/lib/api";
import { Photo } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface StagedFile {
  id: string; // temp id
  file: File;
  previewUrl: string;
}

/**
 * Handles photo upload + drag-and-drop reordering for a journal entry.
 *
 * If `journalEntryId` is set, files upload immediately to Cloudinary via the API.
 * If not (new, unsaved entry), files are staged locally and exposed via
 * `onStagedFilesChange` so the parent can upload them right after the entry is created.
 */
export function PhotoUploader({
  journalEntryId,
  photos,
  onPhotosChange,
  onStagedFilesChange,
}: {
  journalEntryId?: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  onStagedFilesChange?: (files: File[]) => void;
}) {
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    if (!journalEntryId) {
      const newStaged = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      const updated = [...staged, ...newStaged];
      setStaged(updated);
      onStagedFilesChange?.(updated.map((s) => s.file));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("journalEntryId", journalEntryId);
      Array.from(files).forEach((f) => formData.append("photos", f));
      const { photos: uploaded } = await unwrap<{ photos: Photo[] }>(
        api.post("/photos", formData, { headers: { "Content-Type": "multipart/form-data" } })
      );
      onPhotosChange([...photos, ...uploaded]);
    } catch {
      show("Couldn't upload one or more photos. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  async function removePhoto(id: string) {
    await api.delete(`/photos/${id}`);
    onPhotosChange(photos.filter((p) => p.id !== id));
  }

  function removeStaged(id: string) {
    const updated = staged.filter((s) => s.id !== id);
    setStaged(updated);
    onStagedFilesChange?.(updated.map((s) => s.file));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    const reordered = [...photos];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    onPhotosChange(reordered);
    api.post("/photos/reorder", { journalEntryId, order: reordered.map((p) => p.id) }).catch(() => {});
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 py-8 text-center text-sm text-ink/50 transition-colors hover:border-ink/30 hover:bg-ink/5"
      >
        <ImagePlus size={22} />
        <span>{isUploading ? "Uploading…" : "Drag photos here, or click to choose"}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {(photos.length > 0 || staged.length > 0) && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null && dragIndex.current !== index) {
                  handleReorder(dragIndex.current, index);
                }
                dragIndex.current = null;
              }}
              className="group relative aspect-square overflow-hidden rounded-xl bg-ink/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical size={14} className="cursor-grab text-white drop-shadow" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="rounded-full bg-black/50 p-1 text-white"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
          {staged.map((s) => (
            <div key={s.id} className="group relative aspect-square overflow-hidden rounded-xl bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.previewUrl} alt="" className="h-full w-full object-cover opacity-80" />
              <button
                type="button"
                onClick={() => removeStaged(s.id)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
