import React, { useState } from 'react';
import { Supplier, PurchaseOrder, Branch, Medicine, User } from '../types/pharmacy';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { Truck, FileSpreadsheet, Plus, CheckCircle2, Phone, Mail, Building2, PackageCheck } from 'lucide-react';

interface SuppliersPurchasingViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  branches: Branch[];
  medicines: Medicine[];
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const SuppliersPurchasingView: React.FC<SuppliersPurchasingViewProps> = ({
  suppliers,
  purchaseOrders,
  branches,
  medicines,
  currentUser,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ORDERS' | 'SUPPLIERS'>('ORDERS');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
            Suppliers & Procurement Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Depot supply chain with Bangladesh pharmaceutical manufacturers & Goods Receiving (GRN)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab controls */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setActiveSubTab('ORDERS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeSubTab === 'ORDERS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Purchase Orders</span>
            </button>
            <button
              onClick={() => setActiveSubTab('SUPPLIERS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeSubTab === 'SUPPLIERS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Depot Suppliers</span>
            </button>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="flex items-center gap-1.5 rounded-lg bg-[#168C8C] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#127373] transition-colors shadow-2xs whitespace-nowrap"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            <span>Receive Goods (GRN)</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'ORDERS' ? (
        /* Purchase Orders List */
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">PO Number</th>
                    <th className="px-5 py-3 font-semibold">Manufacturer Depot</th>
                    <th className="px-5 py-3 font-semibold">Destination Branch</th>
                    <th className="px-5 py-3 font-semibold">Item Count</th>
                    <th className="px-5 py-3 text-right font-semibold">Total Cost (BDT)</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">
                        {po.poNumber}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {po.supplierName}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {po.branchName}
                      </td>
                      <td className="px-5 py-3 text-slate-600 font-mono">
                        {po.items.length} lines
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatBDT(po.totalAmount)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            po.status === 'RECEIVED'
                              ? 'text-[#16803C]'
                              : po.status === 'APPROVED' || po.status === 'SUBMITTED'
                              ? 'text-[#B7791F]'
                              : 'text-slate-600'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[11px]">
                        <div>{po.createdBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{formatDateTime(po.createdAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Suppliers Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{sup.address}, {sup.city}</p>
                </div>
                <span className="font-mono text-xs font-semibold text-[#168C8C]">
                  ★ {sup.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-[11px] text-slate-500">Key Contact</span>
                  <div className="font-medium text-slate-900 mt-0.5">{sup.contactPerson}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">DGDA Depot License</span>
                  <div className="font-mono text-slate-800 mt-0.5">{sup.dgdaLicense}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Phone Hotline</span>
                  <div className="font-mono text-slate-800 mt-0.5">{sup.phone}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Credit Term</span>
                  <div className="font-mono text-slate-800 mt-0.5">{sup.paymentTermsDays} Days Net</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
