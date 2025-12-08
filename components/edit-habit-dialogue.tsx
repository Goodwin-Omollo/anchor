"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useHabits, type Habit } from "@/lib/habits-context";
import { Id } from "@/convex/_generated/dataModel";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colors = [
  "#4ade80",
  "#60a5fa",
  "#f59e0b",
  "#a78bfa",
  "#f472b6",
  "#22d3d8",
  "#ef4444",
  "#84cc16",
];

export function EditHabitDialog({
  habit,
  open,
  onOpenChange,
}: EditHabitDialogProps) {
  const { goals, updateHabit } = useHabits();
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description);
  const [frequency, setFrequency] = useState(habit.frequency);
  const [goalId, setGoalId] = useState<Id<"goals"> | "no-goal">(
    habit.goalId || "no-goal"
  );
  const [color, setColor] = useState(habit.color);

  useEffect(() => {
    setName(habit.name);
    setDescription(habit.description);
    setFrequency(habit.frequency);
    setGoalId(habit.goalId || "no-goal");
    setColor(habit.color);
  }, [habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateHabit(habit._id, {
      name,
      description,
      frequency,
      goalId: goalId === "no-goal" ? null : goalId,
      color,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>Update your habit details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Habit Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as typeof frequency)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Link to Goal</Label>
            <Select
              value={goalId}
              onValueChange={(v) => setGoalId(v as Id<"goals"> | "no-goal")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-goal">No goal</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal._id} value={goal._id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
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
