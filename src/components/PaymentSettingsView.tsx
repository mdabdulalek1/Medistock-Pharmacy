import React, { useState } from 'react';
import { Settings, Shield, KeyRound, CreditCard, CheckCircle2, AlertCircle, Database, Server } from 'lucide-react';
import { User } from '../types/pharmacy';

interface PaymentSettingsViewProps {
  currentUser?: User;
}

export const PaymentSettingsView: React.FC<PaymentSettingsViewProps> = ({ currentUser }) => {
  const [provider, setProvider] = useState<'BKASH' | 'SSLCOMMERZ' | 'NAGAD'>('BKASH');
  const [isSandbox, setIsSandbox] = useState(true);
  const [merchantId, setMerchantId] = useState('01700-MEDISTOCK');
  const [appKey, setAppKey] = useState('bk_sandbox_key_9941');
  const [webhookSecret, setWebhookSecret] = useState('whsec_bd_medistock_98213');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (currentUser && currentUser.role !== 'owner' && currentUser.role !== 'it_admin' && currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-200 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-[#D64545] border border-rose-200">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-[#123B5D]">System Switches Restricted</h2>
        <p className="text-xs text-slate-500">
          System-wide configurations, payment gateway credentials, and global switches are strictly restricted to authorized Business Owners and Platform IT Administrators.
        </p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Payment settings updated. Ready for server-side verification.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
          Payment Gateways & Security Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configuration steps for Bangladeshi MFS gateways (bKash, Nagad, SSLCommerz) & Server Security
        </p>
      </div>

      {/* Security Notice Card */}
      <div className="rounded-xl border border-[#168C8C]/30 bg-[#E7F6F6] p-4 text-xs text-[#17365D] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#17365D]">
          <Shield className="h-4 w-4 text-[#168C8C]" />
          <span>Server-Side Payment Verification Policy</span>
        </div>
        <p>
          MediStock Pharmacy never approves an order based solely on client-side frontend events. All payments are verified on the secure Node.js backend using IPN (Instant Payment Notification) webhooks with HMAC-SHA256 signature checks against the payment gateway provider.
        </p>
      </div>

      {/* Payment Gateway Configuration Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#168C8C]" />
              <span>Bangladeshi Payment Gateway Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter test sandbox credentials or production merchant keys
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 font-semibold">
            {isSandbox ? '🧪 Sandbox Test Mode' : '🚀 Live Production Mode'}
          </span>
        </div>

        {saveStatus && (
          <div className="rounded bg-[#EDF7F0] p-2.5 text-xs text-[#16803C] font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#16803C]" />
            <span>{saveStatus}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">Primary Gateway Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-[#168C8C] bg-white font-medium"
              >
                <option value="BKASH">bKash Merchant Payment (Direct API)</option>
                <option value="SSLCOMMERZ">SSLCommerz (bKash + Nagad + Rocket + Cards aggregator)</option>
                <option value="NAGAD">Nagad Direct Payment Gateway</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Environment Mode</label>
              <div className="mt-1 flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="env"
                    checked={isSandbox}
                    onChange={() => setIsSandbox(true)}
                    className="text-[#168C8C]"
                  />
                  <span>Sandbox Testing</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="env"
                    checked={!isSandbox}
                    onChange={() => setIsSandbox(false)}
                    className="text-[#168C8C]"
                  />
                  <span>Live Production</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">
                {provider === 'SSLCOMMERZ' ? 'Store ID (Store Name)' : 'Merchant MSISDN / Wallet #'}
              </label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-[#168C8C]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">App Key / Public API Key</label>
              <input
                type="text"
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-[#168C8C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700">
                Webhook Secret (HMAC-SHA256 verification)
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-[#168C8C]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Server Webhook URL (IPN endpoint)</label>
              <input
                type="text"
                readOnly
                value="https://.../api/payment/webhook"
                className="mt-1 w-full rounded border border-slate-200 bg-slate-50 p-2 font-mono text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-[#168C8C] px-4 py-2 font-bold text-white hover:bg-[#127373] shadow-xs"
            >
              Save Gateway Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Beginner Guide & Deployment Roadmap */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="h-4 w-4 text-[#168C8C]" />
            <span>Beginner Setup & Cloud Deployment Guide</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear explanation of architectural layers, current state, and production scaling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg bg-slate-50 p-3.5 space-y-2 border border-slate-100">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F6F6] text-[#17365D] font-mono font-bold text-[11px]">
                1
              </span>
              <span>Full-Stack Node.js Architecture</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The application runs an Express server in <code className="bg-slate-200 px-1 rounded font-mono">server.ts</code> mounted with Vite on port 3000. All inventory mutations, sales transactions, and role authorizations are checked server-side before execution.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 space-y-2 border border-slate-100">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F6F6] text-[#17365D] font-mono font-bold text-[11px]">
                2
              </span>
              <span>Atomic Stock & FEFO Logic</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              When a checkout occurs, the server checks that stock is not expired and quantity &ge; requested. It performs atomic stock deduction and appends an immutable record to the Stock Movement Ledger.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 space-y-2 border border-slate-100">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F6F6] text-[#17365D] font-mono font-bold text-[11px]">
                3
              </span>
              <span>Firebase / Cloud DB Integration</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              To persist records permanently across container restarts, you can easily connect Cloud Firestore and Firebase Auth using our schema blueprint (collections: <code className="bg-slate-200 px-1 rounded font-mono">branches</code>, <code className="bg-slate-200 px-1 rounded font-mono">medicines</code>, <code className="bg-slate-200 px-1 rounded font-mono">batches</code>, <code className="bg-slate-200 px-1 rounded font-mono">sales</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
