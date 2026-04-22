
export type LinkRole = 
  | "quan_tam" 
  | "da_xem" 
  | "dang_dam_phan" 
  | "dat_coc" 
  | "da_mua" 
  | "da_thue" 
  | "chu_so_huu" 
  | "dong_so_huu" 
  | "nguoi_gioi_thieu";

export interface CustomerPropertyLink {
  id: string;
  customerId: string;
  propertyId: string;
  role: LinkRole;
  ownershipPercent?: number; // 0-100
  note?: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<LinkRole, string> = {
  quan_tam: "Quan tâm",
  da_xem: "Đã đi xem",
  dang_dam_phan: "Đang đàm phán",
  dat_coc: "Đã đặt cọc",
  da_mua: "Đã mua",
  da_thue: "Đã thuê",
  chu_so_huu: "Chủ sở hữu (Bán/Cho thuê)",
  dong_so_huu: "Đồng sở hữu",
  nguoi_gioi_thieu: "Người giới thiệu",
};

export const MOCK_CUSTOMER_PROPERTY_LINKS: CustomerPropertyLink[] = [
  {
    id: "link_1",
    customerId: "cus_1",
    propertyId: "123", // CC Ocean Park
    role: "quan_tam",
    note: "Thích view biển, tài chính 3 tỷ",
    createdAt: "2023-11-20T08:30:00Z"
  },
  {
    id: "link_2",
    customerId: "cus_1",
    propertyId: "126", // BT Ecopark
    role: "da_xem",
    note: "Đã xem ngày 25/11, đang cân nhắc giá",
    createdAt: "2023-11-25T15:00:00Z"
  },
  {
    id: "link_3",
    customerId: "cus_3",
    propertyId: "125", // Nhà riêng Thái Hà
    role: "chu_so_huu",
    ownershipPercent: 100,
    note: "Gửi bán độc quyền",
    createdAt: "2023-09-20T11:00:00Z"
  }
];
