"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { UserPlus, Check, X, Search as SearchIcon } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useFriends,
  useFriendRequests,
  useUserSearch,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriendship,
} from "@/hooks/useFriends";
import { useToast } from "@/components/ui/Toast";
import { PublicUser } from "@/types";

type Tab = "friends" | "requests" | "find";

function PersonRow({ person, right }: { person: PublicUser; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <Link href={`/profile/${person.username}`} className="flex items-center gap-3 hover:opacity-80">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-medium text-ink">
          {person.profile.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.profile.profilePhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            person.profile.displayName.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{person.profile.displayName}</p>
          <p className="text-xs text-ink/45">@{person.username}</p>
        </div>
      </Link>
      {right}
    </div>
  );
}

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const [query, setQuery] = useState("");
  const { show } = useToast();

  const { data: friendsData, isLoading: friendsLoading } = useFriends();
  const { data: requestsData, isLoading: requestsLoading } = useFriendRequests();
  const { data: searchData, isLoading: searchLoading } = useUserSearch(query);

  const sendRequest = useSendFriendRequest();
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const remove = useRemoveFriendship();

  const pendingCount = requestsData?.incoming?.length ?? 0;

  async function handleSend(username: string) {
    try {
      await sendRequest.mutateAsync(username);
      show("Friend request sent.");
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't send that request.", "error");
    }
  }

  return (
    <div>
      <Topbar title="Friends" />
      <div className="mx-auto max-w-xl px-4 pb-24 sm:px-6 md:px-10">
        <div className="mb-6 flex gap-2">
          {([
            { key: "friends", label: "Friends" },
            { key: "requests", label: `Requests${pendingCount ? ` (${pendingCount})` : ""}` },
            { key: "find", label: "Find people" },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                "rounded-pill border px-4 py-1.5 text-sm transition-colors",
                tab === t.key ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:bg-ink/5"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "friends" && (
          friendsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : friendsData?.friends?.length ? (
            <div className="paper-card divide-y divide-ink/8 px-5">
              {friendsData.friends.map((f) => <PersonRow key={f.id} person={f} right={null} />)}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-ink/40">No friends yet — try "Find people".</p>
          )
        )}

        {tab === "requests" && (
          requestsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Incoming</p>
                {requestsData?.incoming?.length ? (
                  <div className="paper-card divide-y divide-ink/8 px-5">
                    {requestsData.incoming.map((r) => (
                      <PersonRow
                        key={r.id}
                        person={r.requester!}
                        right={
                          <div className="flex gap-2">
                            <button
                              onClick={() => accept.mutate(r.id)}
                              className="rounded-full bg-ink p-2 text-paper"
                              aria-label="Accept"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => decline.mutate(r.id)}
                              className="rounded-full border border-ink/15 p-2 text-ink/60"
                              aria-label="Decline"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/40">No incoming requests.</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Sent</p>
                {requestsData?.outgoing?.length ? (
                  <div className="paper-card divide-y divide-ink/8 px-5">
                    {requestsData.outgoing.map((r) => (
                      <PersonRow
                        key={r.id}
                        person={r.addressee!}
                        right={
                          <button
                            onClick={() => remove.mutate(r.id)}
                            className="text-xs text-ink/40 hover:text-red-500"
                          >
                            Cancel
                          </button>
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/40">No pending sent requests.</p>
                )}
              </div>
            </div>
          )
        )}

        {tab === "find" && (
          <div>
            <div className="relative mb-4">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
              <Input
                placeholder="Search by username…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : query && searchData?.users?.length ? (
              <div className="paper-card divide-y divide-ink/8 px-5">
                {searchData.users.map((u) => (
                  <PersonRow
                    key={u.id}
                    person={u}
                    right={
                      <button
                        onClick={() => handleSend(u.username)}
                        className="flex items-center gap-1.5 rounded-pill border border-ink/15 px-3 py-1.5 text-xs hover:bg-ink/5"
                      >
                        <UserPlus size={13} /> Add
                      </button>
                    }
                  />
                ))}
              </div>
            ) : query ? (
              <p className="py-16 text-center text-sm text-ink/40">No one found with that username.</p>
            ) : (
              <p className="py-16 text-center text-sm text-ink/40">Search for someone by their username.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
