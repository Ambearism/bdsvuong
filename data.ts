import { DashboardData, DetailedFilterState, FilterState, FunnelStage, InventoryCategory, InventoryDetailedItem, KPIItem, Lead, LeadDashboardData, LeadFilterState, LeadSource, RevenueData, Deal, DealDashboardData, DealFilterState, DealStage, PipelineCard, PipelineStageKey, Staff, Role, PermissionGroup } from './types';

// Base data
const kpiBase: KPIItem[] = [
  { id: '1', label: 'Lead Mới', value: 248, changeValue: '+12% Cùng Kỳ', changeType: 'positive', tooltip: 'Tổng số khách mới trong kỳ' },
  { id: '2', label: 'Deal Đang Mở', value: 73, changeValue: '+5 Deals', changeType: 'positive', tooltip: 'Các giao dịch đang mở' },
  { id: '3', label: 'Deal Chốt Thành Công', value: 21, changeValue: '+3 Giao Dịch', changeType: 'positive', tooltip: 'Giao dịch đã chốt' },
  { id: '4', label: 'Giao Dịch Hoàn Tất (Giá Trị)', value: 69000, unit: 'triệu', changeValue: '+9,2 Tỷ', changeType: 'positive', tooltip: 'Giá trị giao dịch' },
  { id: '5', label: 'Giá Trị Hàng Tồn (Bán)', value: 78522000, unit: 'triệu', changeValue: '-2,3%', changeType: 'negative', tooltip: 'Hàng tồn kho' },
  { id: '6', label: 'Tỷ Lệ Lead → Giao Dịch', value: 4.7, unit: '%', changeValue: '↗ Funnel Cải Thiện', changeType: 'positive', tooltip: 'Tỷ lệ chốt' },
];

const funnelBase: FunnelStage[] = [
  { key: "lead_moi", label: "LEAD MỚI", count: 450, percent: 100, side: "right", color: "#15803d" },
  { key: "dang_cham", label: "ĐANG CHĂM", count: 320, percent: 71.1, side: "left", color: "#22c55e" },
  { key: "hen_xem_nha", label: "HẸN XEM NHÀ", count: 215, percent: 47.7, side: "right", color: "#facc15" },
  { key: "deal_mo", label: "DEAL MỞ", count: 140, percent: 31.1, side: "left", color: "#f97316" },
  { key: "dam_phan", label: "ĐÀM PHÁN", count: 85, percent: 18.8, side: "right", color: "#ef4444" },
  { key: "dat_coc", label: "ĐẶT CỌC", count: 32, percent: 7.1, side: "left", color: "#60a5fa" },
  { key: "gd_hoan_tat", label: "GIAO DỊCH HOÀN TẤT", count: 18, percent: 4.0, side: "right", color: "#1e40af" },
];

const sourceBase: LeadSource[] = [
  { name: 'Quảng cáo Facebook', value: 180, deals: 5, color: '#3b82f6' },
  { name: 'Tìm kiếm Google', value: 120, deals: 6, color: '#ef4444' },
  { name: 'Giới Thiệu (Ref)', value: 60, deals: 5, color: '#10b981' },
  { name: 'Sự Kiện / Event', value: 50, deals: 1, color: '#f59e0b' },
  { name: 'Zalo / Direct', value: 40, deals: 1, color: '#8b5cf6' },
];

const revenueBase: RevenueData[] = [
  { name: 'T2', completed: 8.5, pending: 12, cancelled: 0 },
  { name: 'T3', completed: 12.0, pending: 15, cancelled: 2 },
  { name: 'T4', completed: 25.5, pending: 20, cancelled: 1.5 },
  { name: 'T5', completed: 18.2, pending: 28, cancelled: 5 },
  { name: 'T6', completed: 32.5, pending: 22, cancelled: 3 },
  { name: 'T7', completed: 15.8, pending: 18, cancelled: 0 },
  { name: 'CN', completed: 0, pending: 5, cancelled: 0 },
];

const inventoryBase: InventoryCategory[] = [
  { category: 'Căn Hộ CC', sell: 1250, rent: 450 },
  { category: 'Nhà Phố', sell: 1800, rent: 200 },
  { category: 'Biệt Thự', sell: 1500, rent: 150 },
  { category: 'Đất Nền', sell: 400, rent: 0 },
  { category: 'Shophouse', sell: 350, rent: 180 },
  { category: 'Khác', sell: 120, rent: 50 },
];

