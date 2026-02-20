import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Alert } from "../../../shared/components/Alert";
import { DataTable } from "../../../shared/components/DataTable";
import type { Column } from "../../../shared/components/DataTable";
import { FormField } from "../../../shared/components/FormField";
import { Panel } from "../../../shared/components/Panel";
import { useApiData } from "../../../shared/hooks/useApiData";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { currentPeriod } from "../../../shared/utils/format";
import { getStalls } from "../../stalls/services/stallService";
import type { Stand } from "../../stalls/types";
import { createPayment } from "../services/paymentService";

const NO_STALLS: Stand[] = [];

interface ActiveAllocation {
  id: number;
  stallCode: string;
  vendorName: string | null;
}

const columns: Column<ActiveAllocation>[] = [
  { header: "Stand", render: (a) => a.stallCode },
  { header: "Vendeur", render: (a) => a.vendorName ?? "-" },
  { header: "Allocation ID", render: (a) => a.id },
];

export function PaymentsPage() {
  const { data: stalls, loading, error: loadError, reload } = useApiData(getStalls, NO_STALLS);
  const { feedback, success, error, clear } = useFeedback();
  const [allocationId, setAllocationId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
  const [saving, setSaving] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const activeAllocations = useMemo<ActiveAllocation[]>(
    () =>
      stalls.flatMap((stall) =>
        stall.active_allocation
          ? [{ id: stall.active_allocation.id, stallCode: stall.code, vendorName: stall.active_allocation.vendor_name }]
          : [],
      ),
    [stalls],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    clear();
    setReceiptUrl(null);
    const response = await createPayment({
      allocation_id: Number(allocationId),
      amount_paid: Number(amountPaid),
      period,
    });
    setSaving(false);
    if (!response.success) {
      error(response.message);
      return;
    }
    setAllocationId("");
    setAmountPaid("");
    setReceiptUrl(response.data.receipt_url ?? null);
    success("Paiement enregistré.");
    await reload();
  };

  return (
    <section className="admin-page-space">
      {loadError && <Alert>{loadError}</Alert>}
      {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}
      {receiptUrl && (
        <a className="btn-primary accent" href={receiptUrl} target="_blank" rel="noreferrer">
          Télécharger le reçu de paiement
        </a>
      )}

      <div className="admin-split-grid">
        <Panel variant="form" title="Nouveau Paiement" description="Enregistrer un encaissement." className="form-panel">
          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : (
            <form className="form-stack" onSubmit={handleSubmit}>
              <FormField label="Allocation active" htmlFor="allocation">
                <select id="allocation" value={allocationId} onChange={(e) => setAllocationId(e.target.value)} required>
                  <option value="">Sélectionner</option>
                  {activeAllocations.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.stallCode} - {a.vendorName ?? "Vendeur"} (#{a.id})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Montant payé (CFA)" htmlFor="amount">
                <input
                  id="amount"
                  type="number"
                  min={1}
                  step="any"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Période" htmlFor="period">
                <input id="period" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} required />
              </FormField>
              <button className="btn-primary accent" type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer le paiement"}
              </button>
            </form>
          )}
        </Panel>

        <Panel title="Allocations actives" pill={`${activeAllocations.length} actives`}>
          <DataTable
            columns={columns}
            rows={activeAllocations}
            rowKey={(a) => a.id}
            loading={loading}
            emptyMessage="Aucune allocation active."
          />
        </Panel>
      </div>
    </section>
  );
}
