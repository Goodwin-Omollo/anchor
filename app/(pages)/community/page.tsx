"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useHabits } from "@/lib/habits-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CommunityCard from "@/components/community-card";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { JoinCommunityDialog } from "@/components/join-community-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Plus, Target } from "lucide-react";
import { FaUserPlus, FaUsers } from "react-icons/fa";

import Link from "next/link";

export default function CommunityPage() {
  const { user } = useUser();
  const { goals } = useHabits();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const communities = useQuery(
    api.communities.listByUser,
    user ? { userId: user.id } : "skip"
  );

  const isLoading = communities === undefined;
  const hasGoals = goals.length > 0;

  return (
    <div className="px-3 md:px-6">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl text-primary font-bold">Communities</h1>
        <p className="mt-1">
          Join accountability groups and compete with friends
        </p>
      </div>

      {/* Action Buttons */}
      {communities && communities.length > 0 && (
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setShowCreate(true)}
            className="gap-2"
            disabled={!hasGoals}
          >
            <Plus className="h-4 w-4" />
            Create Community
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowJoin(true)}
            className="gap-2"
            disabled={!hasGoals}
          >
            <FaUserPlus className="h-4 w-4" />
            Join with Code
          </Button>
        </div>
      )}

      {/* Communities Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-lg bg-muted">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : communities?.length === 0 ? (
        <Empty className="bg-muted">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {hasGoals ? (
                <FaUsers className="h-5 w-5" />
              ) : (
                <Target className="h-5 w-5" />
              )}
            </EmptyMedia>
            <EmptyTitle>
              {hasGoals
                ? "No communities created or joined yet"
                : "Create a goal first"}
            </EmptyTitle>
            <EmptyDescription>
              {hasGoals
                ? "Create a community or join one with an invite code to compete with friends!"
                : "You need to set a goal before you can join or create a community."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hasGoals ? (
              <div className="flex gap-3">
                <Button onClick={() => setShowCreate(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Community
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowJoin(true)}
                  className="gap-2"
                >
                  <FaUserPlus className="h-4 w-4" />
                  Join with Code
                </Button>
              </div>
            ) : (
              <Link href="/dashboard">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Goal
                </Button>
              </Link>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {communities
            ?.filter((community) => community !== null)
            .map((community) => (
              <CommunityCard
                key={community._id}
                community={{
                  _id: community._id,
                  name: community.name,
                  description: community.description,
                  goalType: community.goalType,
                  memberCount: community.memberCount,
                  maxMembers: community.maxMembers,
                  userRole: community.userRole,
                }}
              />
            ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateCommunityDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        userGoals={goals}
      />
      <JoinCommunityDialog open={showJoin} onOpenChange={setShowJoin} />
    </div>
  );
}
