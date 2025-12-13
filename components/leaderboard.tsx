"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  details: string;
  rank: number;
  role: "admin" | "member";
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  title?: string;
  subtitle?: string;
}

const rankConfig = {
  1: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  2: { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10" },
  3: { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10" },
};

export function Leaderboard({
  entries,
  currentUserId,
  title = "Leaderboard",
  subtitle = "Weekly rankings",
}: LeaderboardProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm ">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Podium for top 3 */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-2 pb-4 ">
            {/* 2nd place */}
            {top3[1] && (
              <div className="flex flex-col items-center">
                <Avatar className="h-12 w-12 border-2 border-gray-400">
                  <AvatarImage src={top3[1].avatarUrl} />
                  <AvatarFallback>
                    {top3[1].displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium truncate max-w-[80px]">
                    {top3[1].displayName}
                  </p>
                  <p className="text-xs ">{top3[1].details}</p>
                </div>
                <div className="mt-1 w-16 h-12 bg-gray-400/20 rounded-t-lg flex items-center justify-center">
                  <Medal className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* 1st place */}
            {top3[0] && (
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-16 w-16 border-2 border-yellow-500">
                  <AvatarImage src={top3[0].avatarUrl} />
                  <AvatarFallback>
                    {top3[0].displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium truncate max-w-[80px]">
                    {top3[0].displayName}
                  </p>
                  <p className="text-xs ">{top3[0].details}</p>
                </div>
                <div className="mt-1 w-20 h-16 bg-yellow-500/20 rounded-t-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            )}

            {/* 3rd place */}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <Avatar className="h-10 w-10 border-2 border-amber-600">
                  <AvatarImage src={top3[2].avatarUrl} />
                  <AvatarFallback>
                    {top3[2].displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium truncate max-w-[80px]">
                    {top3[2].displayName}
                  </p>
                  <p className="text-xs ">{top3[2].details}</p>
                </div>
                <div className="mt-1 w-14 h-8 bg-amber-600/20 rounded-t-lg flex items-center justify-center">
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rest of the list */}
        <div className="space-y-2">
          {rest.map((entry) => {
            const isCurrentUser = entry.userId === currentUserId;

            return (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg",
                  isCurrentUser && "bg-primary/10"
                )}
              >
                <span className="w-6 text-center text-sm font-medium ">
                  {entry.rank}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatarUrl} />
                  <AvatarFallback>{entry.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.displayName}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </p>
                </div>
                <span className="text-sm ">{entry.details}</span>
              </div>
            );
          })}
        </div>

        {/* Show current user's position if not in top list */}
        {entries.length > 3 &&
          !entries
            .slice(0, entries.length)
            .some((e) => e.userId === currentUserId) && (
            <div className="pt-2 border-t">
              <p className="text-sm text-center ">
                Complete more habits to appear on the leaderboard!
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
