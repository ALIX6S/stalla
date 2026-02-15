import { Vendor, User, Stand, Allocation, Payment } from "../models/index.js";
import { computeBalance } from "../utils/debt.js";

export async function debtorsReport() {
  const vendors = await Vendor.findAll({
    include: [
      { model: User, as: "user", attributes: ["id", "email"] },
      {
        model: Allocation,
        as: "allocations",
        include: [
          { model: Stand, as: "stall", attributes: ["id", "code", "zone", "monthlyPrice"] },
          { model: Payment, as: "payments", attributes: ["id", "amountPaid", "period", "paymentDate"] },
        ],
      },
    ],
  });

  return vendors
    .map((vendor) => ({
      vendor_id: vendor.id,
      email: vendor.user?.email || null,
      full_name: vendor.fullName,
      phone: vendor.phone,
      business_type: vendor.businessType,
      ...computeBalance(vendor.allocations),
    }))
    .filter((item) => item.current_debt > 0)
    .sort((a, b) => b.current_debt - a.current_debt);
}
