import React, { memo, useMemo } from 'react';
import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card"
import { Save, UserPlus, Users } from "lucide-react";
import { useRoomManagement } from './hooks';

export default function GlobalRoomManager({ rooms, allStudents, sessionId }) {
    // Hook de gestion pour la première salle (exemple pour un local)
    const { state, actions, cleanData } = useRoomManagement(rooms, sessionId);

    // Filtrer les étudiants qui ne sont pas encore assis dans cette salle
    const unassignedStudents = useMemo(() => {
        const assignedIds = new Set(
            state.seatingPlan
                .filter(s => s.student)
                .map(s => s.student?.id)
        );
        return allStudents?.filter(s => !assignedIds.has(s.id)) || [];
    }, [allStudents, state.seatingPlan]);

    const handleSave = () => {
        console.log("Données formatées pour l'API :", cleanData);
        // Ici ton appel API: mutation.mutate(cleanData)
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 p-4">
            {/* SIDEBAR : Liste des élèves non assignés */}
            <Card className="w-80 flex flex-col border-2">
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" /> Non assignés
                    </h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                        {unassignedStudents.length}
                    </span>
                </div>
                <ScrollArea className="flex-1 p-2">
                    <div className="space-y-2">
                        {unassignedStudents.map((student) => (
                            <DraggableStudent key={student.id} student={student} />
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* ZONE PRINCIPALE : Grille et Bouton Save */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden">
                    <RoomGrid state={state} actions={actions} />
                </div>

                {/* BARRE D'ACTION FIXE */}
                <div className="bg-white p-4 border-2 rounded-xl flex justify-between items-center shadow-lg">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Étudiants placés : </span>
                        <span className="font-bold text-primary">{state.studentCount}</span>
                    </div>
                    <Button
                        size="lg"
                        onClick={handleSave}
                        className="gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Enregistrer le placement
                    </Button>
                </div>
            </div>
        </div>
    );
}

const DraggableStudent = ({ student }) => {
    const onDragStart = (e: React.DragEvent) => {
        // On passe l'ID et l'objet complet en JSON pour plus de flexibilité
        e.dataTransfer.setData("studentId", student.id);
        e.dataTransfer.setData("studentData", JSON.stringify(student));
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="p-3 bg-white border rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-between group"
        >
            <div className="flex flex-col">
                <span className="text-sm font-medium">{student.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{student.classId}</span>
            </div>
            <UserPlus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
    );
};

const RoomGrid = ({ roomData, sessionId }) => {
    const { state, actions } = useRoomManagement(roomData, sessionId);

    // Calcul dynamique des colonnes pour le CSS
    const maxCols = Math.max(...state.seatingPlan.map(s => s.column));

    return (
        <Card className="border-2">
            <CardHeader className="bg-slate-50/50 border-b">
                <div className="flex justify-between">
                    <CardTitle>{state.roomName}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Taux d'occupation : <span className="font-mono">{state.occupancyRate}%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-grid-slate-100">
                    <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: `repeat(${maxCols + 1}, minmax(120px, 1fr))` }}
                    >
                        {state.seatingPlan.map((seat) => (
                            <Seat
                                key={`${seat.row}-${seat.column}`}
                                seat={seat}
                                onTransfer={actions.transferStudent}
                                onRemove={actions.removeStudent}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

// 3. Cellule Individuelle (Mémoïsée)
const Seat = memo(({ seat, onTransfer, onRemove }: any) => {
    const hasStudent = !!seat.student;

    return (
        <div
            className={`
        relative h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-2 transition-all
        ${hasStudent ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted bg-transparent opacity-40'}
      `}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                const studentId = e.dataTransfer.getData("studentId");
                onTransfer(studentId, seat.row, seat.column);
            }}
        >
        </div >
    )
});