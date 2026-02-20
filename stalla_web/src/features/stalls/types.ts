import type { StandCategory } from "../../core/types";

export interface Stand {
  id: number;
  code: string;
  zone: string;
  category?: StandCategory;
  monthly_price: number;
  status: "AVAILABLE" | "OCCUPIED";
  active_allocation?: {
    id: number;
    vendor_id: number;
    vendor_name: string | null;
    start_date: string;
    end_date: string | null;
  } | null;
}
