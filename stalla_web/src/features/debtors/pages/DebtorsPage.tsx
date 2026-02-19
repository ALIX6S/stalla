import { Alert } from "../../../shared/components/Alert";
import { DataTable } from "../../../shared/components/DataTable";
import type { Column } from "../../../shared/components/DataTable";
import { Panel } from "../../../shared/components/Panel";
import { useApiData } from "../../../shared/hooks/useApiData";
import { formatCfa } from "../../../shared/utils/format";
import { getDebtors } from "../services/debtorService";
import type { Debtor } from "../types";

const NO_DEBTORS: Debtor[] = [];

const columns: Column<Debtor>[] = [
  { header: "Vendeur", render: (d) => d.full_name },
  { header: "Téléphone", render: (d) => d.phone },
  { header: "Activité", render: (d) => d.business_type },
  { header: "Total dû", render: (d) => formatCfa(d.total_due) },
  { header: "Payé", render: (d) => formatCfa(d.total_paid) },
  { header: "Dette", render: (d) => formatCfa(d.current_debt) },
];

export function DebtorsPage() {
  const { data: debtors, loading, error } = useApiData(getDebtors, NO_DEBTORS);

  return (
    <section className="admin-page-space">
      {error && <Alert>{error}</Alert>}
      <Panel title="Liste des débiteurs" pill={`${debtors.length} en retard`}>
        <DataTable columns={columns} rows={debtors} rowKey={(d) => d.vendor_id} loading={loading} emptyMessage="Aucun débiteur." />
      </Panel>
    </section>
  );
}
