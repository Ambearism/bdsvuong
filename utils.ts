
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Format tiền tệ thông minh
 * @param value Giá trị (mặc định đơn vị là Tỷ)
 * @param purpose 'ban' | 'cho_thue' | 'all'
 */
export const formatCurrency = (value: number, purpose: 'ban' | 'cho_thue' | 'all' = 'all'): string => {
  if (value === 0) return '0';
  
  // Nếu mục đích là Thuê hoặc giá trị quá nhỏ (< 0.1 tỷ) thì chuyển sang triệu
  if (purpose === 'cho_thue' || (purpose === 'all' && value < 0.1)) {
    const trieuValue = Math.round(value * 1000);
    return `${new Intl.NumberFormat('vi-VN').format(trieuValue)} triệu`;
  }
  
  // Mặc định hiển thị Tỷ
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)} tỷ`;
};

// Giữ lại để tương thích ngược nhưng khuyến khích dùng formatCurrency
export const formatCurrencyTy = (value: number): string => {
  return formatCurrency(value, 'ban');
};

export const formatPercent = (value: number): string => {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value)}%`;
};

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
