"use client";

// Force rebuild

import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Target } from "lucide-react";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";

interface CommunityCardProps {
  community: {
    _id: Id<"communities">;
    name: string;
    description?: string;
    goalType?: "weight-loss" | "reading";
    memberCount: number;
    maxMembers: number;
    userRole: "admin" | "member";
  };
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const goalEmoji =
    community.goalType === "weight-loss"
      ? "⚖️"
      : community.goalType === "reading"
        ? "📚"
        : "🎯";

  return (
    <Link href={`/community/${community._id}`}>
      <Card className=" hover:border-primary transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{goalEmoji}</span>
              <CardTitle className="text-lg">{community.name}</CardTitle>
            </div>
            {community.userRole === "admin" && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>
          {community.description && (
            <p className="text-sm line-clamp-2">{community.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FaUsers className="h-5 w-5" />
              <span>
                {community.memberCount}/{community.maxMembers}{" "}
                {community.goalType === "weight-loss"
                  ? "Weight Loss"
                  : "Reading"}{" "}
                Members
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
