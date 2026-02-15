import { Vendor, User, Stand, Allocation, Payment } from "../models/index.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { PERIOD_RE, todayIso, toNumber } from "../utils/helpers.js";
import { generatePaymentReceipt } from "./pdfService.js";

export async function createPayment({ allocation_id, amount_paid, period }, { baseUrl }) {
  if (!allocation_id || amount_paid == null || !period) {
    throw badRequest("Champs obligatoires manquants", { fields: "allocation_id, amount_paid, period requis" });
  }
  if (typeof period !== "string" || !PERIOD_RE.test(period)) {
    throw badRequest("Format de période invalide", { period: "Utilisez le format YYYY-MM" });
  }
  const amount = toNumber(amount_paid, "amount_paid", { positive: true });

  const allocation = await Allocation.findByPk(allocation_id, {
    include: [
      { model: Vendor, as: "vendor", include: [{ model: User, as: "user", attributes: ["email"] }] },
      { model: Stand, as: "stall" },
    ],
  });
  if (!allocation) {
    throw notFound("Attribution introuvable", { allocation: "Aucune attribution avec cet id" });
  }

  const payment = await Payment.create({
    allocationId: allocation.id,
    amountPaid: amount,
    paymentDate: todayIso(),
    period,
  });

  let receiptPath = null;
  let receiptUrl = null;
  try {
    const receipt = await generatePaymentReceipt({
      payment: {
        id: payment.id,
        amount_paid: Number(payment.amountPaid),
        period: payment.period,
        payment_date: payment.paymentDate,
      },
      vendor: {
        full_name: allocation.vendor?.fullName || "Vendeur",
        email: allocation.vendor?.user?.email || null,
        phone: allocation.vendor?.phone || null,
      },
      stand: { code: allocation.stall?.code || "-", zone: allocation.stall?.zone || "-" },
    });
    receiptPath = receipt.filePath;
    receiptUrl = `${baseUrl}${receipt.filePath}`;
    await payment.update({ receiptPath });
  } catch (err) {
    console.error("Génération du reçu impossible:", err.message);
  }

  return {
    id: payment.id,
    allocation_id: payment.allocationId,
    amount_paid: Number(payment.amountPaid),
    payment_date: payment.paymentDate,
    period: payment.period,
    receipt_path: receiptPath,
    receipt_url: receiptUrl,
  };
}
