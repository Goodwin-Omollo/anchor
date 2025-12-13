"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LogWeeklyProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: Id<"goals">;
  goalType: "weight-loss" | "reading";
  currentWeek: number;
}

export function LogWeeklyProgressDialog({
  open,
  onOpenChange,
  goalId,
  goalType,
  currentWeek,
}: LogWeeklyProgressDialogProps) {
  const { user } = useUser();
  const logProgress = useMutation(api.progressTracking.logWeeklyProgress);

  const [weight, setWeight] = useState("");
  const [books, setBooks] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      await logProgress({
        goalId,
        weightValue:
          goalType === "weight-loss" ? parseFloat(weight) : undefined,
        booksCompleted: goalType === "reading" ? parseInt(books) : undefined,
        notes: notes || undefined,
        userId: user.id,
      });

      // Reset form
      setWeight("");
      setBooks("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to log progress:", error);
      alert("Failed to log progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Week {currentWeek} Progress</DialogTitle>
          <DialogDescription>
            Enter your current progress for this week
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {goalType === "weight-loss" && (
            <div className="space-y-2">
              <Label htmlFor="weight">Current Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 95.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
          )}

          {goalType === "reading" && (
            <div className="space-y-2">
              <Label htmlFor="books">Books Completed</Label>
              <Input
                id="books"
                type="number"
                placeholder="e.g., 3"
                value={books}
                onChange={(e) => setBooks(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did this week go? Any challenges or wins?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
