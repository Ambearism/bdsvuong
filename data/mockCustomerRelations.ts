
export type RelationType = 
  | "vo_chong" 
  | "anh_chi_em" 
  | "ho_hang" 
  | "ban_be" 
  | "dong_nghiep" 
  | "gioi_thieu" 
  | "duoc_gioi_thieu" 
  | "dong_so_huu" 
  | "dai_dien";

export interface CustomerRelation {
  id: string;
  customerAId: string;
  customerBId: string; // The related customer
  relationType: RelationType;
  relatedPropertyId?: string;
  note?: string;
  createdAt: string;
}

export const RELATION_LABELS: Record<RelationType, string> = {
  vo_chong: "Vợ / Chồng",
  anh_chi_em: "Anh / Chị / Em ruột",
  ho_hang: "Họ hàng",
  ban_be: "Bạn bè",
  dong_nghiep: "Đồng nghiệp",
  gioi_thieu: "Giới thiệu (Referrer)",
  duoc_gioi_thieu: "Được giới thiệu bởi",
  dong_so_huu: "Đồng sở hữu BĐS",
  dai_dien: "Người đại diện / Ủy quyền",
};

export const MOCK_CUSTOMER_RELATIONS: CustomerRelation[] = [
  {
    id: "rel_1",
    customerAId: "cus_1",
    customerBId: "cus_2",
    relationType: "vo_chong",
    note: "Vợ chồng cùng mua nhà",
    createdAt: "2023-10-16T09:00:00Z"
  },
  {
    id: "rel_2",
    customerAId: "cus_1",
    customerBId: "cus_3",
    relationType: "ban_be",
    note: "Bạn thân đại học",
    createdAt: "2023-11-01T10:00:00Z"
  },
  {
    id: "rel_3",
    customerAId: "cus_1",
    customerBId: "cus_4",
    relationType: "gioi_thieu",
    note: "Giới thiệu mua căn hộ Ocean Park",
    createdAt: "2023-11-15T14:00:00Z"
  }
];
