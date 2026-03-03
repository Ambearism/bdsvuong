
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Select, Switch, toast, Badge } from '../../ui';
import { CashflowEntry, RevenueCode, CashflowCategory, CashflowSubtype } from '../../../types';
import { getRevenueCodes } from '../../../data/settingsFactory';
import { approveCashflow } from '../../../data/financeFactory';
import { CheckCircle2, AlertTriangle, User, Info, DollarSign, BookOpen, AlertCircle } from 'lucide-react';
import { formatCurrencyTy } from '../../../utils';

interface Props {
  entry: CashflowEntry;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: string;
}

const CATEGORY_LABELS: Record<CashflowCategory, string> = {
    'RENT_INCOME': 'Doanh thu tiền cho thuê nhà',
    'ASSET_OTHER_INCOME': 'Doanh thu khai thác tài sản',
    'NON_REVENUE': 'Khoản thu không phải doanh thu',
    'COMPENSATION_IRREGULAR': 'Bồi thường / Thu bất thường'
};

const SUBTYPE_OPTIONS: Record<CashflowCategory, { value: CashflowSubtype, label: string }[]> = {
    'RENT_INCOME': [
        { value: 'RENT_MONTHLY', label: 'Thu tiền thuê tháng' },
        { value: 'RENT_PERIODIC', label: 'Thu theo kỳ (Quý/Năm)' },
        { value: 'RENT_ADVANCE', label: 'Thu trước (Advance)' },
        { value: 'RENT_LATE', label: 'Thu muộn (Truy thu)' },
        { value: 'RENT_DISCOUNT', label: 'Giảm trừ tiền thuê (Nếu có)' }
    ],
    'ASSET_OTHER_INCOME': [
        { value: 'SERVICE_FEE_TENANT', label: 'Phí dịch vụ thu thêm' },
        { value: 'UTILITY_MARKUP', label: 'Chênh lệch điện/nước' },
        { value: 'PENALTY_FEE', label: 'Phí phạt vi phạm' },
        { value: 'CONTRACT_CHANGE_FEE', label: 'Phí thay đổi HĐ' },
        { value: 'EXTRA_SPACE_RENTAL', label: 'Cho thuê thêm (Kho/Xe)' },
        { value: 'REVENUE_SHARING_COOP', label: 'Doanh thu hợp tác/chia sẻ' }
    ],
    'NON_REVENUE': [
        { value: 'SECURITY_DEPOSIT', label: 'Tiền đặt cọc (Deposit)' },
        { value: 'REFUND_DEPOSIT', label: 'Hoàn trả cọc' },
        { value: 'REIMBURSEMENT_PASS_THROUGH', label: 'Thu hộ chi hộ (Điện/Nước gốc)' },
        { value: 'LOAN_BORROW', label: 'Khoản vay / Mượn' }
    ],
    'COMPENSATION_IRREGULAR': [
        { value: 'DAMAGE_COMPENSATION', label: 'Bồi thường hư hỏng' },
        { value: 'CONTRACT_BREACH_COMPENSATION', label: 'Bồi thường phá vỡ HĐ' },
        { value: 'DEPOSIT_FORFEIT', label: 'Cọc mất (Chuyển thành DT)' },
        { value: 'RECOVER_COST', label: 'Thu hồi chi phí' }
    ]
};

const EXAMPLES: Record<CashflowCategory, string[]> = {
    'RENT_INCOME': [
        "Thu trước 120tr cho cả năm -> Chọn 'Thu theo kỳ', ghi nhận 1 lần theo ngày nhận.",
        "Thu muộn tháng 12 vào tháng 1 năm sau -> Vẫn ghi nhận vào năm nhận tiền."
    ],
    'NON_REVENUE': [
        "Nhận cọc 20tr -> Chọn 'Tiền đặt cọc', KHÔNG tính vào doanh thu.",
        "Thu hộ tiền điện 3tr trả cho điện lực -> Chọn 'Thu hộ chi hộ'."
    ],
    'ASSET_OTHER_INCOME': [
        "Phí gửi xe thu thêm 500k -> Chọn 'Phí dịch vụ'.",
        "Thu tiền điện chênh lệch (giá kinh doanh) -> Chọn 'Chênh lệch điện/nước'."
    ],
    'COMPENSATION_IRREGULAR': [
        "Khách làm hỏng cửa, đền 2tr -> Chọn 'Bồi thường hư hỏng'.",
        "Khách bỏ cọc, giữ lại 10tr -> Chọn 'Cọc mất'."
    ]
};

