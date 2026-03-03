
import { Property, MOCK_PROPERTIES } from './mockProperties';

export interface TimelineEvent {
  id: string;
  type: 'create' | 'update_price' | 'status_change' | 'lead_link' | 'deal_link' | 'note';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface LinkedLead {
  id: string;
  customerName: string;
  status: string; // lead_moi, hen_xem_nha...
  source: string;
  assignee: string;
  createdAt: string;
}

export interface LinkedDeal {
  id: string;
  status: string; // deal_mo, dat_coc...
  assignee: string;
  valueTy: number;
  updatedAt: string;
}

export interface PropertyTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
}

export const getPropertyById = (id: string): Promise<Property | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_PROPERTIES.find(p => p.id === id));
    }, 400);
  });
};

export const getPropertyTimeline = (id: string): Promise<TimelineEvent[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 't1', type: 'create', title: 'Tạo mới hàng hóa', 
          description: 'Hàng hóa được tạo bởi Admin', actor: 'Nguyễn Admin', timestamp: '2023-11-20T08:30:00Z'
        },
        {
          id: 't2', type: 'update_price', title: 'Cập nhật giá', 
          description: 'Thay đổi giá bán từ 2.9 tỷ -> 2.88 tỷ', actor: 'Lê Sale', timestamp: '2023-11-22T10:00:00Z'
        },
        {
          id: 't3', type: 'lead_link', title: 'Liên kết Lead', 
          description: 'Lead #00123 quan tâm', actor: 'Lê Sale', timestamp: '2023-11-25T14:30:00Z'
        }
      ]);
    }, 300);
  });
};

export const getLinkedLeads = (id: string): Promise<LinkedLead[]> => {
  return new Promise((resolve) => {
    resolve([
      { id: '#00123', customerName: 'Nguyễn Văn Khách', status: 'hen_xem_nha', source: 'Facebook', assignee: 'Lê Sale', createdAt: '2023-11-25' },
      { id: '#00124', customerName: 'Trần Thị Mua', status: 'lead_moi', source: 'Zalo', assignee: 'Trịnh Sale', createdAt: '2023-11-28' }
    ]);
  });
};

export const getLinkedDeals = (id: string): Promise<LinkedDeal[]> => {
  return new Promise((resolve) => {
    resolve([
      { id: 'DEAL-001', status: 'dam_phan', assignee: 'Lê Sale', valueTy: 2.85, updatedAt: '2023-11-29' }
    ]);
  });
};

export const getTasks = (id: string): Promise<PropertyTask[]> => {
  return new Promise((resolve) => {
    resolve([
      { id: 'tsk1', title: 'Xin sổ đỏ chủ nhà', assignee: 'Lê Sale', dueDate: '2023-12-01', completed: false },
      { id: 'tsk2', title: 'Chụp ảnh 360', assignee: 'Team Media', dueDate: '2023-11-30', completed: true }
    ]);
  });
};
