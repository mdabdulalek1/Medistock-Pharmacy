import React, { useState, useEffect } from 'react';
import { SaleInvoice, Branch, PurchaseOrder } from '../types/pharmacy';
import { formatBDT, formatDate } from '../utils/formatters';
import { MediStockLogo } from './MediStockLogo';
import {
  Printer,
  X,
  FileText,
  Receipt,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  Share2,
  AlertCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

export type PrintDocumentType =
  | 'POS_RECEIPT'
  | 'TAX_INVOICE'
  | 'PAYMENT_RECEIPT'
  | 'REFUND_SLIP'
  | 'PURCHASE_ORDER'
  | 'TRANSFER_NOTE'
  | 'DELIVERY_SLIP'
  | 'DUE_STATEMENT';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: PrintDocumentType;
  invoice?: SaleInvoice | null;
  purchaseOrder?: PurchaseOrder | null;
  dueStatement?: any | null;
  transferData?: any | null;
  refundData?: any | null;
  activeBranch?: Branch;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  invoice,
  purchaseOrder,
  dueStatement,
  transferData,
  refundData,
  activeBranch,
}) => {
  const [printFormat, setPrintFormat] = useState<'thermal_80mm' | 'standard_a4'>('thermal_80mm');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const branchName = invoice?.branchName || activeBranch?.name || 'Dhanmondi Flagship & Corporate HQ';
  const branchAddress = invoice?.branchAddress || activeBranch?.address || 'House 42, Road 27, Dhanmondi R/A, Dhaka-1209';
  const branchPhone = invoice?.branchPhone || activeBranch?.phone || '+880 1711-234567';
  const branchBin = invoice?.branchBin || activeBranch?.taxBinNumber || '003482910-0101';
  const drugLicense = activeBranch?.drugLicenseNo || 'DGDA/DL/DHK-84920/2022';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs font-sans print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        {/* Modal Controls Bar (Hidden during printing) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#123B5D] px-6 py-3.5 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-[#079B8C]" />
            <span className="font-bold text-sm">
              {documentType === 'POS_RECEIPT'
                ? 'Print POS Cash Receipt'
                : documentType === 'TAX_INVOICE'
                ? 'Print Mushak 6.3 Tax Invoice'
                : documentType === 'REFUND_SLIP'
                ? 'Print Refund & Return Slip'
                : documentType === 'DUE_STATEMENT'
                ? 'Print Customer Credit Due Statement'
                : 'Print Pharmacy Document'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Format toggle: Thermal vs A4 */}
            <div className="flex items-center rounded-lg bg-white/10 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setPrintFormat('thermal_80mm')}
                className={`rounded px-2.5 py-1 transition-all ${
                  printFormat === 'thermal_80mm' ? 'bg-[#079B8C] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Thermal 80mm
              </button>
              <button
                onClick={() => setPrintFormat('standard_a4')}
                className={`rounded px-2.5 py-1 transition-all ${
                  printFormat === 'standard_a4' ? 'bg-[#079B8C] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Standard A4
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-[#079B8C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#067d71] transition-colors shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print Now</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Document Printable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center print:bg-white print:p-0">
          {/* Printable Sheet Container */}
          <div
            className={`bg-white transition-all text-slate-900 ${
              printFormat === 'thermal_80mm'
                ? 'w-[320px] p-4 shadow-md border border-slate-200 font-mono text-xs print:shadow-none print:border-none print:w-[80mm] print:p-2'
                : 'w-full max-w-[540px] p-8 shadow-md border border-slate-200 font-sans text-xs print:shadow-none print:border-none print:w-full print:p-6'
            }`}
          >
            {/* Header branding */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-center mb-1">
                <MediStockLogo size="sm" />
              </div>
              <div className="font-bold text-sm text-[#123B5D]">MediStock Pharmacy Network</div>
              <div className="text-[11px] text-slate-600 font-sans">{branchName}</div>
              <div className="text-[10px] text-slate-500 font-sans">{branchAddress}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Hotline: {branchPhone}
              </div>
              <div className="text-[10px] text-slate-500">
                BIN: <strong className="text-slate-700">{branchBin}</strong> · Lic: {drugLicense}
              </div>

              {documentType === 'TAX_INVOICE' && (
                <div className="mt-2 inline-block rounded border border-slate-400 bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-800">
                  Government of Bangladesh NBR Form Mushak 6.3 Tax Invoice
                </div>
              )}
            </div>

            {/* Document Metadata */}
            {invoice && (
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Invoice No:</span>
                  <strong className="font-mono text-slate-900">{invoice.invoiceNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{new Date(invoice.createdAt).toLocaleString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Counter / Till:</span>
                  <span>{invoice.tillNumber} · Cashier: {invoice.cashierName.split(' ')[0]}</span>
                </div>
                {invoice.customerName && (
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{invoice.customerName} ({invoice.customerPhone})</span>
                  </div>
                )}
                {invoice.doctorName && (
                  <div className="flex justify-between">
                    <span>Doctor / Rx:</span>
                    <span>{invoice.doctorName} {invoice.prescriptionNumber ? `(#${invoice.prescriptionNumber})` : ''}</span>
                  </div>
                )}
              </div>
            )}

            {/* Customer Due Statement Header */}
            {documentType === 'DUE_STATEMENT' && dueStatement && (
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="font-bold text-sm text-center text-[#123B5D]">Customer Credit Statement</div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <strong>{dueStatement.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{dueStatement.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Limit:</span>
                  <span>{formatBDT(dueStatement.creditLimitBDT)}</span>
                </div>
              </div>
            )}

            {/* Line Items Table */}
            {invoice && (
              <div className="py-2.5 border-b border-dashed border-slate-300">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-1 font-semibold">Item & Batch</th>
                      <th className="pb-1 text-center font-semibold">Qty</th>
                      <th className="pb-1 text-right font-semibold">Rate</th>
                      <th className="pb-1 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((it, idx) => (
                      <tr key={idx} className="py-1">
                        <td className="py-1 pr-1">
                          <div className="font-semibold text-slate-800 leading-tight">{it.brandName}</div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {it.strength} · B:{it.batchNumber}
                          </div>
                        </td>
                        <td className="py-1 text-center font-mono">{it.quantity}</td>
                        <td className="py-1 text-right font-mono">{it.unitPrice.toFixed(2)}</td>
                        <td className="py-1 text-right font-mono font-semibold">
                          {(it.quantity * it.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals Section */}
            {invoice && (
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatBDT(invoice.subtotal)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-[#168653]">
                    <span>Discount:</span>
                    <span className="font-mono">- {formatBDT(invoice.discountAmount)}</span>
                  </div>
                )}
                {invoice.vatAmount > 0 && (
                  <div className="flex justify-between">
                    <span>VAT (Mushak 6.3):</span>
                    <span className="font-mono">{formatBDT(invoice.vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-bold text-[#123B5D]">
                  <span>Net Payable:</span>
                  <span className="font-mono">{formatBDT(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between pt-1 text-[10px] text-slate-600">
                  <span>Paid via {invoice.paymentMethod}:</span>
                  <span className="font-mono">{formatBDT(invoice.tenderedAmount)}</span>
                </div>
                {invoice.changeAmount > 0 && (
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Change Returned:</span>
                    <span className="font-mono">{formatBDT(invoice.changeAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Due Statement Table */}
            {documentType === 'DUE_STATEMENT' && dueStatement && (
              <div className="py-2.5 border-b border-dashed border-slate-300">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-1 font-semibold">Invoice #</th>
                      <th className="pb-1 font-semibold">Date</th>
                      <th className="pb-1 text-right font-semibold">Total</th>
                      <th className="pb-1 text-right font-semibold">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dueStatement.invoices.map((inv: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-1 font-mono text-[10px]">{inv.invoiceNumber}</td>
                        <td className="py-1 text-[10px]">{inv.date}</td>
                        <td className="py-1 text-right font-mono">{formatBDT(inv.totalAmount)}</td>
                        <td className="py-1 text-right font-mono font-bold text-[#D64545]">{formatBDT(inv.dueAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex justify-between pt-2 border-t border-slate-300 text-sm font-black text-[#D64545]">
                  <span>Total Current Due:</span>
                  <span className="font-mono">{formatBDT(dueStatement.currentBalanceDueBDT)}</span>
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div className="pt-3 text-center space-y-1 text-[9px] text-slate-500">
              <div className="font-bold text-slate-700">Thank you for choosing MediStock Pharmacy</div>
              <div>Keep receipt for verified returns within 7 days. Cold-chain items non-returnable.</div>
              <div className="font-mono text-[8px] text-slate-400">
                Powered by MediStock BD ERP · DGDA Drug Reg. Compliant
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
