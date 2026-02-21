import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import * as vendorService from "../services/vendorService.js";

export const myStall = asyncHandler(async (req, res) =>
  sendResponse(res, { message: "Stand du vendeur", data: await vendorService.getMyStall(req.user.id) })
);

export const myProfile = asyncHandler(async (req, res) =>
  sendResponse(res, { message: "Profil vendeur", data: await vendorService.getMyProfile(req.user.id) })
);

export const myPayments = asyncHandler(async (req, res) =>
  sendResponse(res, {
    message: "Historique des paiements",
    data: await vendorService.getMyPayments(req.user.id),
  })
);

export const myBalance = asyncHandler(async (req, res) =>
  sendResponse(res, {
    message: "Situation financière du vendeur",
    data: await vendorService.getMyBalance(req.user.id),
  })
);

export const resetMyPassword = asyncHandler(async (req, res) => {
  await vendorService.changeMyPassword(req.user.id, req.body ?? {});
  return sendResponse(res, { message: "Mot de passe réinitialisé avec succès", data: null });
});
