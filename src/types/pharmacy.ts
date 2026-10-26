/**
 * MediStock Pharmacy - Enterprise Data Models & Type System
 * Supports multi-branch retail network, multiple tills, shift accounting,
 * pack conversions, returns/refunds, approvals, and offline outbox sync.
 */

export type UserRole =
  | 'owner'
  | 'admin'
  | 'head_office_manager'
  | 'operations_manager'
  | 'general_staff'
  | 'branch_manager'
  | 'pharmacist'
  | 'cashier'
  | 'inventory_staff'
  | 'inventory_manager'
  | 'purchasing_manager'
  | 'accountant'
  | 'order_packer'
  | 'fulfillment_staff'
  | 'delivery_coordinator'
  | 'delivery_rider'
  | 'delivery_worker'
  | 'customer_support'
  | 'customer'
  | 'auditor'
  | 'it_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roles?: UserRole[]; // Supports secondary role assignments
  branchId: string | null; // null for Owner/HQ Operations with multi-branch authority
  branchName?: string;
  avatar?: string;
  active: boolean;
  registrationNumber?: string; // DGDA/PCB license or employee ID
  permittedBranches?: string[]; // Specific branch IDs user is allowed to access
  branchScope?: 'ALL' | 'ASSIGNED' | 'CUSTOM';
  maxDiscountPercent?: number; // e.g. 5% for cashier, 15% for branch manager, 100% for owner
  explicitGrants?: string[]; // Granular permissions granted directly to user
  explicitDenies?: string[]; // Explicit denials taking strict precedence
  temporaryAccessExpiry?: string; // ISO timestamp for time-limited elevation
  sessionRevokedAt?: string; // Revocation timestamp for session invalidation
  lastLoginAt?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  isHeadOffice?: boolean;
  address: string;
  thana: string;
  district: string;
  phone: string;
  email: string;
  managerId: string;
  managerName: string;
  active: boolean;
  drugLicenseNo: string;
  taxBinNumber: string;
  tillCount: number; // Configurable number of POS tills in branch
  activeTillIds?: string[];
  localServerIp?: string; // Branch local coordinator IP on LAN (e.g. 192.168.1.100)
  lastSyncTimestamp?: string;
}

export type MedicineCategory =
  | 'Analgesic & Antipyretic'
  | 'Antibiotic & Antimicrobial'
  | 'Gastrointestinal & Antacid'
  | 'Respiratory & Antihistamine'
  | 'Cardiovascular & Hypertension'
  | 'Antidiabetic & Endocrinology'
  | 'Vitamins & Minerals'
  | 'Dermatology & Topical'
  | 'Pediatric Care'
  | 'Ophthalmic & ENT'
  | 'Surgical & Healthcare Devices';

export type DosageForm =
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Suspension'
  | 'Injection'
  | 'Inhaler'
  | 'Eye Drops'
  | 'Ointment'
  | 'Sachet'
  | 'Suppository';

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  manufacturer: string;
  category: MedicineCategory;
  barcode: string;
  isPrescriptionRequired: boolean;
  requiresColdChain: boolean;
  onlineEligible: boolean;
  unit: string; // e.g. "Strip of 10 Tablets", "Box of 100", "Bottle 100ml"
  packUnitName: string; // e.g. "Strip", "Box", "Bottle"
  dispenseUnitName: string; // e.g. "Tablet", "Capsule", "Sachet", "ml"
  unitsPerPack: number; // e.g. 10 tablets per strip, or 100 tablets per box
  boxToStripRatio?: number; // e.g. 10 strips in 1 box
  description: string;
  darNumber?: string; // DGDA DAR registration number
  reorderLevel: number; // Minimum stock before auto-replenishment alert
  targetBufferStock: number;
  active: boolean;
  imageUrl?: string; // Primary high-resolution package/strip photo
  additionalImages?: string[]; // Optional extra blister/box photos
  imageVerified?: boolean; // Verified by registered pharmacist or authorized staff
  imageSource?: 'OFFICIAL_DEPOT' | 'MANUAL_STAFF_UPLOAD' | 'DGDA_REPOSITORY' | string;
  imageUploadedBy?: string;
  imageUploadedAt?: string;
  // Official Pricing & Integration Metadata
  publishedMrpPrice?: number; // Official DGDA-regulated Maximum Retail Price
  publishedPriceSource?: 'DGDA_OFFICIAL' | 'MANUFACTURER_GAZETTE' | 'DEPOT_PRICE_LIST' | 'MANUAL_IMPORT';
  priceVerificationStatus?: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'STALE' | 'DISCREPANCY';
  priceLastCheckedAt?: string;
  priceHistory?: PriceHistoryEntry[];
  supplierPurchaseCost?: number; // Standard wholesale purchase price
  pharmacySellingPrice?: number; // Configured selling price at retail counter
  maxAllowedDiscountPercent?: number; // Ceiling before requiring manager approval
}

