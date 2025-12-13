"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface JoinCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinCommunityDialog({
  open,
  onOpenChange,
}: JoinCommunityDialogProps) {
  const { user } = useUser();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const joinCommunity = useMutation(api.communities.join);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode) return;

    setIsJoining(true);
    try {
      const result = await joinCommunity({
        inviteCode: inviteCode.toUpperCase(),
        userId: user.id,
        displayName: user.fullName || user.firstName || "Anonymous",
        avatarUrl: user.imageUrl,
      });

      toast.success(`Joined ${result.communityName}!`);
      setInviteCode("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to join community");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join Community
          </DialogTitle>
          <DialogDescription>
            Enter the invite code shared by a friend
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Invite Code</Label>
              <Input
                id="code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteCode.length !== 6 || isJoining}
            >
              {isJoining ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
