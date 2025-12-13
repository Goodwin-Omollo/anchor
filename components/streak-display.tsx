"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flame, Shield, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface StreakDisplayProps {
  habitId: Id<"habits">;
  habitName: string;
  currentStreak: number;
  showShieldButton?: boolean;
}

const MILESTONES = [7, 14, 30, 60, 90, 100, 180, 365];

export function StreakDisplay({
  habitId,
  habitName,
  currentStreak,
  showShieldButton = true,
}: StreakDisplayProps) {
  const { user } = useUser();
  const [showShieldDialog, setShowShieldDialog] = useState(false);

  const canUseShield = useQuery(
    api.streakShields.canUseShield,
    user ? { userId: user.id } : "skip"
  );
  const hasActiveShield = useQuery(
    api.streakShields.hasActiveShield,
    user && habitId ? { userId: user.id, habitId } : "skip"
  );

  const useShield = useMutation(api.streakShields.useShield);

  const handleUseShield = async () => {
    if (!user) return;

    try {
      await useShield({ userId: user.id, habitId });
      toast.success(
        "Streak shield activated! Your streak is protected for 24 hours."
      );
      setShowShieldDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to use shield");
    }
  };

  // Calculate milestone progress
  const nextMilestone = MILESTONES.find((m) => m > currentStreak);
  const prevMilestone =
    [...MILESTONES].reverse().find((m) => m <= currentStreak) || 0;
  const progressToNext = nextMilestone
    ? ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100;

  // Check if current streak is a milestone
  const isMilestone = MILESTONES.includes(currentStreak);

  // Trigger confetti for milestones
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <>
      <Card
        className={cn(
          "border-none",
          isMilestone
            ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20"
            : "bg-muted"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame
                className={cn(
                  "h-5 w-5",
                  currentStreak > 0
                    ? "text-orange-500"
                    : "text-muted-foreground"
                )}
              />
              Current Streak
              {hasActiveShield && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="secondary"
                        className="gap-1 bg-purple-500/20 text-purple-500"
                      >
                        <Shield className="h-3 w-3" />
                        Protected
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your streak is protected for 24 hours</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
            {showShieldButton && canUseShield?.canUse && !hasActiveShield && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-purple-500 border-purple-500/50 hover:bg-purple-500/10"
                onClick={() => setShowShieldDialog(true)}
              >
                <Shield className="h-3 w-3" />
                Use Shield
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold">{currentStreak}</span>
            <span className="text-muted-foreground mb-1">days</span>
            {isMilestone && (
              <Badge
                className="mb-1 gap-1 bg-yellow-500 text-yellow-950"
                onClick={triggerCelebration}
              >
                <Trophy className="h-3 w-3" />
                Milestone!
              </Badge>
            )}
          </div>

          {/* Progress to next milestone */}
          {nextMilestone && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentStreak} days</span>
                <span>{nextMilestone} days</span>
              </div>
              <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {nextMilestone - currentStreak} days to next milestone
              </p>
            </div>
          )}

          {/* Milestone badges earned */}
          {currentStreak >= 7 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {MILESTONES.filter((m) => m <= currentStreak).map((milestone) => (
                <TooltipProvider key={milestone}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="gap-1 bg-orange-500/10 border-orange-500/50"
                      >
                        <Sparkles className="h-3 w-3 text-orange-500" />
                        {milestone}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{milestone}-day milestone achieved!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shield Confirmation Dialog */}
      <Dialog open={showShieldDialog} onOpenChange={setShowShieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Use Streak Shield?
            </DialogTitle>
            <DialogDescription>
              Protect your streak on <strong>{habitName}</strong> for 24 hours.
              You can only use one shield per week.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will protect your {currentStreak}-day streak if you miss
              logging this habit tomorrow.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowShieldDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUseShield}
              className="gap-2 bg-purple-500 hover:bg-purple-600"
            >
              <Shield className="h-4 w-4" />
              Activate Shield
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