export interface PriceHistoryEntry {
  id: string;
  date: string;
  oldPrice: number;
  newPrice: number;
  priceType: 'MRP' | 'SELLING_PRICE' | 'PURCHASE_COST';
  source: string;
  changedByUserName: string;
  verified: boolean;
  notes?: string;
}

export interface CandidateMedicineMatch {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  packSize: string;
  manufacturer: string;
  barcode: string;
  darNumber: string;
  publishedMrp: number;
  supplierWholesalePrice: number;
  source: 'DGDA_NATIONAL_REGISTRY' | 'AUTHORIZED_DEPOT_FEED' | 'MEDIDATA_BD' | 'CSV_IMPORT';
  matchScore: number; // 0 to 100 percentage
  isExactMatch: boolean; // Exact brand + strength + dosageForm + packSize + manufacturer
  imageUrl: string;
  lastUpdated: string;
  requiresConfirmation: boolean;
}

export interface BatchInventory {
  id: string;
  medicineId: string;
  branchId: string;
  batchNumber: string;
  manufacturingDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  purchaseCost: number; // Landed purchase cost per pack in BDT (৳)
  unitCost: number; // Cost per single dispense unit (purchaseCost / unitsPerPack)
  sellingPrice: number; // Retail selling price per pack in BDT (৳)
  unitSellingPrice: number; // Retail price per single tablet/unit
  mrpPrice: number; // DGDA-regulated Maximum Retail Price
  currentQuantity: number; // Count in packs or primary units
  reservedQuantity: number; // Allocated to online orders or cart locks
  quarantineQuantity: number; // Damaged, recalled, or returned pending inspection
  rackLocation: string; // e.g. "Shelf A-01", "Cold Chain Refrigerator 1"
  status: 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED' | 'RECALLED' | 'QUARANTINED';
}

export type StockMovementType =
  | 'PURCHASE_RECEIVE'
  | 'SALE_POS'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'ONLINE_RESERVED'
  | 'ONLINE_DISPATCH'
  | 'ONLINE_CANCEL_RETURN'
  | 'CUSTOMER_RETURN'
  | 'SUPPLIER_RETURN'
  | 'DAMAGE_DISPOSAL'
  | 'AUDIT_ADJUSTMENT';

export interface StockMovement {
  id: string;
  batchId: string;
  medicineId: string;
  medicineName: string;
  branchId: string;
  branchName: string;
  movementType: StockMovementType;
  quantityDelta: number; // positive or negative
  previousQuantity: number;
  newQuantity: number;
  referenceId: string; // e.g. INV-2026-DHK-0012, PO-2026-004, TRF-2026-008
  notes: string;
  costImpactBDT?: number;
  performedByUserId: string;
  performedByUserName: string;
  timestamp: string;
}

