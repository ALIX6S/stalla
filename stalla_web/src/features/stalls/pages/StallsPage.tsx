import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { StandCategory } from "../../../core/types";
import { Alert } from "../../../shared/components/Alert";
import { DataTable } from "../../../shared/components/DataTable";
import type { Column } from "../../../shared/components/DataTable";
import { FormField } from "../../../shared/components/FormField";
import { Icon } from "../../../shared/components/Icon";
import { Panel } from "../../../shared/components/Panel";
import { StatusPill } from "../../../shared/components/StatusPill";
import { useApiData } from "../../../shared/hooks/useApiData";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { ZONE_LABELS, formatCfa, zoneLabel } from "../../../shared/utils/format";
import { createStall, deleteStall, getStalls } from "../services/stallService";
import type { Stand } from "../types";

const ZONES = Object.keys(ZONE_LABELS);
const NO_STALLS: Stand[] = [];

const PRICE_OPTIONS: Record<StandCategory, number[]> = {
  STANDARD: [10000, 15000, 20000, 25000, 30000],
  PREMIUM: [35000, 40000, 45000, 50000],
};

function getNextStandCode(zone: string, category: StandCategory, stalls: Stand[]): string {
  const prefix = `${zone}-${category === "PREMIUM" ? "P" : "S"}`;
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  const max = stalls.reduce((acc, stall) => {
    const match = stall.code.trim().toUpperCase().match(pattern);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `${prefix}${String(max + 1).padStart(2, "0")}`;
}

export function StallsPage() {
  const { data: stalls, loading, error: loadError, reload } = useApiData(getStalls, NO_STALLS);
  const { feedback, success, error, clear } = useFeedback();
  const [zone, setZone] = useState(ZONES[0]);
  const [category, setCategory] = useState<StandCategory>("STANDARD");
  const [monthlyPrice, setMonthlyPrice] = useState<number>(PRICE_OPTIONS.STANDARD[0]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const code = useMemo(() => getNextStandCode(zone, category, stalls), [zone, category, stalls]);

  const handleCategoryChange = (next: StandCategory) => {
    setCategory(next);
    setMonthlyPrice(PRICE_OPTIONS[next][0]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    clear();
    const response = await createStall({ code, zone, category, monthly_price: monthlyPrice });
    setSaving(false);
    if (!response.success) {
      error(response.message);
      return;
    }
    success("Stand créé avec succès.");
    await reload();
  };

  const handleDelete = async (stand: Stand) => {
    if (!window.confirm(`Supprimer le stand ${stand.code} ?`)) return;
    setDeletingId(stand.id);
    clear();
    const response = await deleteStall(stand.id);
    setDeletingId(null);
    if (!response.success) {
      error(response.message);
      return;
    }
    success("Stand supprimé avec succès.");
    await reload();
  };

  const columns: Column<Stand>[] = [
    { header: "Code", render: (s) => s.code },
    { header: "Zone", render: (s) => zoneLabel(s.zone) },
    {
      header: "Catégorie",
      render: (s) => (
        <StatusPill tone={s.category === "PREMIUM" ? "occupied" : "available"}>
          {s.category ?? "STANDARD"}
        </StatusPill>
      ),
    },
    { header: "Loyer", render: (s) => formatCfa(s.monthly_price) },
    {
      header: "Statut",
      render: (s) =>
        s.status === "OCCUPIED" ? (
          <StatusPill tone="occupied">Occupé</StatusPill>
        ) : (
          <StatusPill tone="available">Disponible</StatusPill>
        ),
    },
    { header: "Vendeur actif", render: (s) => s.active_allocation?.vendor_name ?? "-" },
    {
      header: "Action",
      align: "center",
      render: (s) =>
        s.status === "OCCUPIED" ? (
          "-"
        ) : (
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => handleDelete(s)}
            disabled={deletingId === s.id}
            title="Supprimer"
            aria-label={`Supprimer le stand ${s.code}`}
          >
            <Icon name="trash" size={16} />
          </button>
        ),
    },
  ];

  return (
    <section className="admin-page-space">
      {loadError && <Alert>{loadError}</Alert>}
      {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}

      <div className="admin-split-grid">
        <Panel
          variant="form"
          title="Nouveau Stand"
          description="Créer un emplacement avec sa catégorie et son loyer."
          className="form-panel"
        >
          <form className="form-stack" onSubmit={handleSubmit}>
            <FormField label="Zone" htmlFor="zone">
              <select id="zone" value={zone} onChange={(e) => setZone(e.target.value)} required>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {ZONE_LABELS[z]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Catégorie" htmlFor="category">
              <select
                id="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as StandCategory)}
                required
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </FormField>
            <FormField label="Loyer mensuel (CFA)" htmlFor="price">
              <select
                id="price"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                required
              >
                {PRICE_OPTIONS[category].map((price) => (
                  <option key={price} value={price}>
                    {formatCfa(price)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Code généré" htmlFor="code">
              <input id="code" value={code} readOnly />
            </FormField>
            <button className="btn-primary accent" type="submit" disabled={saving}>
              {saving ? "Création..." : "Ajouter le stand"}
            </button>
          </form>
        </Panel>

        <Panel title="Liste des Stands" pill={`${stalls.length} total`}>
          <DataTable columns={columns} rows={stalls} rowKey={(s) => s.id} loading={loading} emptyMessage="Aucun stand." />
        </Panel>
      </div>
    </section>
  );
}
