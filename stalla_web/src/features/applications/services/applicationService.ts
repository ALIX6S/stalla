import { apiRequest } from "../../../core/api";
import type { ApiResponse } from "../../../core/types";
import type { VendorApplication } from "../types";

export function getVendorApplications(): Promise<ApiResponse<VendorApplication[]>> {
  return apiRequest<VendorApplication[]>("/admin/vendor-applications");
}

export function approveVendorApplication(id: number): Promise<ApiResponse<unknown>> {
  return apiRequest<unknown>(`/admin/vendor-applications/${id}/approve`, "PATCH");
}

export function rejectVendorApplication(id: number): Promise<ApiResponse<unknown>> {
  return apiRequest<unknown>(`/admin/vendor-applications/${id}/reject`, "PATCH");
}
