"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AchievementsGrid } from "@/components/achievements-grid";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Loader2, Trophy } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function AchievementsPage() {
  const { user } = useUser();
  const [isInitializing, setIsInitializing] = useState(false);
  const initializeAchievements = useMutation(
    api.achievements.initializeAchievements
  );
  const allAchievements = useQuery(api.achievements.getAllWithStatus, {
    userId: user?.id || "",
  });

  const syncNeeded = useQuery(api.achievements.checkSyncStatus);

  if (!user) {
    return (
      <div className="px-3 md:px-8 py-4">
        <p>Please sign in to view achievements</p>
      </div>
    );
  }

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const result = await initializeAchievements();
      console.log(`Seeded ${result.seededCount} achievements`);
    } catch (error) {
      console.error("Failed to initialize achievements:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Show initialize/sync button if no achievements exist or sync is needed
  if ((allAchievements && allAchievements.length === 0) || syncNeeded) {
    return (
      <div className="px-3 md:px-6">
        <div className="mb-4 text-center">
          <h1 className="text-2xl text-primary font-bold">Achievements</h1>
          <p className="mt-1">
            Unlock badges by building habits and reaching milestones
          </p>
        </div>

        <Card className="bg-muted border-none max-w-md mx-auto mt-8">
          <Empty className="">
            <EmptyMedia variant="icon">
              <Trophy className="size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>
                {allAchievements && allAchievements.length === 0
                  ? "No Achievements Yet"
                  : "New Achievements Available"}
              </EmptyTitle>
              <EmptyDescription>
                {allAchievements && allAchievements.length === 0
                  ? "Initialize the achievement system to start earning badges"
                  : "Sync to get the latest badges and challenges"}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={handleInitialize}
                disabled={isInitializing}
                className="w-full"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {allAchievements && allAchievements.length === 0
                      ? "Initializing..."
                      : "Syncing..."}
                  </>
                ) : allAchievements && allAchievements.length === 0 ? (
                  "Initialize Achievements"
                ) : (
                  "Sync Achievements"
                )}
              </Button>
            </EmptyContent>
          </Empty>
        </Card>

        {/* Show existing achievements below if we are just syncing */}
        {allAchievements && allAchievements.length > 0 && (
          <div className="mt-8 opacity-50 pointer-events-none filter blur-sm">
            <AchievementsGrid userId={user.id} showLocked />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 md:px-6">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl text-primary font-bold">Achievements</h1>
        <p className="mt-1 ">
          Unlock badges by building habits and reaching milestones
        </p>
      </div>

      {/* Achievements Grid */}
      <AchievementsGrid userId={user.id} showLocked />
    </div>
  );
}
