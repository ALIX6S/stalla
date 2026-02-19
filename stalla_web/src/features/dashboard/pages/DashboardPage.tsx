import { useMemo } from "react";
import { Alert } from "../../../shared/components/Alert";
import { useApiData } from "../../../shared/hooks/useApiData";
import { formatCfa } from "../../../shared/utils/format";
import { getDebtors } from "../../debtors/services/debtorService";
import type { Debtor } from "../../debtors/types";
import { getStalls } from "../../stalls/services/stallService";
import type { Stand } from "../../stalls/types";
import { getVendors } from "../../vendors/services/vendorService";
import type { Vendor } from "../../vendors/types";

const NO_STALLS: Stand[] = [];
const NO_VENDORS: Vendor[] = [];
const NO_DEBTORS: Debtor[] = [];

export function DashboardPage() {
  const stallsQuery = useApiData(getStalls, NO_STALLS);
  const vendorsQuery = useApiData(getVendors, NO_VENDORS);
  const debtorsQuery = useApiData(getDebtors, NO_DEBTORS);

  const loading = stallsQuery.loading || vendorsQuery.loading || debtorsQuery.loading;
  const errors = [stallsQuery.error, vendorsQuery.error, debtorsQuery.error].filter(Boolean);
  const stalls = stallsQuery.data;
  const vendors = vendorsQuery.data;
  const debtors = debtorsQuery.data;

  const kpis = useMemo(() => {
    const totalStalls = stalls.length;
    const occupiedStalls = stalls.filter((stall) => stall.status === "OCCUPIED").length;
    const totalDebt = debtors.reduce((sum, d) => sum + d.current_debt, 0);
    const totalDue = debtors.reduce((sum, d) => sum + d.total_due, 0);
    const totalPaid = debtors.reduce((sum, d) => sum + d.total_paid, 0);
    return {
      totalStalls,
      occupiedStalls,
      availableStalls: totalStalls - occupiedStalls,
      totalVendors: vendors.length,
      totalDebtors: debtors.length,
      totalDebt,
      totalDue,
      totalPaid,
      occupancyRate: totalStalls > 0 ? Math.round((occupiedStalls / totalStalls) * 100) : 0,
      recoveryRate: totalPaid + totalDebt > 0 ? Math.round((totalPaid / (totalPaid + totalDebt)) * 100) : 0,
    };
  }, [stalls, vendors, debtors]);

  return (
    <section className="dashboard-page">
      {errors.length > 0 && <Alert>{errors.join(" | ")}</Alert>}

      {loading ? (
        <p className="helper-text">Chargement des données...</p>
      ) : (
        <div className="bento-layout">
          <div className="hero-card">
            <h3>Bienvenue sur STALLA</h3>
            <p>
              L&apos;occupation actuelle est à <strong>{kpis.occupancyRate}%</strong>. Vous suivez{" "}
              <strong>{kpis.totalDebtors}</strong> débiteurs actifs.
            </p>
            <div className="hero-actions">
              <span className="chip">Stands: {kpis.totalStalls}</span>
              <span className="chip">Vendeurs: {kpis.totalVendors}</span>
            </div>
          </div>

          <div className="stat-grid">
            <StatTile label="Stands occupés" value={kpis.occupiedStalls} />
            <StatTile label="Stands disponibles" value={kpis.availableStalls} />
            <StatTile label="Vendeurs" value={kpis.totalVendors} />
            <StatTile label="Débiteurs" value={kpis.totalDebtors} />
          </div>

          <div className="chart-card">
            <div className="section-head">
              <h4>Occupation des stands</h4>
              <b>{kpis.occupancyRate}%</b>
            </div>
            <div className="progress-track">
              <div className="progress-value" style={{ width: `${kpis.occupancyRate}%` }}></div>
            </div>
            <div className="dual-metrics">
              <Metric label="Occupés" value={kpis.occupiedStalls} />
              <Metric label="Disponibles" value={kpis.availableStalls} />
            </div>
          </div>

          <div className="finance-card">
            <div className="section-head">
              <h4>Recouvrement</h4>
              <b>{kpis.recoveryRate}%</b>
            </div>
            <div className="progress-track soft">
              <div className="progress-value grad" style={{ width: `${kpis.recoveryRate}%` }}></div>
            </div>
            <div className="dual-metrics">
              <Metric label="Total collecté" value={formatCfa(kpis.totalPaid)} />
              <Metric label="Reste à recouvrer" value={formatCfa(kpis.totalDebt)} />
            </div>
            <div className="finance-foot">
              <small>Total dû</small>
              <b>{formatCfa(kpis.totalDue)}</b>
            </div>
          </div>

          <div className="activity-card">
            <div className="section-head">
              <h4>Débiteurs récents</h4>
              <b>{debtors.length}</b>
            </div>
            <div className="debtor-list-modern">
              {debtors.slice(0, 4).map((debtor) => (
                <div className="debtor-row" key={debtor.vendor_id}>
                  <div className="debtor-avatar">{debtor.full_name.charAt(0)}</div>
                  <div>
                    <p>{debtor.full_name}</p>
                    <small>{debtor.business_type}</small>
                  </div>
                  <strong>{formatCfa(debtor.current_debt)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <small>{label}</small>
      <p>{value}</p>
    </div>
  );
}
