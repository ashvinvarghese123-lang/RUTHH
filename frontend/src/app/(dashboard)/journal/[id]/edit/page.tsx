"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJournal } from "@/hooks/useJournals";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function EditJournalPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useJournal(id);
  const { user } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  const isOwner = data?.entry && user?.id === data.entry.userId;

  useEffect(() => {
    if (!isLoading && data?.entry && !isOwner) {
      show("You can only edit your own entries.", "error");
      router.replace(`/journal/${id}`);
    }
  }, [isLoading, data, isOwner, id, router, show]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }

  if (!data?.entry || !isOwner) return null;

  return <JournalEditor existingEntry={data.entry} />;
}
