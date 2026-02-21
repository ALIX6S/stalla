import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import { publicOverview } from "../services/standService.js";

/** GET /api/public/stands/overview : zones disponibles, compteurs par catégorie, fourchettes de prix. */
export const getPublicStandsOverview = asyncHandler(async (req, res) => {
  const data = await publicOverview();
  return sendResponse(res, { message: "Aperçu des stands disponibles", data });
});
