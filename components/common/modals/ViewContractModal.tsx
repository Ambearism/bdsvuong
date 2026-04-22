import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button, Badge } from '../../ui';
import { FileText, Download, ExternalLink, Eye, Info, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils';

export interface DocumentItem {
    id: string;
    name: string;
    url: string; // Used for iframe src or download, in real app
    sizeKb: number;
    type?: string;
    uploadedAt?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    documents: DocumentItem[];
    headerColor?: string;
    badgeText?: string;
}

export const ViewContractModal: React.FC<Props> = ({
    isOpen,
    onClose,
    title = "Tài Liệu Đính Kèm",
    subtitle = "Danh sách tài liệu & hợp đồng",
    documents,
    headerColor = "bg-indigo-600",
    badgeText
}) => {
    const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

    // Auto-select first document when opening
    useEffect(() => {
        if (isOpen && documents.length > 0 && !selectedDoc) {
            setSelectedDoc(documents[0]);
        }
    }, [isOpen, documents]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xem Tài Liệu" size="5xl">
            {/* Header info about the context (Transaction/Lease) */}
            <div className={cn("px-6 py-4 flex justify-between items-center text-white", headerColor)}>
                <div>
                    <h2 className="text-xl font-black">{title}</h2>
                    <p className="text-xs opacity-80 font-medium mt-0.5">{subtitle}</p>
                </div>
                {badgeText && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {badgeText}
                    </Badge>
                )}
            </div>

            <div className="flex flex-col md:flex-row h-[70vh] min-h-[500px] border-b border-slate-200">
                {/* Left Pane: Document Selection */}
                <div className="w-full md:w-1/3 border-r border-slate-200 bg-slate-50 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                            DANH SÁCH TÀI LIỆU ({documents.length})
                        </h3>
                    </div>

                    <div className="flex-1 p-3 space-y-2">
                        {documents.length === 0 ? (
                            <div className="text-center p-8 text-slate-400 italic text-sm">
                                Không có tài liệu nào được đính kèm.
                            </div>
                        ) : (
                            documents.map(doc => (
                                <button
                                    key={doc.id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-xl border transition-all flex gap-3 group",
                                        selectedDoc?.id === doc.id
                                            ? "bg-white border-indigo-300 shadow-md ring-1 ring-indigo-500/20"
                                            : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg shrink-0 flex items-center justify-center transition-colors",
                                        selectedDoc?.id === doc.id ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                                    )}>
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={cn(
                                            "text-sm font-bold truncate leading-tight mb-1 transition-colors",
                                            selectedDoc?.id === doc.id ? "text-indigo-900" : "text-slate-700 group-hover:text-indigo-700"
                                        )}>
                                            {doc.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-wider">
                                            <span>{doc.sizeKb} KB</span>
                                            {doc.uploadedAt && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="truncate">{doc.uploadedAt}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane: Document Viewer */}
                <div className="flex-1 bg-slate-200/50 flex flex-col relative overflow-hidden">
                    {selectedDoc ? (
                        <>
                            {/* Toolbar for the PDF/Doc viewer */}
                            <div className="h-12 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm z-10 w-full">
                                <div className="flex items-center gap-2 max-w-[60%]">
                                    <FileText size={16} className="text-indigo-600 shrink-0" />
                                    <span className="text-sm font-bold text-slate-800 truncate">{selectedDoc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8 gap-2 bg-white text-slate-600 hover:bg-slate-50">
                                        <Download size={14} /> Tải xuống
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 gap-2 bg-white text-slate-600 hover:bg-slate-50">
                                        <ExternalLink size={14} /> Mở tab mới
                                    </Button>
                                </div>
                            </div>

                            {/* Viewer Area (Mocked with a styled placeholder representing PDF) */}
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative flex justify-center w-full">
                                <div className="w-full max-w-3xl bg-white shadow-lg mx-auto min-h-full border border-slate-200 p-12 flex flex-col items-center">
                                    {/* Mock PDF Content Header */}
                                    <div className="w-full flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-6">
                                        <div>
                                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">HỢP ĐỒNG / BẢN GHI NHỚ</h1>
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Số / Ref: {selectedDoc.id.toUpperCase()}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-indigo-900">VUÔNG ENTERPRISE</div>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Hà Nội, {selectedDoc.uploadedAt || new Date().toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>

                                    {/* Mock PDF Content Skeleton */}
                                    <div className="w-full space-y-6 flex-1">
                                        <div className="space-y-3">
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                                        </div>
                                        <div className="py-6 flex justify-center">
                                            <div className="p-8 border-4 border-indigo-100 rounded-2xl bg-indigo-50/50 flex flex-col items-center gap-4 animate-pulse">
                                                <FileText size={48} className="text-indigo-300" />
                                                <div className="text-center font-bold text-indigo-800 text-lg uppercase tracking-wider">
                                                    KV HIỂN THỊ TÀI LIỆU
                                                </div>
                                                <div className="text-xs text-indigo-500 font-medium">
                                                    Đây là mô phỏng trình xem PDF tích hợp.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-12">
                                            <div className="text-center">
                                                <div className="font-bold text-slate-800 mb-16 uppercase text-sm tracking-wider">ĐẠI DIỆN BÊN A</div>
                                                <div className="h-px w-32 bg-slate-300 mx-auto"></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-bold text-slate-800 mb-16 uppercase text-sm tracking-wider">ĐẠI DIỆN BÊN B</div>
                                                <div className="h-px w-32 bg-slate-300 mx-auto"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[400px]">
                            <Eye size={48} className="mb-4 text-slate-300 opacity-50" />
                            <p className="text-lg font-bold text-slate-800 mb-1">Chưa chọn tài liệu</p>
                            <p className="text-sm font-medium text-slate-500">Vui lòng chọn một tài liệu từ danh sách bên trái để xem nội dung.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
