
import React from 'react';
import { HistoryLog } from '../../../types';
import { HistoryList } from '../../common/HistoryList';
import { Card, CardContent } from '../../ui';
import { History } from 'lucide-react';

interface Props {
  history: HistoryLog[];
}

export const LeaseHistoryTab: React.FC<Props> = ({ history }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><History size={18}/></div>
             <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Lịch sử hoạt động</h3>
                <p className="text-xs text-slate-500">Ghi lại toàn bộ thay đổi, cập nhật trạng thái và tác vụ liên quan đến hợp đồng</p>
             </div>
        </div>

        <Card className="border-slate-200 shadow-sm bg-slate-50/30">
            <CardContent className="p-6">
                <HistoryList logs={history} />
            </CardContent>
        </Card>
    </div>
  );
};
