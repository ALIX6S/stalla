export interface Debtor {
  vendor_id: number;
  email: string | null;
  full_name: string;
  phone: string;
  business_type: string;
  total_paid: number;
  total_due: number;
  current_debt: number;
}
