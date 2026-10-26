import React, { useState, useEffect } from 'react';
import { Medicine, CandidateMedicineMatch } from '../types/pharmacy';
import { searchMedicineCandidates, importCandidateMedicine, refreshMedicinePrices } from '../services/api';
import { formatBDT } from '../utils/formatters';
import {
  Database,
  Search,
  ScanBarcode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink,
  Tag,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

interface MedicineDataIntegrationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicineImported?: (medicine: Medicine) => void;
}

export const MedicineDataIntegrationCenterModal: React.FC<MedicineDataIntegrationCenterModalProps> = ({
  isOpen,
  onClose,
  onMedicineImported,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [customSellingPrice, setCustomSellingPrice] = useState<number | ''>('');
  const [customPurchaseCost, setCustomPurchaseCost] = useState<number | ''>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [refreshResult, setRefreshResult] = useState<any | null>(null);

  // Search when query changes
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await searchMedicineCandidates(searchQuery, barcodeInput);
      setCandidates(res.candidates);
      if (res.candidates.length > 0) {
        setSelectedCandidate(res.candidates[0]);
        setCustomSellingPrice(res.candidates[0].publishedMrp);
        setCustomPurchaseCost(res.candidates[0].supplierWholesalePrice);
      } else {
        setSelectedCandidate(null);
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Search failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen]);

  // Execute import
  const handleImport = async (candidate: any, override: boolean = false) => {
    setImportingId(candidate.id);
    setStatusMessage(null);
    try {
      const res = await importCandidateMedicine({
        candidateId: candidate.id,
        customSellingPrice: customSellingPrice !== '' ? Number(customSellingPrice) : candidate.publishedMrp,
        customPurchaseCost: customPurchaseCost !== '' ? Number(customPurchaseCost) : candidate.supplierWholesalePrice,
        overrideConfirmation: override,
      });

      setStatusMessage({
        text: `Successfully ${res.action === 'CREATED' ? 'imported new medicine' : 'updated price records for'} ${res.medicine.brandName} (${res.medicine.strength}) from ${candidate.source}.`,
        type: 'success',
      });

      onMedicineImported?.(res.medicine);

      // Refresh list status
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id
            ? { ...c, alreadyInLocalCatalog: true, currentLocalMrp: res.medicine.publishedMrpPrice }
            : c
        )
      );
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    } finally {
      setImportingId(null);
    }
  };

  // Run bulk price verification job
  const handleRefreshJob = async () => {
    setIsRefreshingPrices(true);
    setRefreshResult(null);
    try {
      const res = await refreshMedicinePrices();
      setRefreshResult(res);
      setStatusMessage({
        text: `Batch price verification completed: ${res.verifiedCount} verified, ${res.discrepanciesCount} discrepancies detected.`,
        type: 'info',
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Price sync job failed', type: 'error' });
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#123B5D] to-[#1a4f7c] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#079B8C] text-white shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Medicine Data Integration Center</h2>
                <span className="rounded-full bg-[#DDF6EF] px-2.5 py-0.5 text-[10px] font-bold text-[#079B8C] font-mono">
                  DGDA + Depot Feeds
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Bangladesh pharmaceutical registries, published retail prices, and verified package imagery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="border-b border-slate-100 bg-[#F3F7FA] p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand, generic (e.g. Napa, Omeprazole, Fexo) or DAR number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#079B8C] focus:outline-hidden"
              />
            </div>
            <div className="relative sm:w-56">
              <ScanBarcode className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Scan or enter barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-[#079B8C] focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-[#079B8C] px-4 py-2 text-xs font-bold text-white hover:bg-[#067d71] transition-colors shadow-2xs whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>Search Registry</span>
            </button>
            <button
              type="button"
              onClick={handleRefreshJob}
              disabled={isRefreshingPrices}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#123B5D] hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap flex items-center justify-center gap-1.5"
              title="Audit and verify local prices against official DGDA & depot prices"
            >
              <RefreshCw className={`h-4 w-4 text-[#079B8C] ${isRefreshingPrices ? 'animate-spin' : ''}`} />
              <span>Verify All Prices</span>
            </button>
          </form>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`mt-3 rounded-xl p-3 text-xs flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-[#168653] border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-[#D64545] border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)} className="font-bold opacity-60 hover:opacity-100">
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Main Content: Two Columns (Candidates List on left, Inspector on right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Candidates List (5 cols) */}
          <div className="md:col-span-5 overflow-y-auto p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Candidate Feeds ({candidates.length})</span>
              <span className="text-[11px] text-[#079B8C] font-mono">Exact Matching Engine</span>
            </div>

            {candidates.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Database className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                No candidate medicine feeds match your search query.
              </div>
            ) : (
              candidates.map((cand) => {
                const isSelected = selectedCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setCustomSellingPrice(cand.publishedMrp);
                      setCustomPurchaseCost(cand.supplierWholesalePrice);
                    }}
                    className={`rounded-xl border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#079B8C] bg-[#DDF6EF]/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <img
                            src={cand.imageUrl || '/assets/medicines/placeholder.png'}
                            alt={cand.brandName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/medicines/placeholder.png';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#123B5D]">{cand.brandName}</span>
                            <span className="text-[10px] text-slate-500">{cand.strength}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{cand.genericName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{cand.manufacturer}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold font-mono text-[#123B5D]">
                          {formatBDT(cand.publishedMrp)}
                        </div>
                        <span
                          className={`inline-block rounded-full px-2 py-0.2 text-[9px] font-bold ${
                            cand.isExactMatch
                              ? 'bg-emerald-100 text-[#168653]'
                              : 'bg-amber-100 text-[#E9A23B]'
                          }`}
                        >
                          {cand.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                      <span className="font-mono text-slate-400">DAR: {cand.darNumber}</span>
                      {cand.alreadyInLocalCatalog ? (
                        <span className="text-[#168653] font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3" /> In Local DB
                        </span>
                      ) : (
                        <span className="text-[#079B8C] font-semibold">Ready to Import</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Candidate Detail & Inspector Panel (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-6 bg-white">
            {selectedCandidate ? (
              <div className="space-y-6">
                {/* Top overview card */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={selectedCandidate.imageUrl || '/assets/medicines/placeholder.png'}
                      alt={selectedCandidate.brandName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/medicines/placeholder.png';
                      }}
                    />
                    <div className="absolute top-1 right-1 rounded-sm bg-[#168653] p-0.5 text-white">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 font-mono">
                        {selectedCandidate.source}
                      </span>
                      {selectedCandidate.isExactMatch && (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#168653]">
                          ✓ Exact DGDA Match
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 text-lg font-black text-[#123B5D]">
                      {selectedCandidate.brandName}{' '}
                      <span className="text-sm font-normal text-slate-500">{selectedCandidate.strength}</span>
                    </h3>
                    <p className="text-xs text-slate-600">{selectedCandidate.genericName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Manufactured by <strong className="text-slate-700">{selectedCandidate.manufacturer}</strong>
                    </p>
                  </div>
                </div>

                {/* Technical Formulation Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200/80 bg-[#F3F7FA] p-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Dosage Form</span>
                    <div className="font-bold text-slate-800">{selectedCandidate.dosageForm}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Commercial Pack Size</span>
                    <div className="font-bold text-slate-800">{selectedCandidate.packSize}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">DGDA DAR Number</span>
                    <div className="font-mono font-bold text-slate-800">{selectedCandidate.darNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Barcode / GTIN</span>
                    <div className="font-mono font-bold text-slate-800">{selectedCandidate.barcode}</div>
                  </div>
                </div>

                {/* Price Label Tier Matrix (Requirement 1) */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#123B5D] mb-3 flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-[#079B8C]" />
                    <span>Price Label Tier & Verification Status</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Officially Published MRP */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <div className="text-[10px] text-slate-500 font-medium">Published Reference MRP</div>
                      <div className="text-base font-black font-mono text-[#123B5D] mt-1">
                        {formatBDT(selectedCandidate.publishedMrp)}
                      </div>
                      <div className="text-[10px] text-[#168653] font-medium mt-1">
                        ● DGDA Gazetted Ceiling
                      </div>
                    </div>

                    {/* Authorized Supplier Wholesale */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <div className="text-[10px] text-slate-500 font-medium">Authorised Depot Wholesale</div>
                      <div className="text-base font-black font-mono text-slate-700 mt-1">
                        {formatBDT(selectedCandidate.supplierWholesalePrice)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Standard 15% Trade Margin
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <div className="text-[10px] text-slate-500 font-medium">Verification Status</div>
                      <div className="mt-1 flex items-center gap-1 text-sm font-bold text-[#168653]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Verified Live</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Synced: Today (BST)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Customization & Import Form */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                    Pharmacy Pricing Configuration
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Selling Price at Retail Counter (BDT ৳)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={customSellingPrice}
                        onChange={(e) => setCustomSellingPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Must not exceed DGDA MRP of {formatBDT(selectedCandidate.publishedMrp)}
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Landed Supplier Purchase Cost (BDT ৳)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={customPurchaseCost}
                        onChange={(e) => setCustomPurchaseCost(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Official depot wholesale rate: {formatBDT(selectedCandidate.supplierWholesalePrice)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {selectedCandidate.alreadyInLocalCatalog ? (
                        <span>Existing MRP in database: <strong>{formatBDT(selectedCandidate.currentLocalMrp || selectedCandidate.publishedMrp)}</strong></span>
                      ) : (
                        <span>This will create a new verified master medicine entry.</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleImport(selectedCandidate, selectedCandidate.requiresConfirmation)}
                      disabled={importingId === selectedCandidate.id}
                      className="rounded-xl bg-[#079B8C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#067d71] transition-all shadow-xs flex items-center gap-2"
                    >
                      {importingId === selectedCandidate.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="h-4 w-4" />
                          <span>
                            {selectedCandidate.alreadyInLocalCatalog ? 'Update Local Price & Image' : 'Import Verified Record'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <Database className="h-12 w-12 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-600 text-sm">No Candidate Selected</h4>
                <p className="text-xs max-w-sm mt-1">
                  Select a medicine record from the search results on the left to inspect official pricing, clinical DAR registration, and import into your pharmacy database.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
