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
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Flame, TrendingUp, Trash2, Heart } from "lucide-react";

interface HabitCardProps {
  habit: Habit;
}

const encouragementMessages = [
  "You chose this habit for a reason. Remember why you started and stick with it till the end. Every small step counts towards your goal!",
  "Don't give up now! The magic happens when you push through the hard days. You've got this!",
  "Your future self will thank you for staying committed today. Keep going!",
  "Success is built on consistency, not perfection. You're already on the right path!",
  "Remember, it's not about being perfect—it's about making progress. Stay the course!",
  "Every champion was once a beginner who refused to give up. That's you!",
  "The only way to fail is to quit. Keep showing up, you're doing better than you think!",
  "You didn't come this far to only come this far. Finish what you started!",
];

export function HabitCard({ habit }: HabitCardProps) {
  const { habitLogs, goals } = useHabits();
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  const streak = getStreakForHabit(habit._id, habitLogs);
  const completionRate = getCompletionRate(habit._id, habitLogs, 7);
  const linkedGoal = goals.find((g) => g._id === habit.goalId);

  const handleDeleteClick = () => {
    // Pick a random encouragement message
    const randomMessage =
      encouragementMessages[
        Math.floor(Math.random() * encouragementMessages.length)
      ];
    setCurrentMessage(randomMessage);
    setShowEncouragement(true);
  };

  return (
    <>
      <Card className=" backdrop-blur">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <CardTitle className="font-medium">{habit.name}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete habit</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm ">{habit.description}</p>

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
              <span className="">Weekly Progress</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {linkedGoal && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Goal: {linkedGoal.title}
            </Badge>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showEncouragement} onOpenChange={setShowEncouragement}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Stay Strong! 💪
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {currentMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={() => setShowEncouragement(false)}>
              You're Right, I'll Keep Going!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
