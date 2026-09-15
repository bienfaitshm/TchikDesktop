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
 * Renders the primary tutors management page, handling data fetching and action dialog integrations.
 * @returns Rendered React page component for managing school legal tutors.
 */
export const TutorsPage: React.FC = () => {
  const { schoolId, yearId } = useCurrentConfig();

  const { data: tutors = [] } = useGetTutors({
    where: { tutors: { schoolId: schoolId } },
  });

  if (!schoolId || !yearId) {
    return null;
  }

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
        <TutorTable
          mutationKey={["schools"]}
          schoolId={schoolId}
          yearId={yearId}
          tutors={tutors}
        />
      </PageContent>
    </PageContainer>
  );
};

TutorsPage.displayName = "TutorsPage";
