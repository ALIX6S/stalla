import { Setting } from "../models/index.js";
import { badRequest } from "../utils/AppError.js";
import { str } from "../utils/helpers.js";

export async function getSupportSettings() {
  const setting = await Setting.findByPk("support_phone");
  return { support_phone: setting?.value || null };
}

export async function updateSupportSettings({ support_phone }) {
  const value = str(support_phone);
  if (!value) {
    throw badRequest("support_phone est requis", { support_phone: "support_phone obligatoire" });
  }
  if (value.length > 255) {
    throw badRequest("support_phone invalide", { support_phone: "255 caractères maximum" });
  }
  await Setting.upsert({ key: "support_phone", value });
  return { support_phone: value };
}
