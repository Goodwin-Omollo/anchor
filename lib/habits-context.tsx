"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Types that match Convex schema
export type GoalType = "weight-loss" | "reading";

export interface Goal {
  _id: Id<"goals">;
  type: GoalType;
  title: string;

  // Weight Loss specific fields
  currentWeight?: number;
  targetWeightLoss?: number;

  // Reading specific fields
  targetBooks?: number;
  booksRead?: number;

  // Common fields
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  userId: string;
  _creationTime: number;
}

export interface Habit {
  _id: Id<"habits">;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "flexible";
  goalId: Id<"goals">; // Now required
  templateId: string; // Template reference
  color: string;
  userId: string;
  _creationTime: number;
}

export interface HabitLog {
  _id: Id<"habitLogs">;
  habitId: Id<"habits">;
  date: string;
  completed: boolean;
  notes?: string;
  userId: string;
  _creationTime: number;
}

export interface ProgressLog {
  _id: Id<"progressLogs">;
  goalId: Id<"goals">;
  date: string;
  value: number;
  notes?: string;
  userId: string;
  _creationTime: number;
}

interface HabitsContextType {
  habits: Habit[];
  goals: Goal[];
  habitLogs: HabitLog[];
  progressLogs: ProgressLog[];
  isLoading: boolean;
  addHabit: (habit: {
    name: string;
    description: string;
    frequency: "daily" | "weekly" | "flexible";
    goalId: Id<"goals">;
    templateId: string;
    color: string;
  }) => void;
  updateHabit: (
    id: Id<"habits">,
    updates: Partial<{
      name: string;
      description: string;
      frequency: "daily" | "weekly" | "flexible";
      color: string;
    }>
  ) => void;
  deleteHabit: (id: Id<"habits">) => void;
  addGoal: (goal: {
    type: GoalType;
    title: string;
    currentWeight?: number;
    targetWeightLoss?: number;
    targetBooks?: number;
    booksRead?: number;
    targetValue: number;
    unit: string;
    deadline: string;
  }) => void;
  addGoalWithHabits: (params: {
    goal: {
      type: GoalType;
      title: string;
      currentWeight?: number;
      targetWeightLoss?: number;
      targetBooks?: number;
      booksRead?: number;
      targetValue: number;
      unit: string;
      deadline: string;
    };
    habits: Array<{
      name: string;
      description: string;
      frequency: "daily" | "weekly" | "flexible";
      templateId: string;
      color: string;
    }>;
  }) => void;
  updateGoal: (
    id: Id<"goals">,
    updates: Partial<{
      title: string;
      targetValue: number;
      currentValue: number;
      unit: string;
      deadline: string;
    }>
  ) => void;
  deleteGoal: (id: Id<"goals">) => void;
  logHabit: (
    habitId: Id<"habits">,
    date: string,
    completed: boolean,
    notes?: string
  ) => void;
  logProgress: (goalId: Id<"goals">, value: number, notes?: string) => void;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const userId = user?.id ?? "";

  // Queries - store raw results to check loading state
  const habitsRaw = useQuery(api.habits.list, userId ? { userId } : "skip");
  const goalsRaw = useQuery(api.goals.list, userId ? { userId } : "skip");
  const habitLogsRaw = useQuery(
    api.habitLogs.list,
    userId ? { userId } : "skip"
  );
  const progressLogsRaw = useQuery(
    api.progressLogs.list,
    userId ? { userId } : "skip"
  );

  // Check loading state before applying defaults
  const isLoading =
    habitsRaw === undefined ||
    goalsRaw === undefined ||
    habitLogsRaw === undefined ||
    progressLogsRaw === undefined;

  // Apply defaults after loading check
  const habits = habitsRaw ?? [];
  const goals = goalsRaw ?? [];
  const habitLogs = habitLogsRaw ?? [];
  const progressLogs = progressLogsRaw ?? [];

  // Mutations
  const createHabit = useMutation(api.habits.create);
  const updateHabitMutation = useMutation(api.habits.update);
  const removeHabit = useMutation(api.habits.remove);

  const createGoal = useMutation(api.goals.create);
  const updateGoalMutation = useMutation(api.goals.update);
  const removeGoal = useMutation(api.goals.remove);

  const logHabitMutation = useMutation(api.habitLogs.log);
  const logProgressMutation = useMutation(api.progressLogs.log);
  const createGoalWithHabitsMutation = useMutation(
    api.goalWithHabits.createWithHabits
  );

