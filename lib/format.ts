
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

// Fix: Adjusted formatCurrency to handle values in billions consistent with the rest of the app's utilities
export const formatCurrency = (value: number, purpose: 'ban' | 'cho_thue' | 'all' = 'all'): string => {
  if (value === 0) return '0';
  
  if (purpose === 'cho_thue' || (purpose === 'all' && value < 0.1)) {
    const trieuValue = Math.round(value * 1000);
    return `${new Intl.NumberFormat('vi-VN').format(trieuValue)} triệu`;
  }
  
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)} tỷ`;
};

// Fix: Added missing formatCurrencyTy export
export const formatCurrencyTy = (value: number): string => {
  return formatCurrency(value, 'ban');
};

// Fix: Added missing formatDateTimeVi export
export const formatDateTimeVi = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};