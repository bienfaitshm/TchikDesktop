"use client";

import React from "react";
import { NavLink, useNavigate, useParams } from "react-router";
import { ChevronLeft, DoorOpen } from "lucide-react";

import {
  SidebarFlatList,
  SidebarItem,
  SidebarItemMedia,
  SidebarItemContent,
  SidebarItemTitle,
  SidebarItemDescription,
} from "@/renderer/components/sidebar-menus";
import { Button } from "@/renderer/components/ui/button";
import { useGetSessionRoomsStatus } from "@/renderer/libs/queries/seating";
import { cn } from "@/renderer/utils";
import { APP_ROUTES } from "@/renderer/constants";
interface LocalRoomStatus {
  localroomId: string;
  roomName: string;
  assignedCount: number;
  maxCapacity: number;
  occupancyRate: number;
}

export const LocalroomSidebar: React.FC = () => {
  const { sessionId, localroomId } = useParams<{
    sessionId: string;
    localroomId: string;
  }>();
  const navigate = useNavigate();

  const { data: localrooms = [] } = useGetSessionRoomsStatus(sessionId!);

  return (
    <SidebarFlatList
      data={localrooms as LocalRoomStatus[]}
      listHeaderComponent={
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-md hover:bg-accent border border-border/40 shadow-xs"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ChevronLeft className="size-4 text-muted-foreground" />
            </Button>
            <h2 className="text-sm font-semibold tracking-tight truncate leading-none">
              Salles & Locaux
            </h2>
          </div>
        </div>
      }
      renderItem={(room) => {
        const isCritical = room.occupancyRate >= 90;
        const isActive = room.localroomId === localroomId;

        return (
          <SidebarItem
            key={room.localroomId}
            isActive={isActive}
            asChild
            className="h-12 py-2"
            data-critical={isCritical ? "true" : undefined}
          >
            <NavLink
              to={APP_ROUTES.SEATING.ASSIGNMENT(
                sessionId as string,
                room.localroomId,
              )}
            >
              <SidebarItemMedia
                className={cn(
                  "p-1.5 size-8 rounded-md bg-background border transition-colors",
                  "group-aria-[current=page]:border-primary/40 group-aria-[current=page]:bg-primary/5",
                  isCritical &&
                    "border-destructive/20 bg-destructive/5 text-destructive group-aria-[current=page]:text-destructive",
                )}
              >
                <DoorOpen className="size-4" />
              </SidebarItemMedia>

              <SidebarItemContent>
                <SidebarItemTitle className="text-xs font-semibold">
                  {room.roomName}
                </SidebarItemTitle>
                <SidebarItemDescription className="font-medium uppercase tracking-wider">
                  Capacité:{" "}
                  <span className="font-bold text-foreground/80">
                    {room.maxCapacity}
                  </span>
                  {isCritical && (
                    <span className="sr-only">
                      {" "}
                      (Attention : capacité critique)
                    </span>
                  )}
                </SidebarItemDescription>
              </SidebarItemContent>
            </NavLink>
          </SidebarItem>
        );
      }}
    />
  );
};

LocalroomSidebar.displayName = "LocalroomSidebar";
