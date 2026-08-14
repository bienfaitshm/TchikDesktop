import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";

export const TutorDetailPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle>Tuteurs</PageHeadTitle>
          <PageHeadDescription>descriptions</PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
          totam ut nesciunt eius cumque quos dolores perspiciatis inventore
          fugiat officiis quam molestias at, iste laborum nam? Aliquid
          consectetur commodi rem?
        </p>
      </PageContent>
    </PageContainer>
  );
};