  const addHabit = (habit: {
    name: string;
    description: string;
    frequency: "daily" | "weekly" | "flexible";
    goalId: Id<"goals">;
    templateId: string;
    color: string;
  }) => {
    if (!userId) return;
    createHabit({
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      goalId: habit.goalId,
      templateId: habit.templateId,
      color: habit.color,
      userId,
    });
  };

  const updateHabit = (
    id: Id<"habits">,
    updates: Partial<{
      name: string;
      description: string;
      frequency: "daily" | "weekly" | "flexible";
      color: string;
    }>
  ) => {
    updateHabitMutation({ id, ...updates });
  };

  const deleteHabit = (id: Id<"habits">) => {
    removeHabit({ id });
  };

  const addGoal = (goal: {
    type: GoalType;
    title: string;
    currentWeight?: number;
    targetWeightLoss?: number;
    targetBooks?: number;
    booksRead?: number;
    targetValue: number;
    unit: string;
    deadline: string;
  }) => {
    if (!userId) return;
    createGoal({
      type: goal.type,
      title: goal.title,
      currentWeight: goal.currentWeight,
      targetWeightLoss: goal.targetWeightLoss,
      targetBooks: goal.targetBooks,
      booksRead: goal.booksRead,
      targetValue: goal.targetValue,
      unit: goal.unit,
      deadline: goal.deadline,
      userId,
    });
  };

  const addGoalWithHabits = (params: {
    goal: {
      type: GoalType;
      title: string;
      currentWeight?: number;
      targetWeightLoss?: number;
      targetBooks?: number;
      booksRead?: number;
      targetValue: number;
      unit: string;
      deadline: string;
    };
    habits: Array<{
      name: string;
      description: string;
      frequency: "daily" | "weekly" | "flexible";
      templateId: string;
      color: string;
    }>;
  }) => {
    if (!userId) return;
    createGoalWithHabitsMutation({
      goal: {
        ...params.goal,
        userId,
      },
      habits: params.habits.map((h) => ({ ...h, userId })),
    });
  };

  const updateGoal = (
    id: Id<"goals">,
    updates: Partial<{
      title: string;
      currentWeight: number;
      targetWeightLoss: number;
      targetBooks: number;
      booksRead: number;
      targetValue: number;
      currentValue: number;
      unit: string;
      deadline: string;
    }>
  ) => {
    updateGoalMutation({ id, ...updates });
  };

  const deleteGoal = (id: Id<"goals">) => {
    removeGoal({ id });
  };

  const logHabit = (
    habitId: Id<"habits">,
    date: string,
    completed: boolean,
    notes?: string
  ) => {
    if (!userId) return;
    logHabitMutation({ habitId, date, completed, notes, userId });
  };

  const logProgress = (goalId: Id<"goals">, value: number, notes?: string) => {
    if (!userId) return;
    logProgressMutation({ goalId, value, notes, userId });
  };

  return (
    <HabitsContext.Provider
      value={{
        habits: habits ?? [],
        goals: goals ?? [],
        habitLogs: habitLogs ?? [],
        progressLogs: progressLogs ?? [],
        isLoading,
        addHabit,
        updateHabit,
        deleteHabit,
        addGoal,
        addGoalWithHabits,
        updateGoal,
        deleteGoal,
        logHabit,
        logProgress,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}

// Helper functions (kept for compatibility with existing components)
export function getStreakForHabit(
  habitId: Id<"habits">,
  logs: HabitLog[]
): number {
  const habitLogs = logs
    .filter((log) => log.habitId === habitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];

  for (const log of habitLogs) {
    if (log.completed) {
      streak++;
    } else if (log.date !== today) {
      break;
    }
  }

  return streak;
}

export function getCompletionRate(
  habitId: Id<"habits">,
  logs: HabitLog[],
  days = 7
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentLogs = logs.filter(
    (log) => log.habitId === habitId && new Date(log.date) >= cutoffDate
  );

  if (recentLogs.length === 0) return 0;

  const completed = recentLogs.filter((log) => log.completed).length;
  return Math.round((completed / recentLogs.length) * 100);
}

export function getProjectedCompletion(goal: Goal): string | null {
  if (goal.currentValue >= goal.targetValue) return "Completed!";

  const startDate = new Date(goal._creationTime);
  const now = new Date();
  const daysPassed = Math.max(
    1,
    Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const ratePerDay = goal.currentValue / daysPassed;

  if (ratePerDay <= 0) return null;

  const daysRemaining = Math.ceil(
    (goal.targetValue - goal.currentValue) / ratePerDay
  );
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysRemaining);

  return projectedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
