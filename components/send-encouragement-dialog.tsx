"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Megaphone, PartyPopper } from "lucide-react";
import { toast } from "sonner";

interface SendEncouragementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toUserId: string;
  toDisplayName: string;
  toAvatarUrl?: string;
  communityId?: Id<"communities">;
  type: "nudge" | "cheer";
}

export function SendEncouragementDialog({
  open,
  onOpenChange,
  toUserId,
  toDisplayName,
  toAvatarUrl,
  communityId,
  type,
}: SendEncouragementDialogProps) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendNudge = useMutation(api.activityFeed.sendNudge);
  const sendCheer = useMutation(api.activityFeed.sendCheer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSending(true);
    try {
      if (type === "nudge") {
        await sendNudge({
          fromUserId: user.id,
          toUserId,
          communityId,
          message: message || undefined,
        });
        toast.success("Nudge sent!");
      } else {
        await sendCheer({
          fromUserId: user.id,
          toUserId,
          communityId,
          message: message || "Keep up the great work! 🎉",
        });
        toast.success("Cheer sent!");
      }
      setMessage("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "nudge" ? (
              <>
                <Megaphone className="h-5 w-5 text-blue-500" />
                Send a Nudge
              </>
            ) : (
              <>
                <PartyPopper className="h-5 w-5 text-pink-500" />
                Send a Cheer
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === "nudge"
              ? "Gently remind them to stay on track"
              : "Celebrate their progress and motivate them"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Recipient */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Avatar>
                <AvatarImage src={toAvatarUrl} />
                <AvatarFallback>
                  {toDisplayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{toDisplayName}</p>
                <p className="text-xs text-muted-foreground">
                  Will receive your {type}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message {type === "nudge" && "(optional)"}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === "nudge"
                    ? "Hey! Don't forget to complete your habits today! 💪"
                    : "You're doing amazing! Keep it up! 🌟"
                }
                rows={3}
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
              disabled={isSending || (type === "cheer" && !message)}
              className={
                type === "nudge"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-pink-500 hover:bg-pink-600"
              }
            >
              {isSending
                ? "Sending..."
                : type === "nudge"
                  ? "Send Nudge"
                  : "Send Cheer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
