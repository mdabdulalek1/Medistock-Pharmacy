import React, { useState, useEffect } from 'react';
import { User } from '../types/pharmacy';
import { fetchRiderDeliveries, updateRiderDelivery } from '../services/api';
import { formatBDT } from '../utils/formatters';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Package,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

interface DeliveryRiderWorkstationViewProps {
  currentUser: User;
}

export const DeliveryRiderWorkstationView: React.FC<DeliveryRiderWorkstationViewProps> = ({ currentUser }) => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [proofInput, setProofInput] = useState('');
  const [cashCollected, setCashCollected] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await fetchRiderDeliveries();
      setDeliveries(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED') => {
    try {
      setActionStatus('Updating...');
      await updateRiderDelivery({
        orderId,
        status,
        recipientProof: proofInput || 'SMS OTP / Signature Verified',
        cashCollectedBDT: cashCollected ? Number(cashCollected) : selectedOrder?.totalAmountBDT || 0,
        failureReason,
      });
      setActionStatus(`Successfully marked as ${status}!`);
      await loadDeliveries();
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err: any) {
      setActionStatus(err.message || 'Failed to update delivery');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-[#123B5D] to-[#079B8C] text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold tracking-wider uppercase text-teal-100">
              Delivery Fleet Workstation
            </span>
            <span className="flex items-center gap-1 text-xs font-mono text-teal-200">
              <Truck className="h-3.5 w-3.5" /> Rider ID: {currentUser.id}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Assigned Deliveries & Route Dispatch
          </h1>
          <p className="text-xs text-teal-100/90 max-w-xl">
            Manage live delivery parcels, route navigation, COD cash collection, and proof of delivery signatures. Restricted strictly to courier personnel.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
          <div className="h-10 w-10 rounded-full bg-white text-[#123B5D] flex items-center justify-center font-bold text-base">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold">{currentUser.name}</div>
            <div className="text-[10px] text-teal-200">{currentUser.branchName || 'Dhanmondi Courier Hub'}</div>
          </div>
        </div>
      </div>

      {actionStatus && (
        <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs font-bold text-[#168653] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List: Deliveries Roster */}
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-[#F3F7FA] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              My Active Parcels ({deliveries.length})
            </h3>
            <button
              onClick={loadDeliveries}
              className="text-xs font-semibold text-[#079B8C] hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading delivery roster...</div>
            ) : deliveries.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Truck className="mx-auto h-8 w-8 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No active deliveries assigned.</p>
              </div>
            ) : (
              deliveries.map((deliv) => {
                const isSelected = selectedOrder?.orderId === deliv.orderId;
                return (
                  <button
                    key={deliv.orderId}
                    onClick={() => setSelectedOrder(deliv)}
                    className={`w-full text-left p-4 transition-all flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-teal-50/70 border-l-4 border-[#079B8C]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#123B5D]">{deliv.orderNumber}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            deliv.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-[#168653]'
                              : deliv.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-teal-100 text-[#079B8C]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {deliv.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate">{deliv.recipientName}</div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{deliv.thana} · {deliv.deliveryAddress}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-[#079B8C] block">
                        {formatBDT(deliv.totalAmountBDT)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{deliv.paymentMethod}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Panel: Selected Delivery */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 shadow-xl p-6 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#123B5D]">{selectedOrder.orderNumber}</h2>
                    <span className="rounded bg-teal-100 text-[#079B8C] font-mono font-bold text-xs px-2.5 py-0.5">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Assigned route: {selectedOrder.deliveryNotes}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedOrder.recipientPhone}`}
                    className="flex items-center gap-1.5 rounded-xl bg-[#079B8C] hover:bg-[#058276] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>

              {/* Recipient & Destination Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#F3F7FA] border border-slate-200 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Recipient Information
                  </span>
                  <div className="text-xs font-bold text-slate-900">{selectedOrder.recipientName}</div>
                  <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#079B8C]" />
                    <span>{selectedOrder.recipientPhone}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-[#079B8C] shrink-0 mt-0.5" />
                    <span>{selectedOrder.deliveryAddress}, {selectedOrder.thana}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F3F7FA] border border-slate-200 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Financial Summary & Settlement
                  </span>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Items Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">{formatBDT(selectedOrder.totalAmountBDT - selectedOrder.deliveryFeeBDT)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Delivery Fee:</span>
                    <span className="font-mono text-slate-800">{formatBDT(selectedOrder.deliveryFeeBDT)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#123B5D] border-t border-slate-200 pt-2">
                    <span>Total Collectible:</span>
                    <span className="font-mono text-[#079B8C]">{formatBDT(selectedOrder.totalAmountBDT)}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    Payment Mode: <strong className="text-slate-900">{selectedOrder.paymentMethod}</strong> ({selectedOrder.isPaid ? 'Prepaid Online (bKash/Nagad)' : 'Cash on Delivery (COD)'})
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Parcel Contents ({selectedOrder.items.length} items)
                </h4>
                <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Package className="h-4 w-4 text-[#079B8C]" />
                        <div>
                          <span className="font-bold text-slate-900">{item.brandName}</span>
                          <span className="text-slate-500 ml-2 font-mono">({item.dosageForm})</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#123B5D]">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Action & Proof of Delivery Form */}
              <div className="rounded-2xl bg-teal-50/50 border border-teal-200 p-5 space-y-4">
                <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Record Delivery Outcome & Proof
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Recipient Signature / OTP Proof
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Received by Son (OTP #4829)"
                      value={proofInput}
                      onChange={(e) => setProofInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Cash Collected (BDT ৳)
                    </label>
                    <input
                      type="number"
                      placeholder={selectedOrder.totalAmountBDT.toString()}
                      value={cashCollected}
                      onChange={(e) => setCashCollected(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-[#079B8C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.orderId, 'DELIVERED')}
                    className="flex-1 py-3 bg-[#168653] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm Successful Delivery & COD Settlement</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.orderId, 'RETURNED')}
                    className="px-5 py-3 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Failed Delivery / Return to Hub</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs">
              Select a delivery parcel from the left list to view route and proof details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
