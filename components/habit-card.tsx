"use client";

import { useState } from "react";
import {
  useHabits,
  getStreakForHabit,
  getCompletionRate,
  type Habit,
} from "@/lib/habits-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Flame, TrendingUp, Edit, Trash2 } from "lucide-react";
import { EditHabitDialog } from "./edit-habit-dialogue";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { habitLogs, goals, deleteHabit } = useHabits();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const streak = getStreakForHabit(habit._id, habitLogs);
  const completionRate = getCompletionRate(habit._id, habitLogs, 7);
  const linkedGoal = goals.find((g) => g._id === habit.goalId);

  return (
    <>
      <Card className="border-none bg-muted backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <CardTitle className="text-base font-medium">
              {habit.name}
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
                onClick={() => deleteHabit(habit._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{habit.description}</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-chart-5" />
              <span className="text-sm font-medium">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {completionRate}% this week
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Weekly Progress</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {linkedGoal && (
            <Badge variant="default" className="text-xs px-2 py-1">
              Goal: {linkedGoal.title}
            </Badge>
          )}
        </CardContent>
      </Card>

      <EditHabitDialog
        habit={habit}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
