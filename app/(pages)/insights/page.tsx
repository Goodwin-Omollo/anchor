"use client";

import { useMemo } from "react";
import {
  useHabits,
  getStreakForHabit,
  getCompletionRate,
  getProjectedCompletion,
} from "@/lib/habits-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Flame, Target, Calendar } from "lucide-react";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{payload[0].value}%</p>
    </div>
  );
}

export default function InsightsPage() {
  const { habits, goals, habitLogs, progressLogs, isLoading } = useHabits();

  // Calculate weekly completion data
  const weeklyData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayLogs = habitLogs.filter((l) => l.date === dateStr);
      const completed = dayLogs.filter((l) => l.completed).length;
      const total = habits.length;

      data.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: dateStr,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return data;
  }, [habits, habitLogs]);

  // Calculate monthly trend data
  const monthlyData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayLogs = habitLogs.filter((l) => l.date === dateStr);
      const completed = dayLogs.filter((l) => l.completed).length;
      const total = habits.length;

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return data;
  }, [habits, habitLogs]);

  // Habit performance data
  const habitPerformance = useMemo(() => {
    return habits
      .map((habit) => ({
        name: habit.name,
        color: habit.color,
        streak: getStreakForHabit(habit._id, habitLogs),
        weeklyRate: getCompletionRate(habit._id, habitLogs, 7),
        monthlyRate: getCompletionRate(habit._id, habitLogs, 30),
      }))
      .sort((a, b) => b.weeklyRate - a.weeklyRate);
  }, [habits, habitLogs]);

  // Goal progress data
  const goalProgress = useMemo(() => {
    return goals.map((goal) => {
      const logs = progressLogs
        .filter((l) => l.goalId === goal._id)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      return {
        ...goal,
        progress: (goal.currentValue / goal.targetValue) * 100,
        projected: getProjectedCompletion(goal),
        history: logs.map((l) => ({
          date: new Date(l.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: l.value,
        })),
      };
    });
  }, [goals, progressLogs]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalCompletions = habitLogs.filter((l) => l.completed).length;
    const totalPossible = habitLogs.length;
    const overallRate =
      totalPossible > 0
        ? Math.round((totalCompletions / totalPossible) * 100)
        : 0;
    const bestStreak = Math.max(
      ...habits.map((h) => getStreakForHabit(h._id, habitLogs)),
      0
    );
    const goalsCompleted = goals.filter(
      (g) => g.currentValue >= g.targetValue
    ).length;

    return {
      overallRate,
      bestStreak,
      goalsCompleted,
      totalGoals: goals.length,
    };
  }, [habits, goals, habitLogs]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="mt-1 text-muted-foreground">
          Track your progress and analyze your habit patterns
        </p>
      </div>

      {/* Overview Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none bg-muted">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-none bg-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overall Completion
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.overallRate}%
                </div>
                <Progress
                  value={overallStats.overallRate}
                  className="mt-2 h-2"
                />
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
                <div className="text-2xl font-bold">
                  {overallStats.bestStreak} days
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep it going!
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Goals Progress
                </CardTitle>
                <Target className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.goalsCompleted}/{overallStats.totalGoals}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  goals achieved
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Habits
                </CardTitle>
                <Calendar className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{habits.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  being tracked
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Completion Chart */}
        <Card className="border-none bg-muted">
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>
              Your habit completion over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] flex items-end justify-between gap-2 px-4">
                {[...Array(7)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="w-full"
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="percentage"
                      fill="hsl(142, 76%, 36%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-none bg-muted">
          <CardHeader>
            <CardTitle>30-Day Trend</CardTitle>
            <CardDescription>
              Your consistency over the past month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke="hsl(217, 91%, 60%)"
                      fill="hsl(217, 91%, 60%)"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habit Performance */}
        <Card className="border-none bg-muted">
          <CardHeader>
            <CardTitle>Habit Performance</CardTitle>
            <CardDescription>Completion rates for each habit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </>
            ) : habitPerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No habits to analyze yet
              </p>
            ) : (
              habitPerformance.map((habit) => (
                <div key={habit.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="text-sm font-medium">{habit.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Flame className="h-3 w-3" />
                        {habit.streak}d
                      </span>
                      <span className="font-medium">{habit.weeklyRate}%</span>
                    </div>
                  </div>
                  <Progress value={habit.weeklyRate} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card className="border-none bg-muted">
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>Track your goals with projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </>
            ) : goalProgress.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No goals to track yet
              </p>
            ) : (
              goalProgress.map((goal) => (
                <div key={goal._id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(goal.progress)}% complete</span>
                    {goal.projected && (
                      <span>
                        Projected:{" "}
                        <span className="text-primary">{goal.projected}</span>
                      </span>
                    )}
                  </div>
                  {goal.history.length > 1 && (
                    <div className="h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={goal.history}>
                          <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            hide
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Habit Correlations */}
      {habits.length >= 2 && (
        <Card className="mt-6 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Habit Correlations</CardTitle>
            <CardDescription>
              See how completing certain habits affects others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {habits.slice(0, 3).map((habit) => {
                const linkedGoal = goals.find((g) => g._id === habit.goalId);
                const completionRate = getCompletionRate(
                  habit._id,
                  habitLogs,
                  30
                );

                return (
                  <div
                    key={habit._id}
                    className="rounded-lg border-none bg-muted p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    {linkedGoal ? (
                      <p className="text-sm text-muted-foreground">
                        When completed consistently ({completionRate}% this
                        month), contributes to{" "}
                        <span className="text-primary">{linkedGoal.title}</span>{" "}
                        goal progress.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {completionRate}% completion rate this month. Link to a
                        goal to track its impact.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
