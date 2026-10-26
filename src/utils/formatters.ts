/**
 * Formatting and Bangladesh Localization Helpers
 */

export function formatBDT(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '৳ 0.00';
  return (
    '৳ ' +
    amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeStr: string | undefined): string {
  if (!dateTimeStr) return '—';
  try {
    const d = new Date(dateTimeStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka',
    });
  } catch {
    return dateTimeStr;
  }
}

export function getExpiryStatus(expiryDate: string): {
  daysLeft: number;
  label: string;
  badgeClass: string;
  isExpired: boolean;
  isNearExpiry: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      daysLeft,
      label: `Expired (${Math.abs(daysLeft)}d ago)`,
      badgeClass: 'text-[#C62828] font-bold',
      isExpired: true,
      isNearExpiry: true,
    };
  }

  if (daysLeft <= 30) {
    return {
      daysLeft,
      label: `Critical: ${daysLeft}d left`,
      badgeClass: 'text-[#C62828] font-semibold',
      isExpired: false,
      isNearExpiry: true,
    };
  }

  if (daysLeft <= 90) {
    return {
      daysLeft,
      label: `${daysLeft}d left (Soon)`,
      badgeClass: 'text-[#B7791F] font-semibold',
      isExpired: false,
      isNearExpiry: true,
    };
  }

  return {
    daysLeft,
    label: `${formatDate(expiryDate)}`,
    badgeClass: 'text-slate-600',
    isExpired: false,
    isNearExpiry: false,
  };
}