const inventoryDetailedBase: InventoryDetailedItem[] = [
  { type: "Chung Cư", sell: { count: 450, value: 1250, fee: 25 }, rent: { count: 120, value: 450, fee: 4.5 } },
  { type: "Liên Kế", sell: { count: 120, value: 980, fee: 19.6 }, rent: { count: 15, value: 50, fee: 0.5 } },
  { type: "Biệt Thự", sell: { count: 85, value: 1500, fee: 30 }, rent: { count: 22, value: 150, fee: 1.5 } },
  { type: "Nhà Riêng", sell: { count: 320, value: 1800, fee: 36 }, rent: { count: 80, value: 200, fee: 2.0 } },
  { type: "Đất Nền", sell: { count: 210, value: 400, fee: 8 }, rent: { count: 0, value: 0, fee: 0 } },
  { type: "Shophouse", sell: { count: 45, value: 350, fee: 7 }, rent: { count: 60, value: 180, fee: 1.8 } },
  { type: "Nghỉ Dưỡng", sell: { count: 30, value: 280, fee: 5.6 }, rent: { count: 40, value: 80, fee: 0.8 } },
  { type: "BĐS Khác", sell: { count: 15, value: 120, fee: 2.4 }, rent: { count: 10, value: 50, fee: 0.5 } },
];

// --- LEAD MOCK GENERATOR ---
const NAMES = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E", "Ngô Thị F", "Vũ Văn G", "Đặng Thị H", "Bùi Văn I", "Đỗ Thị K"];
const AREAS = ["P.Hà Đông", "P.Dương Nội", "P.Yên Nghĩa", "P.La Khê", "P.Mộ Lao"];
const SOURCES = ["website", "zalo", "facebook", "hotline", "ctv", "van_phong", "gioi_thieu"];
const ASSIGNEES = ["Lê Thị B", "Nguyễn Văn Sale", "Trịnh Trung Hiếu", "Trần Chuyên Viên", "Hoàng Quản Lý"];
const STATUSES = ["lead_moi", "dang_cham", "hen_xem_nha", "deal_mo", "dam_phan", "dat_coc", "gd_hoan_tat", "that_bai"];

const generateLeads = (count: number): Lead[] => {
  return Array.from({ length: count }, (_, i) => {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)] as any;
    const hasDeal = status === "hen_xem_nha" || status === "deal_mo" || status === "dam_phan" || status === "dat_coc" || status === "gd_hoan_tat";

    return {
      id: `#00${1000 + i}`,
      customerName: NAMES[Math.floor(Math.random() * NAMES.length)],
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      need: Math.random() > 0.7 ? "thue" : (Math.random() > 0.9 ? "ky_gui_ban" : "mua"),
      propertyType: Math.random() > 0.5 ? "Chung Cư" : (Math.random() > 0.5 ? "Liền Kề" : "Biệt Thự"),
      area: AREAS[Math.floor(Math.random() * AREAS.length)],
      budgetTy: parseFloat((Math.random() * 20 + 2).toFixed(2)),
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)] as any,
      assignee: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)],
      status: status,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 100000000).toISOString(),
      hasDeal: hasDeal,
      dealId: hasDeal ? `DEAL-${100 + i}` : undefined
    };
  });
};

export const ALL_LEADS = generateLeads(150);

// --- DEAL MOCK GENERATOR ---
const DEAL_STAGES = ["deal_mo", "dam_phan", "dat_coc", "gd_hoan_tat", "huy_that_bai"];
const PROPERTY_LABELS = [
  "Chung Cư", "Liên Kế", "Biệt Thự", "Nhà Riêng", "Đất Nền",
  "Biệt thự nhà vườn - Trang trại", "Ki-ot & Sàn thương mại", "Khách sạn nghỉ dưỡng", "BĐS Khác"
];

