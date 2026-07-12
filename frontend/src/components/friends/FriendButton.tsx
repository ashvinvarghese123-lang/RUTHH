"use client";

import { UserPlus, Check, Clock, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useFriendStatus,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriendship,
} from "@/hooks/useFriends";
import { useToast } from "@/components/ui/Toast";

export function FriendButton({ username }: { username: string }) {
  const { data, isLoading } = useFriendStatus(username);
  const sendRequest = useSendFriendRequest();
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const remove = useRemoveFriendship();
  const { show } = useToast();

  if (isLoading || !data || data.status === "SELF") return null;

  async function handleSend() {
    try {
      await sendRequest.mutateAsync(username);
      show("Friend request sent.");
    } catch (err: any) {
      show(err?.response?.data?.message ?? "Couldn't send that request.", "error");
    }
  }

  if (data.status === "NONE") {
    return (
      <Button variant="secondary" onClick={handleSend} isLoading={sendRequest.isPending}>
        <UserPlus size={15} /> Add friend
      </Button>
    );
  }

  if (data.status === "REQUEST_SENT") {
    return (
      <Button variant="secondary" disabled className="opacity-60">
        <Clock size={15} /> Request sent
      </Button>
    );
  }

  if (data.status === "REQUEST_RECEIVED" && data.friendshipId) {
    const id = data.friendshipId;
    return (
      <div className="flex gap-2">
        <Button onClick={() => accept.mutate(id)} isLoading={accept.isPending}>
          <Check size={15} /> Accept
        </Button>
        <Button variant="secondary" onClick={() => decline.mutate(id)} isLoading={decline.isPending}>
          Decline
        </Button>
      </div>
    );
  }

  if (data.status === "FRIENDS" && data.friendshipId) {
    const id = data.friendshipId;
    return (
      <Button
        variant="secondary"
        onClick={() => {
          if (confirm("Remove this friend?")) remove.mutate(id);
        }}
        isLoading={remove.isPending}
      >
        <UserMinus size={15} /> Friends
      </Button>
    );
  }

  return null;
}
