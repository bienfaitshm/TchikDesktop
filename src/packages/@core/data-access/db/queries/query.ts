import {
  resolveToPlain,
  resolveToPlainList,
} from "@/packages/@core/data-access/db";
import { Model } from "sequelize";

export class Query {
  static cleanData<T extends Model>(data: Promise<T | T[]> | T | T[]) {
    return Array.isArray(data)
      ? resolveToPlainList(data)
      : resolveToPlain(data as T);
  }
}
