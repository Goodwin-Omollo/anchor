"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  useHabits,
  getStreakForHabit,
  getCompletionRate,
} from "@/lib/habits-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitCard } from "@/components/habit-card";
import { GoalCard } from "@/components/goal-card";

import {
  Plus,
  Target,
  Flame,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AddHabitDialog } from "@/components/add-habit-dialogue";
import { AddGoalDialog } from "@/components/add-goal-dialogue";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

export default function DashboardPage() {
  const { habits, goals, habitLogs, isLoading } = useHabits();
  const { user } = useUser();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Calculate overview stats
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = habitLogs.filter((log) => log.date === today);
  const completedToday = todayLogs.filter((log) => log.completed).length;

  const totalStreak = habits.reduce(
    (max, habit) => Math.max(max, getStreakForHabit(habit._id, habitLogs)),
    0
  );

  const avgCompletion =
    habits.length > 0
      ? Math.round(
          habits.reduce(
            (sum, habit) => sum + getCompletionRate(habit._id, habitLogs, 7),
            0
          ) / habits.length
        )
      : 0;

  const activeGoals = goals.filter(
    (g) => g.currentValue < g.targetValue
  ).length;

  return (
    <div className="px-3 md:px-8 py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "there"}
        </h1>
        <p className="mt-1">Here's an overview of your habits and goals</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none bg-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-none bg-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Today
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedToday}/{habits.length}
                </div>
                <p className="text-xs text-muted-foreground capitalize mt-2">
                  habits completed
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Streak
                </CardTitle>
                <Flame className="h-4 w-4 text-chart-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStreak}</div>
                <p className="text-xs text-muted-foreground capitalize mt-2">
                  consecutive days
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Weekly Avg
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCompletion}%</div>
                <p className="text-xs text-muted-foreground capitalize mt-2">
                  completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Goals
                </CardTitle>
                <Target className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeGoals}</div>
                <p className="text-xs text-muted-foreground capitalize mt-2">
                  in progress
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Goals Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Goals</h2>
          {goals.length > 0 && (
            <Button onClick={() => setShowAddGoal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-none bg-muted">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Empty className="bg-muted">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Target className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>No goals yet</EmptyTitle>
              <EmptyDescription>Set a goal to work towards!</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowAddGoal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Goal
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      {/* Habits Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Habits</h2>
          {habits.length > 0 && (
            <Button onClick={() => setShowAddHabit(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-none bg-muted">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : habits.length === 0 ? (
          <Empty className="bg-muted">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>No habits yet</EmptyTitle>
              <EmptyDescription>
                Start building better habits today!
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowAddHabit(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Habit
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <HabitCard key={habit._id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddHabitDialog open={showAddHabit} onOpenChange={setShowAddHabit} />
      <AddGoalDialog open={showAddGoal} onOpenChange={setShowAddGoal} />
    </div>
  );
}