const generateDeals = (count: number): Deal[] => {
  return Array.from({ length: count }, (_, i) => {
    const lead = ALL_LEADS[i % ALL_LEADS.length];
    const stage = DEAL_STAGES[Math.floor(Math.random() * DEAL_STAGES.length)] as DealStage;

    return {
      id: `DEAL-${1000 + i}`,
      leadId: lead.id,
      customerId: `#KH${100 + i}`,
      customerName: lead.customerName,
      phone: lead.phone,
      need: lead.need,
      propertyType: PROPERTY_LABELS[Math.floor(Math.random() * PROPERTY_LABELS.length)],
      area: lead.area,
      budgetTy: lead.budgetTy,
      source: lead.source,
      assignee: lead.assignee,
      stage: stage,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    };
  });
};

export const ALL_DEALS = generateDeals(100);

export const getDashboardData = (filter: DetailedFilterState): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let multiplier = 1;
      if (filter.timeRange === '30_ngay_gan_nhat' || filter.timeRange === 'thang_nay') multiplier = 2.5;
      if (filter.timeRange === 'quy_nay') multiplier = 5;

      const kpi = kpiBase.map(item => ({
        ...item,
        value: item.id === '5' || item.id === '6' ? item.value : Math.round(item.value * multiplier)
      }));

      let inventoryDetailed = inventoryDetailedBase.map(item => ({
        ...item,
        sell: {
          count: Math.round(item.sell.count * multiplier),
          value: item.sell.value * multiplier,
          fee: item.sell.fee * multiplier
        },
        rent: {
          count: Math.round(item.rent.count * multiplier),
          value: item.rent.value * multiplier,
          fee: item.rent.fee * multiplier
        }
      }));

      if (filter.propertyType !== 'tat_ca') {
        const mapping: Record<string, string> = {
          "chung_cu": "Chung Cư",
          "lien_ke": "Liên Kế",
          "biet_thu": "Biệt Thự",
          "nha_rieng": "Nhà Riêng",
          "dat_nen": "Đất Nền",
          "shophouse_kiosk": "Shophouse",
          "nghi_duong": "Nghỉ Dưỡng",
          "bds_khac": "BĐS Khác"
        };
        const target = mapping[filter.propertyType];
        if (target) {
          inventoryDetailed = inventoryDetailed.filter(i => i.type === target);
        }
      }

      resolve({
        kpi,
        funnel: funnelBase,
        leadSources: sourceBase,
        revenue: revenueBase,
        inventory: inventoryBase,
        inventoryDetailed
      });
    }, 600);
  });
};

export const getLeads = (filter: LeadFilterState): Promise<LeadDashboardData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock random error (5%)
      if (Math.random() < 0.05) {
        // reject(new Error("Network Error")); // Uncomment to test error state
      }

      let filtered = [...ALL_LEADS];

      // Filtering logic
      if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(l =>
          l.customerName.toLowerCase().includes(s) ||
          l.id.toLowerCase().includes(s) ||
          l.phone.includes(s)
        );
      }
      if (filter.source !== 'tat_ca') filtered = filtered.filter(l => l.source === filter.source);
      if (filter.status !== 'tat_ca') filtered = filtered.filter(l => l.status === filter.status);
      if (filter.need !== 'tat_ca') filtered = filtered.filter(l => l.need === filter.need);
      if (filter.propertyType !== 'tat_ca') {
        const mapping: Record<string, string> = {
          "chung_cu": "Chung Cư",
          "lien_ke": "Liền Kề",
          "biet_thu": "Biệt Thự",
          "nha_rieng": "Nhà Riêng",
          "dat_nen": "Đất Nền"
        };
        const target = mapping[filter.propertyType];
        if (target) filtered = filtered.filter(l => l.propertyType === target);
      }
      if (filter.area !== 'tat_ca') filtered = filtered.filter(l => l.area === filter.area);
      if (filter.assignee !== 'tat_ca') filtered = filtered.filter(l => l.assignee === filter.assignee);

      // Budget filtering (mock)
      if (filter.budget !== 'tat_ca') {
        if (filter.budget === 'duoi_5') filtered = filtered.filter(l => l.budgetTy < 5);
        else if (filter.budget === '5_10') filtered = filtered.filter(l => l.budgetTy >= 5 && l.budgetTy < 10);
        else if (filter.budget === '10_15') filtered = filtered.filter(l => l.budgetTy >= 10 && l.budgetTy < 15);
        else if (filter.budget === '15_20') filtered = filtered.filter(l => l.budgetTy >= 15 && l.budgetTy < 20);
        else if (filter.budget === 'tren_20') filtered = filtered.filter(l => l.budgetTy >= 20);
      }

      const totalCount = filtered.length;

      // Pagination
      const start = (filter.page - 1) * filter.pageSize;
      const end = start + filter.pageSize;
      const sliced = filtered.slice(start, end);

      resolve({
        leads: sliced,
        totalCount,
        kpi: {
          total: 1284,
          newThisWeek: 32,
          leadToDeal: 47,
          conversionRate: 21.5
        }
      });
    }, 600); // 600ms latency
  });
};

