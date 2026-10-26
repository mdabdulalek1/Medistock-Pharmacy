import React, { useState } from 'react';
import { ReturnRefund, SaleInvoice, User } from '../types/pharmacy';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { RotateCcw, Search, CheckCircle2, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

interface ReturnsRefundsViewProps {
  returns: ReturnRefund[];
  salesInvoices: SaleInvoice[];
  currentUser: User;
  onProcessReturn: (payload: any) => Promise<any>;
}

export const ReturnsRefundsView: React.FC<ReturnsRefundsViewProps> = ({
  returns,
  salesInvoices,
  currentUser,
  onProcessReturn,
}) => {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<{ [batchId: string]: number }>({});
  const [returnReasons, setReturnReasons] = useState<{ [batchId: string]: string }>({});
  const [conditionDecisions, setConditionDecisions] = useState<{ [batchId: string]: 'RESTOCK_INSPECTED' | 'QUARANTINE_HOLD' | 'DISPOSAL_DESTROY' }>({});
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'BKASH'>('CASH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookupInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = salesInvoices.find(
      (i) => i.invoiceNumber.toLowerCase() === searchInvoiceNo.trim().toLowerCase()
    );
    if (!inv) {
      setErrorMsg(`Invoice #${searchInvoiceNo} not found in system.`);
      setSelectedInvoice(null);
    } else {
      setSelectedInvoice(inv);
      setErrorMsg('');
      const initialQty: { [b: string]: number } = {};
      const initialReasons: { [b: string]: string } = {};
      const initialConditions: { [b: string]: any } = {};
      inv.items.forEach((it) => {
        initialQty[it.batchId] = 0;
        initialReasons[it.batchId] = 'CUSTOMER_CANCEL';
        initialConditions[it.batchId] = 'RESTOCK_INSPECTED';
      });
      setReturnQuantities(initialQty);
      setReturnReasons(initialReasons);
      setConditionDecisions(initialConditions);
    }
  };

  const calculateTotalRefund = () => {
    if (!selectedInvoice) return 0;
    return selectedInvoice.items.reduce((acc, it) => {
      const qty = returnQuantities[it.batchId] || 0;
      return acc + qty * it.unitPrice;
    }, 0);
  };

  const handleExecuteReturn = async () => {
    if (!selectedInvoice) return;
    const itemsToReturn = selectedInvoice.items
      .filter((it) => (returnQuantities[it.batchId] || 0) > 0)
      .map((it) => ({
        medicineId: it.medicineId,
        brandName: it.brandName,
        batchId: it.batchId,
        batchNumber: it.batchNumber,
        quantity: returnQuantities[it.batchId],
        unitPrice: it.unitPrice,
        reason: returnReasons[it.batchId],
        conditionDecision: conditionDecisions[it.batchId],
      }));

    if (itemsToReturn.length === 0) {
      alert('Please specify quantity > 0 for at least one item to return.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onProcessReturn({
        invoiceNumber: selectedInvoice.invoiceNumber,
        items: itemsToReturn,
        refundMethod,
        notes,
      });

      setShowReturnModal(false);
      setSelectedInvoice(null);
      setSearchInvoiceNo('');
    } catch (err: any) {
      alert(err.message || 'Refund processing failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Returns, Refunds & Item Inspection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-linked credit reversals · Pharmacy product inspection: Restock vs Quarantine vs Disposal
          </p>
        </div>

        <button
          onClick={() => setShowReturnModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs whitespace-nowrap"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Initiate Return / Credit Note</span>
        </button>
      </div>

      {/* Returns History Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="border-b border-slate-200 px-6 py-3.5 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Completed Customer Returns & Credit Notes
          </h2>
          <span className="font-mono text-xs text-slate-500">{returns.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Return Reference</th>
                <th className="px-5 py-3 font-semibold">Original Invoice</th>
                <th className="px-5 py-3 font-semibold">Branch</th>
                <th className="px-5 py-3 font-semibold">Returned Items</th>
                <th className="px-5 py-3 text-right font-semibold">Refund Total (BDT)</th>
                <th className="px-5 py-3 font-semibold">Inspection Action</th>
                <th className="px-5 py-3 font-semibold">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No returns processed yet.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      <div>{ret.returnNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{formatDateTime(ret.createdAt)}</div>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-emerald-800">
                      {ret.originalInvoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{ret.branchName}</td>
                    <td className="px-5 py-3">
                      {ret.items.map((it, idx) => (
                        <div key={idx} className="text-[11px] text-slate-800">
                          {it.brandName} &times; {it.quantity} (Batch: {it.batchNumber})
                        </div>
                      ))}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                      -{formatBDT(ret.totalRefundAmount)}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px]">
                      {ret.items.map((it, idx) => (
                        <div key={idx} className="text-slate-600">
                          {it.conditionDecision === 'RESTOCK_INSPECTED' ? 'Restocked to Shelf' : 'Quarantined'}
                        </div>
                      ))}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-[11px]">
                      {ret.approvedBy || 'Manager'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initiate Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Process Item Return & Credit Note</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify original sale invoice, inspect medicine blisters, and approve refund
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedInvoice(null);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            {/* Step 1: Invoice Lookup */}
            <form onSubmit={handleLookupInvoice} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Invoice Number (e.g. INV-2026-DHK-0001)..."
                value={searchInvoiceNo}
                onChange={(e) => setSearchInvoiceNo(e.target.value)}
                className="flex-1 rounded border border-slate-300 p-2 text-xs font-mono outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="rounded bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Lookup Invoice
              </button>
            </form>

            {errorMsg && (
              <div className="rounded bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Step 2: Line Items & Inspection */}
            {selectedInvoice && (
              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500">Invoice:</span> <strong>{selectedInvoice.invoiceNumber}</strong>
                    <div><span className="text-slate-500">Date:</span> {formatDateTime(selectedInvoice.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div><span className="text-slate-500">Customer:</span> {selectedInvoice.customerName}</div>
                    <div><span className="text-slate-500">Original Total:</span> {formatBDT(selectedInvoice.totalAmount)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-800">Select Items to Return & Inspect:</div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {selectedInvoice.items.map((it) => (
                      <div key={it.batchId} className="p-3 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{it.brandName}</span>
                            <span className="text-slate-500 font-mono ml-2">({it.dosageForm} · Batch: {it.batchNumber})</span>
                          </div>
                          <div className="font-mono text-slate-700">
                            Purchased: {it.quantity} &times; ৳{it.unitPrice.toFixed(2)}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500">Return Qty (Max {it.quantity})</label>
                            <input
                              type="number"
                              min="0"
                              max={it.quantity}
                              value={returnQuantities[it.batchId] || 0}
                              onChange={(e) =>
                                setReturnQuantities({
                                  ...returnQuantities,
                                  [it.batchId]: Math.min(it.quantity, Math.max(0, Number(e.target.value))),
                                })
                              }
                              className="mt-0.5 w-full rounded border border-slate-300 p-1.5 font-mono outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500">Return Reason</label>
                            <select
                              value={returnReasons[it.batchId]}
                              onChange={(e) =>
                                setReturnReasons({ ...returnReasons, [it.batchId]: e.target.value })
                              }
                              className="mt-0.5 w-full rounded border border-slate-300 p-1.5 outline-none bg-white"
                            >
                              <option value="CUSTOMER_CANCEL">Customer Cancel / Change Mind</option>
                              <option value="DAMAGED_PACK">Damaged Blister Pack</option>
                              <option value="INCORRECT_DISPENSE">Wrong Item Dispensed</option>
                              <option value="ADVERSE_EFFECT">Adverse Reaction Reported</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500">Inspection Decision</label>
                            <select
                              value={conditionDecisions[it.batchId]}
                              onChange={(e) =>
                                setConditionDecisions({ ...conditionDecisions, [it.batchId]: e.target.value as any })
                              }
                              className="mt-0.5 w-full rounded border border-slate-300 p-1.5 outline-none bg-white font-medium"
                            >
                              <option value="RESTOCK_INSPECTED">Restock into Sellable Inventory</option>
                              <option value="QUARANTINE_HOLD">Quarantine / Hold for Supplier Return</option>
                              <option value="DISPOSAL_DESTROY">Disposal / Biological Waste</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <div>
                    <span className="text-slate-500 text-[11px]">Calculated Refund:</span>
                    <div className="font-mono text-base font-bold text-rose-700">
                      {formatBDT(calculateTotalRefund())}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(null)}
                      className="rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={calculateTotalRefund() === 0 || isSubmitting}
                      onClick={handleExecuteReturn}
                      className="rounded bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Authorize Refund & Update Ledger'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
