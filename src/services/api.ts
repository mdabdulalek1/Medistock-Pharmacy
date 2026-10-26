import {
  Medicine,
  BatchInventory,
  Branch,
  User,
  SaleInvoice,
  OnlineOrder,
  PurchaseOrder,
  StockMovement,
  Supplier,
  AuditLogEntry,
  DashboardMetrics,
  TillShift,
  OperatingExpense,
  ReturnRefund,
  ApprovalRequest,
  NotificationItem,
  Business,
  BusinessBackupArchive,
  BusinessResetRequest,
  BusinessResetResponse,
} from '../types/pharmacy';

export async function fetchCurrentSession(): Promise<{ user: User; activeBranchId: string | null; allUsers: User[] }> {
  const res = await fetch('/api/auth/current');
  if (!res.ok) throw new Error('Failed to fetch session');
  return await res.json();
}

export async function switchUserSession(userId: string, branchId?: string | null): Promise<{ user: User; activeBranchId: string | null }> {
  const res = await fetch('/api/auth/switch-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, branchId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to switch user');
  }
  return await res.json();
}

export async function fetchBranches(): Promise<Branch[]> {
  const res = await fetch('/api/branches');
  if (!res.ok) throw new Error('Failed to load branches');
  return await res.json();
}

export async function createBranch(branch: Partial<Branch>): Promise<Branch> {
  const res = await fetch('/api/branches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(branch),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || err.error || 'Failed to create branch');
  }
  return await res.json();
}

export async function fetchMedicines(search?: string, category?: string, prescriptionOnly?: boolean): Promise<Medicine[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (prescriptionOnly) params.append('prescriptionOnly', 'true');

  const res = await fetch(`/api/medicines?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load medicines');
  return await res.json();
}

export async function createMedicine(med: Partial<Medicine>): Promise<Medicine> {
  const res = await fetch('/api/medicines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(med),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || err.error || 'Failed to save medicine');
  }
  return await res.json();
}

export async function fetchBatches(branchId?: string, medicineId?: string): Promise<BatchInventory[]> {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (medicineId) params.append('medicineId', medicineId);

  const res = await fetch(`/api/batches?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load batches');
  return await res.json();
}

export async function checkoutPOS(saleData: any): Promise<{ success: boolean; invoice: SaleInvoice; message: string }> {
  const res = await fetch('/api/sales/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Checkout failed');
  }
  return await res.json();
}

export async function fetchShifts(branchId?: string): Promise<TillShift[]> {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const res = await fetch(`/api/shifts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load shifts');
  return await res.json();
}

export async function openTillShift(payload: { branchId: string; tillNumber: string; openingFloat: number; notes?: string }): Promise<TillShift> {
  const res = await fetch('/api/shifts/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to open till shift');
  }
  return await res.json();
}

export async function closeTillShift(shiftId: string, payload: { declaredCash: number; notes?: string }): Promise<any> {
  const res = await fetch(`/api/shifts/${shiftId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to close till shift');
  }
  return await res.json();
}

export async function fetchReturns(): Promise<ReturnRefund[]> {
  const res = await fetch('/api/returns');
  if (!res.ok) throw new Error('Failed to load returns');
  return await res.json();
}

export async function processReturnRefund(payload: any): Promise<any> {
  const res = await fetch('/api/returns/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to process return');
  }
  return await res.json();
}

export async function fetchExpenses(branchId?: string): Promise<OperatingExpense[]> {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const res = await fetch(`/api/expenses?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load expenses');
  return await res.json();
}

export async function recordExpense(payload: any): Promise<OperatingExpense> {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to record expense');
  }
  return await res.json();
}

export async function fetchApprovals(): Promise<ApprovalRequest[]> {
  const res = await fetch('/api/approvals');
  if (!res.ok) throw new Error('Failed to load approvals');
  return await res.json();
}

export async function reviewApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED', notes?: string): Promise<any> {
  const res = await fetch(`/api/approvals/${approvalId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, notes }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Review failed');
  }
  return await res.json();
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Failed to load notifications');
  return await res.json();
}

export async function markNotificationRead(id: string): Promise<any> {
  const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  return await res.json();
}

export async function searchGlobal(q: string): Promise<{ medicines: Medicine[]; invoices: SaleInvoice[]; orders: OnlineOrder[]; batches: BatchInventory[] }> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Search failed');
  return await res.json();
}

export async function runAutomatedTests(): Promise<any> {
  const res = await fetch('/api/tests/run');
  if (!res.ok) throw new Error('Test run failed');
  return await res.json();
}

export async function transferStock(payload: any): Promise<any> {
  const res = await fetch('/api/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Stock transfer failed');
  }
  return await res.json();
}

export async function receiveGoods(payload: any): Promise<any> {
  const res = await fetch('/api/purchases/receive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to receive goods');
  }
  return await res.json();
}

