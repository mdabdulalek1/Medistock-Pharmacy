/**
 * MediStock Pharmacy - Enterprise Fine-Grained RBAC & Permission System
 * Resource/Action pairs, 16 Configurable Role Templates, Scope Isolation & Separation of Duties.
 */

import { User, UserRole } from './pharmacy';

// Fine-grained permission strings in 'resource.action' notation
export type PermissionString =
  // Sales & POS
  | 'sales.view'
  | 'sales.create'
  | 'sales.discount'
  | 'sales.discount.unlimited'
  | 'sales.refund.request'
  | 'sales.refund.approve'
  | 'sales.export'
  | 'shifts.view'
  | 'shifts.open'
  | 'shifts.close'
  | 'shifts.review'
  
  // Inventory & Stock
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.receive'
  | 'inventory.adjust.request'
  | 'inventory.adjust.approve'
  | 'inventory.transfer.request'
  | 'inventory.transfer.approve'
  | 'inventory.export'
  
  // Medicines & Pricing
  | 'medicines.view'
  | 'medicines.create'
  | 'medicines.edit'
  | 'medicines.price.view'
  | 'medicines.price.edit'
  | 'medicines.photo.verify'
  
  // Clinical & Prescriptions
  | 'prescriptions.view'
  | 'prescriptions.verify'
  
  // Online Orders & Dispatch Logistics
  | 'orders.view'
  | 'orders.pack'
  | 'orders.dispatch'
  | 'orders.deliver'
  | 'orders.cancel'
  | 'fleet.manage'
  
  // Purchasing & Suppliers
  | 'purchasing.view'
  | 'purchasing.create'
  | 'purchasing.approve'
  | 'suppliers.view'
  | 'suppliers.manage'
  
  // Finance, Accounts & Reports
  | 'finance.reports.view'
  | 'finance.dues.view'
  | 'finance.dues.settle'
  | 'finance.payables.view'
  | 'finance.expenses.view'
  | 'finance.expenses.create'
  | 'finance.reconcile'
  | 'finance.export'
  
  // Branch & Staff Administration
  | 'branches.view'
  | 'branches.manage'
  | 'users.view'
  | 'users.manage'
  | 'permissions.assign'
  | 'permissions.request'
  | 'permissions.approve'
  
  // Platform & Developer Operations
  | 'settings.view'
  | 'settings.manage'
  | 'audit.view'
  | 'audit.export'
  | 'platform.health.view'
  | 'platform.tenant.manage'
  | 'platform.backup.manage'
  | 'platform.support.manage'
  | 'platform.business_reset';

export interface PermissionDefinition {
  key: PermissionString;
  label: string;
  category: 'Sales & POS' | 'Inventory & Warehousing' | 'Medicines & Pricing' | 'Clinical & Rx' | 'Orders & Delivery' | 'Purchasing' | 'Finance & Reports' | 'Users & Branches' | 'Platform & Security';
  description: string;
  isSensitive: boolean; // Triggers UI warning and dual-authorization rules
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Sales & POS
  { key: 'sales.view', label: 'View Sales & Invoices', category: 'Sales & POS', description: 'Can view completed invoices and sales list', isSensitive: false },
  { key: 'sales.create', label: 'Create POS Sales', category: 'Sales & POS', description: 'Can operate POS billing terminal and tender sales', isSensitive: false },
  { key: 'sales.discount', label: 'Apply Routine Discount', category: 'Sales & POS', description: 'Can apply discount within personal threshold (e.g. 5%)', isSensitive: false },
  { key: 'sales.discount.unlimited', label: 'Approve Exceptional Discounts', category: 'Sales & POS', description: 'Can apply or authorize discounts exceeding branch limits', isSensitive: true },
  { key: 'sales.refund.request', label: 'Request Customer Refund', category: 'Sales & POS', description: 'Can initiate refund or exchange workflow', isSensitive: false },
  { key: 'sales.refund.approve', label: 'Approve Cash Refund', category: 'Sales & POS', description: 'Can disburse cash refunds and restock returns', isSensitive: true },
  { key: 'sales.export', label: 'Export Sales Ledgers', category: 'Sales & POS', description: 'Can download CSV/Excel transaction registers', isSensitive: true },
  { key: 'shifts.view', label: 'View Register Shifts', category: 'Sales & POS', description: 'Can view till shift summary and sales totals', isSensitive: false },
  { key: 'shifts.open', label: 'Open POS Till Shift', category: 'Sales & POS', description: 'Can declare opening cash float and start shift', isSensitive: false },
  { key: 'shifts.close', label: 'Close Cash Till Shift', category: 'Sales & POS', description: 'Can declare physical cash count and close shift', isSensitive: false },
  { key: 'shifts.review', label: 'Review & Audit Shifts', category: 'Sales & POS', description: 'Can approve shift cash variance and manager sign-off', isSensitive: true },

