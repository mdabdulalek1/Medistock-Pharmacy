import React from 'react';
import { User, Branch } from '../types/pharmacy';
import { ROLE_TEMPLATES } from '../types/rbac';
import {
  LayoutDashboard,
  CreditCard,
  Pill,
  Boxes,
  Building2,
  Truck,
  ArrowLeftRight,
  ClipboardCheck,
  BarChart3,
  Users,
  Settings,
  ShoppingBag,
  Clock,
  RotateCcw,
  CheckSquare,
  Wifi,
  Terminal,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  activeBranch: Branch | undefined;
  isStorefrontMode: boolean;
  onToggleStorefront: () => void;
  pendingOrdersCount?: number;
  expiringCount?: number;
  pendingApprovalsCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  activeBranch,
  isStorefrontMode,
  onToggleStorefront,
  pendingOrdersCount = 0,
  expiringCount = 0,
  pendingApprovalsCount = 0,
  isOpen = false,
  onClose,
}) => {
  const roleTemplate = ROLE_TEMPLATES[currentUser.role];
  const allowedTabs = roleTemplate?.allowedNavigationTabs || ['dashboard'];

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Billing', icon: CreditCard },
    { id: 'shifts', label: 'Tills & Shifts', icon: Clock },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'medicines', label: 'Medicine Catalogue', icon: Pill },
    { id: 'inventory', label: 'Batch Inventory', icon: Boxes, badge: expiringCount > 0 ? `${expiringCount} exp` : null },
    { id: 'branches', label: 'Branch Network', icon: Building2 },
    { id: 'purchasing', label: 'Suppliers & PO', icon: Truck },
    { id: 'transfers', label: 'Transfers & Ledger', icon: ArrowLeftRight },
    { id: 'approvals', label: 'Approvals Center', icon: CheckSquare, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} req` : null },
    { id: 'orders', label: 'Online Orders & Rx', icon: ClipboardCheck, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : null },
    { id: 'deliveries', label: 'My Deliveries', icon: Truck },
    { id: 'reports', label: 'Reports & P&L', icon: BarChart3 },
    { id: 'offline', label: 'Offline Multi-Till', icon: Wifi },
    { id: 'developer', label: 'Developer Control', icon: ShieldAlert, badge: 'IT DEV' },
    { id: 'tests', label: 'Automated Tests', icon: Terminal, badge: '50/50' },
    { id: 'employees', label: 'Staff & Roles', icon: Users },
    { id: 'settings', label: 'Gateway & Rules', icon: Settings },
  ];

  const navItems = allNavItems.filter((item) => {
    if (currentUser.role === 'owner') return true;
    if (currentUser.role === 'it_admin') return ['dashboard', 'developer', 'tests', 'offline', 'audit'].includes(item.id);
    if (currentUser.role === 'delivery_rider') return item.id === 'deliveries';
    return allowedTabs.includes(item.id) || (item.id === 'dashboard' && allowedTabs.length > 0);
  });

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto min-h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
      <div className="p-4 space-y-6">
        {/* Branch Context Indicator */}
        <div className="rounded-xl bg-[#F3F7FA] border border-[#123B5D]/10 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#079B8C]">
            Active Branch Scope
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-bold text-[#123B5D] truncate">
              {activeBranch ? activeBranch.name : 'All Branches (Consolidated)'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            BDT (৳) · Asia/Dhaka
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !isStorefrontMode && activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isStorefrontMode) onToggleStorefront();
                  onSelectTab(item.id);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#DDF6EF] text-[#079B8C] font-bold border-l-4 border-[#079B8C]'
                    : 'text-[#203246] hover:bg-[#F3F7FA] hover:text-[#123B5D]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#079B8C]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono text-[#E9A23B] font-bold bg-[#FEF8ED] px-1.5 py-0.5 rounded border border-[#E9A23B]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher: Customer Mobile App */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onToggleStorefront}
          className={`flex w-full items-center justify-between rounded-xl p-2.5 text-xs font-bold transition-all border ${
            isStorefrontMode
              ? 'border-[#123B5D] bg-[#123B5D] text-white shadow-xs'
              : 'border-[#079B8C]/30 bg-[#DDF6EF] hover:bg-[#c9f1e6] text-[#079B8C]'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#079B8C]" />
            <span>{isStorefrontMode ? 'Return to Management' : 'Customer Mobile App'}</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">
            {isStorefrontMode ? 'Exit' : 'BD View'}
          </span>
        </button>
        <div className="mt-2 text-center text-[10px] text-slate-400">
          MediStock Pharmacy v1.0 · DGDA Compliant
        </div>
      </div>
    </aside>
    </>
  );
};
