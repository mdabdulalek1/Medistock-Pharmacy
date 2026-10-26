import React, { useState, useEffect } from 'react';
import {
  User,
  Branch,
  Medicine,
  BatchInventory,
  Supplier,
  StockMovement,
  SaleInvoice,
  OnlineOrder,
  PurchaseOrder,
  AuditLogEntry,
  DashboardMetrics,
  TillShift,
  ReturnRefund,
  ApprovalRequest,
  NotificationItem,
  OperatingExpense,
} from './types/pharmacy';
import {
  fetchCurrentSession,
  switchUserSession,
  fetchBranches,
  createBranch,
  fetchMedicines,
  createMedicine,
  fetchBatches,
  checkoutPOS,
  transferStock,
  receiveGoods,
  fetchOnlineOrders,
  createOnlineOrder,
  updateOrderStatus,
  fetchStockMovements,
  fetchSuppliers,
  fetchPurchaseOrders,
  fetchSalesInvoices,
  fetchDashboardSummary,
  fetchAuditLogs,
  fetchShifts,
  openTillShift,
  closeTillShift,
  fetchReturns,
  processReturnRefund,
  fetchApprovals,
  reviewApproval,
  fetchNotifications,
  markNotificationRead,
  fetchExpenses,
} from './services/api';
import {
  INITIAL_USERS,
  INITIAL_BRANCHES,
  INITIAL_MEDICINES,
  INITIAL_BATCHES,
  INITIAL_SUPPLIERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SALES_INVOICES,
  INITIAL_ONLINE_ORDERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SHIFTS,
  INITIAL_RETURNS,
  INITIAL_APPROVALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXPENSES,
} from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PosBillingView } from './components/PosBillingView';
import { MedicineCatalogueView } from './components/MedicineCatalogueView';
import { BatchInventoryView } from './components/BatchInventoryView';
import { BranchManagementView } from './components/BranchManagementView';
import { SuppliersPurchasingView } from './components/SuppliersPurchasingView';
import { StockMovementAuditView } from './components/StockMovementAuditView';
import { OnlineOrdersView } from './components/OnlineOrdersView';
import { CustomerStorefrontView } from './components/CustomerStorefrontView';
import { CustomerMobileAppView } from './components/CustomerMobileAppView';
import { ReportsView } from './components/ReportsView';
import { EmployeesView } from './components/EmployeesView';
import { PaymentSettingsView } from './components/PaymentSettingsView';
import { InvoiceModal } from './components/InvoiceModal';
import { ShiftsCashView } from './components/ShiftsCashView';
import { ReturnsRefundsView } from './components/ReturnsRefundsView';
import { ApprovalsView } from './components/ApprovalsView';
import { OfflineArchitectureView } from './components/OfflineArchitectureView';
import { AutomatedTestRunnerView } from './components/AutomatedTestRunnerView';
import { DeveloperControlCenterView } from './components/DeveloperControlCenterView';
import { DeliveryRiderWorkstationView } from './components/DeliveryRiderWorkstationView';
import { PermissionManagementView } from './components/PermissionManagementView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { ROLE_TEMPLATES, hasPermission } from './types/rbac';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PublicLandingView } from './components/PublicLandingView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import {
  auth,
  testFirestoreConnection,
  loginWithGoogle,
  logoutUser,
} from './firebase';
import {
  seedFirestoreIfEmpty,
  loadFirestoreData,
  persistSaleToFirestore,
  persistBatchToFirestore,
} from './services/firebaseSync';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [authScreen, setAuthScreen] = useState<'landing' | 'login' | 'register' | 'authenticated'>('landing');
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);

  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [batches, setBatches] = useState<BatchInventory[]>(INITIAL_BATCHES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [salesInvoices, setSalesInvoices] = useState<SaleInvoice[]>(INITIAL_SALES_INVOICES);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(INITIAL_ONLINE_ORDERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [shifts, setShifts] = useState<TillShift[]>(INITIAL_SHIFTS);
  const [returns, setReturns] = useState<ReturnRefund[]>(INITIAL_RETURNS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [expenses, setExpenses] = useState<OperatingExpense[]>(INITIAL_EXPENSES);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isStorefrontMode, setIsStorefrontMode] = useState<boolean>(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<SaleInvoice | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('medistock_language') as 'en' | 'bn') || 'en';
  });

  const handleToggleLang = () => {
    const next = lang === 'en' ? 'bn' : 'en';
    setLang(next);
    localStorage.setItem('medistock_language', next);
  };

  // Compute dashboard metrics
  const metrics: DashboardMetrics = React.useMemo(() => {
    let targetInvoices = salesInvoices;
    let targetBatches = batches;
    let targetOrders = onlineOrders;

    if (activeBranchId) {
      targetInvoices = targetInvoices.filter((i) => i.branchId === activeBranchId);
      targetBatches = targetBatches.filter((b) => b.branchId === activeBranchId);
      targetOrders = targetOrders.filter((o) => o.assignedBranchId === activeBranchId);
    }

    let todaySales = 0;
    let costTotal = 0;
    targetInvoices.forEach((inv) => {
      todaySales += inv.totalAmount;
      inv.items.forEach((item) => {
        costTotal += (item.unitCost || 0) * item.quantity;
      });
    });

    let stockVal = 0;
    let lowStock = 0;
    let exp30 = 0;
    let exp90 = 0;

    const now = new Date();
    const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    targetBatches.forEach((b) => {
      stockVal += b.currentQuantity * b.purchaseCost;
      if (b.currentQuantity <= 10) lowStock++;
      if (b.expiryDate <= d30) exp30++;
      else if (b.expiryDate <= d90) exp90++;
    });

    const branchPerformance = branches.map((br) => {
      const brInvoices = salesInvoices.filter((i) => i.branchId === br.id);
      const brBatches = batches.filter((b) => b.branchId === br.id);
      const brShifts = shifts.filter((s) => s.branchId === br.id && s.status === 'OPEN');
      const brSales = brInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
      const brStock = brBatches.reduce((acc, b) => acc + b.currentQuantity * b.purchaseCost, 0);
      return {
        branchId: br.id,
        branchName: br.name,
        todaySalesBDT: brSales,
        monthSalesBDT: brSales * 1.5,
        stockValuationBDT: brStock,
        batchCount: brBatches.length,
        activeTills: brShifts.length,
      };
    });

    const estimatedGrossProfit = Math.max(0, todaySales - costTotal);
    const grossMarginPercentage = todaySales > 0 ? (estimatedGrossProfit / todaySales) * 100 : 0;

    return {
      todaySalesBDT: todaySales,
      monthSalesBDT: todaySales * 1.45,
      totalOrdersCount: targetInvoices.length,
      estimatedGrossProfitBDT: estimatedGrossProfit,
      grossMarginPercentage,
      totalStockValueBDT: stockVal,
      lowStockItemsCount: lowStock,
      expiringIn30DaysCount: exp30,
      expiringIn90DaysCount: exp90,
      pendingOnlineOrdersCount: targetOrders.filter((o) => o.status === 'PENDING').length,
      pendingApprovalsCount: approvals.filter((a) => a.status === 'PENDING').length,
      activeBranchesCount: branches.filter((b) => b.active).length,
      openShiftsCount: shifts.filter((s) => s.status === 'OPEN').length,
      branchPerformance,
    };
  }, [salesInvoices, batches, onlineOrders, branches, activeBranchId, shifts, approvals]);

  // Initial load from backend API
  const refreshAllData = async () => {
    try {
      const [
        sessionData,
        branchList,
        medList,
        batchList,
        orderList,
        salesList,
        poList,
        supList,
        movList,
        audList,
        shiftList,
        retList,
        appList,
        notifList,
        expList,
      ] = await Promise.all([
        fetchCurrentSession().catch(() => null),
        fetchBranches().catch(() => INITIAL_BRANCHES),
        fetchMedicines().catch(() => INITIAL_MEDICINES),
        fetchBatches().catch(() => INITIAL_BATCHES),
        fetchOnlineOrders().catch(() => INITIAL_ONLINE_ORDERS),
        fetchSalesInvoices().catch(() => INITIAL_SALES_INVOICES),
        fetchPurchaseOrders().catch(() => INITIAL_PURCHASE_ORDERS),
        fetchSuppliers().catch(() => INITIAL_SUPPLIERS),
        fetchStockMovements().catch(() => INITIAL_STOCK_MOVEMENTS),
        fetchAuditLogs().catch(() => INITIAL_AUDIT_LOGS),
        fetchShifts().catch(() => INITIAL_SHIFTS),
        fetchReturns().catch(() => INITIAL_RETURNS),
        fetchApprovals().catch(() => INITIAL_APPROVALS),
        fetchNotifications().catch(() => INITIAL_NOTIFICATIONS),
        fetchExpenses().catch(() => INITIAL_EXPENSES),
      ]);

      if (sessionData) {
        setCurrentUser(sessionData.user);
        setAllUsers(sessionData.allUsers);
        setActiveBranchId(sessionData.activeBranchId);
      }
      if (branchList) setBranches(branchList);
      if (medList) setMedicines(medList);
      if (batchList) setBatches(batchList);
      if (orderList) setOnlineOrders(orderList);
      if (salesList) setSalesInvoices(salesList);
      if (poList) setPurchaseOrders(poList);
      if (supList) setSuppliers(supList);
      if (movList) setStockMovements(movList);
      if (audList) setAuditLogs(audList);
      if (shiftList) setShifts(shiftList);
      if (retList) setReturns(retList);
      if (appList) setApprovals(appList);
      if (notifList) setNotifications(notifList);
      if (expList) setExpenses(expList);
    } catch (err) {
      console.warn('Initial data sync fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Test Cloud Firestore connection
    testFirestoreConnection().then((connected) => {
      setFirebaseConnected(connected);
      if (connected) {
        seedFirestoreIfEmpty().then((res) => {
          if (res.seeded) {
            loadFirestoreData().then((cloudData) => {
              if (cloudData) {
                if (cloudData.branches.length) setBranches(cloudData.branches);
                if (cloudData.medicines.length) setMedicines(cloudData.medicines);
                if (cloudData.batches.length) setBatches(cloudData.batches);
                if (cloudData.sales.length) setSalesInvoices(cloudData.sales);
                if (cloudData.onlineOrders.length) setOnlineOrders(cloudData.onlineOrders);
                if (cloudData.stockMovements.length) setStockMovements(cloudData.stockMovements);
              }
            });
          }
        });
      }
    });

    // Listen to Firebase Authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseAuthUser(user);
      if (user) {
        console.log('[Firebase Auth] User authenticated via Google:', user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.user) {
        setFirebaseAuthUser(result.user);
        // Link with current profile
        setCurrentUser((prev) => ({
          ...prev,
          name: result.user.displayName || prev.name,
          email: result.user.email || prev.email,
          avatar: result.user.photoURL || undefined,
        }));
      }
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      alert('Google Sign-in: ' + (err.message || 'Popup closed or restricted in iframe.'));
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutUser();
    setFirebaseAuthUser(null);
  };

  const handleSwitchUser = async (userId: string, branchId?: string | null) => {
    try {
      const res = await switchUserSession(userId, branchId);
      setCurrentUser(res.user);
      setActiveBranchId(res.activeBranchId);
      if (res.user.role === 'customer') {
        setIsStorefrontMode(true);
      }
    } catch (err) {
      // Fallback local switch
      const found = allUsers.find((u) => u.id === userId);
      if (found) {
        setCurrentUser(found);
        setActiveBranchId(branchId !== undefined ? branchId : found.branchId);
        if (found.role === 'customer') setIsStorefrontMode(true);
      }
    }
  };

  const handlePOSCheckout = async (saleData: any) => {
    const res = await checkoutPOS(saleData);
    if (res.success && res.invoice) {
      persistSaleToFirestore(res.invoice);
      refreshAllData();
    }
    return res;
  };

  const handleTransferStock = async (payload: any) => {
    const res = await transferStock(payload);
    refreshAllData();
    return res;
  };

  const handleReceiveGoods = async (payload: any) => {
    const res = await receiveGoods(payload);
    refreshAllData();
    return res;
  };

  const handleAddMedicine = async (med: Partial<Medicine>) => {
    const res = await createMedicine(med);
    refreshAllData();
    return res;
  };

  const handleAddBranch = async (br: Partial<Branch>) => {
    const res = await createBranch(br);
    refreshAllData();
    return res;
  };

  const handlePlaceOnlineOrder = async (orderData: any) => {
    const res = await createOnlineOrder(orderData);
    refreshAllData();
    return res;
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    const res = await updateOrderStatus(orderId, status, notes);
    refreshAllData();
    return res;
  };

  const handleOpenShift = async (payload: { branchId: string; tillNumber: string; openingFloat: number; notes?: string }) => {
    const res = await openTillShift(payload);
    await refreshAllData();
    return res;
  };

  const handleCloseShift = async (shiftId: string, payload: { declaredCash: number; notes?: string }) => {
    const res = await closeTillShift(shiftId, payload);
    await refreshAllData();
    return res;
  };

  const handleProcessReturn = async (payload: any) => {
    const res = await processReturnRefund(payload);
    await refreshAllData();
    return res;
  };

  const handleReviewApproval = async (id: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => {
    await reviewApproval(id, decision, notes);
    await refreshAllData();
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    await markNotificationRead(notif.id);
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    if (notif.type === 'APPROVAL_REQUEST') setActiveTab('approvals');
    else if (notif.type === 'CASH_VARIANCE') setActiveTab('shifts');
    else if (notif.type === 'LOW_STOCK' || notif.type === 'EXPIRY_ALERT') setActiveTab('inventory');
    setIsNotificationsOpen(false);
  };

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  if (authScreen === 'landing') {
    return (
      <PublicLandingView
        onShopMedicines={() => {
          setAuthScreen('authenticated');
          setIsStorefrontMode(true);
        }}
        onSignIn={() => setAuthScreen('login')}
        onRegister={() => setAuthScreen('register')}
        medicinesCount={medicines.length}
        lang={lang}
        onToggleLang={handleToggleLang}
      />
    );
  }

  if (authScreen === 'login') {
    return (
      <LoginView
        allUsers={allUsers}
        onSuccessfulLogin={(user) => {
          setCurrentUser(user);
          setAuthScreen('authenticated');
          if (user.role === 'customer') setIsStorefrontMode(true);
          else if (user.role === 'cashier') setActiveTab('pos');
          else if (user.role === 'delivery_worker') setActiveTab('deliveries');
          else setActiveTab('dashboard');
        }}
        onNavigateRegister={() => setAuthScreen('register')}
        onNavigateLanding={() => setAuthScreen('landing')}
        onGoogleSignIn={handleGoogleSignIn}
      />
    );
  }

  if (authScreen === 'register') {
    return (
      <RegisterView
        onCreateCustomerUser={(userData) => {
          const newUser: User = {
            id: `cust_${Date.now()}`,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: 'customer',
            branchId: null,
            active: true,
          };
          setAllUsers((prev) => [newUser, ...prev]);
          return newUser;
        }}
        onSuccessfulRegistration={(user) => {
          setCurrentUser(user);
          setAuthScreen('authenticated');
          setIsStorefrontMode(true);
        }}
        onNavigateLogin={() => setAuthScreen('login')}
        onNavigateLanding={() => setAuthScreen('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col font-sans text-[#1F2937]">
      {/* Top Bar Header */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        branches={branches}
        activeBranchId={activeBranchId}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setIsStorefrontMode(false);
          setActiveTab(tab);
        }}
        isStorefrontMode={isStorefrontMode}
        onToggleStorefront={() => setIsStorefrontMode(!isStorefrontMode)}
        firebaseConnected={firebaseConnected}
        firebaseAuthUser={firebaseAuthUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onOpenSearch={() => setIsSearchOpen(true)}
        notificationsCount={notifications.filter((n) => !n.isRead).length}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onSignOut={() => setAuthScreen('landing')}
        lang={lang}
        onToggleLang={handleToggleLang}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          currentUser={currentUser}
          activeBranch={activeBranch}
          isStorefrontMode={isStorefrontMode}
          onToggleStorefront={() => setIsStorefrontMode(!isStorefrontMode)}
          pendingOrdersCount={metrics.pendingOnlineOrdersCount}
          expiringCount={metrics.expiringIn30DaysCount}
          pendingApprovalsCount={approvals.filter((a) => a.status === 'PENDING').length}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isStorefrontMode ? (
            <CustomerMobileAppView
              medicines={medicines}
              batches={batches}
              orders={onlineOrders}
              currentUser={currentUser}
              onOrderCreated={(order) => {
                setOnlineOrders((prev) => [order, ...prev]);
                refreshAllData();
              }}
              onSwitchToDashboard={() => setIsStorefrontMode(false)}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardView
              metrics={metrics}
              branches={branches}
              activeBranch={activeBranch}
              onNavigateTab={(tab) => setActiveTab(tab)}
              salesInvoices={salesInvoices}
              medicines={medicines}
              batches={batches}
              suppliers={suppliers}
              shifts={shifts}
              onSelectInvoice={(inv) => setSelectedInvoiceForModal(inv)}
            />
          ) : activeTab === 'pos' ? (
            <PosBillingView
              medicines={medicines}
              batches={batches}
              activeBranch={activeBranch}
              currentUser={currentUser}
              onCheckout={handlePOSCheckout}
              onInvoiceCreated={(inv) => setSelectedInvoiceForModal(inv)}
            />
          ) : activeTab === 'shifts' ? (
            <ShiftsCashView
              shifts={shifts}
              branches={branches}
              activeBranch={activeBranch}
              currentUser={currentUser}
              onOpenShift={handleOpenShift}
              onCloseShift={handleCloseShift}
            />
          ) : activeTab === 'returns' ? (
            <ReturnsRefundsView
              returns={returns}
              salesInvoices={salesInvoices}
              currentUser={currentUser}
              onProcessReturn={handleProcessReturn}
            />
          ) : activeTab === 'medicines' ? (
            <MedicineCatalogueView
              medicines={medicines}
              currentUser={currentUser}
              onAddMedicine={handleAddMedicine}
            />
          ) : activeTab === 'inventory' ? (
            <BatchInventoryView
              batches={batches}
              medicines={medicines}
              branches={branches}
              activeBranchId={activeBranchId}
              currentUser={currentUser}
              onReceiveGoods={handleReceiveGoods}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'branches' ? (
            <BranchManagementView
              branches={branches}
              batches={batches}
              currentUser={currentUser}
              onAddBranch={handleAddBranch}
            />
          ) : activeTab === 'purchasing' ? (
            <SuppliersPurchasingView
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              branches={branches}
              medicines={medicines}
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'transfers' ? (
            <StockMovementAuditView
              stockMovements={stockMovements}
              batches={batches}
              medicines={medicines}
              branches={branches}
              currentUser={currentUser}
              onTransferStock={handleTransferStock}
            />
          ) : activeTab === 'approvals' ? (
            <ApprovalsView
              currentUser={currentUser}
              activeBranchId={activeBranchId}
              approvals={approvals}
              branches={branches}
              onReviewApproval={handleReviewApproval}
            />
          ) : activeTab === 'orders' ? (
            <OnlineOrdersView
              orders={onlineOrders}
              currentUser={currentUser}
              branches={branches}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          ) : activeTab === 'reports' ? (
            <ReportsView
              metrics={metrics}
              salesInvoices={salesInvoices}
              branches={branches}
            />
          ) : activeTab === 'offline' ? (
            <OfflineArchitectureView activeBranch={activeBranch} />
          ) : activeTab === 'developer' ? (
            <DeveloperControlCenterView
              currentUser={currentUser}
              allUsers={allUsers}
              onUserSwitched={(user) => {
                setCurrentUser(user);
                refreshAllData();
              }}
              onNavigateToTests={() => setActiveTab('tests')}
            />
          ) : activeTab === 'tests' ? (
            <AutomatedTestRunnerView />
          ) : activeTab === 'employees' ? (
            <PermissionManagementView
              currentUser={currentUser}
              branches={branches}
              allUsers={allUsers}
            />
          ) : activeTab === 'deliveries' ? (
            <DeliveryRiderWorkstationView currentUser={currentUser} />
          ) : activeTab === 'settings' ? (
            <PaymentSettingsView currentUser={currentUser} />
          ) : (
            <AccessDeniedView
              user={currentUser}
              attemptedResource={activeTab}
              onNavigateHome={() => setActiveTab(currentUser.role === 'delivery_rider' ? 'deliveries' : 'dashboard')}
            />
          )}
        </main>
      </div>

      {/* Tax Invoice Modal */}
      {selectedInvoiceForModal && (
        <InvoiceModal
          invoice={selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMedicine={(med) => {
          setActiveTab('medicines');
          setIsStorefrontMode(false);
        }}
        onSelectInvoice={(inv) => {
          setSelectedInvoiceForModal(inv);
        }}
        onSelectOrder={(ord) => {
          setActiveTab('orders');
          setIsStorefrontMode(false);
        }}
        onSelectBatch={(batch) => {
          setActiveTab('inventory');
          setIsStorefrontMode(false);
        }}
      />

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-2xs p-4 pt-16">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#F3F6FA]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#17365D]">Notifications & Alerts</span>
                <span className="rounded-full bg-[#E7F6F6] px-2 py-0.5 text-[10px] font-mono font-bold text-[#168C8C] border border-[#168C8C]/20">
                  {notifications.filter((n) => !n.isRead).length} new
                </span>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No notifications. System is operating normally.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 hover:bg-[#F3F6FA] cursor-pointer transition-colors ${
                      !notif.isRead ? 'bg-[#FEF8ED]/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{notif.title}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          notif.severity === 'CRITICAL'
                            ? 'bg-[#FDECEC] text-[#C62828] border border-[#C62828]/20'
                            : notif.severity === 'WARNING'
                            ? 'bg-[#FEF8ED] text-[#B7791F] border border-[#B7791F]/20'
                            : 'bg-[#EBF1F8] text-[#17365D] border border-[#17365D]/20'
                        }`}
                      >
                        {notif.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString()} · Click to inspect
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