  // Inventory & Warehousing
  { key: 'inventory.view', label: 'View Batch Inventory', category: 'Inventory & Warehousing', description: 'Can view stock counts, batch numbers, and shelf locations', isSensitive: false },
  { key: 'inventory.create', label: 'Register New Stock Batch', category: 'Inventory & Warehousing', description: 'Can create new batch inventory entries', isSensitive: false },
  { key: 'inventory.receive', label: 'Receive Goods (GRN)', category: 'Inventory & Warehousing', description: 'Can receive supplier shipments and verify physical quantities', isSensitive: false },
  { key: 'inventory.adjust.request', label: 'Request Stock Adjustment', category: 'Inventory & Warehousing', description: 'Can request stock write-off for damaged or expired items', isSensitive: false },
  { key: 'inventory.adjust.approve', label: 'Approve Stock Write-Off', category: 'Inventory & Warehousing', description: 'Can authorize inventory reduction and disposal write-down', isSensitive: true },
  { key: 'inventory.transfer.request', label: 'Request Inter-Branch Transfer', category: 'Inventory & Warehousing', description: 'Can request stock movement to another branch', isSensitive: false },
  { key: 'inventory.transfer.approve', label: 'Authorize Branch Transfer', category: 'Inventory & Warehousing', description: 'Can approve and dispatch inter-branch transfers', isSensitive: true },
  { key: 'inventory.export', label: 'Export Stock Valuation', category: 'Inventory & Warehousing', description: 'Can export stock valuation and FEFO audit sheets', isSensitive: true },

  // Medicines & Pricing
  { key: 'medicines.view', label: 'View Medicine Catalog', category: 'Medicines & Pricing', description: 'Can search drugs, generics, strengths, and dosages', isSensitive: false },
  { key: 'medicines.create', label: 'Register New Drug Profile', category: 'Medicines & Pricing', description: 'Can register new medicines in system catalogue', isSensitive: true },
  { key: 'medicines.edit', label: 'Edit Drug Metadata', category: 'Medicines & Pricing', description: 'Can modify generic, dosage form, manufacturer, and barcode', isSensitive: false },
  { key: 'medicines.price.view', label: 'View Wholesale Purchase Prices', category: 'Medicines & Pricing', description: 'Can view supplier purchase costs and landing rates', isSensitive: true },
  { key: 'medicines.price.edit', label: 'Modify Retail Selling Prices', category: 'Medicines & Pricing', description: 'Can update MRP and branch retail pricing', isSensitive: true },
  { key: 'medicines.photo.verify', label: 'Verify Packaging Photos', category: 'Medicines & Pricing', description: 'Can certify packaging images for DGDA compliance', isSensitive: false },

  // Clinical & Prescriptions
  { key: 'prescriptions.view', label: 'View Uploaded Prescriptions', category: 'Clinical & Rx', description: 'Can view doctor prescription slips submitted by customers', isSensitive: false },
  { key: 'prescriptions.verify', label: 'Pharmacist Rx Verification', category: 'Clinical & Rx', description: 'Can audit and digitally sign prescription verification for dispatch', isSensitive: true },

