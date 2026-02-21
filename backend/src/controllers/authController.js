import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import * as authService from "../services/authService.js";
import * as applicationService from "../services/applicationService.js";

export const registerAdmin = asyncHandler(async (req, res) => {
  const data = await authService.registerAdmin(req.body ?? {});
  return sendResponse(res, { status: 201, message: "Compte administrateur créé avec succès", data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body ?? {});
  return sendResponse(res, { message: "Connexion réussie", data });
});

export const forgotAdminPassword = asyncHandler(async (req, res) => {
  await authService.forgotAdminPassword(req.body ?? {});
  return sendResponse(res, { message: "Lien de réinitialisation envoyé par email.", data: null });
});

export const resetAdminPassword = asyncHandler(async (req, res) => {
  await authService.resetAdminPassword(req.body ?? {});
  return sendResponse(res, { message: "Mot de passe réinitialisé avec succès", data: null });
});

export const submitVendorApplication = asyncHandler(async (req, res) => {
  const data = await applicationService.submitApplication(req.body ?? {});
  return sendResponse(res, {
    status: 201,
    message: "Demande envoyée avec succès. Un admin la traitera bientôt.",
    data,
  });
});
