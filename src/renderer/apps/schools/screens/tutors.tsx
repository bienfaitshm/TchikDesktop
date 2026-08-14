import * as React from "react";
import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";
import { useGetTutors } from "@/renderer/libs/queries/tutors";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { TutorTable } from "../tables/tutor-table";

/**
 * Renders the tutors management page displaying administrative overview controls and tutor detail dialogs.
 * @returns Rendered page component for legal tutor administration.
 */
export const TutorsPage: React.FC = () => {
  const { schoolId, yearId } = useCurrentConfig();
  const { data: tutors } = useGetTutors({ where: { tutors: { schoolId } } });

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
        <TutorTable schoolId={schoolId!} yearId={yearId!} tutors={tutors} />
      </PageContent>
    </PageContainer>
  );
};

TutorsPage.displayName = "TutorsPage";
