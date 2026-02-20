export function formatCfa(value: number | string): string {
  return `${Number(value).toLocaleString("fr-FR")} CFA`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentPeriod(): string {
  return todayISO().slice(0, 7);
}

export const ZONE_LABELS: Record<string, string> = {
  A: "Zone A - Entrée",
  B: "Zone B - Produits frais",
  C: "Zone C - Textile",
  D: "Zone D - Divers",
};

/** Accepts both "A" and legacy "Zone A" values coming from the API. */
export function zoneLabel(zone: string): string {
  const key = zone.replace(/^zone\s+/i, "").trim().toUpperCase();
  return ZONE_LABELS[key] ?? `Zone ${key}`;
}
