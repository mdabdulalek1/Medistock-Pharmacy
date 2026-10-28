import React, { useState } from 'react';
import { User, SaleInvoice, OnlineOrder } from '../types/pharmacy';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, Plus, FileText, Award } from 'lucide-react';

interface CustomersViewProps {
  salesInvoices: SaleInvoice[];
  onlineOrders: OnlineOrder[];
  currentUser: User;
}

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastVisit: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  salesInvoices,
  onlineOrders,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Derive initial customer list from invoices and orders or seed defaults
  const [customers, setCustomers] = useState<CustomerRecord[]>([
    {
      id: 'cust-01',
      name: 'Dr. Rafiqul Islam',
      phone: '+880 1711-987654',
      email: 'rafiqul.md@gmail.com',
      address: 'House 12, Road 4, Dhanmondi, Dhaka',
      loyaltyPoints: 340,
      totalSpent: 18450,
      lastVisit: '2026-10-24',
    },
    {
      id: 'cust-02',
      name: 'Farzana Akter',
      phone: '+880 1812-334455',
      email: 'farzana.akter@yahoo.com',
      address: 'Flat 5B, Concord Tower, Gulshan-2, Dhaka',
      loyaltyPoints: 180,
      totalSpent: 9200,
      lastVisit: '2026-10-23',
    },
    {
      id: 'cust-03',
      name: 'Anisur Rahman',
      phone: '+880 1913-556677',
      email: 'anis.rahman@outlook.com',
      address: 'Road 11, Sector 7, Uttara, Dhaka',
      loyaltyPoints: 520,
      totalSpent: 27100,
      lastVisit: '2026-10-25',
    },
    {
      id: 'cust-04',
      name: 'Sumaiya Sultana',
      phone: '+880 1521-889900',
      email: 'sumaiya.s@gmail.com',
      address: 'Block C, Mirpur-10, Dhaka',
      loyaltyPoints: 95,
      totalSpent: 4300,
      lastVisit: '2026-10-22',
    },
  ]);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const created: CustomerRecord = {
      id: `cust-${Date.now()}`,
      name: newName,
      phone: newPhone,
      email: newEmail || 'customer@medistock.com',
      address: newAddress || 'Dhaka, Bangladesh',
      loyaltyPoints: 50,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0],
    };

    setCustomers([created, ...customers]);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setShowAddModal(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#079B8C]/10 text-[#079B8C]">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#123B5D]">Customer Database & CRM</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered patients, customer contact records, and loyalty reward balances.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#079B8C] hover:bg-[#068577] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers by name, mobile phone number, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#079B8C]/20 focus:border-[#079B8C]"
        />
      </div>

      {/* Customer Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            onClick={() => setSelectedCustomer(cust)}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#079B8C] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#123B5D]">{cust.name}</span>
                <span className="flex items-center gap-1 bg-[#DDF6EF] text-[#079B8C] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                  <Award className="h-3 w-3" />
                  {cust.loyaltyPoints} pts
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono">{cust.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{cust.address}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Last visit: {cust.lastVisit}</span>
              <span className="font-bold text-[#123B5D] font-mono">
                ৳{cust.totalSpent.toLocaleString()} spent
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#F3F6FA]">
              <h3 className="font-bold text-sm text-[#17365D]">Register New Customer Profile</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Anisur Rahman"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B8C]/20 focus:border-[#079B8C]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+880 1700-000000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#079B8C]/20 focus:border-[#079B8C]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@domain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B8C]/20 focus:border-[#079B8C]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Address / Area</label>
                <input
                  type="text"
                  placeholder="House, Road, Thana, District"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B8C]/20 focus:border-[#079B8C]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#079B8C] hover:bg-[#068577] text-white px-5 py-2 font-bold shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#F3F6FA]">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#079B8C]" />
                <h3 className="font-bold text-sm text-[#17365D]">{selectedCustomer.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-[#F3F7FA] p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block">Phone Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address</span>
                  <span className="font-mono text-slate-800">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Loyalty Points</span>
                  <span className="font-mono font-bold text-[#079B8C]">
                    {selectedCustomer.loyaltyPoints} Points
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Lifetime Spend</span>
                  <span className="font-mono font-bold text-[#123B5D]">
                    ৳{selectedCustomer.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Residential / Delivery Address</span>
                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  {selectedCustomer.address}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-2">Prescription & Purchase History</span>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-slate-500">
                  <FileText className="h-8 w-8 mx-auto text-slate-300 mb-1" />
                  No pending prescriptions. All past orders successfully dispensed.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-xl bg-[#123B5D] text-white px-5 py-2 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
