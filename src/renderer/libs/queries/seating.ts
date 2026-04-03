import { useMutation, useQuery } from "@tanstack/react-query";
import { stats } from "@/renderer/libs/apis";
import type {
  TUserCreate,
  TUserUpdate,
  TUserFilter,
} from "@/packages/@core/data-access/schema-validations";
