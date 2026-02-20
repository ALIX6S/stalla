import { apiRequest } from "../../../core/api";
import type { ApiResponse } from "../../../core/types";

export interface SupportSettings {
  support_phone: string | null;
}

export function getSupportSettings(): Promise<ApiResponse<SupportSettings>> {
  return apiRequest<SupportSettings>("/admin/settings/support");
}

export function updateSupportSettings(payload: {
  support_phone: string;
}): Promise<ApiResponse<SupportSettings>> {
  return apiRequest<SupportSettings>("/admin/settings/support", "PUT", payload);
}
