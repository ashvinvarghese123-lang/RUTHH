"use client";

import { useParams } from "next/navigation";
import { useJournal } from "@/hooks/useJournals";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditJournalPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useJournal(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }

  if (!data?.entry) return null;

  return <JournalEditor existingEntry={data.entry} />;
}