export const getDeals = (filter: DealFilterState): Promise<DealDashboardData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock random error (5%)
      if (Math.random() < 0.05) {
        // reject(new Error("Mock Error")); 
      }

      let filtered = [...ALL_DEALS];

      // Search
      if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(d =>
          d.customerName.toLowerCase().includes(s) ||
          d.customerId.toLowerCase().includes(s) ||
          d.phone.includes(s)
        );
      }

      // Enum filters
      if (filter.source !== 'tat_ca') filtered = filtered.filter(d => d.source === filter.source);
      if (filter.stage !== 'tat_ca') filtered = filtered.filter(d => d.stage === filter.stage);
      if (filter.assignee !== 'tat_ca') filtered = filtered.filter(d => d.assignee === filter.assignee);
      if (filter.need !== 'tat_ca') filtered = filtered.filter(d => d.need === filter.need);
      if (filter.area !== 'tat_ca') filtered = filtered.filter(d => d.area === filter.area);

      // Property Type (Mapping logic for demo)
      if (filter.propertyType !== 'tat_ca') {
        // Simplified matching, normally ID based
        const map: Record<string, string> = { "chung_cu": "Chung Cư", "lien_ke": "Liên Kế", "biet_thu": "Biệt Thự" };
        const label = map[filter.propertyType];
        if (label) filtered = filtered.filter(d => d.propertyType === label);
      }

      // Budget
      if (filter.budget !== 'tat_ca') {
        if (filter.budget === 'duoi_5') filtered = filtered.filter(l => l.budgetTy < 5);
        else if (filter.budget === '5_10') filtered = filtered.filter(l => l.budgetTy >= 5 && l.budgetTy < 10);
        else if (filter.budget === '10_15') filtered = filtered.filter(l => l.budgetTy >= 10 && l.budgetTy < 15);
        else if (filter.budget === '15_20') filtered = filtered.filter(l => l.budgetTy >= 15 && l.budgetTy < 20);
        else if (filter.budget === 'tren_20') filtered = filtered.filter(l => l.budgetTy >= 20);
      }

      const totalCount = filtered.length;
      // Alignment with updated DealStage type values
      const wonDeals = filtered.filter(d => d.stage === 'gd_hoan_tat').length;
      const newThisWeek = filtered.filter(d => {
        const date = new Date(d.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }).length;

      const start = (filter.page - 1) * filter.pageSize;
      const end = start + filter.pageSize;
      const sliced = filtered.slice(start, end);

      resolve({
        deals: sliced,
        totalCount,
        kpi: {
          totalDeals: totalCount,
          newThisWeek,
          wonDeals,
          conversionRate: totalCount > 0 ? parseFloat(((wonDeals / totalCount) * 100).toFixed(1)) : 0
        }
      });

    }, 600);
  });
};

// --- PIPELINE MOCK DATA ---
const STAGES: PipelineStageKey[] = [
  "lead_moi", "dang_cham", "hen_xem_nha", "deal_mo", "dam_phan", "dat_coc", "gd_hoan_tat", "that_bai"
];

