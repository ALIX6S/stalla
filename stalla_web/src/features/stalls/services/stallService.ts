import { apiRequest } from "../../../core/api";
import type { ApiResponse, StandCategory } from "../../../core/types";
import type { Stand } from "../types";

export function getStalls(): Promise<ApiResponse<Stand[]>> {
  return apiRequest<Stand[]>("/admin/stalls");
}

export function createStall(payload: {
  code: string;
  zone: string;
  category: StandCategory;
  monthly_price: number;
}): Promise<ApiResponse<Stand>> {
  return apiRequest<Stand>("/admin/stalls", "POST", payload);
}

export function deleteStall(stallId: number): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/admin/stalls/${stallId}`, "DELETE");
}