export interface TillShift {
  id: string;
  branchId: string;
  branchName: string;
  tillNumber: string; // e.g. "Till-01", "Till-02"
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number; // Starting cash float in BDT (৳)
  cashSales: number;
  mobileMfsSales: number; // bKash, Nagad
  cardSales: number;
  cashRefunds: number;
  cashIn: number; // Paid in (e.g. change top-up)
  cashOut: number; // Paid out (e.g. minor store expense)
  expectedCash: number; // openingFloat + cashSales - cashRefunds + cashIn - cashOut
  declaredCash?: number; // Physical cash counted by cashier at shift close
  variance?: number; // declaredCash - expectedCash (surplus or shortage)
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  approvedBy?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  dgdaLicense: string;
  paymentTermsDays: number;
  rating: number;
  balancePayableBDT: number; // Current accounts payable balance
  active: boolean;
}

export interface PurchaseOrderItem {
  medicineId: string;
  medicineName: string;
  strength: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  receivedAt?: string;
}

export interface SaleInvoiceItem {
  medicineId: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  subtotal: number;
  isPack?: boolean;
}

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'CARD' | 'SPLIT';

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  idempotencyKey?: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  branchBin: string;
  tillNumber: string;
  shiftId?: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: SaleInvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountPercentage?: number;
  discountApprovedBy?: string;
  vatAmount: number; // Mushak 6.3 VAT
  totalAmount: number;
  tenderedAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  prescriptionNumber?: string;
  doctorName?: string;
  status: 'PAID' | 'VOIDED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  refundedAmount?: number;
  createdAt: string;
  offlineCreated?: boolean;
}

export interface ReturnRefundItem {
  medicineId: string;
  brandName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: 'EXPIRED_CUSTOMER' | 'DAMAGED_PACK' | 'INCORRECT_DISPENSE' | 'CUSTOMER_CANCEL' | 'ADVERSE_EFFECT';
  conditionDecision: 'RESTOCK_INSPECTED' | 'QUARANTINE_HOLD' | 'DISPOSAL_DESTROY';
}

export interface ReturnRefund {
  id: string;
  returnNumber: string;
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  customerName: string;
  customerPhone: string;
  items: ReturnRefundItem[];
  totalRefundAmount: number;
  refundMethod: PaymentMethod;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  approvedBy?: string;
  notes: string;
  createdAt: string;
}

export interface InterBranchTransfer {
  id: string;
  transferNumber: string;
  sourceBranchId: string;
  sourceBranchName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  batchId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantityRequested: number;
  quantityDispatched?: number;
  quantityReceived?: number;
  status:
    | 'DRAFT'
    | 'REQUESTED'
    | 'APPROVED'
    | 'IN_TRANSIT'
    | 'RECEIVED'
    | 'DISCREPANCY'
    | 'CANCELLED';
  dispatchedAt?: string;
  dispatchedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
}

