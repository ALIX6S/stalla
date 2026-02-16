import { Op } from "sequelize";
import { sequelize, User, Vendor, Allocation, Stand, Payment, Setting } from "../models/index.js";
import { badRequest, notFound, unauthorized } from "../utils/AppError.js";
import { MIN_PASSWORD_LENGTH, str, todayIso } from "../utils/helpers.js";
import { computeBalance } from "../utils/debt.js";
import { createVendorAccount } from "./accountService.js";
import { sendVendorWelcomeEmail } from "./emailService.js";

export async function safeSendWelcomeEmail(payload) {
  try {
    return await sendVendorWelcomeEmail(payload);
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

// ---------- Administration des vendeurs ----------

export async function listVendors() {
  const vendors = await Vendor.findAll({
    include: [{ model: User, as: "user", attributes: ["id", "email", "role"] }],
    order: [["id", "DESC"]],
  });
  return vendors.map((vendor) => ({
    id: vendor.id,
    user_id: vendor.userId,
    email: vendor.user?.email || null,
    full_name: vendor.fullName,
    phone: vendor.phone,
    business_type: vendor.businessType,
  }));
}

export async function createVendor(body) {
  const full_name = str(body.full_name);
  const phone = str(body.phone);
  const business_type = str(body.business_type);
  const email = str(body.email) || null;
  if (!full_name || !phone || !business_type) {
    throw badRequest("Champs obligatoires manquants", {
      fields: "full_name, phone, business_type requis (email optionnel)",
    });
  }

  const { vendor, user, generatedPassword } = await sequelize.transaction((transaction) =>
    createVendorAccount({ email, full_name, phone, business_type }, transaction)
  );

  const emailDelivery = await safeSendWelcomeEmail({
    to: user.email,
    fullName: vendor.fullName,
    password: generatedPassword,
    phone: vendor.phone,
  });

  return {
    id: vendor.id,
    user_id: user.id,
    email: user.email,
    full_name: vendor.fullName,
    phone: vendor.phone,
    business_type: vendor.businessType,
    default_password: generatedPassword,
    email_delivery: emailDelivery,
  };
}

export async function deleteVendor(id) {
  await sequelize.transaction(async (transaction) => {
    const vendor = await Vendor.findByPk(id, { transaction });
    if (!vendor) throw notFound("Vendeur introuvable", { vendor: "Aucun vendeur avec cet id" });

    if (await Allocation.findOne({ where: { vendorId: vendor.id }, transaction })) {
      throw badRequest("Impossible de supprimer ce vendeur", {
        vendor: "Ce vendeur possède déjà des allocations/paiements",
      });
    }
    const userId = vendor.userId;
    await vendor.destroy({ transaction });
    await User.destroy({ where: { id: userId }, transaction });
  });
}

// ---------- Espace vendeur connecté ----------

async function vendorOfUser(userId, options = {}) {
  const vendor = await Vendor.findOne({ where: { userId }, ...options });
  if (!vendor) {
    throw notFound("Profil vendeur introuvable", { vendor: "Aucun profil vendeur lié à cet utilisateur" });
  }
  return vendor;
}

function daysRemaining(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - new Date(todayIso()).getTime();
  return diff < 0 ? 0 : Math.ceil(diff / 86400000);
}

export async function getMyStall(userId) {
  const vendor = await vendorOfUser(userId);
  const today = todayIso();
  const allocation = await Allocation.findOne({
    where: {
      vendorId: vendor.id,
      startDate: { [Op.lte]: today },
      [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }],
    },
    include: [{ model: Stand, as: "stall" }],
    order: [["startDate", "DESC"]],
  });
  if (!allocation?.stall) {
    throw notFound("Aucun stand actif", { stall: "Aucune attribution active trouvée" });
  }
  return {
    stall_code: allocation.stall.code,
    zone: allocation.stall.zone,
    monthly_price: Number(allocation.stall.monthlyPrice),
    end_date: allocation.endDate,
    days_remaining: daysRemaining(allocation.endDate),
  };
}

export async function getMyProfile(userId) {
  const vendor = await vendorOfUser(userId, {
    include: [{ model: User, as: "user", attributes: ["email"] }],
  });
  const support = await Setting.findByPk("support_phone");
  return {
    full_name: vendor.fullName,
    phone: vendor.phone,
    business_type: vendor.businessType,
    email: vendor.user?.email || null,
    support_phone: support?.value || null,
  };
}

export async function getMyPayments(userId) {
  const vendor = await vendorOfUser(userId);
  const allocations = await Allocation.findAll({ where: { vendorId: vendor.id }, attributes: ["id"] });
  if (allocations.length === 0) return [];

  const payments = await Payment.findAll({
    where: { allocationId: allocations.map((a) => a.id) },
    include: [
      {
        model: Allocation,
        as: "allocation",
        include: [{ model: Stand, as: "stall", attributes: ["code", "zone", "monthlyPrice"] }],
      },
    ],
    order: [["paymentDate", "DESC"], ["id", "DESC"]],
  });

  return payments.map((p) => ({
    id: p.id,
    allocation_id: p.allocationId,
    amount_paid: Number(p.amountPaid),
    payment_date: p.paymentDate,
    period: p.period,
    stall_code: p.allocation?.stall?.code || null,
    zone: p.allocation?.stall?.zone || null,
  }));
}

export async function getMyBalance(userId) {
  const vendor = await vendorOfUser(userId);
  const allocations = await Allocation.findAll({
    where: { vendorId: vendor.id },
    include: [
      { model: Stand, as: "stall", attributes: ["monthlyPrice"] },
      { model: Payment, as: "payments", attributes: ["amountPaid"] },
    ],
  });
  return computeBalance(allocations);
}

export async function changeMyPassword(userId, { current_password, new_password }) {
  if (!current_password || !new_password) {
    throw badRequest("Champs obligatoires manquants", { fields: "current_password et new_password requis" });
  }
  const user = await User.findByPk(userId);
  if (!user || user.role !== "VENDOR") {
    throw notFound("Utilisateur vendeur introuvable", { user: "Aucun vendeur trouvé pour ce token" });
  }
  if (!(await user.comparePassword(String(current_password)))) {
    throw unauthorized("Mot de passe actuel incorrect", {
      current_password: "Le mot de passe actuel est invalide",
    });
  }
  if (current_password === new_password) {
    throw badRequest("Nouveau mot de passe invalide", {
      new_password: "Le nouveau mot de passe doit être différent de l'ancien",
    });
  }
  if (String(new_password).length < MIN_PASSWORD_LENGTH) {
    throw badRequest("Nouveau mot de passe invalide", {
      new_password: `Au moins ${MIN_PASSWORD_LENGTH} caractères requis`,
    });
  }
  user.password = String(new_password);
  await user.save();
}
