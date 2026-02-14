import crypto from "crypto";
import { User, Vendor } from "../models/index.js";
import { badRequest } from "../utils/AppError.js";

/**
 * Crée un compte User(VENDOR) + profil Vendor dans la transaction fournie.
 * Retourne aussi le mot de passe généré (en clair, une seule fois).
 */
export async function createVendorAccount({ email, full_name, phone, business_type }, transaction) {
  if (email && (await User.findOne({ where: { email }, transaction }))) {
    throw badRequest("Email déjà utilisé", { email: "Un compte existe déjà avec cet email" });
  }
  if (await Vendor.findOne({ where: { phone }, transaction })) {
    throw badRequest("Numéro de téléphone déjà utilisé", { phone: "Un vendeur existe déjà avec ce numéro" });
  }

  const generatedPassword = crypto.randomBytes(6).toString("base64url");
  const user = await User.create(
    { name: full_name, email: email || null, password: generatedPassword, role: "VENDOR" },
    { transaction }
  );
  const vendor = await Vendor.create(
    { userId: user.id, fullName: full_name, phone, businessType: business_type },
    { transaction }
  );
  return { vendor, user, generatedPassword };
}
