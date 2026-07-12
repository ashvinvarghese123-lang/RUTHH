"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { Friendship, FriendRelationStatus, PublicUser } from "@/types";

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: () => unwrap<{ friends: PublicUser[]; count: number }>(api.get("/friends")),
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ["friend-requests"],
    queryFn: () =>
      unwrap<{ incoming: Friendship[]; outgoing: Friendship[] }>(api.get("/friends/requests")),
  });
}

export function useFriendStatus(username: string | undefined) {
  return useQuery({
    queryKey: ["friend-status", username],
    queryFn: () =>
      unwrap<{ status: FriendRelationStatus; friendshipId?: string }>(
        api.get(`/friends/status/${username}`)
      ),
    enabled: Boolean(username),
  });
}

export function useUserSearch(q: string) {
  return useQuery({
    queryKey: ["user-search", q],
    queryFn: () => unwrap<{ users: PublicUser[] }>(api.get("/friends/search", { params: { q } })),
    enabled: q.trim().length > 0,
  });
}

function useInvalidateFriends() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["friends"] });
    qc.invalidateQueries({ queryKey: ["friend-requests"] });
    qc.invalidateQueries({ queryKey: ["friend-status"] });
    qc.invalidateQueries({ queryKey: ["feed"] });
  };
}

export function useSendFriendRequest() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (username: string) => unwrap(api.post("/friends/request", { username })),
    onSuccess: invalidate,
  });
}

export function useAcceptFriendRequest() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (friendshipId: string) => unwrap(api.post(`/friends/${friendshipId}/accept`)),
    onSuccess: invalidate,
  });
}

export function useDeclineFriendRequest() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (friendshipId: string) => unwrap(api.post(`/friends/${friendshipId}/decline`)),
    onSuccess: invalidate,
  });
}

export function useRemoveFriendship() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (friendshipId: string) => unwrap(api.delete(`/friends/${friendshipId}`)),
    onSuccess: invalidate,
  });
}