export const ApproveCashflowModal: React.FC<Props> = ({ entry, isOpen, onClose, onSuccess, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [revenueCodes, setRevenueCodes] = useState<RevenueCode[]>([]);
  
  // Form State
  const [category, setCategory] = useState<CashflowCategory>('RENT_INCOME');
  const [subtype, setSubtype] = useState<CashflowSubtype>('RENT_PERIODIC');
  const [revenueCode, setRevenueCode] = useState('');
  const [isTaxable, setIsTaxable] = useState(true);

  // Load codes
  useEffect(() => {
      getRevenueCodes().then(setRevenueCodes);
  }, []);

  // Intelligent Defaults based on Category
  useEffect(() => {
      if (category === 'NON_REVENUE') {
          setIsTaxable(false);
          setRevenueCode(''); // Non-revenue often doesn't need a tax code, or specific one
      } else {
          setIsTaxable(true);
          // Try to auto-pick a code based on category (simple mock matching)
          const defaultCode = revenueCodes.find(c => {
              if (category === 'RENT_INCOME' && c.code.includes('DT01')) return true;
              if (category === 'ASSET_OTHER_INCOME' && c.code.includes('DT02')) return true;
              return false;
          });
          if (defaultCode) setRevenueCode(defaultCode.code);
      }
      // Reset subtype when category changes to first available
      setSubtype(SUBTYPE_OPTIONS[category][0].value);
  }, [category, revenueCodes]);

  const handleApprove = async () => {
      if (currentUser === entry.createdBy) {
          toast("Lỗi: Người nhập không được quyền duyệt dòng tiền này.", "error");
          return;
      }
      if (category !== 'NON_REVENUE' && !revenueCode) return toast("Vui lòng chọn Mã Doanh Thu (DT Code)", "error");

      setLoading(true);
      try {
          await approveCashflow(entry.id, {
              category,
              subtype,
              revenueCode,
              isTaxable,
              type: 'RENT' // Legacy field fallback
          }, currentUser);
          toast("Đã chuẩn hóa & duyệt dòng tiền thành công!", "success");
          onSuccess();
          onClose();
      } catch (e: any) {
          toast(e.toString(), "error");
      } finally {
          setLoading(false);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duyệt & Chuẩn Hóa Dòng Tiền" size="lg">
        <div className="p-6 space-y-6">
            {/* Header: Transaction Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-start">
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giao dịch gốc (Source)</div>
                    <div className="flex items-baseline gap-3">
                        <span className="font-black text-slate-900 text-xl">{formatCurrencyTy(entry.amountTy)}</span>
                        <span className="text-xs text-slate-500 font-medium">{new Date(entry.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="text-sm text-indigo-700 font-medium mt-1">{entry.payer}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người nhập liệu</div>
                    <div className="font-bold text-slate-700 flex items-center justify-end gap-1"><User size={14}/> {entry.createdBy}</div>
                    <div className="text-xs text-slate-400 italic mt-0.5">{entry.note || 'Không có ghi chú'}</div>
                </div>
            </div>

            {currentUser === entry.createdBy && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
                    <AlertTriangle size={16}/>
                    <span>Theo quy định kiểm soát nội bộ (SOP), bạn <b>không thể tự duyệt</b> dòng tiền do mình tạo.</span>
                </div>
            )}

            {/* Categorization Form */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <BookOpen size={18} className="text-indigo-600"/>
                    <h4 className="text-sm font-bold text-slate-800">Phân loại kế toán (Tax Basis)</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Select 
                            label="1. Nhóm Dòng Tiền (Category)"
                            value={category}
                            onChange={(v) => setCategory(v as CashflowCategory)}
                            options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ label: v, value: k }))}
                        />
                        <Select 
                            label="2. Chi tiết (Subtype)"
                            value={subtype}
                            onChange={(v) => setSubtype(v as CashflowSubtype)}
                            options={SUBTYPE_OPTIONS[category]}
                        />
                    </div>

                    <div className="space-y-4">
                        {category !== 'NON_REVENUE' && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <Select 
                                    label="3. Mã Doanh Thu (DT Code)"
                                    placeholder="Chọn mã DT..."
                                    value={revenueCode}
                                    onChange={setRevenueCode}
                                    options={revenueCodes.map(c => ({ label: `${c.code} - ${c.name}`, value: c.code }))}
                                />
                            </div>
                        )}
                        
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-700">Tính thuế (Taxable)</span>
                                <Switch checked={isTaxable} onChange={setIsTaxable} />
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">
                                {isTaxable 
                                    ? "Số tiền này sẽ được cộng vào doanh thu tính thuế của chủ nhà trong năm nay." 
                                    : "Số tiền này KHÔNG tính vào doanh thu chịu thuế (VD: Cọc, Thu hộ)."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Examples/Tips */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700">
                        <Info size={16}/>
                        <span className="text-xs font-bold uppercase tracking-wide">Hướng dẫn nhanh ({CATEGORY_LABELS[category]})</span>
                    </div>
                    <ul className="space-y-1.5 ml-1">
                        {EXAMPLES[category].map((ex, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0"/>
                                <span>{ex}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Warning for Rent Allocation */}
            {category === 'RENT_INCOME' && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800">
                    <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                    <div>
                        <b>Lưu ý Cash Basis:</b> Doanh thu sẽ được ghi nhận vào ngày <b>{new Date(entry.date).toLocaleDateString('vi-VN')}</b> (ngày nhận tiền), không phụ thuộc vào kỳ thanh toán trên hợp đồng.
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Hủy bỏ</Button>
                <Button 
                    className="flex-1 shadow-lg shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700 gap-2" 
                    onClick={handleApprove} 
                    disabled={loading || currentUser === entry.createdBy || (category !== 'NON_REVENUE' && !revenueCode)}
                >
                    <CheckCircle2 size={18}/> 
                    {loading ? "Đang xử lý..." : "Xác nhận Duyệt"}
                </Button>
            </div>
        </div>
    </Modal>
  );
};
