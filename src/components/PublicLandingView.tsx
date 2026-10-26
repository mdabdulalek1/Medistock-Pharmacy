import React from 'react';
import { MediStockLogo } from './MediStockLogo';
import { Shield, Truck, Clock, Pill, CheckCircle2, ArrowRight, Lock, MapPin, Phone, Mail, Award, Heart } from 'lucide-react';
import { getTranslation, Language } from '../utils/i18n';

interface PublicLandingViewProps {
  onShopMedicines: () => void;
  onSignIn: () => void;
  onRegister: () => void;
  medicinesCount?: number;
  lang?: Language;
  onToggleLang?: () => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onShopMedicines,
  onSignIn,
  onRegister,
  medicinesCount = 500,
  lang = 'en',
  onToggleLang,
}) => {
  return (
    <div className="min-h-screen bg-[#F3F7FA] font-sans text-[#203246] flex flex-col justify-between selection:bg-[#079B8C] selection:text-white">
      {/* Top Public Header */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between px-6 sm:px-12 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <MediStockLogo size="md" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#benefits" className="hover:text-[#079B8C] transition-colors">Why MediStock</a>
          <a href="#categories" className="hover:text-[#079B8C] transition-colors">Categories</a>
          <a href="#how-it-works" className="hover:text-[#079B8C] transition-colors">How It Works</a>
          <a href="#delivery" className="hover:text-[#079B8C] transition-colors">Delivery Hubs</a>
          <a href="#contact" className="hover:text-[#079B8C] transition-colors">Support</a>
        </div>
        <div className="flex items-center gap-3">
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 rounded-xl border border-[#079B8C]/30 bg-[#DDF6EF]/60 px-3 py-2 text-xs font-bold text-[#079B8C] hover:bg-[#DDF6EF] transition-colors shadow-2xs"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          )}
          <button
            onClick={onSignIn}
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#123B5D] transition-colors border border-slate-200 bg-white"
          >
            {getTranslation('landing.signin', lang)}
          </button>
          <button
            onClick={onShopMedicines}
            className="rounded-xl px-4 py-2 text-xs font-bold text-[#123B5D] hover:bg-slate-100 transition-colors"
          >
            {getTranslation('landing.shop', lang)}
          </button>
          <button
            onClick={onRegister}
            className="rounded-xl bg-[#079B8C] hover:bg-[#058276] px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02]"
          >
            {getTranslation('landing.register', lang)}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#123B5D] via-[#1b4b74] to-[#079B8C] text-white py-20 px-6 sm:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(7,155,140,0.3),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider uppercase backdrop-blur-md text-[#DDF6EF] border border-white/20">
              <Award className="h-4 w-4 text-[#DDF6EF]" /> DGDA Certified Pharmacy Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Your Health, <span className="text-[#DDF6EF]">Our Priority.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-100/90 leading-relaxed max-w-lg">
              Experience Bangladesh's most trusted digital pharmacy network. Genuine certified medicines, cold-chain temperature assurance, lightning-fast hub delivery, and professional pharmacist verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onShopMedicines}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#DDF6EF] hover:bg-white px-8 py-4 text-sm font-black text-[#123B5D] shadow-xl transition-all hover:scale-105"
              >
                <Pill className="h-5 w-5 text-[#079B8C]" />
                <span>Shop Medicines ({medicinesCount}+ items)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onRegister}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-4 text-sm font-bold text-white backdrop-blur-md transition-all"
              >
                <span>Register as Customer</span>
              </button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#DDF6EF]" /> 100% Genuine Drugs
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#DDF6EF]" /> A-Grade Pharmacist Checked
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#079B8C] text-white flex items-center justify-center font-bold text-xl shadow-md">
                    💊
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Quick Prescription & Order</h3>
                    <p className="text-xs text-teal-200">Instant digital dispatch hub</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono px-3 py-1 border border-emerald-400/30">
                  ● Live 24/7
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-slate-300">Active Delivery Hubs:</span>
                  <span className="font-mono font-bold text-white">Dhanmondi, Gulshan, Uttara, Banani</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-slate-300">Average Delivery Time:</span>
                  <span className="font-mono font-bold text-emerald-300">45 Mins (Express)</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <span className="text-slate-300">Payment Gateways:</span>
                  <span className="font-mono font-bold text-white">bKash, Nagad, SSLCommerz, COD</span>
                </div>
              </div>
              <button
                onClick={onShopMedicines}
                className="w-full py-3.5 rounded-xl bg-[#079B8C] hover:bg-[#058276] text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Browse Online Storefront</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="rounded-full bg-[#DDF6EF] px-3.5 py-1 text-xs font-bold text-[#079B8C] uppercase tracking-wider">
            Why Choose MediStock
          </span>
          <h2 className="text-3xl font-black text-[#123B5D]">Built for Safety, Speed & Transparency</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Everything you need for your family's healthcare management in one secure platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/80 space-y-4 transition-transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-[#DDF6EF] text-[#079B8C] flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">Verified Authenticity</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sourced directly from authorized manufacturers and licensed pharmaceutical distributors with strict batch and expiry control.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/80 space-y-4 transition-transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-[#DDF6EF] text-[#079B8C] flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">Express Hub Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Temperature-controlled delivery vans and trained riders ensuring your medicines reach you safely and promptly.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/80 space-y-4 transition-transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-[#DDF6EF] text-[#079B8C] flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">24/7 Clinical Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              A-Grade registered pharmacists available to verify prescriptions, check interactions, and provide dosage guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#123B5D] text-white py-12 px-6 sm:px-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <MediStockLogo size="sm" />
            <p className="text-xs text-slate-300 leading-relaxed">
              MediStock Pharmacy Enterprise Platform. DGDA compliant pharmaceutical supply chain management and digital storefront.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              © 2026 MediStock Pharmacy Ltd. Dhaka, Bangladesh.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#079B8C]">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={onShopMedicines} className="hover:text-white">Shop Catalog</button></li>
              <li><button onClick={onSignIn} className="hover:text-[#079B8C] font-bold">Staff Portal Login</button></li>
              <li><button onClick={onRegister} className="hover:text-white">Customer Sign Up</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#079B8C]">Compliance & Legal</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><span className="hover:text-white cursor-pointer">DGDA License #48291</span></li>
              <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white cursor-pointer">Mushak 6.3 VAT Compliance</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#079B8C]">Headquarters</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#079B8C] shrink-0 mt-0.5" />
                <span>Road 11, Dhanmondi R/A, Dhaka-1209, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#079B8C] shrink-0" />
                <span className="font-mono">+880 9612-345678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#079B8C] shrink-0" />
                <span className="font-mono">support@medistock.com.bd</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
