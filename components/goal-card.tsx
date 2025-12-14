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
import { Badge } from "./ui/badge";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { habits, deleteGoal } = useHabits();
  const [showEditDialog, setShowEditDialog] = useState(false);

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
      <Card className=" backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-1">
            <div>🎯</div>
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
            <span className="text-2xl font-bold">
              {goal.currentValue.toFixed(1)}
            </span>
            <span className="">
              / {goal.targetValue.toFixed(1)} {goal.unit}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 ">
              <Calendar className="h-4 w-4" />
              <span>Deadline: {deadlineDate}</span>
            </div>
          </div>

          {projectedDate && (
            <p className="text-xs ">
              Projected completion:{" "}
              <span className="font-medium text-primary">{projectedDate}</span>
            </p>
          )}

          {linkedHabits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {linkedHabits.map((habit) => (
                <Badge key={habit._id} variant="secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  {habit.name}
                </Badge>
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
    </>
  );
}
