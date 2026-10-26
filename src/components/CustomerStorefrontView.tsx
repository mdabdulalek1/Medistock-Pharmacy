import React, { useState, useMemo } from 'react';
import { Medicine, BatchInventory, User, OnlineOrder } from '../types/pharmacy';
import { formatBDT } from '../utils/formatters';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Check,
  ShieldAlert,
  Truck,
  CheckCircle2,
  FileUp,
  MapPin,
  Phone,
  User as UserIcon,
  X,
} from 'lucide-react';

interface CustomerStorefrontViewProps {
  medicines: Medicine[];
  batches: BatchInventory[];
  currentUser: User;
  onPlaceOrder: (orderData: any) => Promise<OnlineOrder>;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
  unitPrice: number;
}

const DHAKA_THANAS = [
  'Dhanmondi',
  'Gulshan',
  'Banani',
  'Uttara',
  'Mirpur',
  'Mohammadpur',
  'Badda',
  'Motijheel',
  'Bashundhara R/A',
  'Tejgaon',
  'Chattogram Central',
  'Sylhet Sadar',
];

export const CustomerStorefrontView: React.FC<CustomerStorefrontViewProps> = ({
  medicines,
  batches,
  currentUser,
  onPlaceOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Checkout Form State
  const [customerName, setCustomerName] = useState(currentUser.name || 'Rahim Ahmed');
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '+880 1711-');
  const [deliveryAddress, setDeliveryAddress] = useState('House 14, Road 5, Dhanmondi');
  const [selectedThana, setSelectedThana] = useState('Dhanmondi');
  const [selectedCity, setSelectedCity] = useState('Dhaka');
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH_ONLINE' | 'NAGAD_ONLINE'>('COD');
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OnlineOrder | null>(null);

  // Eligible products for online sale
  const eligibleMedicines = useMemo(() => {
    return medicines.filter((m) => m.onlineEligible && m.active);
  }, [medicines]);

  // Compute selling price for each medicine based on lowest batch price
  const medicinePrices = useMemo(() => {
    const map = new Map<string, number>();
    eligibleMedicines.forEach((med) => {
      const medBatches = batches.filter((b) => b.medicineId === med.id && b.currentQuantity > 0);
      if (medBatches.length > 0) {
        const minPrice = Math.min(...medBatches.map((b) => b.sellingPrice));
        map.set(med.id, minPrice);
      } else {
        map.set(med.id, 45); // default fallback
      }
    });
    return map;
  }, [eligibleMedicines, batches]);

  const filteredMedicines = useMemo(() => {
    return eligibleMedicines.filter((m) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        m.brandName.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [eligibleMedicines, searchTerm, selectedCategory]);

  const addToCart = (med: Medicine) => {
    const price = medicinePrices.get(med.id) || 40;
    const existingIndex = cart.findIndex((c) => c.medicine.id === med.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { medicine: med, quantity: 1, unitPrice: price }]);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      const updated = [...cart];
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const deliveryFee = 60; // BDT 60 Dhaka Standard Delivery
  const orderTotal = cartSubtotal > 0 ? cartSubtotal + deliveryFee : 0;

  const hasRx = useMemo(() => {
    return cart.some((c) => c.medicine.isPrescriptionRequired);
  }, [cart]);

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (hasRx && !prescriptionNote.trim()) {
      alert('One or more selected medicines require a doctor prescription. Please provide doctor or prescription details.');
      return;
    }

    setIsPlacing(true);
    try {
      const orderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        thana: selectedThana,
        city: selectedCity,
        prescriptionNote: prescriptionNote.trim() || undefined,
        paymentMethod,
        items: cart.map((c) => ({
          medicineId: c.medicine.id,
          brandName: c.medicine.brandName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
        })),
      };

      const result = await onPlaceOrder(orderData);
      setOrderConfirmation(result);
      setCart([]);
      setShowCheckoutModal(false);
    } catch (err: any) {
      alert(err.message || 'Order failed');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Storefront Announcement */}
      <div className="rounded-2xl bg-gradient-to-r from-[#17365D] via-[#153254] to-[#0f223a] p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-block border border-[#168C8C]/50 bg-[#168C8C]/20 px-2.5 py-0.5 rounded-sm text-[11px] font-semibold tracking-wider text-[#A2E6E6] uppercase">
            Dhaka & Bangladesh Fast Home Delivery
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Genuine Medicines Delivered to Your Doorstep
          </h1>
          <p className="text-xs text-slate-300">
            100% authentic pharmaceuticals sourced directly from Square, Beximco, Incepta, and Renata depots. Verified by registered pharmacists.
          </p>
        </div>
      </div>

      {/* Main Storefront Layout (Split: Products Grid + Floating/Sidebar Cart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Napa Extra, Seclo, Ceevit, Sergel, Monas, Fexo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#168C8C] focus:ring-1 focus:ring-[#168C8C]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#168C8C]"
            >
              <option value="ALL">All Categories</option>
              <option value="Analgesic & Antipyretic">Pain & Fever Relief</option>
              <option value="Gastrointestinal & Antacid">Gastric & Acidity</option>
              <option value="Respiratory & Antihistamine">Allergy & Cold</option>
              <option value="Vitamins & Minerals">Vitamins & Supplements</option>
              <option value="Antibiotic & Antimicrobial">Antibiotics (Rx)</option>
            </select>
          </div>

          {/* Medicine Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredMedicines.map((med) => {
              const price = medicinePrices.get(med.id) || 35;
              const cartItem = cart.find((c) => c.medicine.id === med.id);

              return (
                <div
                  key={med.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-2">
                    {/* Packaging Photo with Neutral SVG Fallback */}
                    <div className="w-full h-32 rounded-lg bg-[#F3F6FA] border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative">
                      <img
                        src={med.imageUrl || '/assets/medicine-placeholder.svg'}
                        alt={med.brandName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                        }}
                      />
                      {med.imageVerified && (
                        <span className="absolute top-2 right-2 bg-[#16803C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          DGDA Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400">{med.dosageForm}</span>
                      {med.isPrescriptionRequired ? (
                        <span className="text-[10px] font-bold text-[#B7791F] font-mono">
                          Rx Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#16803C]">OTC</span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{med.brandName}</h3>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{med.strength}</p>
                    <p className="text-xs text-slate-600 line-clamp-1">{med.genericName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{med.manufacturer}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Price</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {formatBDT(price)}
                      </div>
                    </div>

                    {cartItem ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(cart.indexOf(cartItem), cartItem.quantity - 1)}
                          className="rounded p-1 text-slate-600 hover:bg-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-bold px-1.5">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cart.indexOf(cartItem), cartItem.quantity + 1)}
                          className="rounded p-1 text-slate-600 hover:bg-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(med)}
                        className="flex items-center gap-1 rounded-lg bg-[#168C8C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#127373] transition-colors shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cart & Checkout Summary (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#17365D]">
              <ShoppingBag className="h-4 w-4 text-[#168C8C]" />
              <span>Your Shopping Cart</span>
            </div>
            <span className="font-mono text-xs text-slate-500 font-semibold">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Cart list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Your cart is empty. Click "+ Add" on any medicine to order.
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{item.medicine.brandName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.quantity} &times; {formatBDT(item.unitPrice)}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900">
                    {formatBDT(item.quantity * item.unitPrice)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Price breakdown */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono">{formatBDT(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-slate-400" /> Delivery Fee (Dhaka)
                </span>
                <span className="font-mono">{formatBDT(deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-[#17365D]">
                <span>Total Amount</span>
                <span className="font-mono text-[#17365D]">{formatBDT(orderTotal)}</span>
              </div>

              {hasRx && (
                <div className="rounded bg-[#FEF8ED] border border-[#B7791F]/30 p-2.5 text-[11px] text-[#B7791F] flex items-start gap-1.5 font-medium">
                  <ShieldAlert className="h-3.5 w-3.5 text-[#B7791F] shrink-0 mt-0.5" />
                  <span>
                    Cart contains Rx medicine. Our pharmacist will verify prescription before dispatch.
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full rounded-lg bg-[#168C8C] py-2.5 text-xs font-bold text-white hover:bg-[#127373] transition-colors shadow-xs"
              >
                Proceed to Checkout ({formatBDT(orderTotal)})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Complete Delivery Order</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deliver to your address in Bangladesh · Cash on Delivery or Mobile Payment
                </p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-[#168C8C]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Contact Phone (+880) *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-[#168C8C]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Street Address (House, Road, Block) *</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-[#168C8C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Thana / Area</label>
                  <select
                    value={selectedThana}
                    onChange={(e) => setSelectedThana(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-[#168C8C] bg-white"
                  >
                    {DHAKA_THANAS.map((th) => (
                      <option key={th} value={th}>{th}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">District / City</label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-[#168C8C]"
                  />
                </div>
              </div>

              {/* Prescription Upload / Notes */}
              {hasRx && (
                <div className="rounded-lg border border-[#B7791F]/30 bg-[#FEF8ED] p-3 space-y-2">
                  <div className="font-semibold text-[#B7791F] flex items-center gap-1.5">
                    <FileUp className="h-4 w-4 text-[#B7791F]" />
                    <span>Prescription Verification Note (Required for Rx Items)</span>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter Prescribing Doctor name, Hospital/Clinic, or attach prescription slip description..."
                    value={prescriptionNote}
                    onChange={(e) => setPrescriptionNote(e.target.value)}
                    className="w-full rounded border border-[#B7791F]/40 bg-white p-2 text-xs outline-none focus:border-[#B7791F]"
                  />
                  <p className="text-[10px] text-[#B7791F]">
                    Our A-Grade Pharmacist will contact this phone number to verify dosage before delivery.
                  </p>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="font-semibold text-slate-700">Payment Option</label>
                <div className="mt-1.5 space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-[#168C8C] focus:ring-[#168C8C]"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Cash on Delivery (COD)</div>
                      <div className="text-[11px] text-slate-500">Pay cash in hand to delivery courier when receiving package</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BKASH_ONLINE'}
                      onChange={() => setPaymentMethod('BKASH_ONLINE')}
                      className="text-[#168C8C] focus:ring-[#168C8C]"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">bKash Online Payment</div>
                      <div className="text-[11px] text-slate-500">Pay instantly from bKash personal wallet via merchant gateway</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500">Total with Delivery</span>
                  <div className="font-mono font-bold text-base text-[#17365D]">
                    {formatBDT(orderTotal)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPlacing}
                    className="rounded-lg bg-[#168C8C] px-4 py-2 font-bold text-white hover:bg-[#127373] shadow-xs disabled:opacity-50"
                  >
                    {isPlacing ? 'Placing Order...' : 'Confirm Delivery Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Screen */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF7F0] text-[#16803C]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#17365D]">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Order Tracking #: <strong className="text-slate-900">{orderConfirmation.orderNumber}</strong>
              </p>
            </div>
            <p className="text-xs text-slate-600">
              We received your order for {formatBDT(orderConfirmation.totalAmount)}. Our pharmacy team at {orderConfirmation.assignedBranchName} is preparing your parcel for dispatch.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setOrderConfirmation(null)}
                className="w-full rounded-lg bg-[#17365D] py-2.5 text-xs font-bold text-white hover:bg-[#132c4e]"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
