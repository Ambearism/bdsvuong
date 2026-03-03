
import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Building2,
  Receipt, FileText, HeartHandshake, Settings,
  ChevronLeft, ChevronRight, Wallet,
  CheckCircle2, Package, Tags, UserCircle, Link as LinkIcon,
  Newspaper, Video, Image, Images, BarChart3, PieChart,
  UserCog, Shield, Key, LayoutPanelLeft, Calendar, LogOut,
  ChevronDown
} from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  currentRoute: string;
  onChangeRoute: (route: string) => void;
}

type MenuItem = {
  id?: string;
  label?: string;
  icon?: any;
  section?: string;
  divider?: boolean;
  subItems?: { id: string; label: string }[];
  isLogout?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { section: 'TỔNG QUAN' },
  { icon: LayoutDashboard, id: 'dashboard', label: 'Tổng quan' },
  { divider: true },

  { section: 'KINH DOANH' },
  {
    icon: Users,
    id: 'lead_group',
    label: 'Lead',
    subItems: [
      { id: 'leads', label: 'Danh sách Lead' },
      { id: 'deals', label: 'Danh sách Deals' },
      { id: 'pipeline', label: 'Pipeline Tiến Trình' },
    ]
  },
  { divider: true },

  { section: 'HÀNG HÓA & DỰ ÁN' },
  {
    icon: Building2,
    id: 'project_group',
    label: 'Dự án',
    subItems: [
      { id: 'projects', label: 'Tra cứu Dự Án' }
    ]
  },
  { icon: Package, id: 'hang_hoa', label: 'Hàng hóa' },
  { divider: true },

  { section: 'GIAO DỊCH & HỢP ĐỒNG' },
  { icon: Receipt, id: 'giao_dich', label: 'Giao dịch & Hợp đồng' },
  {
    icon: FileText,
    id: 'lease_group',
    label: 'Hợp đồng thuê',
    subItems: [
      { id: 'leases', label: 'Danh sách hợp đồng' }
    ]
  },
  { divider: true },

  { section: 'VUÔNG CARE & TÀI CHÍNH' },
  { icon: HeartHandshake, id: 'care_cases', label: 'Danh sách Vuông Care' },
  { icon: CheckCircle2, id: 'pending_approval', label: 'Duyệt dòng tiền' },
  { icon: Wallet, id: 'cost_ledger', label: 'Sổ Chi Phí' },
  { icon: Tags, id: 'cost_categories', label: 'Danh mục Dòng tiền' },
  { divider: true },

  { section: 'KHÁCH HÀNG & DỮ LIỆU LIÊN KẾT' },
  { icon: UserCircle, id: 'khach_hang', label: 'Khách hàng' },
  { icon: LinkIcon, id: 'link_management', label: 'Quản lý tổ hợp Link' },
  { divider: true },

  { icon: Newspaper, id: 'articles', label: 'Bài viết' },
  { divider: true },

  { section: 'MEDIA 360' },
  { icon: Video, id: 'tours_360', label: 'Danh sách tour 360' },
  { icon: Image, id: 'images_360', label: 'Danh sách ảnh 360' },
  { icon: Images, id: 'albums_360', label: 'Album ảnh 360' },
  { divider: true },

  { section: 'BÁO CÁO & SỐ LIỆU' },
  { icon: BarChart3, id: 'report_properties', label: 'Báo cáo Hàng hóa' },
  { icon: PieChart, id: 'report_performance', label: 'Báo cáo Hiệu suất' },
  { divider: true },

  { section: 'QUẢN TRỊ HỆ THỐNG' },
  { icon: UserCog, id: 'employees', label: 'Nhân viên' },
  { icon: Shield, id: 'accounts', label: 'Tài khoản' },
  { icon: Key, id: 'permissions', label: 'Phân quyền' },
  { divider: true },

  { section: 'CÀI ĐẶT' },
  { icon: Settings, id: 'settings', label: 'Settings' },
  { icon: LayoutPanelLeft, id: 'footer_settings', label: 'Footer Settings' },
  { icon: Calendar, id: 'google_calendar', label: 'Google Calendar' },
  { icon: LogOut, id: 'logout', label: 'Đăng xuất', isLogout: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onChangeRoute }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'lead_group': true,
    'project_group': false,
    'lease_group': false,
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        "bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 z-50 sticky top-0 h-screen",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="h-20 flex items-center px-6 mb-4 border-b border-slate-800/50">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Building2 size={24} className="text-white" />
        </div>
        {!collapsed && (
          <div className="ml-3 animate-in fade-in duration-300">
            <h1 className="text-white font-black text-lg tracking-tighter leading-none uppercase">BĐS VUÔNG</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">CRM Enterprise</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar no-scrollbar pb-10">
        {MENU_ITEMS.map((item, idx) => {
          if (item.divider) return <div key={`div-${idx}`} className="my-4 mx-4 h-px bg-slate-800/30" />;

          if (item.section) {
            if (collapsed) return <div key={`sec-${idx}`} className="h-4" />;
            return (
              <div key={`sec-${idx}`} className="mt-6 mb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {item.section}
              </div>
            )
          }

          const Icon = item.icon!;

          if (item.subItems) {
            const isExpanded = expanded[item.id!];
            const hasActiveChild = item.subItems.some(sub => currentRoute === sub.id);

            return (
              <div key={item.id} className="flex flex-col space-y-0.5">
                <button
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setExpanded(prev => ({ ...prev, [item.id!]: true }));
                    } else {
                      toggleExpand(item.id!);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between py-2.5 rounded-xl transition-all duration-200 group relative px-3",
                    hasActiveChild && !isExpanded
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800 hover:text-white text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={cn("shrink-0", hasActiveChild ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400")} />
                    {!collapsed && <span className="text-sm tracking-tight font-medium">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown size={16} className={cn("text-slate-500 transition-transform duration-200", isExpanded && "rotate-180")} />
                  )}
                </button>

                {!collapsed && isExpanded && (
                  <div className="ml-9 mt-1 flex flex-col space-y-1 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-800">
                    {item.subItems.map(sub => {
                      const isActive = currentRoute === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => onChangeRoute(sub.id)}
                          className={cn(
                            "w-full flex items-center py-2 px-4 rounded-lg transition-all duration-200 text-sm relative",
                            isActive
                              ? "text-indigo-400 font-bold bg-indigo-500/10"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          )}
                        >
                          {isActive && <div className="absolute left-[-1px] top-2 bottom-2 w-[2px] bg-indigo-500 rounded-r" />}
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeRoute(item.id!)}
              className={cn(
                "w-full flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group relative px-3",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold"
                  : item.isLogout
                    ? "hover:bg-rose-500/10 hover:text-rose-400 text-slate-400"
                    : "hover:bg-slate-800 hover:text-white text-slate-300",
              )}
            >
              <div className="relative">
                <Icon size={20} className={cn("shrink-0",
                  isActive ? "text-white" :
                    item.isLogout ? "text-slate-400 group-hover:text-rose-400" :
                      "text-slate-400 group-hover:text-indigo-400"
                )} />
              </div>
              {!collapsed && (
                <span className="text-sm tracking-tight">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400"
        >
          {collapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2 text-xs font-bold uppercase"><ChevronLeft size={16} /> Thu gọn</div>}
        </button>
      </div>
    </aside>
  );
};
