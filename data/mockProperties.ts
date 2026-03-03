
export interface Property {
  id: string;
  code: string;
  name: string;
  purpose: "ban" | "cho_thue";
  type: "chung_cu" | "lien_ke" | "nha_rieng" | "dat_nen" | "biet_thu" | "trang_trai" | "shophouse_kiosk" | "bds_khac";
  project: string;
  ward: string;
  areaM2: number;
  legalStatus: "chua_so_do" | "co_so_do" | "dong_tien_do";
  rentPricePerM2?: number; // In Million/m2 or just raw number
  rentTotalTy?: number;
  sellPricePerM2?: number; // In Million/m2
  sellTotalTy?: number;
  brokerFee?: string;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "123",
    code: "#123",
    name: "CC 2PN Ocean Park View Biển",
    purpose: "ban",
    type: "chung_cu",
    project: "Vinhomes Ocean Park",
    ward: "Đa Tốn",
    areaM2: 64,
    legalStatus: "co_so_do",
    sellPricePerM2: 45,
    sellTotalTy: 2.88,
    brokerFee: "3%",
    createdAt: "2023-11-20T08:30:00Z",
    updatedAt: "2023-11-29T10:15:00Z"
  },
  {
    id: "124",
    code: "#124",
    name: "LK KĐT Văn Phú Lô Góc",
    purpose: "ban",
    type: "lien_ke",
    project: "KĐT Văn Phú",
    ward: "Phú La",
    areaM2: 90,
    legalStatus: "co_so_do",
    sellPricePerM2: 120,
    sellTotalTy: 10.8,
    brokerFee: "200tr",
    createdAt: "2023-11-18T14:20:00Z",
    updatedAt: "2023-11-28T09:00:00Z"
  },
  {
    id: "125",
    code: "#125",
    name: "Nhà riêng ngõ 3 Thái Hà",
    purpose: "cho_thue",
    type: "nha_rieng",
    project: "Nhà dân",
    ward: "Trung Liệt",
    areaM2: 45,
    legalStatus: "co_so_do",
    rentPricePerM2: 0.33,
    rentTotalTy: 0.015, // 15 trieu
    brokerFee: "1 tháng",
    createdAt: "2023-11-25T11:00:00Z",
    updatedAt: "2023-11-29T16:45:00Z"
  },
  {
    id: "126",
    code: "#126",
    name: "Biệt thự Ecopark Vườn Tùng",
    purpose: "ban",
    type: "biet_thu",
    project: "Ecopark",
    ward: "Xuân Quan",
    areaM2: 300,
    legalStatus: "dong_tien_do",
    sellPricePerM2: 100,
    sellTotalTy: 30,
    brokerFee: "1%",
    createdAt: "2023-11-15T09:00:00Z",
    updatedAt: "2023-11-29T08:00:00Z"
  },
  {
    id: "127",
    code: "#127",
    name: "Đất nền Hòa Lạc 200m2",
    purpose: "ban",
    type: "dat_nen",
    project: "Tái định cư ĐHQG",
    ward: "Thạch Hòa",
    areaM2: 200,
    legalStatus: "chua_so_do",
    sellPricePerM2: 25,
    sellTotalTy: 5,
    brokerFee: "100tr",
    createdAt: "2023-11-10T10:30:00Z",
    updatedAt: "2023-11-27T14:20:00Z"
  }
];