  // Orders & Fleet
  { key: 'orders.view', label: 'View Online Orders', category: 'Orders & Delivery', description: 'Can view online orders and delivery tracker', isSensitive: false },
  { key: 'orders.pack', label: 'Pack & Seal Orders', category: 'Orders & Delivery', description: 'Can pack items, verify cold chain, and affix tamper-evident seals', isSensitive: false },
  { key: 'orders.dispatch', label: 'Dispatch to Delivery Fleet', category: 'Orders & Delivery', description: 'Can assign riders and dispatch parcels for delivery', isSensitive: false },
  { key: 'orders.deliver', label: 'Update Delivery & Proof', category: 'Orders & Delivery', description: 'Can record proof of delivery, COD receipt, or failed delivery return', isSensitive: false },
  { key: 'orders.cancel', label: 'Cancel Online Order', category: 'Orders & Delivery', description: 'Can cancel customer orders and restock reserved medicines', isSensitive: false },
  { key: 'fleet.manage', label: 'Coordinate Delivery Fleet', category: 'Orders & Delivery', description: 'Can optimize delivery routes, assign riders, and monitor delivery KPIs', isSensitive: false },

  // Purchasing & Suppliers
  { key: 'purchasing.view', label: 'View Purchase Orders', category: 'Purchasing', description: 'Can view procurement orders and supplier price lists', isSensitive: false },
  { key: 'purchasing.create', label: 'Create Purchase Orders', category: 'Purchasing', description: 'Can draft PO requisitions for authorized pharmaceutical vendors', isSensitive: false },
  { key: 'purchasing.approve', label: 'Authorize Capital POs', category: 'Purchasing', description: 'Can authorize POs exceeding ৳ 50,000 threshold', isSensitive: true },
  { key: 'suppliers.view', label: 'View Supplier Directory', category: 'Purchasing', description: 'Can view vendor contact details, DGDA license, and terms', isSensitive: false },
  { key: 'suppliers.manage', label: 'Manage Supplier Accounts', category: 'Purchasing', description: 'Can register, modify, and adjust supplier accounts', isSensitive: true },

  // Finance & Reports
  { key: 'finance.reports.view', label: 'View Financial P&L Reports', category: 'Finance & Reports', description: 'Can inspect gross margins, net profit, and expense ratios', isSensitive: true },
  { key: 'finance.dues.view', label: 'View Customer Credit Dues', category: 'Finance & Reports', description: 'Can view customer credit ledgers and outstanding balances', isSensitive: false },
  { key: 'finance.dues.settle', label: 'Settle Customer Dues', category: 'Finance & Reports', description: 'Can collect and credit customer due payments', isSensitive: false },
  { key: 'finance.payables.view', label: 'View Supplier Payables', category: 'Finance & Reports', description: 'Can review vendor accounts payable and credit terms', isSensitive: true },
  { key: 'finance.expenses.view', label: 'View Operating Expenses', category: 'Finance & Reports', description: 'Can view branch rent, utility, and payroll disbursements', isSensitive: true },
  { key: 'finance.expenses.create', label: 'Record Operating Expense', category: 'Finance & Reports', description: 'Can record new expense voucher with receipt attachment', isSensitive: false },
  { key: 'finance.reconcile', label: 'Reconcile Bank & MFS Gateways', category: 'Finance & Reports', description: 'Can reconcile bKash, Nagad, and POS card settlements', isSensitive: true },
  { key: 'finance.export', label: 'Export Tax & Accounting Ledgers', category: 'Finance & Reports', description: 'Can download Mushak 6.3 summary and financial records', isSensitive: true },

  // Users & Branches
  { key: 'branches.view', label: 'View Branch Directory', category: 'Users & Branches', description: 'Can view branch addresses, drug licenses, and contacts', isSensitive: false },
  { key: 'branches.manage', label: 'Manage Branch Network', category: 'Users & Branches', description: 'Can create branches, configure POS tills, and LAN IPs', isSensitive: true },
  { key: 'users.view', label: 'View Staff Directory', category: 'Users & Branches', description: 'Can view employee rosters, contact info, and assigned branch', isSensitive: false },
  { key: 'users.manage', label: 'Manage Staff Profiles', category: 'Users & Branches', description: 'Can create staff, update roles, and manage employment status', isSensitive: true },
  { key: 'permissions.assign', label: 'Assign Roles & Permissions', category: 'Users & Branches', description: 'Can grant or revoke explicit roles and permissions', isSensitive: true },
  { key: 'permissions.request', label: 'Request Elevated Access', category: 'Users & Branches', description: 'Can request temporary elevated privileges with reason', isSensitive: false },
  { key: 'permissions.approve', label: 'Approve Privilege Requests', category: 'Users & Branches', description: 'Can review, approve, or reject permission escalations', isSensitive: true },

