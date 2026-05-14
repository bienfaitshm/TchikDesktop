"use client";
import { useParams } from "react-router";
import { useGetSeatingSessionById } from "@/renderer/libs/queries/seating";

export const SeatingSessionDetailPage = () => {
  const { sessionId } = useParams();
  // const { schoolId, yearId } = useSchoolContext();
  const { data: seatingSession } = useGetSeatingSessionById(
    sessionId as string,
  );
  // const { data: seatings } = useSessionWithAssignments(sessionId as string);
  // console.log("seatings", seatings);
  return (
    <div>
      <h1>{seatingSession.sessionName}</h1>
    </div>
  );
};
