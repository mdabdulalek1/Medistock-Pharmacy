import React, { useState } from 'react';
import { OnlineOrder, OnlineOrderStatus, User, Branch } from '../types/pharmacy';
import { formatBDT, formatDateTime } from '../utils/formatters';
import {
  ClipboardCheck,
  CheckCircle,
  Truck,
  Package,
  FileCheck2,
  Clock,
  Phone,
  MapPin,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface OnlineOrdersViewProps {
  orders: OnlineOrder[];
  currentUser: User;
  branches: Branch[];
  onUpdateOrderStatus: (orderId: string, status: string, notes?: string) => Promise<any>;
}

export const OnlineOrdersView: React.FC<OnlineOrdersViewProps> = ({
  orders,
  currentUser,
  branches,
  onUpdateOrderStatus,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [certifyingOrderId, setCertifyingOrderId] = useState<string | null>(null);
  const [pharmacistNote, setPharmacistNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const canVerifyPrescription = ['owner', 'admin', 'pharmacist'].includes(currentUser.role);
  const canUpdateFulfillment = ['owner', 'admin', 'branch_manager', 'pharmacist', 'cashier'].includes(currentUser.role);

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusFilter === 'ALL') return true;
    return o.status === selectedStatusFilter;
  });

  const handleVerifyPrescription = async (orderId: string) => {
    setIsUpdating(true);
    try {
      await onUpdateOrderStatus(
        orderId,
        'PRESCRIPTION_VERIFIED',
        pharmacistNote || 'Doctor prescription reviewed & verified by certified A-Grade Pharmacist.'
      );
      setCertifyingOrderId(null);
      setPharmacistNote('');
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdvanceStatus = async (orderId: string, nextStatus: OnlineOrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateOrderStatus(orderId, nextStatus);
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OnlineOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-[#B7791F] font-semibold text-xs">Pending Verification</span>;
      case 'PRESCRIPTION_VERIFIED':
        return <span className="text-[#17365D] font-semibold text-xs">Prescription Verified</span>;
      case 'PACKED':
        return <span className="text-[#168C8C] font-semibold text-xs">Packed in Branch</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="text-[#17365D] font-semibold text-xs">Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="text-[#16803C] font-semibold text-xs">Delivered</span>;
      case 'CANCELLED':
        return <span className="text-[#C62828] font-semibold text-xs">Cancelled</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
            Online Orders & Prescription Dispensing Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            DGDA compliant workflow: Doctor prescription certification & home delivery dispatch
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
          {['ALL', 'PENDING', 'PRESCRIPTION_VERIFIED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                selectedStatusFilter === st ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
            <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <span>No online delivery orders found in this view.</span>
          </div>
        ) : (
          filteredOrders.map((order) => {
            return (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Placed: <span className="font-mono">{formatDateTime(order.createdAt)}</span> · Assigned Branch: {order.assignedBranchName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      {formatBDT(order.totalAmount)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {order.paymentMethod} ({order.paymentStatus})
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3.5 rounded-lg">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Customer Information
                    </span>
                    <div className="mt-1 font-semibold text-slate-900">{order.customerName}</div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Delivery Address
                    </span>
                    <div className="flex items-start gap-1.5 text-slate-700 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress}, {order.thana}, {order.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Ordered Medicines
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{it.brandName}</span>
                            <span className="text-[11px] text-slate-500">({it.strength})</span>
                            {it.isPrescriptionRequired && (
                              <span className="text-[10px] font-bold text-amber-700 font-mono">Rx Required</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{it.dosageForm}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-slate-700 mr-4">
                            {it.quantity} &times; ৳{it.unitPrice.toFixed(2)}
                          </span>
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            ৳{it.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription Status / Pharmacist Verification */}
                {order.hasPrescriptionItems && (
                  <div className="rounded-lg border border-[#B7791F]/30 bg-[#FEF8ED] p-3.5 text-xs text-[#B7791F] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <FileCheck2 className="h-4 w-4 text-[#B7791F]" />
                        <span>Pharmacist Prescription Certification</span>
                      </div>
                      {order.prescriptionVerifiedBy ? (
                        <span className="text-[#16803C] font-semibold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Certified by: {order.prescriptionVerifiedBy}
                        </span>
                      ) : (
                        <span className="text-[#C62828] font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> Awaiting A-Grade Pharmacist Sign-off
                        </span>
                      )}
                    </div>

                    {order.prescriptionNote && (
                      <div className="text-[11px] text-[#B7791F] bg-white/70 p-2 rounded border border-[#B7791F]/30 font-mono">
                        Note: {order.prescriptionNote}
                      </div>
                    )}

                    {/* Pharmacist Verification Action Box */}
                    {!order.prescriptionVerifiedBy && canVerifyPrescription && (
                      <div className="pt-2 border-t border-[#B7791F]/30 space-y-2">
                        {certifyingOrderId === order.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Doctor Name, Clinic, & Verification remarks..."
                              value={pharmacistNote}
                              onChange={(e) => setPharmacistNote(e.target.value)}
                              className="w-full rounded border border-[#B7791F]/40 bg-white p-2 text-xs outline-none focus:border-[#B7791F]"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVerifyPrescription(order.id)}
                                disabled={isUpdating}
                                className="rounded-md bg-[#168C8C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#127373]"
                              >
                                {isUpdating ? 'Certifying...' : 'Certify & Approve Dispensing'}
                              </button>
                              <button
                                onClick={() => setCertifyingOrderId(null)}
                                className="text-xs text-slate-500 hover:text-slate-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCertifyingOrderId(order.id)}
                            className="rounded-md bg-[#168C8C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#127373] transition-colors shadow-2xs"
                          >
                            Verify Doctor Prescription as Pharmacist
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Fulfillment Progression Actions */}
                {canUpdateFulfillment && (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    {order.status === 'PRESCRIPTION_VERIFIED' && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, 'PACKED')}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 rounded-lg bg-[#168C8C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#127373]"
                      >
                        <Package className="h-3.5 w-3.5" />
                        <span>Pack Medicine & Ready for Dispatch</span>
                      </button>
                    )}

                    {order.status === 'PACKED' && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, 'OUT_FOR_DELIVERY')}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 rounded-lg bg-[#17365D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#132d4e]"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Handover to Rider / Out for Delivery</span>
                      </button>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, 'DELIVERED')}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 rounded-lg bg-[#16803C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#126b32]"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Confirm Delivery Completed</span>
                      </button>
                    )}

                    {['PENDING', 'PRESCRIPTION_VERIFIED'].includes(order.status) && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, 'CANCELLED')}
                        disabled={isUpdating}
                        className="flex items-center gap-1 text-xs text-[#C62828] hover:text-[#9b1f1f] p-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
