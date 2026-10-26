import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Pill,
  Receipt,
  ShoppingBag,
  Boxes,
  ArrowRight,
  X,
  Building2,
  Calendar,
} from 'lucide-react';
import { searchGlobal } from '../services/api';
import { Medicine, SaleInvoice, OnlineOrder, BatchInventory } from '../types/pharmacy';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedicine?: (med: Medicine) => void;
  onSelectInvoice?: (inv: SaleInvoice) => void;
  onSelectOrder?: (ord: OnlineOrder) => void;
  onSelectBatch?: (batch: BatchInventory) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMedicine,
  onSelectInvoice,
  onSelectOrder,
  onSelectBatch,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    medicines: Medicine[];
    invoices: SaleInvoice[];
    orders: OnlineOrder[];
    batches: BatchInventory[];
  }>({ medicines: [], invoices: [], orders: [], batches: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ medicines: [], invoices: [], orders: [], batches: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ medicines: [], invoices: [], orders: [], batches: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchGlobal(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.medicines.length +
    results.invoices.length +
    results.orders.length +
    results.batches.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, brand, generic, invoices, online orders, batches..."
            className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500">
            ESC
          </span>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching enterprise ERP records...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching medicines, invoices, orders, or batches found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search by medicine brand name, generic formulation, customer phone, or invoice number.
            </div>
          )}

          {/* Medicines */}
          {results.medicines.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-emerald-600" />
                <span>Medicines & Formulations ({results.medicines.length})</span>
              </div>
              <div className="space-y-1">
                {results.medicines.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (onSelectMedicine) onSelectMedicine(m);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {m.brandName}{' '}
                        <span className="text-slate-500 font-normal">
                          {m.strength} ({m.dosageForm})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.genericName} · {m.manufacturer}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {m.unit}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.barcode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {results.invoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-blue-600" />
                <span>Sales Invoices ({results.invoices.length})</span>
              </div>
              <div className="space-y-1">
                {results.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      if (onSelectInvoice) onSelectInvoice(inv);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs font-mono">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {inv.customerName} ({inv.customerPhone}) · {inv.branchName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        ৳{inv.totalAmount.toLocaleString()}
                      </div>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        {inv.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Online Orders */}
          {results.orders.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-purple-600" />
                <span>Online Delivery Orders ({results.orders.length})</span>
              </div>
              <div className="space-y-1">
                {results.orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      if (onSelectOrder) onSelectOrder(ord);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs font-mono">
                        {ord.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ord.customerName} · {ord.thana}, {ord.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        ৳{ord.totalAmount.toLocaleString()}
                      </div>
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batches */}
          {results.batches.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5 text-amber-600" />
                <span>Batch Inventory ({results.batches.length})</span>
              </div>
              <div className="space-y-1">
                {results.batches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (onSelectBatch) onSelectBatch(b);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs font-mono">
                        Batch: {b.batchNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Exp: {b.expiryDate} · {b.rackLocation}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {b.currentQuantity} units
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Cost: ৳{b.purchaseCost}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono bg-white px-1 py-0.5 rounded border">↑</kbd> <kbd className="font-mono bg-white px-1 py-0.5 rounded border">↓</kbd></span>
            <span>Select: <kbd className="font-mono bg-white px-1 py-0.5 rounded border">Enter</kbd></span>
          </div>
          <span className="font-mono">MediStock Enterprise DB</span>
        </div>
      </div>
    </div>
  );
};
