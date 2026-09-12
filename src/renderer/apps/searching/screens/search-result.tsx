import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useGetPreviewOfUserQuery } from "@/renderer/libs/queries/application";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { FeeAssignmentTab } from "../../finances/components/fee-assignment-tabs";
import {
  PageContainer,
  PageContent,
} from "@/renderer/containers/page-container";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentAvatar } from "@/renderer/components/student-avatar";

/* -------------------------------------------------------------------------- */
/*                             Container / Search                             */
/* -------------------------------------------------------------------------- */

export const ResultSearch: React.FC = () => {
  const { yearId, schoolId } = useCurrentConfig();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("user") ?? "";

  const { data: preview, isLoading } = useGetPreviewOfUserQuery({
    schoolId,
    yearId,
    search: searchQuery,
  });

  if (isLoading) {
    return (
      <div className="p-6 w-full max-w-2xl animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-gray-600 text-sm font-medium">
          Aucun résultat trouvé
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Vérifiez le matricule ou le nom recherché.
        </p>
      </div>
    );
  }

  const fullName = [
    preview.student.lastName,
    preview.student.middleName,
    preview.student.firstName,
  ]
    .filter((i) => Boolean(i))
    .join(" ");
  return (
    <PageContainer>
      <PageContent>
        <div>
          <h1 className="text-xl">{fullName}</h1>
          <p className="text-sm text-muted-foreground">
            Eleve de {preview.currentEnrollment?.classroom.identifier}
          </p>
        </div>
        <div className="w-full">
          {/* {JSON.stringify(preview.currentEnrollment, null, 4)} */}
          {preview.currentEnrollment?.enrollmentId && (
            <FeeAssignmentTab
              enrollmentId={preview.currentEnrollment?.enrollmentId}
            />
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
};
