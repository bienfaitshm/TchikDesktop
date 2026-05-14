import { useParams } from "react-router";

export const SeatingSessionAssignmentPage = () => {
  const { localroomId } = useParams();
  return (
    <div>
      <h1>Assignements :{localroomId} </h1>
    </div>
  );
};
