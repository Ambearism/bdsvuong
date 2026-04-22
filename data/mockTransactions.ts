
import { Transaction } from '../types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TX000123",
    createdAt: "2023-11-15T09:00:00Z",
    updatedAt: "2023-11-28T14:30:00Z",
    source: "auto_from_deal",
    dealId: "DEAL-1001",
    customerId: "cus_1",
    customerCode: "#C00123",
    customerName: "Nguyễn Văn An",
    customerPhone: "0912345678",
    propertyId: "123",
    propertyCode: "#123",
    propertyName: "CC 2PN Ocean Park View Biển",
    propertyType: "Chung Cư",
    purpose: "ban",
    project: "Vinhomes Ocean Park",
    ward: "Đa Tốn",
    areaM2: 64,
    dealValueTy: 2.88,
    depositAmountTy: 0.1,
    commissionFee: "3%",
    status: "ky_hop_dong",
    legalStatus: "co_so_do",
    assigneeName: "Trịnh Trung Hiếu",
    internalNote: "Khách đang đợi làm thủ tục vay ngân hàng VPBank.",
    documents: [
      { id: "doc_1", fileName: "Thoa_Thuan_Coc_TX123.pdf", fileType: "pdf", fileSizeKb: 450, uploadedAt: "2023-11-15T10:00:00Z", uploadedBy: "System", category: "Biên nhận cọc" }
    ],
    hasContract: false,
    hasDepositProof: true,
    riskFlag: "ok"
  },
  {
    id: "TX000124",
    createdAt: "2023-11-20T11:00:00Z",
    updatedAt: "2023-11-29T10:00:00Z",
    source: "manual_admin",
    customerId: "cus_3",
    customerCode: "#C00125",
    customerName: "Phạm Minh Cường",
    customerPhone: "0909090909",
    propertyId: "125",
    propertyCode: "#125",
    propertyName: "Nhà riêng ngõ 3 Thái Hà",
    propertyType: "Nhà Riêng",
    purpose: "cho_thue",
    project: "Nhà dân",
    ward: "Trung Liệt",
    areaM2: 45,
    dealValueTy: 0.015,
    depositAmountTy: 0.015,
    commissionFee: "1 tháng",
    status: "hoan_tat",
    legalStatus: "co_so_do",
    assigneeName: "Nguyễn Văn Sale",
    internalNote: "Đã bàn giao chìa khóa và kiểm kê tài sản.",
    documents: [
      { id: "doc_2", fileName: "HD_Thue_Nha_Thai_Ha.docx", fileType: "docx", fileSizeKb: 1200, uploadedAt: "2023-11-25T11:00:00Z", uploadedBy: "Nguyễn Văn Sale", category: "Hợp đồng" }
    ],
    hasContract: true,
    hasDepositProof: true,
    riskFlag: "ok"
  }
];
