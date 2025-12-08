"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useHabits, type Goal } from "@/lib/habits-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditGoalDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
}: EditGoalDialogProps) {
  const { updateGoal } = useHabits();
  const [title, setTitle] = useState(goal.title);
  const [targetValue, setTargetValue] = useState(goal.targetValue.toString());
  const [unit, setUnit] = useState(goal.unit);
  const [deadline, setDeadline] = useState(goal.deadline);

  useEffect(() => {
    setTitle(goal.title);
    setTargetValue(goal.targetValue.toString());
    setUnit(goal.unit);
    setDeadline(goal.deadline);
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateGoal(goal._id, {
      title,
      targetValue: Number.parseFloat(targetValue),
      unit,
      deadline,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>Update your goal details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-goal-title">Goal Title</Label>
            <Input
              id="edit-goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-target-value">Target Value</Label>
              <Input
                id="edit-target-value"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit</Label>
              <Input
                id="edit-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-deadline">Deadline</Label>
            <Input
              id="edit-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
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
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
