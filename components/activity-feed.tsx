"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Flame,
  Target,
  UserPlus,
  Shield,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

type ActivityType =
  | "habit_completed"
  | "streak_milestone"
  | "goal_achieved"
  | "member_joined"
  | "streak_shield_used";

interface Activity {
  _id: Id<"activityFeed">;
  userId: string;
  type: ActivityType;
  habitId?: Id<"habits">;
  goalId?: Id<"goals">;
  streakCount?: number;
  message?: string;
  createdAt: string;
  displayName: string;
  avatarUrl?: string;
  reactions: { emoji: string; fromUserId: string }[];
}

interface ActivityFeedProps {
  activities: Activity[];
  communityId: Id<"communities">;
}

const REACTION_EMOJIS = ["🔥", "👏", "💪", "🎉", "❤️"];

const activityConfig: Record<
  ActivityType,
  {
    icon: React.ReactNode;
    color: string;
    getText: (activity: Activity) => string;
  }
> = {
  habit_completed: {
    icon: <Target className="h-4 w-4" />,
    color: "text-green-500",
    getText: (a) => a.message || "completed a habit",
  },
  streak_milestone: {
    icon: <Flame className="h-4 w-4" />,
    color: "text-orange-500",
    getText: (a) => `reached a ${a.streakCount}-day streak!`,
  },
  goal_achieved: {
    icon: <Trophy className="h-4 w-4" />,
    color: "text-yellow-500",
    getText: (a) => a.message || "achieved a goal!",
  },
  member_joined: {
    icon: <UserPlus className="h-4 w-4" />,
    color: "text-blue-500",
    getText: (a) => "joined the community",
  },
  streak_shield_used: {
    icon: <Shield className="h-4 w-4" />,
    color: "text-purple-500",
    getText: (a) => "used a streak shield",
  },
};

export function ActivityFeed({ activities, communityId }: ActivityFeedProps) {
  const { user } = useUser();
  const react = useMutation(api.activityFeed.reactToActivity);

  const handleReaction = async (
    activityId: Id<"activityFeed">,
    emoji: string
  ) => {
    if (!user) return;
    try {
      await react({
        activityId,
        fromUserId: user.id,
        emoji,
      });
    } catch (error) {
      console.error("Failed to react:", error);
    }
  };

  if (activities.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircle className="h-12 w-12 opacity-50" />
          </EmptyMedia>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>Complete habits to show up here!</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];

          return (
            <div
              key={activity._id}
              className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.avatarUrl} />
                <AvatarFallback>
                  {activity.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {activity.displayName}
                  </span>
                  <span className={cn("flex-shrink-0", config.color)}>
                    {config.icon}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {config.getText(activity)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-1 mt-2">
                  {REACTION_EMOJIS.map((emoji) => {
                    const reactionCount = activity.reactions.filter(
                      (r) => r.emoji === emoji
                    ).length;
                    const userReacted = activity.reactions.some(
                      (r) => r.emoji === emoji && r.fromUserId === user?.id
                    );

                    return (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 text-xs",
                          userReacted && "bg-primary/10"
                        )}
                        onClick={() => handleReaction(activity._id, emoji)}
                      >
                        {emoji}
                        {reactionCount > 0 && (
                          <span className="ml-1">{reactionCount}</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
