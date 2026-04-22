
export interface FinancialCategory {
  id: string;
  name: string;
  type: 'thu' | 'chi';
  isTaxable: boolean; // Tính vào doanh thu chịu thuế
  isDeductible: boolean; // Được trừ khi tính thu nhập
  defaultParty: 'owner' | 'tenant' | 'other';
  requireInvoice: boolean;
  isActive: boolean;
}

export const MOCK_FINANCIAL_CATEGORIES: FinancialCategory[] = [
  { id: 'c1', name: 'Tiền thuê nhà', type: 'thu', isTaxable: true, isDeductible: false, defaultParty: 'owner', requireInvoice: false, isActive: true },
  { id: 'c2', name: 'Phí dịch vụ thu thêm', type: 'thu', isTaxable: true, isDeductible: false, defaultParty: 'owner', requireInvoice: false, isActive: true },
  { id: 'c3', name: 'Tiền cọc giữ chỗ', type: 'thu', isTaxable: false, isDeductible: false, defaultParty: 'owner', requireInvoice: false, isActive: true },
  { id: 'c4', name: 'Tiền điện / Nước', type: 'chi', isTaxable: false, isDeductible: true, defaultParty: 'other', requireInvoice: true, isActive: true },
  { id: 'c5', name: 'Phí quản lý chung cư', type: 'chi', isTaxable: false, isDeductible: true, defaultParty: 'other', requireInvoice: true, isActive: true },
  { id: 'c6', name: 'Sửa chữa / bảo trì', type: 'chi', isTaxable: false, isDeductible: true, defaultParty: 'other', requireInvoice: true, isActive: true },
  { id: 'c7', name: 'Phí môi giới', type: 'chi', isTaxable: false, isDeductible: true, defaultParty: 'other', requireInvoice: true, isActive: true },
];
