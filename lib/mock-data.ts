export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "flexible";
  goalId?: string;
  color: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface ProgressLog {
  id: string;
  goalId: string;
  date: string;
  value: number;
  notes?: string;
}

// Mock user data
export const mockUser: User = {
  id: "1",
  email: "user@example.com",
  name: "John Doe",
};

// Mock goals
export const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Lose 20kg",
    targetValue: 20,
    currentValue: 5.5,
    unit: "kg",
    deadline: "2025-06-30",
    createdAt: "2025-01-01",
  },
  {
    id: "2",
    title: "Read 24 books",
    targetValue: 24,
    currentValue: 8,
    unit: "books",
    deadline: "2025-12-31",
    createdAt: "2025-01-01",
  },
];

// Mock habits
export const mockHabits: Habit[] = [
  {
    id: "1",
    name: "OMAD Fasting",
    description: "One meal a day intermittent fasting",
    frequency: "daily",
    goalId: "1",
    color: "#4ade80",
    createdAt: "2025-01-01",
  },
  {
    id: "2",
    name: "Morning Run",
    description: "30 minutes of running",
    frequency: "daily",
    goalId: "1",
    color: "#60a5fa",
    createdAt: "2025-01-01",
  },
  {
    id: "3",
    name: "Read 30 minutes",
    description: "Read for at least 30 minutes",
    frequency: "daily",
    goalId: "2",
    color: "#f59e0b",
    createdAt: "2025-01-01",
  },
  {
    id: "4",
    name: "Meditation",
    description: "10 minutes of mindfulness",
    frequency: "daily",
    color: "#a78bfa",
    createdAt: "2025-01-15",
  },
];

// Generate mock habit logs for the past 30 days
export function generateMockHabitLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    mockHabits.forEach((habit) => {
      // Random completion with higher probability for recent days
      const completed = Math.random() > (i < 7 ? 0.2 : 0.4);
      logs.push({
        id: `log-${habit.id}-${dateStr}`,
        habitId: habit.id,
        date: dateStr,
        completed,
      });
    });
  }

  return logs;
}

// Generate mock progress logs
export function generateMockProgressLogs(): ProgressLog[] {
  const logs: ProgressLog[] = [];
  const today = new Date();

  // Weight progress (starting at 85kg, goal to lose 20kg = reach 65kg)
  let currentWeight = 85;
  for (let i = 30; i >= 0; i -= 3) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    currentWeight -= Math.random() * 0.8;
    logs.push({
      id: `progress-1-${i}`,
      goalId: "1",
      date: date.toISOString().split("T")[0],
      value: Math.round((85 - currentWeight) * 10) / 10,
    });
  }

  // Books progress
  for (let i = 0; i < 8; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (30 - i * 4));
    logs.push({
      id: `progress-2-${i}`,
      goalId: "2",
      date: date.toISOString().split("T")[0],
      value: i + 1,
    });
  }

  return logs;
}

export const mockHabitLogs = generateMockHabitLogs();
export const mockProgressLogs = generateMockProgressLogs();

// Helper functions
export function getStreakForHabit(habitId: string, logs: HabitLog[]): number {
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
  habitId: string,
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

  const startDate = new Date(goal.createdAt);
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