export async function fetchOnlineOrders(branchId?: string, status?: string): Promise<OnlineOrder[]> {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (status) params.append('status', status);

  const res = await fetch(`/api/online-orders?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load online orders');
  return await res.json();
}

export async function createOnlineOrder(orderData: any): Promise<OnlineOrder> {
  const res = await fetch('/api/online-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Order creation failed');
  }
  return await res.json();
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string): Promise<any> {
  const res = await fetch(`/api/online-orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, prescriptionNote: notes }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update order status');
  }
  return await res.json();
}

export async function fetchStockMovements(branchId?: string): Promise<StockMovement[]> {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const res = await fetch(`/api/stock-movements?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load stock movements');
  return await res.json();
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const res = await fetch('/api/suppliers');
  if (!res.ok) throw new Error('Failed to load suppliers');
  return await res.json();
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const res = await fetch('/api/purchases');
  if (!res.ok) throw new Error('Failed to load purchase orders');
  return await res.json();
}

export async function fetchSalesInvoices(branchId?: string): Promise<SaleInvoice[]> {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const res = await fetch(`/api/sales?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load sales invoices');
  return await res.json();
}

export async function fetchDashboardSummary(branchId?: string): Promise<DashboardMetrics> {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const res = await fetch(`/api/reports/summary?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return await res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch('/api/audit-logs');
  if (!res.ok) throw new Error('Failed to load audit logs');
  return await res.json();
}

// ================= DEVELOPER SUPER ADMIN & BUSINESS RESET APIS =================

export async function fetchDeveloperStatus(): Promise<any> {
  const res = await fetch('/api/developer/status');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Developer status access denied');
  }
  return await res.json();
}

export async function fetchDeveloperBusinesses(): Promise<Business[]> {
  const res = await fetch('/api/developer/businesses');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Developer businesses access denied');
  }
  return await res.json();
}

export async function fetchDeveloperBackups(): Promise<any[]> {
  const res = await fetch('/api/developer/backups');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Developer backups access denied');
  }
  return await res.json();
}

export async function executeBusinessReset(request: BusinessResetRequest): Promise<BusinessResetResponse> {
  const res = await fetch('/api/developer/business-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Business reset failed');
  }
  return data;
}

export async function testRestoreBackup(backupId: string): Promise<any> {
  const res = await fetch('/api/developer/backup-restore-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ backupId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Backup restore test failed');
  }
  return data;
}

export async function updateBusinessLicense(businessId: string, payload: {
  licenseStatus?: string;
  subscriptionPlan?: string;
  licenseExpiryDate?: string;
  active?: boolean;
  notes?: string;
}): Promise<any> {
  const res = await fetch(`/api/developer/businesses/${businessId}/license`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'License update failed');
  }
  return data;
}

// ================= MEDICINE PHOTO & IMAGE MANAGEMENT APIS =================

export async function uploadMedicineImage(medicineId: string, payload: {
  imageUrl?: string;
  imageData?: string;
  imageSource?: string;
  isVerified?: boolean;
}): Promise<{ success: boolean; medicine: Medicine }> {
  const res = await fetch(`/api/medicines/${medicineId}/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to upload medicine photo');
  }
  return data;
}

export async function deleteMedicineImage(medicineId: string): Promise<{ success: boolean; medicine: Medicine; message: string }> {
  const res = await fetch(`/api/medicines/${medicineId}/image`, {
    method: 'DELETE',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to remove medicine photo');
  }
  return data;
}

export async function fetchMedicineImagesReport(): Promise<any> {
  const res = await fetch('/api/medicines/images/report');
  if (!res.ok) throw new Error('Failed to load medicine image report');
  return await res.json();
}

// ================= MEDICINE DATA INTEGRATION CENTER APIS =================

export async function searchMedicineCandidates(q: string, barcode?: string): Promise<{ success: boolean; count: number; candidates: any[] }> {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (barcode) params.append('barcode', barcode);
  const res = await fetch(`/api/medicines/candidates?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to query candidate medicine feeds');
  return await res.json();
}

export async function importCandidateMedicine(payload: {
  candidateId: string;
  customSellingPrice?: number;
  customPurchaseCost?: number;
  overrideConfirmation?: boolean;
}): Promise<{ success: boolean; action: 'CREATED' | 'UPDATED'; medicine: Medicine }> {
  const res = await fetch('/api/medicines/import-candidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to import medicine candidate');
  }
  return data;
}

export async function refreshMedicinePrices(): Promise<any> {
  const res = await fetch('/api/medicines/refresh-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to run price refresh job');
  return await res.json();
}

// ================= PAYMENT GATEWAY VERIFICATION & CUSTOMER DUES =================

export async function verifyPaymentGateway(payload: {
  gateway: string;
  transactionId: string;
  amountBDT: number;
  invoiceNumber?: string;
  idempotencyKey?: string;
  isSandbox?: boolean;
}): Promise<any> {
  const res = await fetch('/api/payments/verify-gateway', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Payment gateway verification failed');
  }
  return data;
}

export async function fetchCustomerDues(): Promise<any[]> {
  const res = await fetch('/api/customer-dues');
  if (!res.ok) throw new Error('Failed to load customer dues');
  return await res.json();
}

export async function settleCustomerDue(payload: {
  customerPhone: string;
  amountBDT: number;
  paymentMethod?: string;
  notes?: string;
}): Promise<any> {
  const res = await fetch('/api/customer-dues/settle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to record customer payment settlement');
  }
  return data;
}

// ================= BANGLADESH CASCADING ADDRESS APIS =================

export async function fetchBangladeshDivisions(): Promise<any[]> {
  const res = await fetch('/api/addresses/divisions');
  if (!res.ok) throw new Error('Failed to load divisions');
  return await res.json();
}

export async function fetchBangladeshDistricts(divisionId?: string): Promise<any[]> {
  const url = divisionId ? `/api/addresses/districts?divisionId=${divisionId}` : '/api/addresses/districts';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load districts');
  return await res.json();
}

export async function fetchBangladeshThanas(districtId?: string): Promise<any[]> {
  const url = districtId ? `/api/addresses/thanas?districtId=${districtId}` : '/api/addresses/thanas';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load thanas');
  return await res.json();
}

export async function fetchSavedAddresses(): Promise<any[]> {
  const res = await fetch('/api/addresses/saved');
  if (!res.ok) throw new Error('Failed to load saved addresses');
  return await res.json();
}

export async function saveDeliveryAddress(payload: any): Promise<any> {
  const res = await fetch('/api/addresses/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to save address');
  }
  return data;
}

export async function deleteSavedAddress(id: string): Promise<any> {
  const res = await fetch(`/api/addresses/saved/${id}`, {
    method: 'DELETE',
  });
  return await res.json();
}

// ================= USER PROFILE SELF-SERVICE APIS =================

export async function fetchUserProfile(): Promise<any> {
  const res = await fetch('/api/users/profile');
  if (!res.ok) throw new Error('Failed to load user profile');
  return await res.json();
}

export async function updateUserProfile(payload: any): Promise<any> {
  const res = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update user profile');
  }
  return data;
}

// ================= PRINTABLE DOCUMENTS API =================

export async function fetchPrintDocumentData(type: string, id: string): Promise<any> {
  const res = await fetch(`/api/print/document/${type}/${id}`);
  if (!res.ok) throw new Error('Failed to load printable document data');
  return await res.json();
}

// ================= RBAC & ROLE PERMISSION CLIENT APIS =================

export async function fetchRbacRoles(): Promise<any> {
  const res = await fetch('/api/rbac/roles');
  if (!res.ok) throw new Error('Failed to load role templates');
  return await res.json();
}

export async function fetchUserPermissions(userId: string): Promise<any> {
  const res = await fetch(`/api/rbac/user-permissions/${userId}`);
  if (!res.ok) throw new Error('Failed to load user permissions');
  return await res.json();
}

export async function assignUserPermissions(payload: {
  targetUserId: string;
  newRole?: string;
  newRoles?: string[];
  explicitGrants?: string[];
  explicitDenies?: string[];
  branchScope?: string;
  permittedBranches?: string[];
  temporaryDurationHours?: number;
  reason?: string;
}): Promise<any> {
  const res = await fetch('/api/rbac/assign-permissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to assign permissions');
  }
  return data;
}

export async function fetchPermissionRequests(): Promise<any[]> {
  const res = await fetch('/api/rbac/requests');
  if (!res.ok) throw new Error('Failed to load permission requests');
  return await res.json();
}

export async function submitPermissionRequest(payload: {
  requestedPermission: string;
  permissionLabel: string;
  reason: string;
  requestedDurationHours?: number;
}): Promise<any> {
  const res = await fetch('/api/rbac/request-permission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to submit request');
  return data;
}

export async function reviewPermissionRequest(payload: {
  requestId: string;
  decision: 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
}): Promise<any> {
  const res = await fetch('/api/rbac/review-permission-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to review request');
  return data;
}

export async function revokeUserSession(targetUserId: string, deactivate: boolean = false): Promise<any> {
  const res = await fetch('/api/rbac/revoke-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId, deactivate }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to revoke session');
  return data;
}

export async function fetchRbacAuditExport(): Promise<any> {
  const res = await fetch('/api/rbac/audit-export');
  if (!res.ok) throw new Error('Failed to export audit logs');
  return await res.json();
}

export async function fetchRiderDeliveries(): Promise<any[]> {
  const res = await fetch('/api/rider/deliveries');
  if (!res.ok) throw new Error('Failed to load deliveries');
  return await res.json();
}

export async function updateRiderDelivery(payload: {
  orderId: string;
  status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED';
  recipientProof?: string;
  cashCollectedBDT?: number;
  failureReason?: string;
}): Promise<any> {
  const res = await fetch('/api/rider/update-delivery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to update delivery');
  return data;
}
