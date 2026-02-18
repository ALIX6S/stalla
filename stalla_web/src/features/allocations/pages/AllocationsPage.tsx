import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Alert } from "../../../shared/components/Alert";
import { DataTable } from "../../../shared/components/DataTable";
import type { Column } from "../../../shared/components/DataTable";
import { FormField } from "../../../shared/components/FormField";
import { Panel } from "../../../shared/components/Panel";
import { StatusPill } from "../../../shared/components/StatusPill";
import { useApiData } from "../../../shared/hooks/useApiData";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { formatDate, todayISO, zoneLabel } from "../../../shared/utils/format";
import { getStalls } from "../../stalls/services/stallService";
import type { Stand } from "../../stalls/types";
import { getVendors } from "../../vendors/services/vendorService";
import type { Vendor } from "../../vendors/types";
import { createAllocation } from "../services/allocationService";

const NO_STALLS: Stand[] = [];
const NO_VENDORS: Vendor[] = [];

const columns: Column<Stand>[] = [
  { header: "Stand", render: (s) => s.code },
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
  { header: "Début", render: (s) => formatDate(s.active_allocation?.start_date) },
];

export function AllocationsPage() {
  const vendorsQuery = useApiData(getVendors, NO_VENDORS);
  const stallsQuery = useApiData(getStalls, NO_STALLS);
  const { feedback, success, error, clear } = useFeedback();
  const [vendorId, setVendorId] = useState("");
  const [stallId, setStallId] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const vendors = vendorsQuery.data;
  const stalls = stallsQuery.data;
  const loading = vendorsQuery.loading || stallsQuery.loading;
  const loadError = vendorsQuery.error ?? stallsQuery.error;
  const availableStalls = useMemo(() => stalls.filter((s) => s.status === "AVAILABLE"), [stalls]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    clear();
    const response = await createAllocation({
      vendor_id: Number(vendorId),
      stall_id: Number(stallId),
      start_date: startDate,
    });
    setSaving(false);
    if (!response.success) {
      error(response.message);
      return;
    }
    setVendorId("");
    setStallId("");
    success("Attribution créée avec succès.");
    await stallsQuery.reload();
  };

  return (
    <section className="admin-page-space">
      {loadError && <Alert>{loadError}</Alert>}
      {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}

      <div className="admin-split-grid">
        <Panel variant="form" title="Nouvelle Allocation" description="Attribuer un stand à un vendeur." className="form-panel">
          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : (
            <form className="form-stack" onSubmit={handleSubmit}>
              <FormField label="Vendeur" htmlFor="vendor">
                <select id="vendor" value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
                  <option value="">Sélectionner</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.full_name} ({v.phone})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Stand disponible" htmlFor="stall">
                <select id="stall" value={stallId} onChange={(e) => setStallId(e.target.value)} required>
                  <option value="">Sélectionner</option>
                  {availableStalls.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {zoneLabel(s.zone)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Date de début" htmlFor="start">
                <input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </FormField>
              <button className="btn-primary accent" type="submit" disabled={saving}>
                {saving ? "Attribution..." : "Créer l'allocation"}
              </button>
            </form>
          )}
        </Panel>

        <Panel title="Stands & attributions" pill={`${availableStalls.length} disponibles`}>
          <DataTable columns={columns} rows={stalls} rowKey={(s) => s.id} loading={stallsQuery.loading} emptyMessage="Aucun stand." />
        </Panel>
      </div>
    </section>
  );
}