export type OnlineOrderStatus =
  | 'PENDING'
  | 'PRESCRIPTION_VERIFIED'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  thana: string;
  city: string;
  items: {
    medicineId: string;
    brandName: string;
    strength: string;
    dosageForm: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    isPrescriptionRequired: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'BKASH_ONLINE' | 'NAGAD_ONLINE' | 'SSLCOMMERZ';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentTrxId?: string;
  hasPrescriptionItems: boolean;
  prescriptionNote?: string;
  prescriptionVerifiedBy?: string;
  assignedBranchId: string;
  assignedBranchName: string;
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  status: OnlineOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingExpense {
  id: string;
  branchId: string;
  branchName: string;
  category: 'RENT' | 'UTILITIES' | 'SALARIES' | 'SUPPLIES' | 'MAINTENANCE' | 'DGDA_LICENSING' | 'LOGISTICS' | 'OTHER';
  amountBDT: number;
  description: string;
  paidTo: string;
  recordedByUserId: string;
  recordedByUserName: string;
  voucherNumber?: string;
  date: string;
}

export interface ApprovalRequest {
  id: string;
  type: 'DISCOUNT_LIMIT' | 'REFUND' | 'STOCK_ADJUSTMENT' | 'PURCHASE_ORDER' | 'INTER_BRANCH_TRANSFER';
  title: string;
  branchId: string;
  branchName: string;
  requestedByUserId: string;
  requestedByUserName: string;
  details: string;
  impactAmountBDT?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'LOW_STOCK' | 'EXPIRY_ALERT' | 'APPROVAL_REQUEST' | 'CASH_VARIANCE' | 'REORDER_SUGGESTION' | 'SYNC_STATUS';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  branchId?: string;
  referenceEntity?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  idempotencyKey: string;
  branchId: string;
  tillNumber: string;
  entityType: 'SALE' | 'SHIFT' | 'RETURN' | 'EXPENSE';
  payload: any;
  status: 'PENDING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  retries: number;
  errorMessage?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  branchId?: string;
  branchName?: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export interface DashboardMetrics {
  todaySalesBDT: number;
  monthSalesBDT: number;
  totalOrdersCount: number;
  estimatedGrossProfitBDT: number;
  grossMarginPercentage: number;
  totalStockValueBDT: number;
  lowStockItemsCount: number;
  expiringIn30DaysCount: number;
  expiringIn90DaysCount: number;
  pendingOnlineOrdersCount: number;
  pendingApprovalsCount: number;
  activeBranchesCount: number;
  openShiftsCount: number;
  branchPerformance: {
    branchId: string;
    branchName: string;
    todaySalesBDT: number;
    monthSalesBDT: number;
    stockValuationBDT: number;
    batchCount: number;
    activeTills: number;
  }[];
}

export interface Business {
  id: string; // e.g. 'biz-medistock-main', 'biz-apex-pharma'
  name: string; // e.g. 'MediStock Pharmacy Network Bangladesh'
  identifierCode: string; // e.g. 'MS-BD-01'
  tradeLicenseNo: string;
  taxBinNumber: string;
  drugLicenseNo: string;
  headOfficeAddress: string;
  phone: string;
  email: string;
  subscriptionPlan: 'ENTERPRISE_MULTI_BRANCH' | 'PRO' | 'STARTER' | string;
  licenseStatus?: 'ACTIVE' | 'TRIAL' | 'RENEWAL_DUE' | 'SUSPENDED' | string;
  licenseExpiryDate?: string;
  active: boolean;
  createdAt: string;
  branchIds: string[];
}

export interface BusinessBackupArchive {
  backupId: string;
  businessId: string;
  businessName: string;
  createdAt: string;
  createdByUserId: string;
  createdByUserRole: string;
  reason: string;
  checksum: string;
  verified: boolean;
  recordCounts: {
    branches: number;
    batches: number;
    salesInvoices: number;
    tillShifts: number;
    onlineOrders: number;
    stockMovements: number;
    expenses: number;
    returns: number;
    suppliers: number;
  };
  snapshotData: {
    batches: BatchInventory[];
    salesInvoices: SaleInvoice[];
    shifts: TillShift[];
    onlineOrders: OnlineOrder[];
    stockMovements: StockMovement[];
    expenses: OperatingExpense[];
    returns: ReturnRefund[];
    suppliers: Supplier[];
  };
}

export interface BusinessResetRequest {
  businessId: string;
  developerSecurityKey: string;
  confirmationPhrase: string;
  reason: string;
  zeroOpeningBalances?: boolean;
  preserveMasterCatalog?: boolean;
}

export interface BusinessResetResponse {
  success: boolean;
  businessId: string;
  businessName: string;
  backupId: string;
  recordsPurged: {
    batchesCount: number;
    salesInvoicesCount: number;
    shiftsClosedCount: number;
    onlineOrdersCount: number;
    stockMovementsCount: number;
    expensesCount: number;
    returnsCount: number;
  };
  zeroBalancesInitialized: {
    openingCashBDT: number;
    salesTotalBDT: number;
    customerBalancesBDT: number;
    stockQuantity: number;
    inventoryValuationBDT: number;
  };
  preservedRecords: {
    platformAdminAccounts: number;
    branchesCount: number;
    masterMedicinesCount: number;
    otherBusinessesCount: number;
  };
  auditLogId: string;
  message: string;
}

// Bangladesh Cascading Address Hierarchy
export interface BangladeshDivision {
  id: string;
  nameEn: string;
  nameBn: string;
}

export interface BangladeshDistrict {
  id: string;
  divisionId: string;
  nameEn: string;
  nameBn: string;
}

export interface BangladeshThana {
  id: string;
  districtId: string;
  nameEn: string;
  nameBn: string;
  postalCode: string;
  deliveryCoverage: 'FULL_COVERAGE' | 'SUBURB_COVERAGE' | 'COURIER_ONLY';
  standardDeliveryFeeBDT: number;
}

export interface SavedDeliveryAddress {
  id: string;
  userId: string;
  label: 'Home' | 'Work' | 'Other';
  recipientName: string;
  recipientPhone: string;
  divisionId: string;
  divisionName: string;
  districtId: string;
  districtName: string;
  thanaId: string;
  thanaName: string;
  postalCode: string;
  addressLine: string; // House, Road, Flat, Landmark
  isDefault: boolean;
  deliveryInstructions?: string;
}

// Official Payment Gateway Server-Side Verification Types
export type PaymentGatewayType = 'CASH' | 'BKASH_MERCHANT' | 'NAGAD_MERCHANT' | 'CARD_POS' | 'SSLCOMMERZ' | 'CUSTOMER_CREDIT';

export interface PaymentVerificationResult {
  verified: boolean;
  gateway: PaymentGatewayType;
  transactionId: string;
  amountBDT: number;
  currency: 'BDT';
  payerAccount?: string;
  merchantInvoiceNumber: string;
  gatewayStatusCode: string;
  gatewayMessage: string;
  verificationTimestamp: string;
  isSandbox: boolean;
  idempotentAcknowledged: boolean;
}

// Professional Printable Document Types
export type PrintableDocumentType =
  | 'POS_RECEIPT'
  | 'TAX_INVOICE'
  | 'PAYMENT_RECEIPT'
  | 'REFUND_SLIP'
  | 'PURCHASE_ORDER'
  | 'TRANSFER_NOTE'
  | 'DELIVERY_SLIP'
  | 'DUE_STATEMENT';

export interface CustomerDueStatement {
  customerId: string;
  customerName: string;
  customerPhone: string;
  creditLimitBDT: number;
  currentBalanceDueBDT: number;
  lastPaymentDate?: string;
  invoices: {
    invoiceId: string;
    invoiceNumber: string;
    date: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
  }[];
}

// Granular RBAC Permissions
export type UserPermission =
  | 'view_dashboard'
  | 'pos_billing'
  | 'apply_discounts'
  | 'approve_exceptional_discounts'
  | 'view_inventory'
  | 'edit_inventory'
  | 'receive_stock'
  | 'manage_medicines'
  | 'manage_prices'
  | 'approve_price_changes'
  | 'verify_medicine_photos'
  | 'create_purchase_order'
  | 'approve_purchase_order'
  | 'transfer_stock'
  | 'approve_transfers'
  | 'process_refunds'
  | 'view_customer_dues'
  | 'view_financial_reports'
  | 'manage_branch_staff'
  | 'manage_business_settings'
  | 'manage_payment_gateways'
  | 'developer_business_reset'
  | 'view_audit_logs';

export interface UserProfileUpdatePayload {
  name?: string;
  phone?: string;
  avatar?: string;
  preferredLanguage?: 'en' | 'bn';
  emailNotificationEnabled?: boolean;
  smsAlertsEnabled?: boolean;
}


