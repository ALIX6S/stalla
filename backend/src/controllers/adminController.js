import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import * as standService from "../services/standService.js";
import * as vendorService from "../services/vendorService.js";
import * as allocationService from "../services/allocationService.js";
import * as paymentService from "../services/paymentService.js";
import * as reportService from "../services/reportService.js";
import * as settingService from "../services/settingService.js";
import * as applicationService from "../services/applicationService.js";
import { runDebtJob } from "../jobs/debtJob.js";

const body = (req) => req.body ?? {};

export const listAdminStalls = asyncHandler(async (req, res) =>
  sendResponse(res, { message: "Liste des stands", data: await standService.listStands() })
);

export const createAdminStand = asyncHandler(async (req, res) =>
  sendResponse(res, {
    status: 201,
    message: "Stand créé avec succès",
    data: await standService.createStand(body(req)),
  })
);

export const deleteAdminStand = asyncHandler(async (req, res) => {
  await standService.deleteStand(req.params.id);
  return sendResponse(res, { message: "Stand supprimé avec succès", data: null });
});

export const listAdminVendors = asyncHandler(async (req, res) =>
  sendResponse(res, { message: "Liste des vendeurs", data: await vendorService.listVendors() })
);

export const createAdminVendor = asyncHandler(async (req, res) =>
  sendResponse(res, {
    status: 201,
    message: "Vendeur créé avec succès",
    data: await vendorService.createVendor(body(req)),
  })
);

export const deleteAdminVendor = asyncHandler(async (req, res) => {
  await vendorService.deleteVendor(req.params.id);
  return sendResponse(res, { message: "Vendeur supprimé avec succès", data: null });
});

export const createAllocation = asyncHandler(async (req, res) =>
  sendResponse(res, {
    status: 201,
    message: "Attribution créée avec succès",
    data: await allocationService.createAllocation(body(req)),
  })
);

export const createAdminPayment = asyncHandler(async (req, res) =>
  sendResponse(res, {
    status: 201,
    message: "Paiement enregistré avec succès",
    data: await paymentService.createPayment(body(req), {
      baseUrl: `${req.protocol}://${req.get("host")}`,
    }),
  })
);

export const reportDebtors = asyncHandler(async (req, res) =>
  sendResponse(res, { message: "Liste des vendeurs débiteurs", data: await reportService.debtorsReport() })
);

export const getSupportSettings = asyncHandler(async (req, res) =>
  sendResponse(res, { message: "Paramètres support", data: await settingService.getSupportSettings() })
);

export const updateSupportSettings = asyncHandler(async (req, res) =>
  sendResponse(res, {
    message: "Paramètres support mis à jour",
    data: await settingService.updateSupportSettings(body(req)),
  })
);

export const listVendorApplications = asyncHandler(async (req, res) =>
  sendResponse(res, {
    message: "Liste des demandes vendeurs",
    data: await applicationService.listPendingApplications(),
  })
);

export const approveVendorApplication = asyncHandler(async (req, res) =>
  sendResponse(res, {
    message: "Demande validée et vendeur créé",
    data: await applicationService.approveApplication(req.params.id),
  })
);

export const rejectVendorApplication = asyncHandler(async (req, res) =>
  sendResponse(res, {
    message: "Demande rejetée",
    data: await applicationService.rejectApplication(req.params.id),
  })
);

export const runDebtJobNow = asyncHandler(async (req, res) =>
  sendResponse(res, { message: "Job des dettes exécuté", data: await runDebtJob() })
);
