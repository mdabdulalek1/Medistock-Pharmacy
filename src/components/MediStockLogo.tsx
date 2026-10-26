import React from 'react';

interface MediStockLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  bengaliTagline?: boolean;
  light?: boolean;
}

export const MediStockLogo: React.FC<MediStockLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  bengaliTagline = false,
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Distinctive Medical Leaf Cross Symbol */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Top Leaf-shaped Petal */}
          <path
            d="M22 2C22 2 28 8 28 15C28 18.5 25.5 21 22 21C18.5 21 16 18.5 16 15C16 8 22 2 22 2Z"
            fill="#079B8C"
          />
          {/* Left Wing */}
          <path
            d="M2 22C2 22 8 16 15 16C18.5 16 21 18.5 21 22C21 25.5 18.5 28 15 28C8 28 2 22 2 22Z"
            fill="#123B5D"
          />
          {/* Bottom Stem Petal */}
          <path
            d="M22 42C22 42 16 36 16 29C16 25.5 18.5 23 22 23C25.5 23 28 25.5 28 29C28 36 22 42 22 42Z"
            fill="#079B8C"
          />
          {/* Right Organic Leaf Wing with natural tilt */}
          <path
            d="M42 22C42 22 36 28 29 28C25.5 28 23 25.5 23 22C23 18.5 25.5 16 29 16C36 16 42 22 42 22Z"
            fill="#123B5D"
          />
          {/* Center Pharmacy Plus Core */}
          <rect x="19" y="14" width="6" height="16" rx="2" fill="#FFFFFF" />
          <rect x="14" y="19" width="16" height="6" rx="2" fill="#FFFFFF" />
          <circle cx="22" cy="22" r="2.5" fill="#079B8C" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className={`font-extrabold tracking-tight leading-none ${textSizes[size]}`}>
          <span className={light ? 'text-white' : 'text-[#123B5D]'}>Medi</span>
          <span className="text-[#079B8C]">Stock</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${light ? 'text-teal-200' : 'text-[#5A6E85]'}`}>
            Pharmacy
          </span>
          {showTagline && (
            <span className={`text-[10px] font-medium hidden sm:inline ${light ? 'text-slate-300' : 'text-[#5A6E85]'}`}>
              • Your Health • Our Priority
            </span>
          )}
        </div>
        {bengaliTagline && (
          <span className={`text-[10px] font-medium ${light ? 'text-teal-100' : 'text-[#079B8C]'} mt-0.5`}>
            স্মার্ট ফার্মেসি, সুস্থ জীবনের জন্য
          </span>
        )}
      </div>
    </div>
  );
};
