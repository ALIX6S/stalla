import { useState } from "react";
import { Alert } from "../../../shared/components/Alert";
import { DataTable } from "../../../shared/components/DataTable";
import type { Column } from "../../../shared/components/DataTable";
import { Panel } from "../../../shared/components/Panel";
import { StatusPill } from "../../../shared/components/StatusPill";
import { useApiData } from "../../../shared/hooks/useApiData";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { formatCfa, formatDate, zoneLabel } from "../../../shared/utils/format";
import {
  approveVendorApplication,
  getVendorApplications,
  rejectVendorApplication,
} from "../services/applicationService";
import type { VendorApplication } from "../types";

const NO_APPLICATIONS: VendorApplication[] = [];

export function ApplicationsPage() {
  const { data: applications, loading, error: loadError, reload } = useApiData(getVendorApplications, NO_APPLICATIONS);
  const { feedback, success, error, clear } = useFeedback();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const process = async (
    app: VendorApplication,
    confirmText: string,
    action: (id: number) => ReturnType<typeof approveVendorApplication>,
    successText: string,
  ) => {
    if (!window.confirm(confirmText)) return;
    setProcessingId(app.id);
    clear();
    const response = await action(app.id);
    setProcessingId(null);
    if (!response.success) {
      error(response.message);
      return;
    }
    success(successText);
    await reload();
  };

  const columns: Column<VendorApplication>[] = [
    { header: "Date", render: (a) => formatDate(a.created_at) },
    {
      header: "Nom",
      render: (a) => (
        <>
          <strong>{a.full_name}</strong>
          <br />
          <small>{a.email ?? ""}</small>
        </>
      ),
    },
    { header: "Contact", render: (a) => a.phone },
    { header: "Activité", render: (a) => a.business_type || "-" },
    { header: "Zone souhaitée", render: (a) => zoneLabel(a.desired_zone) },
    {
      header: "Catégorie",
      render: (a) => (
        <StatusPill tone={a.desired_category === "PREMIUM" ? "occupied" : "available"}>
          {a.desired_category ?? "STANDARD"}
        </StatusPill>
      ),
    },
    { header: "Budget", render: (a) => formatCfa(a.budget_max) },
    {
      header: "Actions",
      align: "center",
      render: (a) => (
        <div className="row-actions">
          <button
            type="button"
            className="btn-approve-pastel"
            disabled={processingId === a.id}
            onClick={() =>
              process(
                a,
                `Valider la demande de ${a.full_name} ?\nUn compte vendeur sera créé.`,
                approveVendorApplication,
                "Demande validée avec succès.",
              )
            }
          >
            Valider
          </button>
          <button
            type="button"
            className="btn-reject-orange"
            disabled={processingId === a.id}
            onClick={() =>
              process(a, `Rejeter la demande de ${a.full_name} ?`, rejectVendorApplication, "Demande rejetée.")
            }
          >
            Rejeter
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="admin-page-space">
      {loadError && <Alert>{loadError}</Alert>}
      {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}
      <Panel title="Candidatures Vendeurs" pill={`${applications.length} en attente`}>
        <DataTable
          columns={columns}
          rows={applications}
          rowKey={(a) => a.id}
          loading={loading}
          emptyMessage="Aucune demande en attente."
        />
      </Panel>
    </section>
  );
}
