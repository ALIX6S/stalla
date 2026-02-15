import { Op } from "sequelize";
import { sequelize, Vendor, Stand, Allocation } from "../models/index.js";
import { badRequest, notFound } from "../utils/AppError.js";
import { isValidIsoDate } from "../utils/helpers.js";

export async function createAllocation({ vendor_id, stall_id, start_date }) {
  if (!vendor_id || !stall_id || !start_date) {
    throw badRequest("Champs obligatoires manquants", { fields: "vendor_id, stall_id, start_date requis" });
  }
  if (!isValidIsoDate(start_date)) {
    throw badRequest("Date de début invalide", { start_date: "Utilisez le format YYYY-MM-DD" });
  }

  return sequelize.transaction(async (transaction) => {
    const vendor = await Vendor.findByPk(vendor_id, { transaction });
    if (!vendor) throw notFound("Vendeur introuvable", { vendor: "Aucun vendeur avec cet id" });

    const stall = await Stand.findByPk(stall_id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!stall) throw notFound("Stand introuvable", { stall: "Aucun stand avec cet id" });

    const overlapping = await Allocation.findOne({
      where: {
        stallId: stall.id,
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: start_date } }],
      },
      transaction,
    });
    if (overlapping) {
      throw badRequest("Ce stand est déjà attribué", {
        allocation: "Une allocation active existe déjà pour ce stand",
      });
    }

    const allocation = await Allocation.create(
      { vendorId: vendor.id, stallId: stall.id, startDate: start_date, endDate: null },
      { transaction }
    );
    await stall.update({ status: "OCCUPIED" }, { transaction });

    return {
      id: allocation.id,
      vendor_id: allocation.vendorId,
      stall_id: allocation.stallId,
      start_date: allocation.startDate,
      end_date: allocation.endDate,
    };
  });
}
