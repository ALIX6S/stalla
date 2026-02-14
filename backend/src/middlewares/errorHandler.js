import { AppError } from "../utils/AppError.js";
import { sendResponse } from "../utils/response.js";

export function notFoundHandler(req, res) {
  return sendResponse(res, {
    status: 404,
    success: false,
    message: "Ressource non trouvée",
    errors: { path: req.originalUrl },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return sendResponse(res, { status: err.status, success: false, message: err.message, errors: err.errors });
  }
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return sendResponse(res, {
      status: 400,
      success: false,
      message: "Corps de requête JSON invalide",
      errors: { body: "JSON malformé" },
    });
  }
  if (err?.name === "SequelizeUniqueConstraintError") {
    return sendResponse(res, {
      status: 400,
      success: false,
      message: "Valeur déjà utilisée",
      errors: { conflict: err.errors?.map((e) => e.message).join(", ") || "Contrainte d'unicité" },
    });
  }
  if (err?.name === "SequelizeForeignKeyConstraintError") {
    return sendResponse(res, {
      status: 400,
      success: false,
      message: "Opération impossible : des données liées existent",
      errors: { constraint: "Contrainte de clé étrangère" },
    });
  }
  console.error(err);
  return sendResponse(res, {
    status: 500,
    success: false,
    message: "Erreur serveur",
    errors: { server: err?.message || "Erreur inconnue" },
  });
}
