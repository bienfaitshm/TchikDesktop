"use client";

import React from "react";
import { NavLink, useNavigate, useParams } from "react-router";
import { ChevronLeft, DoorOpen } from "lucide-react";

import {
  SidebarFlatList,
  SidebarItem,
} from "@/renderer/components/sidebar-menus";
import { Button } from "@/renderer/components/ui/button";
import { useGetSessionRoomsStatus } from "@/renderer/libs/queries/seating";
import { cn } from "@/renderer/utils";

interface LocalRoomStatus {
  localRoomId: string;
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
              className="size-7 shrink-0 rounded-md hover:bg-accent border border-border/40 shadow-sm"
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
        const isActive = room.localRoomId === localroomId;
        // const isFull = room.occupancyRate >= 100;

        return (
          <SidebarItem
            key={room.localRoomId}
            isActive={isActive}
            asChild
            className="h-auto py-2"
          >
            <RoomNavLink
              isActive={isActive}
              room={room}
              isCritical={isCritical}
              sessionId={sessionId}
            />
          </SidebarItem>
        );
      }}
    />
  );
};

LocalroomSidebar.displayName = "LocalroomSidebar";

const RoomNavLink = ({ sessionId, room, isCritical, isActive }) => {
  return (
    <NavLink
      to={`/seating/${sessionId}/${room.localRoomId}`}
      className={cn(
        "group flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-accent",
        isActive && "bg-accent",
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Container Icône */}
        <div
          className={cn(
            "p-2 rounded-md bg-background border transition-colors",
            "group-data-[state=active]:border-primary/40 group-data-[state=active]:bg-primary/5",
            isCritical && "border-destructive/20 bg-destructive/5",
          )}
        >
          <DoorOpen
            className={cn(
              "h-4 w-4 transition-colors",
              isCritical
                ? "text-destructive"
                : "text-muted-foreground group-data-[state=active]:text-primary",
            )}
          />
        </div>

        {/* Textes */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={cn("text-sm font-semibold truncate leading-none")}>
            {room.roomName}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Capacité: <span className="font-bold">{room.maxCapacity}</span>
            {isCritical && (
              <span className="sr-only"> (Attention : capacité critique)</span>
            )}
          </span>
        </div>
      </div>
    </NavLink>
  );
};
