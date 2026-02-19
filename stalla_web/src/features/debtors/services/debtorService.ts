import { apiRequest } from "../../../core/api";
import type { ApiResponse } from "../../../core/types";
import type { Debtor } from "../types";

export function getDebtors(): Promise<ApiResponse<Debtor[]>> {
  return apiRequest<Debtor[]>("/admin/reports/debtors");
}
