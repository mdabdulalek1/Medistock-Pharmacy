import React, { useState, useMemo } from 'react';
import { Medicine, BatchInventory, OnlineOrder, User, SavedDeliveryAddress, SaleInvoice } from '../types/pharmacy';
import { formatBDT, formatDate } from '../utils/formatters';
import { createOnlineOrder, verifyPaymentGateway } from '../services/api';
import { MediStockLogo } from './MediStockLogo';
import { BangladeshAddressSelector } from './BangladeshAddressSelector';
import { PrintDocumentModal } from './PrintDocumentModal';
import { UserProfileModal } from './UserProfileModal';
import {
  Search,
  ShoppingBag,
  Home,
  Grid,
  ClipboardList,
  User as UserIcon,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  Heart,
  Share2,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Percent,
  FileText,
  CreditCard,
  Upload,
  AlertCircle,
  HelpCircle,
  Settings,
  LogOut,
  Sparkles,
  Award,
  ChevronDown,
} from 'lucide-react';

interface CustomerMobileAppViewProps {
  medicines: Medicine[];
  batches: BatchInventory[];
  orders: OnlineOrder[];
  currentUser: User;
  onOrderCreated: (order: OnlineOrder) => void;
  onSwitchToDashboard?: () => void;
}

export type MobileTab = 'home' | 'categories' | 'cart' | 'orders' | 'profile';

