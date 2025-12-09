"use client";

import { useState, useMemo } from "react";
import { useHabits } from "@/lib/habits-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TrackingPage() {
  const { habits, habitLogs, logHabit, isLoading } = useHabits();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = selectedDate.toISOString().split("T")[0];
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isToday = dateStr === todayStr;
  const isPastDate = dateStr < todayStr;

  // Get logs for selected date
  const dayLogs = useMemo(() => {
    return habits.map((habit) => {
      const log = habitLogs.find(
        (l) => l.habitId === habit._id && l.date === dateStr
      );
      return {
        habit,
        completed: log?.completed ?? false,
        notes: log?.notes,
      };
    });
  }, [habits, habitLogs, dateStr]);

  const completedCount = dayLogs.filter((l) => l.completed).length;

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleToggleHabit = (habitId: string, currentCompleted: boolean) => {
    if (isPastDate) return;

    const habitToToggle = habits.find((h) => h._id === habitId);
    if (!habitToToggle) return;

    const newCompleted = !currentCompleted;

    // Mutual exclusivity logic
    if (newCompleted) {
      if (habitToToggle.templateId === "omad") {
        // OMAD conflicts with Autophagy
        const autophagyLog = dayLogs.find(
          (l) => l.habit.templateId === "autophagy" && l.completed
        );
        if (autophagyLog) {
          logHabit(autophagyLog.habit._id, dateStr, false);
        }
      } else if (habitToToggle.templateId === "moran") {
        // Moran conflicts with Autophagy
        const autophagyLog = dayLogs.find(
          (l) => l.habit.templateId === "autophagy" && l.completed
        );
        if (autophagyLog) {
          logHabit(autophagyLog.habit._id, dateStr, false);
        }
      } else if (habitToToggle.templateId === "autophagy") {
        // Autophagy conflicts with OMAD and Moran
        const omadLog = dayLogs.find(
          (l) => l.habit.templateId === "omad" && l.completed
        );
        if (omadLog) {
          logHabit(omadLog.habit._id, dateStr, false);
        }

        const moranLog = dayLogs.find(
          (l) => l.habit.templateId === "moran" && l.completed
        );
        if (moranLog) {
          logHabit(moranLog.habit._id, dateStr, false);
        }
      }
    }

    logHabit(habitId as any, dateStr, newCompleted);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Generate week view
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  // Calculate max achievable habits considering mutual exclusivity dynamically based on daily logs
  const maxAchievable = useMemo(() => {
    const hasAutophagy = habits.some((h) => h.templateId === "autophagy");
    const hasOmad = habits.some((h) => h.templateId === "omad");
    const hasMoran = habits.some((h) => h.templateId === "moran");

    // If no conflict habits exist, return total length
    if (!hasAutophagy && !hasOmad && !hasMoran) return habits.length;

    // Check if Autophagy is completed for the selected date
    const autophagyCompleted = dayLogs.some(
      (l) => l.habit.templateId === "autophagy" && l.completed
    );

    const conflictGroupTotal =
      (hasAutophagy ? 1 : 0) + (hasOmad ? 1 : 0) + (hasMoran ? 1 : 0);

    // If Autophagy is done, max from group is 1. Otherwise, it's OMAD + Moran (2)
    const currentMaxForGroup = autophagyCompleted
      ? 1
      : (hasOmad ? 1 : 0) + (hasMoran ? 1 : 0);

    return habits.length - conflictGroupTotal + currentMaxForGroup;
  }, [habits, dayLogs]);

  return (
    <div className="p-3 md:p-8 py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Daily Tracking</h1>
        <p className="mt-1 text-muted-foreground">
          Check off your habits as you complete them
        </p>
      </div>

      {/* Date Navigator */}
      <Card className="mb-6 border-none bg-muted">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-semibold">
                {formatDate(selectedDate)}
              </p>
              {isToday && <span className="text-sm text-primary">Today</span>}
              {isPastDate && (
                <span className="text-sm text-muted-foreground">
                  Past - View Only
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate("next")}
              disabled={isToday}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Overview */}
      <Card className="mb-6 border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Week Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-between gap-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center rounded-lg p-2"
                >
                  <Skeleton className="h-4 w-8 mb-1" />
                  <Skeleton className="h-6 w-6 mb-1" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-between gap-2">
              {weekDays.map((day) => {
                const dayString = day.toISOString().split("T")[0];
                const isSelected = dayString === dateStr;
                const dayLogs = habitLogs.filter((l) => l.date === dayString);
                const completed = dayLogs.filter((l) => l.completed).length;
                const total = maxAchievable;
                const percentage = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <button
                    key={dayString}
                    onClick={() => setSelectedDate(day)}
                    disabled={dayString > todayStr}
                    className={`flex flex-1 flex-col items-center rounded-lg p-2 transition-colors ${
                      isSelected
                        ? "bg-primary/20 text-primary"
                        : dayString > todayStr
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-secondary"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-semibold">
                      {day.getDate()}
                    </span>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <div className="mb-6 flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4">
        <div>
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-2xl font-bold">
            {completedCount} / {maxAchievable}
          </p>
        </div>
        <Badge
          variant={
            completedCount === 0
              ? "destructive"
              : completedCount === maxAchievable
                ? "default"
                : "secondary"
          }
        >
          {maxAchievable > 0
            ? Math.round((completedCount / maxAchievable) * 100)
            : 0}
          %
        </Badge>
      </div>

      {/* Past Date Warning */}
      {isPastDate && (
        <div className="mb-6 rounded-lg border-none bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            ⚠️ Past records are final and cannot be edited. If you missed
            logging a habit, it's gone. Stay consistent to build your streak!
          </p>
        </div>
      )}

      {/* Habits Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : dayLogs.length === 0 ? (
          <Card className="border-dashed border-border/50 bg-card/30">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No habits to track. Add some habits from the Dashboard!
              </p>
            </CardContent>
          </Card>
        ) : (
          dayLogs.map(({ habit, completed }) => (
            <Card
              key={habit._id}
              className={`border-border/50 transition-all ${
                completed ? "bg-primary/10 border-primary/30" : "bg-card/50"
              } ${
                isPastDate
                  ? "opacity-70 cursor-not-allowed"
                  : "cursor-pointer hover:border-primary/30"
              }`}
              onClick={() => handleToggleHabit(habit._id, completed)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <Checkbox
                  checked={completed}
                  onCheckedChange={() =>
                    handleToggleHabit(habit._id, completed)
                  }
                  disabled={isPastDate}
                  className="h-6 w-6"
                />
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {habit.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {habit.description}
                  </p>
                </div>
                {completed && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Check className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
