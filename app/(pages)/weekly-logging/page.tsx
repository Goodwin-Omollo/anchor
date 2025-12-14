"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LogWeeklyProgressDialog } from "@/components/log-weekly-progress-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BsJournalCheck } from "react-icons/bs";

export default function WeeklyLoggingPage() {
  const { user } = useUser();
  const goals = useQuery(api.goals.list, user ? { userId: user.id } : "skip");

  const [selectedGoal, setSelectedGoal] = useState<{
    id: Id<"goals">;
    type: "weight-loss" | "reading";
    currentWeek: number;
  } | null>(null);

  if (!goals) {
    return <div className="p-8">Loading goals...</div>;
  }

  const handleLogClick = (goal: any) => {
    const today = new Date();
    const startDate = new Date(goal.startDate || today);
    const daysSinceStart = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentWeek = Math.max(1, Math.floor(daysSinceStart / 7) + 1);

    setSelectedGoal({
      id: goal._id,
      type: goal.type,
      currentWeek,
    });
  };

  return (
    <div className="px-3 md:px-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-primary  font-bold tracking-tight">
          Weekly Logging
        </h1>
        <p className="mt-2">
          Log your progress for the week to keep track of your goals.
        </p>
      </div>

      {goals.length === 0 ? (
        <Card className="border-none bg-muted">
          <Empty>
            <EmptyMedia variant="icon">
              <BsJournalCheck />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Active Goals</EmptyTitle>
              <EmptyDescription>
                You don't have any active goals to log progress for.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => {}}>Create Goal</Button>
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalLogCard
              key={goal._id}
              goal={goal}
              onLogClick={handleLogClick}
            />
          ))}
        </div>
      )}

      {selectedGoal && (
        <LogWeeklyProgressDialog
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
          goalId={selectedGoal.id}
          goalType={selectedGoal.type}
          currentWeek={selectedGoal.currentWeek}
        />
      )}
    </div>
  );
}

function GoalLogCard({
  goal,
  onLogClick,
}: {
  goal: any;
  onLogClick: (goal: any) => void;
}) {
  const logStatus = useQuery(api.weeklyProgress.getWeeklyLogStatus, {
    goalId: goal._id,
  });

  const today = new Date();
  const isSunday = today.getDay() === 0;
  const startDate = new Date(goal.startDate || today);
  const daysSinceStart = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentWeek = Math.max(1, Math.floor(daysSinceStart / 7) + 1);

  const hasLogged = logStatus?.hasLogged;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{goal.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Started:</span>
            <span>{format(startDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Week:</span>
            <span className="font-medium text-foreground">
              Week {currentWeek}
            </span>
          </div>
          {goal.type === "weight-loss" && (
            <>
              <div className="flex justify-between">
                <span>Current Weight:</span>
                <span>
                  {goal.currentWeight ? `${goal.currentWeight} kg` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Weight Difference:</span>
                <span
                  className={
                    -goal.currentValue <= 0
                      ? "font-medium text-primary"
                      : "font-medium text-destructive"
                  }
                >
                  {-goal.currentValue > 0 ? "+" : ""}
                  {(-goal.currentValue).toFixed(1)} kg
                </span>
              </div>
            </>
          )}
          {goal.type === "reading" && (
            <div className="flex justify-between">
              <span>Books Read:</span>
              <span>{goal.booksRead || 0}</span>
            </div>
          )}
        </div>

        <Button
          onClick={() => onLogClick(goal)}
          className="w-full"
          disabled={!isSunday}
          variant={hasLogged ? "outline" : "default"}
        >
          {!isSunday
            ? "Available on Sunday"
            : hasLogged
              ? "Edit Progress"
              : "Log Progress"}
        </Button>
      </CardContent>
    </Card>
  );
}