export const CustomerMobileAppView: React.FC<CustomerMobileAppViewProps> = ({
  medicines,
  batches,
  orders,
  currentUser,
  onOrderCreated,
  onSwitchToDashboard,
}) => {
  // Mobile Navigation State
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState<boolean>(false);
  const [selectedPackSize, setSelectedPackSize] = useState<'10' | '20'>('10');
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(['med-001']));

  // Cart State
  interface MobileCartItem {
    medicine: Medicine;
    quantity: number;
    unitPrice: number;
    packLabel: string;
  }

  const [cart, setCart] = useState<MobileCartItem[]>([
    {
      medicine: medicines.find((m) => m.id === 'med-001') || medicines[0],
      quantity: 1,
      unitPrice: 25.0,
      packLabel: 'Strip of 10 Tablets',
    },
    {
      medicine: medicines.find((m) => m.id === 'med-002') || medicines[1],
      quantity: 1,
      unitPrice: 45.0,
      packLabel: 'Strip of 14 Capsules',
    },
  ]);

  // Checkout Form State
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>(
    currentUser.role === 'customer' ? currentUser.name : 'Tania Rahman'
  );
  const [customerPhone, setCustomerPhone] = useState<string>('+880 1712-345678');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    'House 12, Road 5, Dhanmondi, Dhaka - 1209'
  );
  const [thana, setThana] = useState<string>('Dhanmondi');
  const [deliveryFee, setDeliveryFee] = useState<number>(60.0);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'CARD'>('COD');
  const [gatewayTrxId, setGatewayTrxId] = useState<string>('');
  const [prescriptionNote, setPrescriptionNote] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Modal dialog states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Active tracked order
  const [trackedOrder, setTrackedOrder] = useState<OnlineOrder | null>(orders[0] || null);

  const trackedInvoice = useMemo<SaleInvoice | null>(() => {
    if (!trackedOrder) return null;
    return {
      id: trackedOrder.id,
      invoiceNumber: trackedOrder.orderNumber,
      branchId: 'br-dhk-01',
      branchName: 'Dhanmondi Flagship & Wellness Center',
      branchAddress: 'House 42, Road 9/A, Dhanmondi, Dhaka-1209',
      branchPhone: '+880 1711-000001',
      branchBin: 'BIN-001928374-01',
      cashierId: 'usr-online',
      cashierName: 'MediStock Dispatch Logistics',
      tillNumber: 'TILL-ONLINE',
      shiftId: 'shift-online',
      customerName: trackedOrder.customerName,
      customerPhone: trackedOrder.customerPhone,
      items: trackedOrder.items.map((item) => ({
        medicineId: item.medicineId,
        brandName: item.brandName,
        genericName: 'Essential Pharmaceutical Care',
        strength: item.strength || '',
        dosageForm: item.dosageForm || 'Tablet',
        batchId: 'batch-dispatch',
        batchNumber: 'BT-2026-F1',
        expiryDate: '2027-06-30',
        quantity: item.quantity,
        unitCost: item.unitPrice * 0.8,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      subtotal: trackedOrder.subtotal,
      discountAmount: 0,
      vatAmount: 0,
      totalAmount: trackedOrder.totalAmount,
      changeAmount: 0,
      paymentMethod: 'BKASH',
      paymentReference: 'TRX-BKASH-AUTO',
      tenderedAmount: trackedOrder.totalAmount,
      status: 'PAID',
      createdAt: trackedOrder.createdAt,
    };
  }, [trackedOrder]);

  // Categories definition with clean iconography
  const categoriesList = [
    { id: 'ALL', name: 'All Medicines', icon: '💊', color: 'bg-emerald-50 text-emerald-700' },
    { id: 'Vitamins & Minerals', name: 'Vitamins & Supplements', icon: '🍊', color: 'bg-amber-50 text-amber-700' },
    { id: 'Antidiabetic & Endocrinology', name: 'Diabetes Care', icon: '🩸', color: 'bg-blue-50 text-blue-700' },
    { id: 'Cardiovascular & Hypertension', name: 'Heart Care', icon: '❤️', color: 'bg-red-50 text-red-700' },
    { id: 'Dermatology & Topical', name: 'Skin & Beauty', icon: '✨', color: 'bg-pink-50 text-pink-700' },
    { id: 'Pediatric Care', name: 'Baby Care', icon: '🍼', color: 'bg-indigo-50 text-indigo-700' },
    { id: 'Analgesic & Antipyretic', name: 'Pain Relief', icon: '🩹', color: 'bg-teal-50 text-teal-700' },
    { id: 'Gastrointestinal & Antacid', name: 'Digestive Health', icon: '🌱', color: 'bg-emerald-50 text-emerald-700' },
    { id: 'Respiratory & Antihistamine', name: 'Respiratory Care', icon: '🫁', color: 'bg-sky-50 text-sky-700' },
    { id: 'Ophthalmic & ENT', name: 'Eye & Ear Care', icon: '👁️', color: 'bg-purple-50 text-purple-700' },
  ];

  // Filter medicines for store
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.brandName.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q);

      const matchCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [medicines, searchQuery, selectedCategory]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const cartTotal = cartSubtotal > 0 ? cartSubtotal + deliveryFee : 0;
  const hasRxInCart = cart.some((c) => c.medicine.isPrescriptionRequired);

  const toggleWishlist = (medId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(medId)) next.delete(medId);
      else next.add(medId);
      return next;
    });
  };

  const handleAddToCart = (med: Medicine, customQty: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.medicine.id === med.id);
    const price = selectedPackSize === '20' ? 45.0 : 25.0;

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += customQty;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          medicine: med,
          quantity: customQty,
          unitPrice: price,
          packLabel: `${med.unit || 'Strip'}`,
        },
      ]);
    }
  };

  const updateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      const updated = [...cart];
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (hasRxInCart && !prescriptionNote.trim()) {
      alert('Prescription Required: Please provide the doctor or hospital prescription reference note.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      let finalTrxId = undefined;
      // Real server-side gateway verification for bKash, Nagad, Card
      if (paymentMethod !== 'COD') {
        const trx = gatewayTrxId.trim() || `TRX-${paymentMethod}-${Date.now().toString().slice(-6)}`;
        const verification = await verifyPaymentGateway({
          gateway: paymentMethod === 'BKASH' ? 'BKASH_MERCHANT' : paymentMethod === 'NAGAD' ? 'NAGAD_MERCHANT' : 'CARD_POS',
          transactionId: trx,
          amountBDT: cartTotal,
          idempotencyKey: `idemp-ord-pay-${Date.now()}`,
          isSandbox: true,
        });

        if (!verification.verified) {
          throw new Error('Payment gateway declined verification: ' + verification.gatewayMessage);
        }
        finalTrxId = verification.transactionId;
      }

      const payload = {
        customerName,
        customerPhone,
        deliveryAddress,
        thana,
        city: 'Dhaka',
        paymentMethod: paymentMethod === 'BKASH' ? 'BKASH_ONLINE' : paymentMethod === 'NAGAD' ? 'NAGAD_ONLINE' : paymentMethod === 'CARD' ? 'SSLCOMMERZ' : 'COD',
        paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID',
        paymentTrxId: finalTrxId,
        prescriptionNote: prescriptionNote.trim() || undefined,
        items: cart.map((item) => ({
          medicineId: item.medicine.id,
          brandName: item.medicine.brandName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const newOrder = await createOnlineOrder(payload);
      onOrderCreated(newOrder);
      setTrackedOrder(newOrder);
      setCart([]);
      setIsCheckingOut(false);
      setOrderSuccessMsg(`Order #${newOrder.orderNumber} placed and verified successfully!`);
      setActiveTab('orders');
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] flex flex-col items-center justify-start py-4 px-2 sm:px-4">
      {/* Top Experience Banner: Dual Mode Indicator & Desktop Switcher */}
      <div className="w-full max-w-md sm:max-w-xl mb-3 flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#079B8C] animate-pulse"></span>
          <span className="text-xs font-bold text-[#123B5D]">Customer Mobile Pharmacy</span>
          <span className="text-[10px] bg-teal-100 text-[#079B8C] font-semibold px-2 py-0.5 rounded-full">
            Touch-Optimized
          </span>
        </div>

        {onSwitchToDashboard && (
          <button
            onClick={onSwitchToDashboard}
            className="text-xs font-bold text-[#123B5D] hover:text-[#079B8C] flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <span>Staff Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#079B8C]" />
          </button>
        )}
      </div>

      {/* Mobile Smartphone Frame Container */}
      <div className="w-full max-w-[430px] bg-white rounded-3xl shadow-xl border-4 border-slate-800/10 overflow-hidden flex flex-col relative min-h-[760px] pb-16">
        {/* Smartphone Status Bar (Clean Mockup) */}
        <div className="h-9 bg-white px-6 pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 select-none border-b border-slate-50">
          <span>9:41</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto"></div>
          <div className="flex items-center space-x-1.5 text-xs">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Dynamic Mobile Viewport Screens */}
        <div className="flex-1 overflow-y-auto">
          {/* ================= 1. HOME SCREEN ================= */}
          {activeTab === 'home' && (
            <div className="space-y-4 pb-6">
              {/* Branded Header & Location */}
              <div className="px-5 pt-3 flex items-center justify-between">
                <MediStockLogo size="sm" />
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#123B5D] bg-[#F3F7FA] px-2.5 py-1 rounded-full border border-slate-200">
                  <MapPin className="w-3 h-3 text-[#079B8C]" />
                  <span>Dhanmondi, Dhaka</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Bengali Warmth Hero Banner */}
              <div className="mx-4 rounded-2xl bg-gradient-to-r from-[#123B5D] via-[#10486D] to-[#079B8C] text-white p-4 relative overflow-hidden shadow-sm">
                <div className="relative z-10 max-w-[220px] space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-teal-200 uppercase block">
                    MediStock 24/7 Delivery
                  </span>
                  <h2 className="text-sm font-black leading-snug">
                    আপনার পরিবারের স্বাস্থ্য সুরক্ষায় আমরা সবসময়
                  </h2>
                  <p className="text-[10px] text-teal-100 opacity-90">
                    Authentic DGDA medicines delivered to your doorstep in 45 minutes.
                  </p>
                </div>
                {/* Doctor Avatar / Healthcare Badge */}
                <div className="absolute -right-2 -bottom-2 w-28 h-28 opacity-90 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
                  <span className="text-5xl select-none">👩‍⚕️</span>
                </div>
              </div>

              {/* Medicine Search Bar */}
              <div className="px-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine, health product..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F3F7FA] border border-slate-200 rounded-xl text-xs text-[#203246] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#079B8C]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Shortcuts Grid */}
              <div className="px-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="flex flex-col items-center p-2 rounded-xl bg-teal-50 border border-teal-100/60 hover:bg-teal-100/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-[#079B8C] flex items-center justify-center shadow-2xs text-lg">
                      🏥
                    </div>
                    <span className="text-[10px] font-bold text-[#123B5D] mt-1.5 leading-tight">
                      All Medicines
                    </span>
                  </button>

                  <button
                    onClick={() => setIsPrescriptionModalOpen(true)}
                    className="flex flex-col items-center p-2 rounded-xl bg-blue-50 border border-blue-100/60 hover:bg-blue-100/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xs text-lg">
                      📄
                    </div>
                    <span className="text-[10px] font-bold text-[#123B5D] mt-1.5 leading-tight">
                      Upload Rx
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCategory('Vitamins & Minerals');
                      setActiveTab('categories');
                    }}
                    className="flex flex-col items-center p-2 rounded-xl bg-amber-50 border border-amber-100/60 hover:bg-amber-100/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center shadow-2xs text-lg">
                      🎁
                    </div>
                    <span className="text-[10px] font-bold text-[#123B5D] mt-1.5 leading-tight">
                      Offers & Deals
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="flex flex-col items-center p-2 rounded-xl bg-emerald-50 border border-emerald-100/60 hover:bg-emerald-100/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xs text-lg">
                      📦
                    </div>
                    <span className="text-[10px] font-bold text-[#123B5D] mt-1.5 leading-tight">
                      Order History
                    </span>
                  </button>
                </div>
              </div>

              {/* Promotional Discount Card */}
              <div className="mx-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#079B8C] to-[#123B5D] text-white flex items-center justify-between shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-teal-200 block">
                    SPECIAL CAMPAIGN
                  </span>
                  <h3 className="text-xs font-bold">Up to 40% OFF On Selected Medicines</h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setActiveTab('categories');
                    }}
                    className="text-[10px] font-bold text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md transition-colors inline-block mt-1"
                  >
                    Shop Now →
                  </button>
                </div>
                <div className="text-3xl">💊</div>
              </div>

              {/* Popular Products Carousel / Grid */}
              <div className="px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#123B5D] uppercase tracking-wider">
                    Popular Medicines
                  </h3>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-[11px] font-bold text-[#079B8C] hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {filteredMedicines.slice(0, 4).map((med) => {
                    const isInCart = cart.some((c) => c.medicine.id === med.id);
                    return (
                      <div
                        key={med.id}
                        className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-sm transition-all"
                      >
                        <div
                          onClick={() => setSelectedMedicine(med)}
                          className="cursor-pointer space-y-2"
                        >
                          {/* Image Box */}
                          <div className="w-full h-28 bg-[#F3F7FA] rounded-xl overflow-hidden flex items-center justify-center p-2 relative">
                            <img
                              src={med.imageUrl || '/assets/medicine-placeholder.svg'}
                              alt={med.brandName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                              }}
                            />
                            {med.imageVerified && (
                              <span className="absolute top-1.5 right-1.5 bg-[#168653] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {med.dosageForm}
                            </span>
                            <h4 className="text-xs font-bold text-[#123B5D] truncate leading-tight">
                              {med.brandName}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">{med.strength}</p>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#123B5D]">
                            {formatBDT(25.0)}
                          </span>
                          <button
                            onClick={() => handleAddToCart(med, 1)}
                            className="w-7 h-7 rounded-full bg-[#079B8C] hover:bg-[#058276] text-white flex items-center justify-center shadow-xs transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. CATEGORIES SCREEN ================= */}
          {activeTab === 'categories' && (
            <div className="space-y-4 p-4 pb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#123B5D]">Medicine Categories</h2>
                <span className="text-[10px] font-semibold text-slate-400">
                  {categoriesList.length} Categories
                </span>
              </div>

              {/* Category Icons Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center transition-all ${
                        isSelected
                          ? 'border-[#079B8C] bg-teal-50/70 shadow-2xs'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl mb-1">{cat.icon}</span>
                      <span className="text-[10px] font-bold text-slate-800 leading-tight">
                        {cat.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Medicines matching selected category */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#123B5D]">
                    {selectedCategory === 'ALL' ? 'All Catalog Products' : selectedCategory}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {filteredMedicines.length} Available
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredMedicines.map((med) => (
                    <div
                      key={med.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-[#079B8C] transition-all"
                    >
                      <div
                        onClick={() => setSelectedMedicine(med)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#F3F7FA] border border-slate-200 shrink-0 p-1 flex items-center justify-center">
                          <img
                            src={med.imageUrl || '/assets/medicine-placeholder.svg'}
                            alt={med.brandName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#123B5D] truncate">
                              {med.brandName}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {med.strength}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{med.genericName}</p>
                          <span className="text-[10px] font-bold text-[#123B5D] block mt-0.5">
                            {formatBDT(25.0)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(med, 1)}
                        className="px-3 py-1.5 bg-[#079B8C] text-white text-[11px] font-bold rounded-lg shadow-2xs hover:bg-[#058276] shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. MEDICINE DETAIL VIEW (MODAL / OVERLAY) ================= */}
          {selectedMedicine && (
            <div className="absolute inset-0 z-40 bg-white flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-200">
              {/* Detail Header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-[#123B5D]">Product Details</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleWishlist(selectedMedicine.id)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-600"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlist.has(selectedMedicine.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-slate-500'
                      }`}
                    />
                  </button>
                  <button className="p-1 rounded-full hover:bg-slate-100 text-slate-600">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-5 space-y-4 flex-1">
                {/* Large Product Image */}
                <div className="w-full h-52 bg-[#F3F7FA] rounded-2xl border border-slate-200 p-4 flex items-center justify-center relative">
                  <img
                    src={selectedMedicine.imageUrl || '/assets/medicine-placeholder.svg'}
                    alt={selectedMedicine.brandName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                    }}
                  />
                  {selectedMedicine.imageVerified && (
                    <span className="absolute bottom-3 left-3 bg-[#168653] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      DGDA Verified Packaging
                    </span>
                  )}
                </div>

                {/* Medicine Title & Specs */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#123B5D]">
                      {selectedMedicine.brandName} {selectedMedicine.strength}
                    </h2>
                    <span className="px-2 py-0.5 bg-emerald-100 text-[#168653] text-[10px] font-bold rounded-full">
                      In Stock
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedMedicine.genericName}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>★★★★☆ 4.8 (124 reviews)</span>
                    <span>•</span>
                    <span className="font-semibold">{selectedMedicine.manufacturer}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-3 bg-[#DDF6EF]/40 rounded-xl border border-[#079B8C]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Unit MRP</span>
                    <span className="text-xl font-black text-[#123B5D]">
                      {formatBDT(selectedPackSize === '20' ? 45.0 : 25.0)}
                    </span>
                  </div>
                  <span className="text-xs text-[#079B8C] font-bold font-mono">
                    DAR: {selectedMedicine.darNumber || '028-0112-054'}
                  </span>
                </div>

                {/* Select Pack Size */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#123B5D] block">Select Pack Size</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPackSize('10')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedPackSize === '10'
                          ? 'border-[#079B8C] bg-teal-50/50 shadow-2xs ring-1 ring-[#079B8C]'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 block">10 Tablets</span>
                      <span className="text-xs text-[#079B8C] font-bold font-mono">৳ 25.00</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPackSize('20')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedPackSize === '20'
                          ? 'border-[#079B8C] bg-teal-50/50 shadow-2xs ring-1 ring-[#079B8C]'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 block">20 Tablets</span>
                      <span className="text-xs text-[#079B8C] font-bold font-mono">৳ 45.00</span>
                    </button>
                  </div>
                </div>

                {/* Batch & Expiry Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Batch Number:</span>
                    <span className="font-mono font-bold text-slate-800">PA-2026-B1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expiry Date:</span>
                    <span className="font-mono text-emerald-700 font-semibold">12 Dec 2026</span>
                  </div>
                </div>

                {/* Clinical Indications */}
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">Description & Dosage</span>
                  <p className="leading-relaxed">
                    {selectedMedicine.description ||
                      'Fast relief from fever, headache, body ache and severe migrainous pains. Store below 30°C in a dry place.'}
                  </p>
                </div>
              </div>

              {/* Bottom Action Sheet */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl p-1 bg-[#F3F7FA]">
                  <button
                    onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono">
                    {detailQuantity}
                  </span>
                  <button
                    onClick={() => setDetailQuantity(detailQuantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedMedicine, detailQuantity);
                    setSelectedMedicine(null);
                    setActiveTab('cart');
                  }}
                  className="flex-1 py-3 bg-[#079B8C] hover:bg-[#058276] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= 4. CART & CHECKOUT SCREEN ================= */}
          {activeTab === 'cart' && (
            <div className="space-y-4 p-4 pb-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-[#123B5D]">My Cart</h2>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs font-bold text-[#D64545] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 bg-teal-50 text-[#079B8C] rounded-full flex items-center justify-center mx-auto text-2xl">
                    🛍️
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Browse our authenticated medicine catalogue to add remedies or prescription drugs.
                  </p>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="px-4 py-2 bg-[#079B8C] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Browse Medicines
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Cart Item Rows */}
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#F3F7FA] border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={item.medicine.imageUrl || '/assets/medicine-placeholder.svg'}
                          alt={item.medicine.brandName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#123B5D] truncate">
                          {item.medicine.brandName}
                        </h4>
                        <span className="text-[10px] text-slate-500 block">
                          {item.packLabel} • {formatBDT(item.unitPrice)}
                        </span>
                        <span className="text-xs font-bold text-[#123B5D] font-mono mt-0.5 block">
                          {formatBDT(item.quantity * item.unitPrice)}
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-[#F3F7FA]">
                        <button
                          onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => updateCartQuantity(idx, 0)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Rx Alert in Cart */}
                  {hasRxInCart && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#E9A23B]">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Prescription Medicine in Cart</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        DGDA regulations require an A-Grade Pharmacist to verify your prescription before dispatch.
                      </p>
                    </div>
                  )}

                  {/* Summary Card */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold text-slate-800">{formatBDT(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charge (Dhaka Express)</span>
                      <span className="font-mono text-slate-800">{formatBDT(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#123B5D] border-t border-slate-100 pt-2">
                      <span>Total Payable</span>
                      <span className="font-mono text-[#079B8C]">{formatBDT(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Checkout Trigger */}
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-3 bg-[#079B8C] hover:bg-[#058276] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Proceed to Checkout ({formatBDT(cartTotal)})
                  </button>
                </div>
              )}

              {/* Checkout Bottom Sheet Modal */}
              {isCheckingOut && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4">
                  <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-[#079B8C]" />
                        <h3 className="text-sm font-black text-[#123B5D]">Delivery & Payment Checkout</h3>
                      </div>
                      <button
                        onClick={() => setIsCheckingOut(false)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                      {/* Cascading Bangladesh Address Selector Component */}
                      <div className="rounded-xl border border-slate-200 bg-[#F3F7FA] p-3">
                        <BangladeshAddressSelector
                          onAddressSelect={(addr, fee) => {
                            setCustomerName(addr.recipientName);
                            setCustomerPhone(addr.recipientPhone);
                            setDeliveryAddress(`${addr.addressLine}, ${addr.thanaName}, ${addr.districtName}`);
                            setThana(addr.thanaName);
                            setDeliveryFee(fee);
                          }}
                        />
                      </div>

                      {/* Payment Method Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Select Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('COD')}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              paymentMethod === 'COD'
                                ? 'border-[#079B8C] bg-[#DDF6EF] text-[#079B8C] font-bold shadow-2xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold">Cash on Delivery</div>
                            <div className="text-[10px] text-slate-500">Pay cash upon receipt</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('BKASH')}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              paymentMethod === 'BKASH'
                                ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold shadow-2xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold">bKash Merchant</div>
                            <div className="text-[10px] text-slate-500">Server verified checkout</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('NAGAD')}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              paymentMethod === 'NAGAD'
                                ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-2xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold">Nagad Merchant</div>
                            <div className="text-[10px] text-slate-500">Instant wallet clearance</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('CARD')}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              paymentMethod === 'CARD'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-2xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold">Card / POS</div>
                            <div className="text-[10px] text-slate-500">Visa / Mastercard</div>
                          </button>
                        </div>

                        {/* bKash / Nagad Transaction ID Verification Field */}
                        {paymentMethod !== 'COD' && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-800">
                                {paymentMethod} Merchant Gateway (Test Sandbox)
                              </span>
                              <span className="rounded bg-emerald-100 text-[#168653] font-bold text-[9px] px-1.5 py-0.2">
                                SSL / TLS Verified
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Send <strong>{formatBDT(cartTotal)}</strong> to MediStock Merchant Account (01711-234567) or click verify to simulate:
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={`Enter ${paymentMethod} TrxID (e.g. 9J28A19K)`}
                                value={gatewayTrxId}
                                onChange={(e) => setGatewayTrxId(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => setGatewayTrxId(`TRX-${paymentMethod}-${Date.now().toString().slice(-6)}`)}
                                className="rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-300"
                              >
                                Auto Fill
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {hasRxInCart && (
                        <div>
                          <label className="block text-[#E9A23B] font-bold mb-1">
                            Prescription Note / Doctor Name (Mandatory for Rx)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Dr. K. Rahman (BSMMU), Slip #9281"
                            value={prescriptionNote}
                            onChange={(e) => setPrescriptionNote(e.target.value)}
                            className="w-full p-2.5 border border-amber-300 rounded-xl bg-amber-50/50"
                            required={hasRxInCart}
                          />
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingOrder}
                          className="w-full py-3 bg-[#079B8C] hover:bg-[#058276] text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                        >
                          {isSubmittingOrder ? 'Verifying & Submitting...' : `Confirm & Place Order (${formatBDT(cartTotal)})`}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 5. ORDERS & TRACK ORDER SCREEN ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4 p-4 pb-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-base font-black text-[#123B5D]">Track Live Order</h2>
                <span className="text-[10px] bg-teal-100 text-[#079B8C] font-bold px-2 py-0.5 rounded-full">
                  GPS Active
                </span>
              </div>

              {orderSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#168653] text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{orderSuccessMsg}</span>
                </div>
              )}

              {/* Status Header Card */}
              <div className="p-4 bg-gradient-to-r from-[#123B5D] to-[#079B8C] text-white rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-teal-200 font-mono font-bold">
                    {trackedOrder?.orderNumber || '#MS-ORD-26-8921'}
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    Out for Delivery
                  </span>
                </div>
                <h3 className="text-base font-black">Expected Today by 2:30 PM</h3>
                <p className="text-[11px] text-teal-100 opacity-90">
                  Your delivery partner <strong className="text-white">Rashedul (Rider #14)</strong> is on the way.
                </p>
              </div>

              {/* 4-Step Tracker Flow (Matching Reference Image) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Order Timeline
                </h4>
                <div className="relative pl-6 space-y-4 border-l-2 border-teal-500 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#168653] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-800 block">Placed</span>
                    <span className="text-[10px] text-slate-400">10:15 AM · Verified via bKash</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#168653] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-800 block">Packed by Pharmacist</span>
                    <span className="text-[10px] text-slate-400">12:30 PM · Cold chain sealed</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#079B8C] text-white flex items-center justify-center text-[10px] font-bold animate-ping"></span>
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#079B8C] text-white flex items-center justify-center text-[10px] font-bold">
                      •
                    </span>
                    <span className="text-xs font-bold text-[#079B8C] block">Out for Delivery</span>
                    <span className="text-[10px] text-slate-500">1:45 PM · On delivery route</span>
                  </div>

                  <div className="relative opacity-50">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px] font-bold">
                      4
                    </span>
                    <span className="text-xs font-bold text-slate-800 block">Delivered</span>
                    <span className="text-[10px] text-slate-400">Estimated 2:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Action Buttons */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block">Destination</span>
                <p className="text-slate-600 text-[11px] flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#079B8C] shrink-0 mt-0.5" />
                  <span>House 12, Road 5, Dhanmondi, Dhaka - 1209</span>
                </p>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => alert('Connecting to delivery rider: +880 1711-234567')}
                    className="flex-1 py-2.5 bg-[#079B8C] hover:bg-[#058276] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Delivery Partner</span>
                  </button>
                  <button
                    onClick={() => alert('Order cannot be cancelled after dispatch.')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="w-full py-2 bg-[#F3F7FA] hover:bg-slate-200 text-[#123B5D] font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#079B8C]" />
                    <span>View / Print Mushak 6.3 Delivery Slip</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. PROFILE SCREEN ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-4 p-4 pb-8">
              {/* Profile Card matching Reference Image */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#123B5D] to-[#079B8C] text-white flex items-center justify-center text-xl font-bold shadow-xs">
                  TR
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#123B5D]">Tania Rahman</h3>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Member since 2024 · Dhanmondi
                  </span>
                  <span className="text-[10px] text-[#079B8C] font-semibold mt-0.5 inline-block">
                    Verified Customer
                  </span>
                </div>
              </div>

              {/* Loyalty Points Banner */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Award className="w-6 h-6 text-[#E9A23B]" />
                  <div>
                    <span className="text-[10px] text-amber-800 uppercase font-black block">
                      LOYALTY POINTS
                    </span>
                    <span className="text-sm font-black text-amber-900 font-mono">150 Points</span>
                  </div>
                </div>
                <button
                  onClick={() => alert('150 Points redeemed! ৳ 75 discount voucher applied.')}
                  className="px-3 py-1 bg-[#E9A23B] text-white text-[11px] font-bold rounded-lg shadow-2xs hover:bg-amber-600"
                >
                  Redeem
                </button>
              </div>

              {/* Settings & Menu List */}
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs text-slate-700 shadow-2xs">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">👤 Profile & Account Settings</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">📦 My Orders</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">📄 My Prescriptions</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => alert('Saved addresses: Dhanmondi (Default), Gulshan Corporate')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">📍 Delivery Addresses</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => alert('bKash (01712-***78), Nagad, Visa ending in 4092')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">💳 Payment Methods</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => alert('MediStock Helpline: +880 1700-000000 (Open 24/7)')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2">📞 Help & Support</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {onSwitchToDashboard && (
                  <button
                    onClick={onSwitchToDashboard}
                    className="w-full p-3.5 flex items-center justify-between bg-teal-50 text-[#079B8C] hover:bg-teal-100/50 transition-colors"
                  >
                    <span className="font-bold flex items-center gap-2">
                      ⚙️ Switch to Pharmacy Staff Dashboard
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Prescription Upload Modal */}
        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-bold text-[#123B5D]">Upload Doctor's Prescription</h3>
                <button
                  onClick={() => setIsPrescriptionModalOpen(false)}
                  className="text-xs text-slate-400"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-600">
                Please upload a clear photo of your prescription signed by a registered BMDC doctor.
              </p>
              <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 text-center bg-teal-50/50 cursor-pointer hover:bg-teal-50">
                <Upload className="w-6 h-6 text-[#079B8C] mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-700 block">
                  Tap to take photo or choose file
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">JPEG, PNG up to 5MB</span>
              </div>
              <button
                onClick={() => {
                  alert('Prescription submitted! Our pharmacist will review it shortly.');
                  setIsPrescriptionModalOpen(false);
                }}
                className="w-full py-2.5 bg-[#079B8C] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Submit Prescription
              </button>
            </div>
          </div>
        )}

        {/* Fixed Ergonomic Bottom Tab Bar (Matching Reference Image) */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 flex items-center justify-around z-30 shadow-md">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'home' ? 'text-[#079B8C]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'categories' ? 'text-[#079B8C]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
              activeTab === 'cart' ? 'text-[#079B8C]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D64545] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">Cart</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'orders' ? 'text-[#079B8C]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'profile' ? 'text-[#079B8C]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Profile</span>
          </button>
        </div>

        {/* Printable Delivery Slip / Mushak 6.3 Document Modal */}
        <PrintDocumentModal
          isOpen={isPrintModalOpen}
          documentType="DELIVERY_SLIP"
          invoice={trackedInvoice}
          onClose={() => setIsPrintModalOpen(false)}
        />

        {/* Customer Self-Service Profile Modal */}
        <UserProfileModal
          isOpen={isProfileModalOpen}
          currentUser={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </div>
    </div>
  );
};
