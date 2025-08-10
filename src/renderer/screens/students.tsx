import { WithSchoolAndYearId } from "@/camons/types/services"
import { TypographyH1 } from "../components/ui/typography"
import { useGetEnrolements } from "@/renderer/libs/queries/enrolement"
import { useGetCurrentYearSchool } from "../libs/stores/app-store"

const StudentEnrolement: React.FC<Required<WithSchoolAndYearId<{}>>> = ({ schoolId, yearId }) => {
    const { data: infos, isLoading } = useGetEnrolements({ schoolId, yearId })

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    // Assurez-vous que les données ne sont pas nulles avant de les utiliser
    const students = infos || [];

    return (
        <div className="flex">
            {/* Side - Barre latérale */}
            <div className="w-1/4 p-4 border-r overflow-y-auto sticky top-0">
                <h2 className="text-xl font-bold mb-4">Liste des élèves</h2>
                <ul className="space-y-2">
                    {students.length > 0 ? (
                        students.map((student) => (
                            <li key={student.enrolementId} className="p-2 border rounded-md cursor-pointe">
                                {student.code}
                            </li>
                        ))
                    ) : (
                        <p>Aucun élève inscrit pour l'instant.</p>
                    )}
                </ul>
            </div>

            {/* Main - Contenu principal */}
            <div className="flex-1 p-8 overflow-y-auto">
                <TypographyH1>
                    Détails de l'élève
                </TypographyH1>
                <div className="mt-4">
                    {/* Ici, vous afficherez les détails de l'élève sélectionné */}
                    <p>Sélectionnez un élève dans la liste pour voir ses détails.</p>
                    <code>
                        {JSON.stringify(infos, null, 4)}
                    </code>
                    <code>
                        {JSON.stringify(infos, null, 4)}
                    </code>
                    <code>
                        {JSON.stringify(infos, null, 4)}
                    </code>
                    <code>
                        {JSON.stringify(infos, null, 4)}
                    </code>
                    <code>
                        {JSON.stringify(infos, null, 4)}
                    </code>
                </div>
            </div>
        </div>
    )
}

const StudentScreen = () => {
    const { schoolId, yearId } = useGetCurrentYearSchool()
    if (!schoolId && !yearId) {
        return null;
    }
    return <StudentEnrolement schoolId={schoolId} yearId={yearId} />
}

export default StudentScreen