export const generatePipelineData = (): PipelineCard[] => {
  return Array.from({ length: 60 }, (_, i) => {
    const stage = STAGES[Math.floor(Math.random() * STAGES.length)];
    const hasDeal = ["deal_mo", "dam_phan", "dat_coc", "gd_hoan_tat"].includes(stage);

    return {
      id: `card-${i}`,
      customerName: NAMES[Math.floor(Math.random() * NAMES.length)],
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      propertyType: Math.random() > 0.5 ? "Chung Cư" : "Liền Kề",
      need: Math.random() > 0.5 ? "mua" : "thue",
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)] as any,
      budgetRangeText: `${(Math.random() * 5 + 2).toFixed(1)} - ${(Math.random() * 10 + 5).toFixed(1)} tỷ`,
      areaText: AREAS[Math.floor(Math.random() * AREAS.length)],
      notes: Math.random() > 0.4 ? ["Gọi lại cho khách", "Hẹn khách tại văn phòng", "Cần tư vấn thêm về pháp lý"] : [],
      tasks: Math.random() > 0.5 ? [{
        id: `task-${i}`,
        title: "Gửi báo giá chi tiết",
        assigneeName: "Trịnh Trung Hiếu",
        assignee: "user_1",
        dueAt: new Date(Date.now() + 86400 * 1000 * 2).toISOString()
      }] : [],
      stage: stage,
      hasDeal: hasDeal,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      assignee: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)]
    }
  });
}
const MOCK_PIPELINE_DATA = generatePipelineData();

export const getPipelineCards = (): Promise<PipelineCard[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_PIPELINE_DATA]);
    }, 500);
  });
}

// --- WIZARD MOCK DATA ---
export const MOCK_USERS = [
  { value: "user_1", label: "Trịnh Trung Hiếu" },
  { value: "user_2", label: "Lê Thị B" },
  { value: "user_3", label: "Nguyễn Văn Sale" },
  { value: "user_4", label: "Trần Chuyên Viên" },
];

export const MOCK_CITIES = [
  { value: "ha_noi", label: "Hà Nội" },
  { value: "hcm", label: "TP. Hồ Chí Minh" },
  { value: "da_nang", label: "Đà Nẵng" },
];

export const MOCK_WARDS = [
  { value: "duong_noi", label: "P.Dương Nội" },
  { value: "ha_dong", label: "P.Hà Đông" },
  { value: "yen_nghia", label: "P.Yên Nghĩa" },
  { value: "la_khe", label: "P.La Khê" },
];

export const MOCK_PROPERTIES = [
  {
    id: "prop_1",
    name: "Chung cư CT4 The Pride (80m2) - Tầng 12",
    project: "KĐT An Hưng",
    area: 80,
    price: 3.2,
    address: "Tố Hữu, La Khê, Hà Đông",
    city: "ha_noi",
    ward: "la_khe"
  },
  {
    id: "prop_2",
    name: "Liền kề K Park - Lô 22 (120m2)",
    project: "KĐT Văn Phú",
    area: 120,
    price: 12.5,
    address: "Văn Phú, Hà Đông",
    city: "ha_noi",
    ward: "ha_dong"
  },
  {
    id: "prop_3",
    name: "Biệt thự Dương Nội (200m2)",
    project: "KĐT Dương Nội",
    area: 200,
    price: 25.0,
    address: "Lê Trọng Tấn, Hà Đông",
    city: "ha_noi",
    ward: "duong_noi"
  },
];

// --- DEAL WIZARD MOCKS ---
export const MOCK_LEAD_SELECT_OPTIONS = ALL_LEADS.slice(0, 15).map(l => ({
  value: l.id,
  label: `${l.id} - ${l.customerName} - ${l.phone} (${l.status})`,
  raw: l
}));

export const MOCK_DEAL_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'hotline', label: 'Hotline' },
  { value: 'ctv', label: 'CTV' },
  { value: 'van_phong', label: 'Văn phòng' },
  { value: 'gioi_thieu', label: 'Giới thiệu' },
  { value: 'khac', label: 'Khác' },
];


