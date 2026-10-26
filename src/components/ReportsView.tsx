import React from 'react';
import { DashboardMetrics, SaleInvoice, Branch } from '../types/pharmacy';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { BarChart3, Download, TrendingUp, DollarSign, Calendar, Boxes, Printer } from 'lucide-react';

interface ReportsViewProps {
  metrics: DashboardMetrics;
  salesInvoices: SaleInvoice[];
  branches: Branch[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  metrics,
  salesInvoices,
  branches,
}) => {
  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Branch', 'Cashier', 'Customer', 'Items Count', 'Payment Method', 'Total BDT', 'Timestamp'];
    const rows = salesInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.branchName,
      inv.cashierName,
      inv.customerName,
      inv.items.length,
      inv.paymentMethod,
      inv.totalAmount.toFixed(2),
      inv.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medistock_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
            Financial & Inventory Valuation Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade accounting · Gross profit margin analysis · Expiry risk write-down forecasting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-[#168C8C] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#127373] transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs text-slate-500">Total Billed Revenue</span>
          <div className="mt-1 text-xl font-bold font-mono text-[#17365D] tabular-nums">
            {formatBDT(metrics.todaySalesBDT)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Invoiced customer receipts</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs text-slate-500">Estimated Gross Margin</span>
          <div className="mt-1 text-xl font-bold font-mono text-[#16803C] tabular-nums">
            {formatBDT(metrics.estimatedGrossProfitBDT)}
          </div>
          <p className="text-[11px] text-[#16803C] mt-0.5">
            {metrics.todaySalesBDT > 0
              ? `${((metrics.estimatedGrossProfitBDT / metrics.todaySalesBDT) * 100).toFixed(1)}% margin`
              : '0% margin'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs text-slate-500">Physical Stock Valuation</span>
          <div className="mt-1 text-xl font-bold font-mono text-[#17365D] tabular-nums">
            {formatBDT(metrics.totalStockValueBDT)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">At landed purchase cost</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs text-slate-500">Expiry Exposure Risk</span>
          <div className="mt-1 text-xl font-bold font-mono text-[#B7791F] tabular-nums">
            {metrics.expiringIn30DaysCount} batches
          </div>
          <p className="text-[11px] text-[#B7791F] mt-0.5">Expiring in next 30 days</p>
        </div>
      </div>

      {/* Branch Contribution Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="border-b border-slate-200 px-6 py-3.5 bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Branch Revenue & Inventory Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-600 bg-white">
              <tr>
                <th className="px-6 py-3 font-semibold">Branch Name</th>
                <th className="px-6 py-3 text-right font-semibold">Today's Sales (BDT)</th>
                <th className="px-6 py-3 text-right font-semibold">Forecast Month Sales (BDT)</th>
                <th className="px-6 py-3 text-right font-semibold">Stock Valuation (BDT)</th>
                <th className="px-6 py-3 text-center font-semibold">Stock Batches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {metrics.branchPerformance.map((bp) => (
                <tr key={bp.branchId} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{bp.branchName}</td>
                  <td className="px-6 py-3.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {formatBDT(bp.todaySalesBDT)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                    {formatBDT(bp.monthSalesBDT)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                    {formatBDT(bp.stockValuationBDT)}
                  </td>
                  <td className="px-6 py-3.5 text-center font-mono tabular-nums">{bp.batchCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Invoices Audit List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="border-b border-slate-200 px-6 py-3.5 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent POS Sales Invoices
          </h2>
          <span className="text-xs text-slate-500 font-mono">{salesInvoices.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-semibold">Invoice No</th>
                <th className="px-6 py-3 font-semibold">Date & Time</th>
                <th className="px-6 py-3 font-semibold">Branch</th>
                <th className="px-6 py-3 font-semibold">Cashier</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 text-center font-semibold">Method</th>
                <th className="px-6 py-3 text-right font-semibold">Total Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {salesInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="px-6 py-3 font-mono text-[11px] text-slate-500">{formatDateTime(inv.createdAt)}</td>
                  <td className="px-6 py-3 text-slate-700">{inv.branchName}</td>
                  <td className="px-6 py-3 text-slate-600">{inv.cashierName}</td>
                  <td className="px-6 py-3 text-slate-700">{inv.customerName}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="font-mono text-[11px] text-slate-700 font-semibold">{inv.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatBDT(inv.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
