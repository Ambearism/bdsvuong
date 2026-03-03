
import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button, Select, toast, Badge } from '../../ui';
import { Transaction, TxDocument } from '../../../types';
import { FileUp, X, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  tx: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadDocumentsModal: React.FC<Props> = ({ tx, isOpen, onClose, onSuccess }) => {
  const [category, setCategory] = useState('Hợp đồng');
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = () => {
    if (files.length === 0) return;
    setIsUploading(true);
    
    // Mock upload
    setTimeout(() => {
        files.forEach(f => {
            const newDoc: TxDocument = {
                id: `doc_${Math.random()}`,
                fileName: f.name,
                fileType: f.name.endsWith('pdf') ? 'pdf' : 'docx',
                fileSizeKb: Math.round(f.size / 1024),
                uploadedAt: new Date().toISOString(),
                uploadedBy: 'Nguyễn Văn Admin',
                category
            };
            tx.documents.push(newDoc);
            if (category === 'Hợp đồng') tx.hasContract = true;
            if (category === 'Biên nhận cọc') tx.hasDepositProof = true;
        });
        
        setIsUploading(false);
        toast("Đã upload tài liệu thành công");
        onSuccess();
        onClose();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tài liệu: ${tx.id}`} size="md">
        <div className="p-6 space-y-6">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Loại tài liệu</label>
                <Select 
                    value={category}
                    onChange={setCategory}
                    options={[
                        { label: 'Hợp đồng', value: 'Hợp đồng' },
                        { label: 'Biên nhận cọc', value: 'Biên nhận cọc' },
                        { label: 'CCCD Khách hàng', value: 'CCCD Khách hàng' },
                        { label: 'Sổ đỏ / Pháp lý', value: 'Sổ đỏ' },
                        { label: 'Khác', value: 'Khác' },
                    ]}
                />
            </div>

            <div 
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer group"
                onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) setFiles(Array.from(target.files));
                    };
                    input.click();
                }}
            >
                <div className="p-4 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <FileUp size={32} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Kéo thả hoặc nhấn để chọn file</p>
                    <p className="text-xs text-slate-500 mt-1">Hỗ trợ PDF, DOCX, JPG, PNG (Tối đa 10MB)</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">File đã chọn ({files.length})</p>
                    {files.map((f, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-indigo-50 border border-indigo-100 rounded-lg animate-in slide-in-from-left-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-indigo-500" />
                                <span className="text-xs font-medium text-indigo-900 truncate max-w-[200px]">{f.name}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, idx) => idx !== i)); }} className="text-slate-400 hover:text-rose-500">
                                <X size={14}/>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {tx.documents.length > 0 && (
                 <div className="space-y-2 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh sách tài liệu đã có ({tx.documents.length})</p>
                    <div className="max-h-[150px] overflow-y-auto space-y-2 custom-scrollbar">
                        {tx.documents.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center p-2 border border-slate-100 rounded-lg text-xs">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-700">{doc.category}</span>
                                    <span className="text-slate-400">{doc.fileName}</span>
                                </div>
                                <CheckCircle2 size={14} className="text-emerald-500" />
                            </div>
                        ))}
                    </div>
                 </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Đóng</Button>
                <Button variant="primary" className="flex-1 gap-2" disabled={files.length === 0 || isUploading} onClick={handleUpload}>
                    {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <CheckCircle2 size={16}/>}
                    {isUploading ? 'Đang xử lý...' : 'Xác nhận Upload'}
                </Button>
            </div>
        </div>
    </Modal>
  );
};
