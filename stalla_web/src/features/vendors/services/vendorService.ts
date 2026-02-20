import { apiRequest } from "../../../core/api";
import type { ApiResponse } from "../../../core/types";
import type { Vendor } from "../types";

export function getVendors(): Promise<ApiResponse<Vendor[]>> {
  return apiRequest<Vendor[]>("/admin/vendors");
}
