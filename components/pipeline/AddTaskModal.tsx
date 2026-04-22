
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button, Input, Select, toast } from '../ui';
import { Calendar, User, ClipboardList } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: { title: string; dueAt: string; assigneeName: string }) => void;
    customerName: string;
}

export const AddTaskModal: React.FC<Props> = ({ isOpen, onClose, onSave, customerName }) => {
    const [title, setTitle] = useState('');
    const [dueAt, setDueAt] = useState('');
    const [assignee, setAssignee] = useState('Phạm Minh Cường');

    const handleSave = () => {
        if (!title.trim()) {
            toast("Vui lòng nhập nội dung tác vụ", "error");
            return;
        }
        onSave({
            title,
            dueAt: dueAt || new Date().toISOString(),
            assigneeName: assignee
        });
        toast("Thêm tác vụ thành công");
        setTitle('');
        setDueAt('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm tác vụ" size="md">
            <div className="p-6 space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tác vụ</label>
                    <Input
                        placeholder="Nhập nội dung tác vụ..."
                        value={title}
                        onChange={(e: any) => setTitle(e.target.value)}
                        icon={<ClipboardList size={18} className="text-slate-400" />}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ngày kết thúc</label>
                    <Input
                        type="date"
                        value={dueAt}
                        onChange={(e: any) => setDueAt(e.target.value)}
                        icon={<Calendar size={18} className="text-slate-400" />}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Người giao việc</label>
                    <Select
                        value={assignee}
                        onChange={setAssignee}
                        options={[
                            { label: 'Phạm Minh Cường', value: 'Phạm Minh Cường' },
                            { label: 'Nguyễn Văn An', value: 'Nguyễn Văn An' },
                            { label: 'Trần Thị Mỹ', value: 'Trần Thị Mỹ' },
                        ]}
                        className="h-11"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button variant="ghost" className="flex-1 h-11 font-bold text-slate-500" onClick={onClose}>Hủy</Button>
                    <Button variant="primary" className="flex-1 h-11 font-bold shadow-md shadow-indigo-100" onClick={handleSave}>
                        Lưu
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
