import { badRequest } from "./AppError.js";

export const MIN_PASSWORD_LENGTH = 6;

export const todayIso = () => new Date().toISOString().slice(0, 10);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
export const CATEGORIES = ["STANDARD", "PREMIUM"];

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Convertit en nombre fini, ou lève une 400 avec le champ concerné. */
export function toNumber(value, field, { positive = false } = {}) {
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (value === "" || value == null || !Number.isFinite(n) || (positive ? n <= 0 : n < 0)) {
    throw badRequest(`Valeur invalide pour ${field}`, {
      [field]: positive ? "Un nombre strictement positif est requis" : "Un nombre positif est requis",
    });
  }
  return n;
}

export const normalizeCategory = (value, fallback = null) =>
  typeof value === "string" && CATEGORIES.includes(value.toUpperCase()) ? value.toUpperCase() : fallback;

export const str = (value) => (typeof value === "string" ? value.trim() : "");
