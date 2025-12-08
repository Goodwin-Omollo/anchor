"use client";

import { useState, useMemo } from "react";
import { useHabits } from "@/lib/habits-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function TrackingPage() {
  const { habits, habitLogs, logHabit, isLoading } = useHabits();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = selectedDate.toISOString().split("T")[0];
  const isToday = dateStr === new Date().toISOString().split("T")[0];

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
      <Card className="mb-6 border-border/50 bg-card/50">
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
                const total = habits.length;
                const percentage = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <button
                    key={dayString}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-1 flex-col items-center rounded-lg p-2 transition-colors ${
                      isSelected
                        ? "bg-primary/20 text-primary"
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
            {completedCount} / {habits.length}
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <span className="text-xl font-bold text-primary">
            {habits.length > 0
              ? Math.round((completedCount / habits.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      {/* Habits Checklist */}
      <div className="space-y-3">
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
              className={`cursor-pointer border-border/50 transition-all ${
                completed
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card/50 hover:border-primary/30"
              }`}
              onClick={() => logHabit(habit._id, dateStr, !completed)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <Checkbox
                  checked={completed}
                  onCheckedChange={(checked) =>
                    logHabit(habit._id, dateStr, checked as boolean)
                  }
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
