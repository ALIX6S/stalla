import { apiRequest } from "../../../core/api";
import type { ApiResponse } from "../../../core/types";

export interface Payment {
  id: number;
  allocation_id: number;
  amount_paid: number;
  payment_date: string;
  period: string;
  receipt_path?: string | null;
  receipt_url?: string | null;
}

export function createPayment(payload: {
  allocation_id: number;
  amount_paid: number;
  period: string;
}): Promise<ApiResponse<Payment>> {
  return apiRequest<Payment>("/admin/payments", "POST", payload);
}
