"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ActivityFeed } from "@/components/activity-feed";
import { Leaderboard } from "@/components/leaderboard";
import {
  ArrowLeft,
  Copy,
  Crown,
  LogOut,
  MoreVertical,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";

export default function CommunityDetailPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as Id<"communities">;

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const community = useQuery(api.communities.getWithMembers, { communityId });
  const activities = useQuery(api.activityFeed.getByCommunity, {
    communityId,
    limit: 50,
  });
  const leaderboard = useQuery(api.leaderboard.getCommunityLeaderboard, {
    communityId,
    type: "streak",
  });

  const leaveCommunity = useMutation(api.communities.leave);
  const deleteCommunity = useMutation(api.communities.remove);
  const regenerateCode = useMutation(api.communities.regenerateInviteCode);

  const isLoading = !community || !activities;
  const isAdmin = community?.members?.some(
    (m) => m.userId === user?.id && m.role === "admin"
  );
  const isCreator = community?.createdBy === user?.id;

  const handleCopyCode = () => {
    if (community?.inviteCode) {
      navigator.clipboard.writeText(community.inviteCode);
      toast.success("Invite code copied!");
    }
  };

  const handleRegenerateCode = async () => {
    if (!user) return;
    try {
      const result = await regenerateCode({ communityId, userId: user.id });
      toast.success(`New code: ${result.inviteCode}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    try {
      await leaveCommunity({ communityId, userId: user.id });
      toast.success("Left community");
      router.push("/community");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteCommunity({ communityId, userId: user.id });
      toast.success("Community deleted");
      router.push("/community");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 md:px-8 py-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="px-3 md:px-8 py-4">
        <p>Community not found</p>
        <Link href="/community">
          <Button variant="link" className="gap-2 p-0">
            <ArrowLeft className="h-4 w-4" />
            Back to communities
          </Button>
        </Link>
      </div>
    );
  }

  const goalEmoji =
    community.goalType === "weight-loss"
      ? "⚖️"
      : community.goalType === "reading"
        ? "📚"
        : "🎯";

  return (
    <div className="px-3 md:px-8 py-4">
      {/* Back Button */}
      <Link href="/community">
        <Button variant="ghost" className="gap-2 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goalEmoji}</span>
            <h1 className="text-2xl text-primary font-bold">
              {community.name}
            </h1>
          </div>
          {community.description && (
            <p className="mt-2 ">{community.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary" className="gap-1 py-1">
              <FaUsers className="h-5 w-5" />
              {community.members?.length ?? 0}/{community.maxMembers} members
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
              onClick={handleCopyCode}
            >
              <Copy className="h-3 w-3" />
              {community.inviteCode}
            </Button>
          </div>
        </div>

        {/* Settings Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={handleRegenerateCode}>
                  <Settings className="h-4 w-4 mr-2" />
                  Regenerate Invite Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowLeaveDialog(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Community
            </DropdownMenuItem>
            {isCreator && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Community
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feed">Activity</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <TabsContent value="feed" className="mt-0">
              <Card className="">
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed
                    activities={activities as any}
                    communityId={communityId}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-0">
              {leaderboard && (
                <Leaderboard
                  entries={leaderboard}
                  currentUserId={user?.id ?? ""}
                  title="Streak Leaderboard"
                  subtitle="Who has the longest streak?"
                />
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <Card className="">
                <CardHeader>
                  <CardTitle>Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {community.members?.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50"
                    >
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>
                          {member.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm flex items-center gap-2">
                          {member.displayName}
                          {member.role === "admin" && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </p>
                        <p className="text-xs ">
                          Joined{" "}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {member.userId === user?.id && (
                        <Badge variant="secondary">You</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Side Panel - Quick Stats */}
          <div className="space-y-4">
            <Card className="">
              <CardHeader>
                <CardTitle className="text-sm">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="">Members</span>
                  <span className="font-medium">
                    {community.members?.length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="">Activities Today</span>
                  <span className="font-medium">
                    {activities?.filter(
                      (a) =>
                        a.createdAt.split("T")[0] ===
                        new Date().toISOString().split("T")[0]
                    ).length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="">Top Streak</span>
                  <span className="font-medium">
                    {leaderboard?.[0]?.score ?? 0} days
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* Leave Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Community?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll no longer see updates from this community. You can rejoin
              with the invite code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the community and remove all members.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
