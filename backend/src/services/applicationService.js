import { sequelize, Vendor, VendorApplication } from "../models/index.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { normalizeCategory, str, toNumber } from "../utils/helpers.js";
import { createVendorAccount } from "./accountService.js";
import { safeSendWelcomeEmail } from "./vendorService.js";
import { sendVendorApplicationRejectedEmail } from "./emailService.js";

const notFoundApplication = () => notFound("Demande introuvable", { request: "Aucune demande avec cet id" });
const alreadyProcessed = (app) =>
  badRequest("Cette demande a déjà été traitée", { status: `Statut actuel: ${app.status}` });

/** Soumission publique d'une demande de stand. */
export async function submitApplication(body) {
  const full_name = str(body.full_name);
  const phone = str(body.phone);
  const desired_zone = str(body.desired_zone);
  if (!full_name || !phone || !desired_zone || body.budget_min == null || body.budget_max == null) {
    throw badRequest("Champs obligatoires manquants", {
      fields: "full_name, phone, desired_zone, budget_min, budget_max requis (email optionnel)",
    });
  }

  const min = Number(body.budget_min);
  const max = Number(body.budget_max);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
    throw badRequest("Marge de prix invalide", {
      budget: "budget_min et budget_max doivent être valides, > 0 et min <= max",
    });
  }

  if (await Vendor.findOne({ where: { phone } })) {
    throw badRequest("Ce numéro est déjà enregistré", { phone: "Un vendeur actif existe déjà avec ce numéro" });
  }
  if (await VendorApplication.findOne({ where: { phone, status: "PENDING" } })) {
    throw badRequest("Une demande est déjà en attente pour ce numéro", { phone: "Demande déjà soumise" });
  }

  const application = await VendorApplication.create({
    fullName: full_name,
    phone,
    email: str(body.email) || null,
    businessType: str(body.business_type) || null,
    desiredZone: desired_zone,
    desiredCategory: normalizeCategory(body.desired_category),
    budgetMin: min,
    budgetMax: max,
    status: "PENDING",
  });
  return { id: application.id, status: application.status };
}

export async function listPendingApplications() {
  const applications = await VendorApplication.findAll({
    where: { status: "PENDING" },
    order: [["createdAt", "DESC"]],
  });
  return applications.map((item) => ({
    id: item.id,
    full_name: item.fullName,
    phone: item.phone,
    email: item.email,
    business_type: item.businessType || null,
    desired_zone: item.desiredZone,
    desired_category: item.desiredCategory || null,
    budget_min: Number(item.budgetMin),
    budget_max: Number(item.budgetMax),
    status: item.status,
    created_at: item.createdAt,
  }));
}

export async function approveApplication(id) {
  const { application, account } = await sequelize.transaction(async (transaction) => {
    const application = await VendorApplication.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!application) throw notFoundApplication();
    if (application.status !== "PENDING") throw alreadyProcessed(application);

    const account = await createVendorAccount(
      {
        email: application.email,
        full_name: application.fullName,
        phone: application.phone,
        business_type: application.businessType || "Non renseignée",
      },
      transaction
    );
    await application.update({ status: "APPROVED" }, { transaction });
    return { application, account };
  });

  const { vendor, user, generatedPassword } = account;
  const emailDelivery = await safeSendWelcomeEmail({
    to: user.email,
    fullName: vendor.fullName,
    password: generatedPassword,
    phone: vendor.phone,
  });

  return {
    application: { id: application.id, status: "APPROVED" },
    vendor: {
      id: vendor.id,
      full_name: vendor.fullName,
      phone: vendor.phone,
      email: user.email,
      default_password: generatedPassword,
      email_delivery: emailDelivery,
    },
  };
}

export async function rejectApplication(id) {
  const application = await VendorApplication.findByPk(id);
  if (!application) throw notFoundApplication();
  if (application.status !== "PENDING") throw alreadyProcessed(application);

  await application.update({ status: "REJECTED" });

  let emailDelivery;
  if (!application.email) {
    emailDelivery = { ok: false, reason: "No recipient email" };
  } else {
    try {
      emailDelivery = await sendVendorApplicationRejectedEmail({
        to: application.email,
        fullName: application.fullName,
      });
    } catch (err) {
      emailDelivery = { ok: false, reason: err.message };
    }
  }
  return { id: application.id, status: application.status, email_delivery: emailDelivery };
}
