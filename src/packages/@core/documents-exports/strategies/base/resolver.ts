import {
  schoolInfoService,
  type SchoolInfo,
} from "@/packages/@core/data-access/db/queries";
import type { DataResolver } from "@/packages/electron-data-exporter";

/**
 * Payload interface requiring school and academic year identifiers.
 */
export interface SchoolPayload {
  schoolId: string;
  yearId: string;
}

/**
 * Contract for services capable of retrieving school information.
 */
export interface SchoolInfoFetcher {
  getSchoolInfo(
    schoolId: string,
    yearId: string,
  ): Promise<SchoolInfo> | SchoolInfo;
}

/**
 * Transformation callback signature applied to resolved data.
 */
export type ResolverMapper<TInput, TOutput, TPayload> = (
  data: TInput,
  payload: TPayload,
) => Promise<TOutput> | TOutput;

/**
 * Enhances a DataResolver by injecting school metadata into the resolved data object.
 *
 * @param resolver - The base DataResolver instance to extend.
 * @param service - Optional service dependency used to fetch school details.
 * @returns A new DataResolver instance whose output contains the aggregated school data.
 */
export function withSchoolData<
  Payload extends SchoolPayload,
  Data extends Record<string, unknown>,
>(
  resolver: DataResolver<Payload, Data>,
  service: SchoolInfoFetcher = schoolInfoService,
): DataResolver<Payload, Data & { school: SchoolInfo }> {
  return {
    async resolveData(
      payload: Payload,
    ): Promise<Data & { school: SchoolInfo }> {
      const [school, data] = await Promise.all([
        service.getSchoolInfo(payload.schoolId, payload.yearId),
        resolver.resolveData(payload),
      ]);

      return {
        ...data,
        school,
      };
    },
  };
}

/**
 * Wraps a DataResolver to post-process and transform its resolved dataset.
 *
 * @param resolver - The target DataResolver instance to decorate.
 * @param transformer - Callback function executed to transform the resolved data.
 * @returns A new DataResolver instance returning the transformed output.
 */
export function mapResolver<
  Payload,
  TInput extends Record<string, unknown>,
  TOutput,
>(
  resolver: DataResolver<Payload, TInput>,
  transformer: ResolverMapper<TInput, TOutput, Payload>,
): DataResolver<Payload, TOutput> {
  return {
    async resolveData(payload: Payload): Promise<TOutput> {
      const data = await resolver.resolveData(payload);
      return await transformer(data, payload);
    },
  };
}
