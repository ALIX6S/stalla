import jwt from "jsonwebtoken";
import { User, Vendor } from "../models/index.js";
import { config, isProduction } from "../config/index.js";
import { badRequest, forbidden, notFound, unauthorized, AppError } from "../utils/AppError.js";
import { MIN_PASSWORD_LENGTH, str } from "../utils/helpers.js";
import { sendAdminResetEmail } from "./emailService.js";

const RESET_PURPOSE = "admin_reset_password";

const createToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const withProfile = [{ model: Vendor, as: "vendorProfile", required: false }];

async function findUserForLogin(identifier) {
  const byEmail = await User.findOne({ where: { email: identifier }, include: withProfile });
  if (byEmail || identifier.includes("@")) return byEmail;

  return User.findOne({
    where: { role: "VENDOR" },
    include: [{ model: Vendor, as: "vendorProfile", where: { phone: identifier }, required: true }],
  });
}

function assertPasswordStrength(password, field = "password") {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw badRequest("Mot de passe trop court", { [field]: `Au moins ${MIN_PASSWORD_LENGTH} caractères requis` });
  }
}

export async function registerAdmin({ name, email, password }) {
  const cleanName = str(name);
  const cleanEmail = str(email);
  if (!cleanName || !cleanEmail || !password) {
    throw badRequest("Champs obligatoires manquants", { fields: "name, email, password requis" });
  }
  assertPasswordStrength(password);
  if (!config.allowAdminSelfRegistration && (await User.count({ where: { role: "ADMIN" } })) > 0) {
    throw forbidden("Création de compte admin désactivée", { permission: "Un administrateur existe déjà" });
  }
  if (await User.findOne({ where: { email: cleanEmail } })) {
    throw badRequest("Email déjà utilisé", { email: "Un compte existe déjà avec cet email" });
  }

  const admin = await User.create({ name: cleanName, email: cleanEmail, password, role: "ADMIN" });
  return { token: createToken(admin), user: { id: admin.id, role: admin.role, name: admin.name } };
}

export async function login({ identifier, email, phone, password }) {
  const loginIdentifier = str(identifier) || str(email) || str(phone);
  if (!loginIdentifier || typeof password !== "string" || !password) {
    throw badRequest("Identifiant et mot de passe requis", {
      fields: "identifier (ou email/phone) et password sont obligatoires",
    });
  }

  const user = await findUserForLogin(loginIdentifier);
  if (!user || !(await user.comparePassword(password))) {
    throw unauthorized("Identifiants invalides", { credentials: "Email ou mot de passe incorrect" });
  }

  const name = user.role === "VENDOR" && user.vendorProfile ? user.vendorProfile.fullName : user.name;
  return {
    token: createToken(user),
    user: {
      id: user.id,
      role: user.role,
      name,
      email: user.email || null,
      phone: user.vendorProfile?.phone || null,
    },
  };
}

export async function forgotAdminPassword({ email }) {
  const cleanEmail = str(email);
  if (!cleanEmail) throw badRequest("Email requis", { email: "email obligatoire" });

  const admin = await User.findOne({ where: { email: cleanEmail, role: "ADMIN" } });
  if (!admin) {
    throw notFound("Aucun compte administrateur trouvé pour cet email.", { email: "admin introuvable" });
  }

  const token = jwt.sign({ id: admin.id, role: "ADMIN", purpose: RESET_PURPOSE }, config.jwtSecret, {
    expiresIn: "30m",
  });
  const resetUrl = `${config.webBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const result = await sendAdminResetEmail({ to: admin.email, adminName: admin.name, resetUrl });

  if (!result.ok) {
    throw new AppError(
      500,
      isProduction
        ? "Impossible d'envoyer l'email de réinitialisation"
        : `Impossible d'envoyer l'email. Lien direct: ${resetUrl}`,
      { email: result.reason || "Erreur d'envoi email" }
    );
  }
}

export async function resetAdminPassword({ token, new_password }) {
  if (!token || !new_password) {
    throw badRequest("token et new_password requis", { fields: "token et new_password sont obligatoires" });
  }
  assertPasswordStrength(new_password, "new_password");

  let payload;
  try {
    payload = jwt.verify(String(token), config.jwtSecret);
  } catch {
    throw badRequest("Lien de réinitialisation invalide ou expiré", { token: "token invalide/expiré" });
  }
  if (payload.role !== "ADMIN" || payload.purpose !== RESET_PURPOSE || !payload.id) {
    throw badRequest("Token invalide", { token: "token invalide" });
  }

  const admin = await User.findOne({ where: { id: payload.id, role: "ADMIN" } });
  if (!admin) throw notFound("Compte admin introuvable", { user: "admin non trouvé" });

  admin.password = new_password;
  await admin.save();
}