  // Platform & Security
  { key: 'settings.view', label: 'View Store Settings', category: 'Platform & Security', description: 'Can view merchant gateway config and branch rules', isSensitive: false },
  { key: 'settings.manage', label: 'Modify Gateway & Business Rules', category: 'Platform & Security', description: 'Can update payment credentials and discount policy', isSensitive: true },
  { key: 'audit.view', label: 'View System Audit Logs', category: 'Platform & Security', description: 'Can inspect immutable platform audit records', isSensitive: true },
  { key: 'audit.export', label: 'Export Audit Evidence', category: 'Platform & Security', description: 'Can download compliance audit log files', isSensitive: true },
  { key: 'platform.health.view', label: 'View Platform Health', category: 'Platform & Security', description: 'Can inspect cloud sync latency, Firestore DB, and API status', isSensitive: false },
  { key: 'platform.tenant.manage', label: 'Manage Multi-Tenant Licensing', category: 'Platform & Security', description: 'Can provision and configure tenant businesses and licenses', isSensitive: true },
  { key: 'platform.backup.manage', label: 'Manage Backup Snapshots', category: 'Platform & Security', description: 'Can trigger and verify SHA256 pre-reset backup archives', isSensitive: true },
  { key: 'platform.support.manage', label: 'Execute Technical Support Ops', category: 'Platform & Security', description: 'Can perform approved diagnostic support actions', isSensitive: true },
  { key: 'platform.business_reset', label: 'Developer Business Reset', category: 'Platform & Security', description: 'Developer-only destructive purge with mutex lock and backup snapshot', isSensitive: true },
];

export interface RoleTemplate {
  id: UserRole;
  name: string;
  category: 'Platform' | 'Executive' | 'Management' | 'Clinical' | 'Operations' | 'Finance' | 'Logistics' | 'Public';
  description: string;
  defaultBranchScope: 'ALL' | 'ASSIGNED' | 'NONE';
  allowedNavigationTabs: string[];
  permissions: PermissionString[];
  canDelegate: boolean;
  delegationMaxLevel?: 'ALL' | 'BRANCH' | 'OPERATIONAL' | 'NONE';
}

