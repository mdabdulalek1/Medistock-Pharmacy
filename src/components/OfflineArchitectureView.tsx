import React, { useState } from 'react';
import { Branch, OfflineSyncQueueItem } from '../types/pharmacy';
import {
  Wifi,
  WifiOff,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  ArrowRight,
  ShieldAlert,
  Play,
  Clock,
  Radio,
} from 'lucide-react';

interface OfflineArchitectureViewProps {
  activeBranch: Branch | undefined;
}

export const OfflineArchitectureView: React.FC<OfflineArchitectureViewProps> = ({
  activeBranch,
}) => {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Initial outbox queue
  const [outboxItems, setOutboxItems] = useState<OfflineSyncQueueItem[]>([
    {
      id: 'outbox-001',
      idempotencyKey: 'idemp-dhk01-pos01-1729864200-a9f8',
      branchId: activeBranch ? activeBranch.id : 'br-dhk-01',
      tillNumber: 'Till-01',
      entityType: 'SALE',
      payload: {
        invoiceNumber: 'INV-2026-DHK-0099',
        customerName: 'Nasir Uddin',
        totalAmount: 485,
        paymentMethod: 'CASH',
        itemsCount: 3,
      },
      status: 'SYNCED',
      retries: 0,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      syncedAt: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
    },
    {
      id: 'outbox-002',
      idempotencyKey: 'idemp-dhk01-pos02-1729864800-3c12',
      branchId: activeBranch ? activeBranch.id : 'br-dhk-01',
      tillNumber: 'Till-02',
      entityType: 'SALE',
      payload: {
        invoiceNumber: 'INV-2026-DHK-0100',
        customerName: 'Sultana Parvin',
        totalAmount: 1250,
        paymentMethod: 'BKASH',
        itemsCount: 2,
      },
      status: 'SYNCED',
      retries: 0,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      syncedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    },
  ]);

  const handleSimulateOfflineSale = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const newIdempotencyKey = `idemp-${activeBranch ? activeBranch.code.toLowerCase() : 'dhk01'}-pos01-${Date.now()}-${randomId}`;
    
    const newItem: OfflineSyncQueueItem = {
      id: `outbox-${Date.now()}`,
      idempotencyKey: newIdempotencyKey,
      branchId: activeBranch ? activeBranch.id : 'br-dhk-01',
      tillNumber: 'Till-01 (Offline Mode)',
      entityType: 'SALE',
      payload: {
        invoiceNumber: `INV-OFFLINE-${Date.now().toString().slice(-4)}`,
        customerName: 'Walk-in Cash Customer',
        totalAmount: 320,
        paymentMethod: 'CASH',
        itemsCount: 1,
        note: 'Billed while fiber Internet link down; committed to Branch Local Server',
      },
      status: 'PENDING',
      retries: 0,
      createdAt: new Date().toISOString(),
    };

    setOutboxItems((prev) => [newItem, ...prev]);
    setSyncStatusMessage('Offline transaction committed to Branch Local Server queue. Awaiting cloud synchronization.');
  };

  const handleTriggerSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatusMessage(null);
      
      const pendingItems = outboxItems.filter((item) => item.status === 'PENDING');
      
      if (pendingItems.length === 0) {
        setSyncStatusMessage('All outbox queue items are already synchronized to Central Cloud.');
        setIsSyncing(false);
        return;
      }

      // Call backend outbox sync endpoint
      const res = await fetch('/api/sync/outbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pendingItems }),
      });

      if (!res.ok) {
        throw new Error('Synchronization error returned by central server');
      }

      const result = await res.json();

      // Mark all pending as SYNCED
      setOutboxItems((prev) =>
        prev.map((item) =>
          item.status === 'PENDING'
            ? { ...item, status: 'SYNCED', syncedAt: new Date().toISOString() }
            : item
        )
      );

      setSyncStatusMessage(
        `Successfully synchronized ${result.syncedCount || pendingItems.length} transactions to Central Cloud with zero duplicate deductions.`
      );
    } catch (err: any) {
      setSyncStatusMessage(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = outboxItems.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Offline Multi-Till Architecture & Edge Sync
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900 font-mono">
              <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
              Active Edge Node
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Decentralized LAN coordination preventing split-brain inventory conflicts across multi-till branches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isSimulatedOffline
                ? 'border-rose-300 bg-rose-50 text-rose-800'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="h-4 w-4 text-rose-600" />
                <span>Simulating: Internet DOWN</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 text-emerald-600" />
                <span>Simulate Uplink Disconnection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Edge Node Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Branch Local Coordinator</span>
            <Server className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 font-mono">
            {activeBranch ? activeBranch.localServerIp : '192.168.1.100:3001'}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>LAN Socket Authority Healthy (0.8ms)</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Uplink Cloud Status</span>
            {isSimulatedOffline ? (
              <WifiOff className="h-4 w-4 text-rose-500" />
            ) : (
              <Wifi className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 font-mono">
            {isSimulatedOffline ? 'DISCONNECTED' : 'CLOUD CONNECTED'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {isSimulatedOffline ? 'Operating on Edge Coordinator' : 'Direct Firestore & Cloud Sync OK'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Outbox Queue</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {pendingCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Transactions waiting for cloud stream
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Idempotency Guarantee</span>
            <ShieldAlert className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 font-mono">
            EXACTLY-ONCE
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            UUIDv4 tokens prevent duplicate stock deductions
          </div>
        </div>
      </div>

      {/* Architectural Explanation Banner */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-5">
        <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" />
          Why Browser IndexedDB Alone Fails for Retail Multi-Till Pharmacies
        </h3>
        <p className="mt-2 text-xs text-indigo-900 leading-relaxed">
          In busy Bangladesh pharmacy branches (such as Dhanmondi or Mirpur-10), there are 3 to 6 POS cash registers operating simultaneously.
          If each till only used browser IndexedDB during an Internet outage, <strong>Till 1</strong> and <strong>Till 2</strong> would have isolated, unsynchronized storage. If only 1 vial of Lantus Insulin remains in stock, both cashiers could sell it to two separate walk-in patients, creating an irrecoverable <em>negative stock discrepancy</em> and physical shortage upon customer receipt.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border border-indigo-200 shadow-2xs">
            <span className="font-semibold text-slate-900 text-xs block">1. Till POS Client (Browser)</span>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Generates client-side <code>idempotencyKey</code>. Sends POS sales to Branch Local Server over LAN with zero dependency on ISP fiber or 4G.
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-200 shadow-2xs">
            <span className="font-semibold text-slate-900 text-xs block">2. Branch Local Coordinator</span>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Lightweight Node/SQLite/Redis server on LAN (e.g. <code>192.168.1.100:3001</code>). Performs atomic branch locks so no two cashiers sell the same batch unit.
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-200 shadow-2xs">
            <span className="font-semibold text-slate-900 text-xs block">3. Upstream Cloud Sync</span>
            <span className="text-[11px] text-slate-600 mt-1 block">
              When Internet restores, the outbox worker pushes queued payloads to Cloud Firestore. Cloud deduplicates using the <code>idempotencyKey</code>.
            </span>
          </div>
        </div>
      </div>

      {/* Outbox Actions & Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Branch Outbox Synchronization Queue
            </h2>
            <span className="text-xs font-mono text-slate-500">
              ({outboxItems.length} records)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateOfflineSale}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Play className="h-3.5 w-3.5 text-amber-600" />
              <span>Simulate Offline Till Sale</span>
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Force Cloud Outbox Sync'}</span>
            </button>
          </div>
        </div>

        {syncStatusMessage && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between">
            <span>{syncStatusMessage}</span>
            <button
              onClick={() => setSyncStatusMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Idempotency Key</th>
                <th className="px-4 py-3">Till / Origin</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3">Payload Summary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Queued / Synced At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {outboxItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-[11px] text-slate-800 font-medium">
                      {item.idempotencyKey}
                    </div>
                    <div className="text-[10px] text-slate-400">UUIDv4 Client Nonce</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{item.tillNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                      {item.entityType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="text-slate-900 font-medium">
                      {item.payload.invoiceNumber || 'Transaction'} · {item.payload.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ৳{item.payload.totalAmount} · {item.payload.paymentMethod}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'SYNCED' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        SYNCED
                      </span>
                    ) : item.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        QUEUED (LOCAL)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 border border-rose-200">
                        <AlertCircle className="h-3 w-3" />
                        CONFLICT
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">
                    <div>Q: {new Date(item.createdAt).toLocaleTimeString()}</div>
                    {item.syncedAt && (
                      <div className="text-emerald-700">
                        S: {new Date(item.syncedAt).toLocaleTimeString()}
                      </div>
                    )}
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
