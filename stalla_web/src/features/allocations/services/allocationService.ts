import { apiRequest } from "../../../core/api";
import type { ApiResponse } from "../../../core/types";

export interface Allocation {
  id: number;
  vendor_id: number;
  stall_id: number;
  start_date: string;
  end_date: string | null;
}

export function createAllocation(payload: {
  vendor_id: number;
  stall_id: number;
  start_date: string;
}): Promise<ApiResponse<Allocation>> {
  return apiRequest<Allocation>("/admin/allocations", "POST", payload);
}
