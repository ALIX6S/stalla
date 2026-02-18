import type { StandCategory } from "../../core/types";

export interface VendorApplication {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  desired_zone: string;
  desired_category: StandCategory | null;
  business_type: string | null;
  budget_min: number;
  budget_max: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
}
