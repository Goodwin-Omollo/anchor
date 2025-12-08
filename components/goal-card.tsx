"use client";

import { useState } from "react";
import {
  useHabits,
  getProjectedCompletion,
  type Goal,
} from "@/lib/habits-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Target, Calendar, Edit, Trash2 } from "lucide-react";
import { EditGoalDialog } from "./edit-goal-dialogue";
import { LogProgressDialog } from "./log-progress-dialog";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { habits, deleteGoal } = useHabits();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLogDialog, setShowLogDialog] = useState(false);

  const progress = (goal.currentValue / goal.targetValue) * 100;
  const projectedDate = getProjectedCompletion(goal);
  const linkedHabits = habits.filter((h) => h.goalId === goal._id);
  const deadlineDate = new Date(goal.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Card className="border-none bg-muted backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-medium">
              {goal.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowLogDialog(true)}>
                <Target className="mr-2 h-4 w-4" />
                Log Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteGoal(goal._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{goal.currentValue}</span>
            <span className="text-muted-foreground">
              / {goal.targetValue} {goal.unit}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Deadline: {deadlineDate}</span>
            </div>
          </div>

          {projectedDate && (
            <p className="text-xs text-muted-foreground">
              Projected completion:{" "}
              <span className="font-medium text-primary">{projectedDate}</span>
            </p>
          )}

          {linkedHabits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {linkedHabits.map((habit) => (
                <span
                  key={habit._id}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  {habit.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditGoalDialog
        goal={goal}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <LogProgressDialog
        goal={goal}
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
      />
    </>
  );
}
