"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, MessageCircle, Megaphone, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const encouragements = useQuery(
    api.activityFeed.getUnreadEncouragements,
    user ? { userId: user.id } : "skip"
  );

  const markAsRead = useMutation(api.activityFeed.markAsRead);

  const unreadCount = encouragements?.length ?? 0;

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);

    // Mark all as read when closing
    if (!open && encouragements && encouragements.length > 0) {
      await markAsRead({
        encouragementIds: encouragements.map((e) => e._id),
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "nudge":
        return <Megaphone className="h-4 w-4 text-blue-500" />;
      case "cheer":
        return <Heart className="h-4 w-4 text-pink-500" />;
      case "reaction":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>

        {encouragements && encouragements.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-2">
              {encouragements.map((item) => (
                <div
                  key={item._id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {item.fromDisplayName}
                      </span>{" "}
                      {item.type === "nudge"
                        ? "sent you a nudge"
                        : item.type === "cheer"
                          ? "cheered for you"
                          : `reacted ${item.emoji}`}
                    </p>
                    {item.message && (
                      <p className="text-sm text-muted-foreground mt-1">
                        "{item.message}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
