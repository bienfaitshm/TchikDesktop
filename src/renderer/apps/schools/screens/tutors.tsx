import * as React from "react";
import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";
import { TutorProfileDialog } from "../components/tutor-profile.dialog";
import { TutorDetail } from "../components/tutor-profile";
import { useGetTutors } from "@/renderer/libs/queries/tutors";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";

/**
 * Mock dataset representing complete legal tutor profiles for development and visual testing.
 */
export const MOCK_TUTORS: TutorDetail[] = [
  {
    id: "tut-001",
    firstName: "Jean",
    lastName: "Kambale",
    middleName: "Mukendi",
    phoneNumber: "+243 990 123 456",
    email: "jean.kambale@example.com",
    address: "12 Avenue Moero, Lubumbashi",
    profession: "Ingénieur Civil",
    gender: "MALE",
    students: [
      {
        id: "std-101",
        firstName: "Marc",
        lastName: "Kambale",
        middleName: "Ilunga",
        classroomName: "3ème Scientifique A",
        status: "ACTIVE",
        relationship: "Père",
      },
      {
        id: "std-102",
        firstName: "Sarah",
        lastName: "Kambale",
        middleName: "Mbuyi",
        classroomName: "1ère Littéraire B",
        status: "ACTIVE",
        relationship: "Père",
      },
    ],
  },
  {
    id: "tut-002",
    firstName: "Marie",
    lastName: "Tshilombo",
    phoneNumber: "+243 810 987 654",
    email: "marie.tshilombo@example.com",
    address: "45 Boulevard Kamanyola, Lubumbashi",
    profession: "Médecin Généraliste",
    gender: "FEMALE",
    students: [
      {
        id: "std-201",
        firstName: "David",
        lastName: "Tshilombo",
        classroomName: "6ème Primaire C",
        status: "ACTIVE",
        relationship: "Mère",
      },
    ],
  },
];

/**
 * Renders the tutors management page displaying administrative overview controls and tutor detail dialogs.
 * @returns Rendered page component for legal tutor administration.
 */
export const TutorsPage: React.FC = () => {
  const { schoolId } = useCurrentConfig();
  const { data: totors } = useGetTutors({ where: { tutors: { schoolId } } });
  console.log("tot", totors);

  const [selectedTutor, setSelectedTutor] = React.useState<
    TutorDetail | undefined
  >(MOCK_TUTORS[0]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle>Tuteurs</PageHeadTitle>
          <PageHeadDescription>
            Gérez la liste des tuteurs légaux, consultez leurs coordonnées et
            accédez aux profils des élèves associés.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Aperçu du profil tuteur
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cliquez sur le bouton ci-dessous pour ouvrir la fiche détaillée
                du tuteur sélectionné.
              </p>
            </div>

            <TutorProfileDialog
              tutor={selectedTutor}
              trigger={
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">
                  Voir la fiche tuteur
                </button>
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {MOCK_TUTORS.map((tutor) => (
              <div
                key={tutor.id}
                onClick={() => setSelectedTutor(tutor)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedTutor?.id === tutor.id
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100">
                    {tutor.firstName} {tutor.lastName}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {tutor.students.length} élève(s)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {tutor.phoneNumber}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

TutorsPage.displayName = "TutorsPage";