// --- STAFF & ROLES MOCK DATA ---
export const ALL_ROLES: Role[] = [
  { id: 'role_1', name: 'Quản trị', color: 'indigo', permissions: ['view_all', 'manage_staff', 'manage_roles'] },
  { id: 'role_2', name: 'Chuyên viên', color: 'emerald', permissions: ['view_assigned', 'create_lead'] },
  { id: 'role_3', name: 'Cộng tác viên', color: 'amber', permissions: ['view_assigned'] },
];

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: 'Sản phẩm',
    permissions: [
      { id: 'p1', name: 'Xem hàng hoá', key: 'view_property', category: 'Sản phẩm', description: 'Cho phép xem danh sách hàng hoá', isEnabled: true },
      { id: 'p2', name: 'Tạo hàng hoá', key: 'create_property', category: 'Sản phẩm', description: 'Cho phép tạo hàng hoá mới', isEnabled: true },
      { id: 'p3', name: 'Chỉnh sửa hàng hoá', key: 'edit_property', category: 'Sản phẩm', description: 'Cho phép chỉnh sửa hàng hoá', isEnabled: true },
      { id: 'p4', name: 'Xóa hàng hoá', key: 'delete_property', category: 'Sản phẩm', description: 'Cho phép xóa hàng hoá', isEnabled: false },
    ]
  },
  {
    category: 'Dự án',
    permissions: [
      { id: 'p5', name: 'Xem dự án', key: 'view_project', category: 'Dự án', description: 'Cho phép xem danh sách dự án', isEnabled: true },
      { id: 'p6', name: 'Tạo dự án', key: 'create_project', category: 'Dự án', description: 'Cho phép tạo dự án mới', isEnabled: true },
      { id: 'p7', name: 'Chỉnh sửa dự án', key: 'edit_project', category: 'Dự án', description: 'Cho phép chỉnh sửa dự án', isEnabled: true },
      { id: 'p8', name: 'Xóa dự án', key: 'delete_project', category: 'Dự án', description: 'Cho phép xóa dự án', isEnabled: false },
    ]
  },
  {
    category: 'Lead',
    permissions: [
      { id: 'p10', name: 'Xem Lead', key: 'view_lead', category: 'Lead', description: 'Cho phép xem danh sách Lead', isEnabled: true },
      { id: 'p11', name: 'Tạo Khách', key: 'create_lead', category: 'Khách', description: 'Cho phép tạo Khách mới', isEnabled: true },
      { id: 'p12', name: 'Chuyển trạng thái Lead', key: 'status_lead', category: 'Lead', description: 'Cho phép chuyển trạng thái Lead', isEnabled: true },
    ]
  },
  {
    category: 'Giao dịch',
    permissions: [
      { id: 'p20', name: 'Xem Giao dịch', key: 'view_tx', category: 'Giao dịch', description: 'Cho phép xem danh sách Giao dịch', isEnabled: true },
      { id: 'p21', name: 'Tạo Giao dịch', key: 'create_tx', category: 'Giao dịch', description: 'Cho phép tạo Giao dịch mới', isEnabled: true },
    ]
  }
];

export const ALL_STAFF: Staff[] = [
  {
    id: '1',
    name: 'Trần Tiến',
    phone: '01669221113',
    email: 'tientm185@gmail.com',
    title: '--',
    yearsOfExp: 10,
    roleId: 'role_2',
    roleName: 'Chuyên viên',
    status: 'active',
    createdAt: '2026-01-19T10:14:00Z',
    updatedAt: '2026-02-27T10:23:00Z',
    avatar: 'https://i.pravatar.cc/150?u=1',
    facebook: 'https://facebook.com/trantien'
  },
  {
    id: '2',
    name: 'Trịnh Trung Hiếu',
    phone: '0906205887',
    email: 'batdongsonhadong2014@gmail.com',
    title: '--',
    yearsOfExp: 0,
    roleId: 'role_1',
    roleName: 'Quản trị',
    status: 'active',
    createdAt: '2016-09-07T10:41:00Z',
    updatedAt: '2026-02-11T09:22:00Z',
    avatar: 'https://i.pravatar.cc/150?u=2',
    facebook: 'https://facebook.com/trunghieu'
  },
  {
    id: '14',
    name: 'Nguyễn Đình Khoa',
    phone: '0975452307',
    email: 'nguyendinhkhoa@bdsv.tech',
    title: 'Chuyên viên môi giới',
    yearsOfExp: 2,
    roleId: 'role_2',
    roleName: 'Chuyên viên',
    status: 'active',
    createdAt: '2017-05-12T14:58:00Z',
    updatedAt: '2026-02-25T16:57:00Z',
    avatar: 'https://i.pravatar.cc/150?u=14'
  }
];