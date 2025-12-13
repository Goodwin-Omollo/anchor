"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Lock, Sparkles, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementsGridProps {
  userId: string;
  showLocked?: boolean;
  limit?: number;
}

const rarityColors = {
  common: "border-gray-400 bg-gray-400/10",
  rare: "border-blue-500 bg-blue-500/10",
  epic: "border-purple-500 bg-purple-500/10",
  legendary: "border-yellow-500 bg-yellow-500/10",
};

const rarityText = {
  common: "text-gray-400",
  rare: "text-blue-500",
  epic: "text-purple-500",
  legendary: "text-yellow-500",
};

export function AchievementsGrid({
  userId,
  showLocked = true,
  limit,
}: AchievementsGridProps) {
  const achievements = useQuery(api.achievements.getAllWithStatus, { userId });
  const stats = useQuery(api.achievements.getStats, { userId });

  if (!achievements || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="">
            <CardContent className="p-4">
              <Skeleton className="h-12 w-12 rounded-full mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const filteredAchievements = showLocked
    ? achievements
    : achievements.filter((a) => a.unlocked);

  // Group achievements by type
  const streakBadges = filteredAchievements.filter((a) => a.type === "streak");
  const goalBadges = filteredAchievements.filter((a) => a.type === "goal");

  const displayStreakBadges = limit
    ? streakBadges.slice(0, limit)
    : streakBadges;
  const displayGoalBadges = limit ? goalBadges.slice(0, limit) : goalBadges;

  const renderAchievementCard = (
    achievement: (typeof achievements)[number]
  ) => (
    <Card
      key={achievement._id}
      className={cn(
        "border transition-all hover:shadow-md",
        achievement.unlocked
          ? rarityColors[achievement.rarity as keyof typeof rarityColors]
          : "border-muted bg-muted/30"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg text-2xl",
              achievement.unlocked
                ? "bg-background/50"
                : "bg-muted-foreground/10"
            )}
          >
            {achievement.unlocked ? (
              <span>{achievement.icon}</span>
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-semibold text-sm leading-tight",
                  !achievement.unlocked && "text-muted-foreground"
                )}
              >
                {achievement.title}
              </h3>
              {achievement.unlocked && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize shrink-0",
                    rarityText[achievement.rarity as keyof typeof rarityText]
                  )}
                >
                  {achievement.rarity}
                </Badge>
              )}
            </div>
            <p
              className={cn(
                "text-xs mt-1",
                achievement.unlocked
                  ? "text-muted-foreground"
                  : "text-muted-foreground/60"
              )}
            >
              {achievement.description}
            </p>
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-muted-foreground/80 mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="">
      {/* Stats Overview */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {stats.unlocked} of {stats.total} unlocked
            </span>
            <span className="text-sm font-medium">
              {Math.round((stats.unlocked / stats.total) * 100)}%
            </span>
          </div>
          <Progress value={(stats.unlocked / stats.total) * 100} />

          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-xs">{stats.byRarity.common} Common</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs">{stats.byRarity.rare} Rare</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs">{stats.byRarity.epic} Epic</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">
                {stats.byRarity.legendary} Legendary
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold">Streak Badges</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-1">
          Unlock badges as you maintain your streak. These reset if you lose
          your streak.
        </p>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayStreakBadges.map(renderAchievementCard)}
        </div>
      </div>

      {/* Goal Completion Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Goal Completion Badges</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-1">
          Unlock badges as you complete your goals. These badges are permanent.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayGoalBadges.map(renderAchievementCard)}
        </div>
      </div>
    </div>
  );
}