// 16 Configurable Role Templates
export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  it_admin: {
    id: 'it_admin',
    name: 'Platform IT Administrator / Developer',
    category: 'Platform',
    description: 'Manages platform technical infrastructure, database integrity, tenant isolation, and developer resets under strict controls.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: ['dashboard', 'developer', 'tests', 'offline', 'audit'],
    permissions: [
      'platform.health.view',
      'platform.tenant.manage',
      'platform.backup.manage',
      'platform.support.manage',
      'platform.business_reset',
      'audit.view',
      'audit.export',
      'branches.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  owner: {
    id: 'owner',
    name: 'Business Owner',
    category: 'Executive',
    description: 'Complete operational and financial authority across all branches, business performance, staff permissions, and policy settings.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: [
      'dashboard', 'pos', 'shifts', 'returns', 'medicines', 'inventory',
      'branches', 'purchasing', 'transfers', 'approvals', 'orders',
      'reports', 'offline', 'employees', 'settings',
    ],
    permissions: ALL_PERMISSIONS.map((p) => p.key).filter((k) => k !== 'platform.business_reset'),
    canDelegate: true,
    delegationMaxLevel: 'ALL',
  },
  head_office_manager: {
    id: 'operations_manager',
    name: 'Head Office Manager',
    category: 'Executive',
    description: 'Central operations oversight across all network branches, supply chain coordination, and operational approvals.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: [
      'dashboard', 'medicines', 'inventory', 'branches', 'purchasing',
      'transfers', 'approvals', 'orders', 'reports', 'employees',
    ],
    permissions: [
      'sales.view', 'sales.export',
      'inventory.view', 'inventory.receive', 'inventory.adjust.approve', 'inventory.transfer.approve', 'inventory.export',
      'medicines.view', 'medicines.edit', 'medicines.price.view', 'medicines.price.edit',
      'prescriptions.view', 'prescriptions.verify',
      'orders.view', 'orders.pack', 'orders.dispatch', 'orders.cancel', 'fleet.manage',
      'purchasing.view', 'purchasing.create', 'purchasing.approve', 'suppliers.view', 'suppliers.manage',
      'finance.reports.view', 'finance.dues.view', 'finance.payables.view', 'finance.export',
      'branches.view', 'branches.manage', 'users.view', 'users.manage', 'permissions.request',
      'settings.view', 'audit.view',
    ],
    canDelegate: true,
    delegationMaxLevel: 'OPERATIONAL',
  },
  branch_manager: {
    id: 'branch_manager',
    name: 'Branch Manager',
    category: 'Management',
    description: 'Full supervisory authority over assigned branch: POS operations, shift close reviews, stock alerts, staff attendance, and local approvals.',
    defaultBranchScope: 'ASSIGNED',
    allowedNavigationTabs: ['dashboard', 'pos', 'shifts', 'returns', 'medicines', 'inventory', 'transfers', 'approvals', 'orders', 'reports', 'employees'],
    permissions: [
      'sales.view', 'sales.create', 'sales.discount', 'sales.discount.unlimited', 'sales.refund.request', 'sales.refund.approve',
      'shifts.view', 'shifts.open', 'shifts.close', 'shifts.review',
      'inventory.view', 'inventory.receive', 'inventory.adjust.request', 'inventory.adjust.approve', 'inventory.transfer.request', 'inventory.transfer.approve',
      'medicines.view', 'medicines.price.view', 'medicines.photo.verify',
      'prescriptions.view',
      'orders.view', 'orders.pack', 'orders.dispatch',
      'branches.view', 'users.view', 'users.manage', 'permissions.request',
      'finance.reports.view', 'finance.dues.view', 'finance.dues.settle',
    ],
    canDelegate: true,
    delegationMaxLevel: 'BRANCH',
  },
  pharmacist: {
    id: 'pharmacist',
    name: 'A-Grade Registered Pharmacist',
    category: 'Clinical',
    description: 'Clinical dispensing authority: prescription auditing, drug interaction checks, packaging photo verification, and patient drug advice.',
    defaultBranchScope: 'ASSIGNED',
    allowedNavigationTabs: ['dashboard', 'pos', 'returns', 'medicines', 'inventory', 'orders'],
    permissions: [
      'sales.view', 'sales.create', 'sales.discount', 'sales.refund.request',
      'shifts.view', 'shifts.open', 'shifts.close',
      'inventory.view', 'inventory.receive',
      'medicines.view', 'medicines.edit', 'medicines.price.view', 'medicines.photo.verify',
      'prescriptions.view', 'prescriptions.verify',
      'orders.view', 'orders.pack',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  cashier: {
    id: 'cashier',
    name: 'Cashier / POS Operator',
    category: 'Operations',
    description: 'Fast front-desk POS billing, barcode scanning, permitted discounts (up to 5%), receipt printing, and shift cash closing.',
    defaultBranchScope: 'ASSIGNED',
    allowedNavigationTabs: ['pos', 'shifts', 'returns'],
    permissions: [
      'sales.view', 'sales.create', 'sales.discount', 'sales.refund.request',
      'shifts.view', 'shifts.open', 'shifts.close',
      'medicines.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  inventory_staff: {
    id: 'inventory_manager',
    name: 'Inventory Staff / Stock Keeper',
    category: 'Operations',
    description: 'Stock receiving (GRN), shelf placement, batch & expiry monitoring, cycle counts, stock adjustment requests, and transfer packing.',
    defaultBranchScope: 'ASSIGNED',
    allowedNavigationTabs: ['dashboard', 'inventory', 'transfers', 'purchasing'],
    permissions: [
      'inventory.view', 'inventory.create', 'inventory.receive', 'inventory.adjust.request', 'inventory.transfer.request',
      'medicines.view', 'medicines.price.view',
      'purchasing.view', 'suppliers.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  purchasing_manager: {
    id: 'purchasing_manager',
    name: 'Purchasing & Procurement Manager',
    category: 'Management',
    description: 'Vendor relationship management, supplier price list negotiation, purchase order drafting, and landed cost analytics.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: ['dashboard', 'purchasing', 'inventory', 'medicines', 'reports'],
    permissions: [
      'purchasing.view', 'purchasing.create', 'purchasing.approve',
      'suppliers.view', 'suppliers.manage',
      'inventory.view', 'medicines.view', 'medicines.price.view', 'medicines.price.edit',
      'finance.payables.view', 'finance.reports.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  accountant: {
    id: 'accountant',
    name: 'Head Office Accountant',
    category: 'Finance',
    description: 'Financial accounting, sales ledger summaries, customer dues tracking, supplier payables, operating expenses, and tax/VAT reporting.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: ['dashboard', 'reports', 'shifts', 'returns', 'purchasing'],
    permissions: [
      'sales.view', 'sales.export',
      'shifts.view', 'shifts.review',
      'finance.reports.view', 'finance.dues.view', 'finance.dues.settle', 'finance.payables.view', 'finance.expenses.view', 'finance.expenses.create', 'finance.reconcile', 'finance.export',
      'purchasing.view', 'suppliers.view', 'inventory.view', 'inventory.export',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  order_packer: {
    id: 'fulfillment_staff',
    name: 'Online Order Packer',
    category: 'Logistics',
    description: 'Order fulfillment workstation: pack list checking, batch selection, cold-chain ice pack verification, and seal labeling.',
    defaultBranchScope: 'ASSIGNED',
    allowedNavigationTabs: ['orders', 'inventory'],
    permissions: [
      'orders.view', 'orders.pack',
      'inventory.view',
      'medicines.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  delivery_coordinator: {
    id: 'delivery_coordinator' as any,
    name: 'Delivery Coordinator / Dispatcher',
    category: 'Logistics',
    description: 'Courier route dispatching, rider assignment, delivery SLA tracking, and cash-on-delivery reconciliation.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: ['orders', 'dashboard'],
    permissions: [
      'orders.view', 'orders.dispatch', 'orders.cancel', 'fleet.manage',
      'finance.dues.view', 'finance.dues.settle',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  delivery_rider: {
    id: 'delivery_worker',
    name: 'Delivery Rider',
    category: 'Logistics',
    description: 'Dedicated mobile delivery view: assigned orders, navigation directions, customer phone contact, proof of delivery, and cash collection.',
    defaultBranchScope: 'ASSIGNED',
    allowedNavigationTabs: ['deliveries'],
    permissions: [
      'orders.view', 'orders.deliver',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  customer_support: {
    id: 'customer_support',
    name: 'Customer Support Representative',
    category: 'Operations',
    description: 'Customer inquiry resolution, order status checking, delivery tracking assistance, and prescription callback ticketing.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: ['orders', 'medicines'],
    permissions: [
      'orders.view', 'medicines.view', 'prescriptions.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  auditor: {
    id: 'auditor',
    name: 'Internal / Statutory Auditor',
    category: 'Executive',
    description: 'Read-only independent audit oversight: immutable system audit trails, inventory adjustments, price change histories, and P&L checks.',
    defaultBranchScope: 'ALL',
    allowedNavigationTabs: ['dashboard', 'reports', 'inventory', 'shifts', 'transfers', 'audit'],
    permissions: [
      'sales.view', 'sales.export',
      'inventory.view', 'inventory.export',
      'medicines.view', 'medicines.price.view',
      'finance.reports.view', 'finance.export',
      'audit.view', 'audit.export',
      'branches.view', 'users.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  general_staff: {
    id: 'general_staff' as any,
    name: 'General Staff / Shop Official',
    category: 'Operations',
    description: 'General shop floor assistance: medicine directory lookup, customer navigation, and shelf restocking assistance.',
    defaultBranchScope: 'ASSIGNED',
    allowedNavigationTabs: ['medicines'],
    permissions: [
      'medicines.view',
    ],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
  customer: {
    id: 'customer',
    name: 'Online Pharmacy Customer',
    category: 'Public',
    description: 'Customer-facing mobile pharmacy app: browsing certified medications, uploading prescriptions, checkout, and tracking deliveries.',
    defaultBranchScope: 'NONE',
    allowedNavigationTabs: ['storefront'],
    permissions: [],
    canDelegate: false,
    delegationMaxLevel: 'NONE',
  },
};

/**
 * Resolves all effective permissions for a user based on their primary role,
 * any additional secondary roles, explicit grants, explicit denies, and temporary expiry.
 */
export function calculateEffectivePermissions(user: User): Set<PermissionString> {
  // If user is inactive or session revoked, return empty set
  if (!user.active) return new Set();

  // Check temporary access expiration
  const isTemporaryExpired =
    user.temporaryAccessExpiry && new Date(user.temporaryAccessExpiry).getTime() < Date.now();

  const permissions = new Set<PermissionString>();

  // 1. Accumulate permissions from primary role template
  const primaryTemplate = ROLE_TEMPLATES[user.role];
  if (primaryTemplate) {
    primaryTemplate.permissions.forEach((p) => permissions.add(p));
  }

  // 2. Accumulate permissions from any assigned secondary roles
  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach((r) => {
      const template = ROLE_TEMPLATES[r];
      if (template) {
        template.permissions.forEach((p) => permissions.add(p));
      }
    });
  }

  // 3. Add explicit grants (only if temporary access has not expired)
  if (user.explicitGrants && !isTemporaryExpired) {
    user.explicitGrants.forEach((p) => permissions.add(p as PermissionString));
  }

  // 4. Subtract explicit denies (Denies take strict precedence!)
  if (user.explicitDenies) {
    user.explicitDenies.forEach((p) => permissions.delete(p as PermissionString));
  }

  return permissions;
}

/**
 * Validates if a user has a specific permission under optional branch/record context.
 */
export function hasPermission(
  user: User,
  permission: PermissionString,
  context?: {
    branchId?: string | null;
    customerId?: string;
    orderRiderId?: string;
  }
): boolean {
  if (!user || !user.active) return false;

  // Platform IT Admin bypass only for platform permissions; normal pharmacy business records require normal permissions
  if (user.role === 'it_admin' && !permission.startsWith('platform.') && permission !== 'audit.view' && permission !== 'audit.export') {
    return false; // Prevents IT admin from bypassing ordinary business separation without approval
  }

  const effective = calculateEffectivePermissions(user);
  if (!effective.has(permission)) {
    return false;
  }

  // Check branch scope isolation
  if (context?.branchId && user.role !== 'owner' && user.role !== 'it_admin' && user.role !== 'operations_manager' && user.role !== 'accountant') {
    // If user has branch scope restricted to assigned
    if (user.branchId && user.branchId !== context.branchId) {
      // Check if branchId is in permittedBranches
      if (!user.permittedBranches || !user.permittedBranches.includes(context.branchId)) {
        return false;
      }
    }
  }

  // Check customer isolation
  if (user.role === 'customer' && context?.customerId && context.customerId !== user.id) {
    return false;
  }

  return true;
}

/**
 * Validates if an administrator can delegate a permission to another user.
 * Principle of Least Privilege: An admin cannot delegate permissions they do not possess!
 */
export function canDelegatePermission(
  adminUser: User,
  targetPermission: PermissionString
): { allowed: boolean; reason?: string } {
  if (adminUser.role === 'owner') {
    return { allowed: true };
  }

  const adminEffective = calculateEffectivePermissions(adminUser);
  if (!adminEffective.has('permissions.assign')) {
    return { allowed: false, reason: 'You lack permissions.assign authorization' };
  }

  // Delegation boundary: cannot grant what you do not hold
  if (!adminEffective.has(targetPermission)) {
    return {
      allowed: false,
      reason: `Delegation limit exceeded: You cannot delegate '${targetPermission}' because you do not hold this permission yourself.`,
    };
  }

  return { allowed: true };
}

// Permission Change Requisition Interface
export interface PermissionChangeRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userBranchName?: string;
  requestedPermission: PermissionString;
  permissionLabel: string;
  reason: string;
  requestedDurationHours?: number; // e.g. 24 hours temporary grant
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}
