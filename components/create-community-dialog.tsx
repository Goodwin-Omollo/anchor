"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Goal } from "@/lib/habits-context";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userGoals: Goal[];
}

export function CreateCommunityDialog({
  open,
  onOpenChange,
  userGoals,
}: CreateCommunityDialogProps) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"weight-loss" | "reading" | "any">(
    "any"
  );
  const [maxMembers, setMaxMembers] = useState("10");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createCommunity = useMutation(api.communities.create);

  const hasWeightLossGoal = userGoals.some((g) => g.type === "weight-loss");
  const hasReadingGoal = userGoals.some((g) => g.type === "reading");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const result = await createCommunity({
        name,
        description: description || undefined,
        goalType: goalType === "any" ? undefined : goalType,
        maxMembers: parseInt(maxMembers),
        userId: user.id,
        displayName: user.fullName || user.firstName || "Anonymous",
        avatarUrl: user.imageUrl,
      });

      setInviteCode(result.inviteCode);
      toast.success("Community created!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create community");
    }
  };

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setGoalType("any");
    setMaxMembers("10");
    setInviteCode(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {inviteCode ? "Community Created!" : "Create Community"}
          </DialogTitle>
          <DialogDescription>
            {inviteCode
              ? "Share this invite code with friends"
              : "Create an accountability group with friends"}
          </DialogDescription>
        </DialogHeader>

        {inviteCode ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl font-bold tracking-widest bg-muted px-6 py-4 rounded-lg">
                {inviteCode}
              </div>
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Friends can join using this code in the Communities page
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Warriors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this community about?"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalType">Focus Area</Label>
                  <Select
                    value={goalType}
                    onValueChange={(v) =>
                      setGoalType(v as "weight-loss" | "reading" | "any")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Goal</SelectItem>
                      {hasWeightLossGoal && (
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                      )}
                      {hasReadingGoal && (
                        <SelectItem value="reading">Reading</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Max Members</Label>
                  <Select value={maxMembers} onValueChange={setMaxMembers}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 members</SelectItem>
                      <SelectItem value="10">10 members</SelectItem>
                      <SelectItem value="20">20 members</SelectItem>
                      <SelectItem value="50">50 members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name}>
                Create Community
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
