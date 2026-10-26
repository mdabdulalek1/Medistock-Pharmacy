import React from 'react';
import { SaleInvoice } from '../types/pharmacy';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { Printer, X, CheckCircle2, FileText } from 'lucide-react';
import { PrintDocumentModal } from './PrintDocumentModal';

interface InvoiceModalProps {
  invoice: SaleInvoice | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  const [showFormatPrintModal, setShowFormatPrintModal] = React.useState(false);
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
        <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
          {/* Modal Controls (Hidden in print) */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Sale Completed Successfully</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFormatPrintModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#123B5D] hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <FileText className="h-3.5 w-3.5 text-[#079B8C]" />
                <span>Thermal 80mm / A4</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-[#079B8C] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#058276] transition-colors shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Quick Print</span>
              </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-receipt" className="overflow-y-auto p-6 text-slate-900 font-sans">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              মেডিস্টক ফার্মাসি <span className="font-normal text-slate-500">|</span> MediStock Pharmacy
            </h1>
            <p className="text-xs font-medium text-slate-600 mt-0.5">{invoice.branchName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{invoice.branchAddress}</p>
            <p className="text-xs text-slate-500">
              Hotline: {invoice.branchPhone} · BIN: {invoice.branchBin}
            </p>
            <div className="mt-2 inline-block border border-slate-300 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-slate-700 uppercase">
              Retail Tax Invoice (Mushak-6.3)
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 text-xs py-3 border-b border-dashed border-slate-300">
            <div>
              <p className="text-slate-500">Invoice No: <span className="font-mono font-semibold text-slate-900">{invoice.invoiceNumber}</span></p>
              <p className="text-slate-500">Date & Time: <span className="text-slate-800">{formatDateTime(invoice.createdAt)}</span></p>
              <p className="text-slate-500">Cashier: <span className="text-slate-800">{invoice.cashierName}</span></p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">Customer: <span className="font-medium text-slate-900">{invoice.customerName}</span></p>
              <p className="text-slate-500">Phone: <span className="font-mono text-slate-800">{invoice.customerPhone}</span></p>
              {invoice.prescriptionNumber && (
                <p className="text-slate-500">Rx No: <span className="text-slate-900 font-medium">{invoice.prescriptionNumber}</span></p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-left text-slate-600">
                  <th className="py-1.5 font-medium">Item & Batch</th>
                  <th className="py-1.5 text-center font-medium">Exp</th>
                  <th className="py-1.5 text-right font-medium">Qty</th>
                  <th className="py-1.5 text-right font-medium">Rate</th>
                  <th className="py-1.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-2 pr-2 font-sans">
                      <div className="font-semibold text-slate-900">{item.brandName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.genericName} · Batch: {item.batchNumber}
                      </div>
                    </td>
                    <td className="py-2 text-center text-slate-500 text-[11px] tabular-nums whitespace-nowrap">
                      {item.expiryDate ? item.expiryDate.slice(2, 7) : '—'}
                    </td>
                    <td className="py-2 text-right text-slate-800 tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right text-slate-800 tabular-nums">
                      ৳{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-semibold text-slate-900 tabular-nums">
                      ৳{item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatBDT(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Special Discount</span>
                <span className="font-mono tabular-nums">- {formatBDT(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>VAT / Tax (Exempted Essential Life Saving Drugs)</span>
              <span className="font-mono tabular-nums">৳ 0.00</span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-bold text-slate-900">
              <span>Net Payable</span>
              <span className="font-mono tabular-nums">{formatBDT(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Payment Mode ({invoice.paymentMethod})</span>
              <span className="font-mono tabular-nums">{formatBDT(invoice.tenderedAmount)}</span>
            </div>
            {invoice.changeAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Change Returned</span>
                <span className="font-mono tabular-nums">{formatBDT(invoice.changeAmount)}</span>
              </div>
            )}
          </div>

          {/* Footer & Bangladesh Regulatory Compliance */}
          <div className="mt-6 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">
              Thank you for trusting MediStock Pharmacy. Wish you quick recovery!
            </p>
            <p>
              * Goods once sold can be exchanged within 7 days with valid invoice (excluding cold-chain items).
            </p>
            <p>
              Keep all medications out of reach of children. Store in a cool dry place below 30°C.
            </p>
            <div className="pt-2 font-mono text-[9px] tracking-widest text-slate-400 uppercase">
              DGDA Approved Pharmacy Automation System
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Done / Next Customer
          </button>
        </div>
      </div>
    </div>

    {/* Thermal 80mm / Mushak 6.3 Standard Format Print Modal */}
    <PrintDocumentModal
      isOpen={showFormatPrintModal}
      documentType="TAX_INVOICE"
      invoice={invoice}
      onClose={() => setShowFormatPrintModal(false)}
    />
  </>
  );
};
