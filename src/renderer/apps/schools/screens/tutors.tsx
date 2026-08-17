import * as React from "react";
import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
  PageHeadAction,
} from "@/renderer/containers/page-container";
import { useGetTutors } from "@/renderer/libs/queries/tutors";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { TutorDialogCreateForm } from "@/renderer/apps/schools/dialogs";
import { TutorTable } from "../tables/tutor-table";
import { Button } from "@/renderer/components/ui/button";

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
        <PageHeadAction>
          <TutorDialogCreateForm
            mutationKey={["schools"]}
            schoolId={schoolId}
            defaultValues={{
              schoolId,
            }}
          >
            <Button size="sm" className="rounded-full text-xs px-2">
              Ajouter un nouveau tuteur
            </Button>
          </TutorDialogCreateForm>
        </PageHeadAction>
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
