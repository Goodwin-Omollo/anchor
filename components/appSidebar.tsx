"use client";

import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Users,
  Trophy,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdAutoGraph, MdInsights, MdTrackChanges } from "react-icons/md";
import { BsGraphUp, BsTrophy } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggler } from "./themeToggler";
import { NotificationBell } from "./notification-bell";
import { usePathname } from "next/navigation";
import { FaUsers } from "react-icons/fa";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LuLayoutDashboard,
  },
  {
    title: "Tracking",
    url: "/tracking",
    icon: MdTrackChanges,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: MdAutoGraph,
  },
  {
    title: "Communities",
    url: "/community",
    icon: FaUsers,
  },
  {
    title: "Achievements",
    url: "/achievements",
    icon: BsTrophy,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-primary! text-white! hover:bg-primary/90!"
                          : ""
                      }
                    >
                      <Link href={item.url} className="">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mx-2 mb-4">
        <NotificationBell />
      </SidebarFooter>
    </Sidebar>
  );
}
