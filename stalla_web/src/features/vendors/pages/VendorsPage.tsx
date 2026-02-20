import { Alert } from "../../../shared/components/Alert";
import { DataTable } from "../../../shared/components/DataTable";
import type { Column } from "../../../shared/components/DataTable";
import { Panel } from "../../../shared/components/Panel";
import { useApiData } from "../../../shared/hooks/useApiData";
import { getVendors } from "../services/vendorService";
import type { Vendor } from "../types";

const NO_VENDORS: Vendor[] = [];

const columns: Column<Vendor>[] = [
  { header: "Nom", render: (v) => v.full_name },
  { header: "Téléphone", render: (v) => v.phone },
  { header: "Email", render: (v) => v.email ?? "-" },
  { header: "Activité", render: (v) => v.business_type },
];

export function VendorsPage() {
  const { data: vendors, loading, error } = useApiData(getVendors, NO_VENDORS);

  return (
    <section className="admin-page-space">
      {error && <Alert>{error}</Alert>}
      <Panel title="Liste des vendeurs" pill={`${vendors.length} total`}>
        <DataTable columns={columns} rows={vendors} rowKey={(v) => v.id} loading={loading} emptyMessage="Aucun vendeur." />
      </Panel>
    </section>
  );
}
