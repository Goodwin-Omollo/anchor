"use client";

import type React from "react";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHabits, type Goal } from "@/lib/habits-context";

interface LogProgressDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogProgressDialog({
  goal,
  open,
  onOpenChange,
}: LogProgressDialogProps) {
  const { logProgress } = useHabits();
  const [value, setValue] = useState(goal.currentValue.toString());
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    logProgress(goal._id, Number.parseFloat(value), notes || undefined);

    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Progress</DialogTitle>
          <DialogDescription>
            Update your progress for "{goal.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="progress-value">
              Current Progress ({goal.unit})
            </Label>
            <Input
              id="progress-value"
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Target: {goal.targetValue} {goal.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress-notes">Notes (Optional)</Label>
            <Textarea
              id="progress-notes"
              placeholder="Add any notes about your progress..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Log Progress</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
