import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeadDescription,
  PageHeadTitle,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";
import { ExporterFormContent } from "../components/exporter-content-form";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";

export const ExportDocumentPage = () => {
  const { schoolId, yearId } = useCurrentConfig();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle>Exportation des documents</PageHeadTitle>
          <PageHeadDescription>
            Sélectionnez un modèle et configurez les paramètres d'exportation.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>

      <PageContent>
        <ExporterFormContent schoolId={schoolId!} yearId={yearId} />
      </PageContent>
    </PageContainer>
  );
};
