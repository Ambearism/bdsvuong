
export type CustomerSegment = "chu_nha" | "nha_dau_tu" | "mua_o" | "thue" | "ctv" | "khac";
export type CustomerSource = "website" | "zalo" | "facebook" | "hotline" | "gioi_thieu" | "ctv" | "van_phong" | "khac";
export type CustomerStatus = "dang_cham" | "tiem_nang" | "dang_deal" | "da_mua" | "da_thue" | "ngung";

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  segment: CustomerSegment;
  source: CustomerSource;
  status: CustomerStatus;
  assigneeName: string;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cus_1",
    code: "#C00123",
    name: "Nguyễn Văn An",
    phone: "0912345678",
    email: "an.nguyen@gmail.com",
    segment: "nha_dau_tu",
    source: "facebook",
    status: "dang_deal",
    assigneeName: "Trịnh Trung Hiếu",
    createdAt: "2023-10-15T08:00:00Z",
    updatedAt: "2023-11-28T10:00:00Z"
  },
  {
    id: "cus_2",
    code: "#C00124",
    name: "Trần Thị Bích",
    phone: "0987654321",
    email: "bich.tran@company.com",
    segment: "mua_o",
    source: "website",
    status: "dang_cham",
    assigneeName: "Lê Thị B",
    createdAt: "2023-11-01T09:30:00Z",
    updatedAt: "2023-11-29T14:20:00Z"
  },
  {
    id: "cus_3",
    code: "#C00125",
    name: "Phạm Minh Cường",
    phone: "0909090909",
    segment: "chu_nha",
    source: "gioi_thieu",
    status: "da_mua",
    assigneeName: "Nguyễn Văn Sale",
    createdAt: "2023-09-20T11:00:00Z",
    updatedAt: "2023-11-25T16:00:00Z"
  },
  {
    id: "cus_4",
    code: "#C00126",
    name: "Lê Thu Hà",
    phone: "0911223344",
    email: "ha.le@outlook.com",
    segment: "thue",
    source: "hotline",
    status: "tiem_nang",
    assigneeName: "Trịnh Trung Hiếu",
    createdAt: "2023-11-10T14:00:00Z",
    updatedAt: "2023-11-29T09:00:00Z"
  },
  {
    id: "cus_5",
    code: "#C00127",
    name: "Hoàng Văn Em",
    phone: "0933445566",
    segment: "ctv",
    source: "van_phong",
    status: "ngung",
    assigneeName: "Lê Thị B",
    createdAt: "2023-08-05T10:00:00Z",
    updatedAt: "2023-10-20T11:00:00Z"
  }
];
