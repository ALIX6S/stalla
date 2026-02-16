import { Op } from "sequelize";
import { Stand, Allocation, Vendor } from "../models/index.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { normalizeCategory, str, todayIso, toNumber } from "../utils/helpers.js";

const serializeStand = (stand) => ({
  id: stand.id,
  code: stand.code,
  zone: stand.zone,
  category: stand.category,
  monthly_price: Number(stand.monthlyPrice),
  status: stand.status,
});

async function activeAllocationByStallId() {
  const today = todayIso();
  const allocations = await Allocation.findAll({
    where: {
      startDate: { [Op.lte]: today },
      [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }],
    },
    include: [{ model: Vendor, as: "vendor" }],
  });
  return new Map(allocations.map((a) => [a.stallId, a]));
}

export async function listStands() {
  const stands = await Stand.findAll({ order: [["code", "ASC"]] });
  const activeByStall = await activeAllocationByStallId();

  return stands.map((stand) => {
    const active = activeByStall.get(stand.id);
    return {
      ...serializeStand(stand),
      active_allocation: active
        ? {
            id: active.id,
            vendor_id: active.vendorId,
            vendor_name: active.vendor?.fullName || null,
            start_date: active.startDate,
            end_date: active.endDate,
          }
        : null,
    };
  });
}

export async function createStand({ code, zone, category, monthly_price }) {
  const cleanCode = str(code);
  const cleanZone = str(zone);
  if (!cleanCode || !cleanZone || monthly_price == null) {
    throw badRequest("Champs obligatoires manquants", { fields: "code, zone, monthly_price requis" });
  }
  const price = toNumber(monthly_price, "monthly_price");

  if (await Stand.findOne({ where: { code: cleanCode } })) {
    throw badRequest("Code de stand déjà utilisé", { code: "Ce code est déjà pris" });
  }

  const stand = await Stand.create({
    code: cleanCode,
    zone: cleanZone,
    category: normalizeCategory(category, "STANDARD"),
    monthlyPrice: price,
    status: "AVAILABLE",
  });
  return serializeStand(stand);
}

export async function deleteStand(id) {
  const stand = await Stand.findByPk(id);
  if (!stand) throw notFound("Stand introuvable", { stand: "Aucun stand avec cet id" });

  if (stand.status === "OCCUPIED") {
    throw badRequest("Impossible de supprimer un stand occupé", { stand: "Libérez d'abord ce stand" });
  }
  if (await Allocation.findOne({ where: { stallId: stand.id } })) {
    throw badRequest("Impossible de supprimer ce stand", {
      stand: "Ce stand possède des allocations (actives ou passées)",
    });
  }
  await stand.destroy();
}

/** Aperçu public : stands disponibles groupés par zone avec fourchettes de prix. */
export async function publicOverview() {
  const stands = await Stand.findAll({
    where: { status: "AVAILABLE" },
    attributes: ["zone", "category", "monthlyPrice"],
    order: [["zone", "ASC"]],
  });

  const DEFAULT_RANGE = { STANDARD: [10000, 30000], PREMIUM: [35000, 50000] };
  const zones = new Map();
  for (const stand of stands) {
    if (!zones.has(stand.zone)) zones.set(stand.zone, { STANDARD: [], PREMIUM: [] });
    const key = stand.category === "PREMIUM" ? "PREMIUM" : "STANDARD";
    zones.get(stand.zone)[key].push(Number(stand.monthlyPrice));
  }

  const bucket = (prices, key) => ({
    available: prices.length,
    price_min: prices.length ? Math.min(...prices) : DEFAULT_RANGE[key][0],
    price_max: prices.length ? Math.max(...prices) : DEFAULT_RANGE[key][1],
  });

  return [...zones].map(([zone, b]) => ({
    zone,
    standard: bucket(b.STANDARD, "STANDARD"),
    premium: bucket(b.PREMIUM, "PREMIUM"),
  }));
}
