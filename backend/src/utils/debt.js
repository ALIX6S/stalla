function toMonthIndex(dateInput) {
  const d = new Date(dateInput);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

export function monthsOccupied(startDate, endDate = null) {
  if (!startDate) return 0;

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  return toMonthIndex(end) - toMonthIndex(start) + 1;
}

export function computeDebtForAllocation({ startDate, endDate, monthlyPrice, totalPaid }) {
  const months = monthsOccupied(startDate, endDate);
  const due = months * Number(monthlyPrice || 0);
  const paid = Number(totalPaid || 0);
  const debt = Math.max(due - paid, 0);

  return {
    months,
    total_due: due,
    total_paid: paid,
    current_debt: debt,
  };
}

const sumPayments = (payments = []) => payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

/**
 * Situation financière agrégée sur des allocations (avec `stall` et `payments` chargés).
 */
export function computeBalance(allocations = []) {
  let totalDue = 0;
  let totalPaid = 0;
  for (const allocation of allocations) {
    const stats = computeDebtForAllocation({
      startDate: allocation.startDate,
      endDate: allocation.endDate,
      monthlyPrice: allocation.stall?.monthlyPrice || 0,
      totalPaid: sumPayments(allocation.payments),
    });
    totalDue += stats.total_due;
    totalPaid += stats.total_paid;
  }
  return { total_paid: totalPaid, total_due: totalDue, current_debt: Math.max(totalDue - totalPaid, 0) };
}
