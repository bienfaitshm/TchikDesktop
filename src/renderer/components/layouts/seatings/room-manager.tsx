import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import { useRoomManagement, RoomState, Seating, Student } from "./hooks";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/renderer/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/renderer/components/ui/table";
import { Button } from "@/renderer/components/ui/button";

import { Trash2, Users, MapPin, ChevronLeft, ChevronRight, Layout } from "lucide-react";

export default function RoomManager({ rooms, sessionId }: { rooms: RoomState[], sessionId: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  // Vérifier si le contenu déborde pour afficher les flèches
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowArrows(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [rooms]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!rooms || rooms.length === 0) return null;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 bg-background">
      {/* Header compact */}
      <div className="flex justify-between items-end border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Layout className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Gestion des Locaux</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Session: {sessionId}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue={rooms.roomId} className="w-full space-y-0">
        {/* Container des Tabs avec Flèches Style VSCode */}
        <div className="relative group flex items-center border-b bg-muted/30">
          {showArrows && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 h-full px-1 bg-background/80 backdrop-blur border-r hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <TabsList
            ref={scrollRef}
            className="flex h-11 w-full justify-start overflow-x-auto scrollbar-hide bg-transparent p-0 rounded-none"
          >
            {rooms.map((room) => (
              <TabsTrigger
                key={room.roomId}
                value={room.roomId}
                className="relative h-11 px-6 rounded-none border-r border-border/50 bg-transparent 
                           data-[state=active]:bg-background data-[state=active]:shadow-none
                           data-[state=active]:after:absolute data-[state=active]:after:bottom-0 
                           data-[state=active]:after:left-0 data-[state=active]:after:right-0 
                           data-[state=active]:after:h-[2px] data-[state=active]:after:bg-primary
                           hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{room.roomName}</span>
                  <span className="text-[10px] opacity-50 px-1.5 py-0.5 rounded-full bg-muted">
                    {room.studentCount}
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {showArrows && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 h-full px-1 bg-background/80 backdrop-blur border-l hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {rooms.map((room) => (
          <TabsContent key={room.roomId} value={room.roomId} className="mt-0 ring-offset-0 focus-visible:ring-0">
            <StudentList roomData={room} sessionId={sessionId} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const StudentList = ({ roomData, sessionId }: { roomData: RoomState, sessionId: string }) => {
  const { state, actions } = useRoomManagement(roomData, sessionId);

  const occupiedSeats = useMemo(() => {
    return state.seatingPlan.filter(
      (seat): seat is Seating & { student: Student } => seat.student !== null
    );
  }, [state.seatingPlan]);

  return (
    <Card className="border-none shadow-none rounded-none">
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b bg-background">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <CardTitle className="text-base font-semibold">{state.roomName}</CardTitle>
            <CardDescription className="text-xs">
              {occupiedSeats.length} étudiants présents sur cette liste
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)] w-full">
          <Table>
            <TableHeader className="bg-muted/20 sticky top-0 z-10 backdrop-blur">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[120px] text-xs uppercase font-bold px-6">Enr. ID</TableHead>
                <TableHead className="text-xs uppercase font-bold">Étudiant</TableHead>
                <TableHead className="text-xs uppercase font-bold">Classe</TableHead>
                <TableHead className="text-xs uppercase font-bold">Localisation</TableHead>
                <TableHead className="text-right px-6 text-xs uppercase font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occupiedSeats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Aucun enregistrement trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                occupiedSeats.map((seat) => (
                  <StudentRow
                    key={seat.student.id}
                    seat={seat}
                    onRemove={actions.removeStudent}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const StudentRow = memo(({ seat, onRemove }: { seat: Seating & { student: Student }; onRemove: (id: string) => void; }) => {
  const { student, row, column } = seat;

  return (
    <TableRow className="group border-b border-border/40 hover:bg-muted/30 transition-colors">
      <TableCell className="font-mono text-[11px] text-muted-foreground px-6">
        #{student.id.slice(-6).toUpperCase()}
      </TableCell>
      <TableCell>
        <span className="font-medium text-sm tracking-tight">{student.name}</span>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="rounded-sm font-semibold text-[10px] uppercase">
          {student.classId}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="bg-muted px-1.5 py-0.5 rounded">R{row}</span>
          <span className="bg-muted px-1.5 py-0.5 rounded">C{column}</span>
        </div>
      </TableCell>
      <TableCell className="text-right px-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
          onClick={() => onRemove(student.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

StudentRow.displayName = "StudentRow";