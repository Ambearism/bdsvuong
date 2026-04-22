import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Skeleton, TooltipWrapper } from '../ui';
import { UploadCloud, CheckCircle2, ChevronRight, X, AlertCircle, FileArchive, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkUploadModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFiles([]);
            setError(null);
            setProgress(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);

        if (selected.length > 1000) {
            setError('Vượt quá số lượng cho phép. Tối đa 1,000 ảnh/lần.');
            return;
        }

        const oversized = selected.filter((f: File) => f.size > 1024 * 1024);
        if (oversized.length > 0) {
            setError(`Có ${oversized.length} file vượt quá 1MB. Vui lòng kiểm tra lại.`);
            return;
        }

        setError(null);
        setFiles(selected);
        if (selected.length > 0) {
            setStep(2);
        }
    };

    const handleConfirm = () => {
        setStep(3);
        // Simulate progress
        let p = 0;
        const interval = setInterval(() => {
            p += Math.floor(Math.random() * 10) + 5;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setStep(4);
            }
            setProgress(p);
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <Card className="w-full max-w-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <UploadCloud className="text-indigo-600" />
                        Tải Lên Ảnh Hàng Loạt
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 p-2 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <CardContent className="p-6">
                    {/* Stepper Header */}
                    <div className="flex items-center justify-between mb-8 px-8">
                        {[1, 2, 3, 4].map((s) => (
                            <React.Fragment key={s}>
                                <div className={`flex flex-col items-center gap-2 ${step >= s ? 'text-indigo-600' : 'text-slate-300'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step > s ? 'bg-indigo-600 border-indigo-600 text-white' :
                                        step === s ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200'
                                        }`}>
                                        {step > s ? <CheckCircle2 size={16} /> : s}
                                    </div>
                                </div>
                                {s < 4 && (
                                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${step > s ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                <div className="text-sm text-amber-900 leading-relaxed font-medium">
                                    <b>Quy tắc đặt tên file:</b> Bắt buộc đặt tên theo cú pháp <code>[Số Căn]_[Phân Lô]_[Phân Khu].jpg</code> để hệ thống tự động mapping dữ liệu chính xác. Ví dụ: <code>S1.01-05A_S1_Sapphire1.jpg</code>.
                                    <br /><br />
                                    <b>Giới hạn:</b> Tối đa 1,000 ảnh/lần. Dung lượng tối đa 1MB/ảnh.
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-bold flex gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.zip"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <FileArchive size={32} />
                                </div>
                                <div className="text-base font-black text-slate-700 mb-1">Click hoặc Kéo thả folder / zip vào đây</div>
                                <div className="text-sm text-slate-400">Chỉ chấp nhận file định dạng (.jpg, .png, .zip)</div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirm Mapping */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-800">Xác nhận dữ liệu tải lên</h3>
                                <p className="text-sm text-slate-500 mt-1">Hệ thống đã đọc thành công <b>{files.length}</b> tệp tin hợp lệ.</p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 max-h-[200px] overflow-y-auto text-sm border border-slate-200 custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                            <th className="pb-2">Tên file</th>
                                            <th className="pb-2">Dung lượng</th>
                                            <th className="pb-2 text-emerald-600">Trạng thái mapping</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.slice(0, 10).map((f, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-white">
                                                <td className="py-2 text-slate-700 font-medium">{f.name}</td>
                                                <td className="py-2 text-slate-500">{(f.size / 1024).toFixed(1)} KB</td>
                                                <td className="py-2 text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Hợp lệ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {files.length > 10 && <div className="text-center pt-3 text-xs text-slate-400 font-medium italic">... và {files.length - 10} file khác</div>}
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="shadow-none">Hủy bỏ</Button>
                                <Button onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md">
                                    Bắt đầu tiến trình <ChevronRight size={16} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Processing */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center p-10 text-center space-y-6">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * progress) / 100} className="text-indigo-600 transition-all duration-300 ease-out" />
                                </svg>
                                <div className="absolute font-black text-xl text-indigo-600">{progress}%</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin text-indigo-600" size={20} />
                                    Đang xử lý mapping và upload...
                                </h3>
                                <p className="text-sm text-slate-500 mt-2">Vui lòng không đóng cửa sổ này trong quá trình tải.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Hoàn tất quá trình!</h3>
                            <p className="text-slate-500 pb-6 max-w-sm">
                                Hệ thống đã upload và mapping thành công <b>{files.length}</b> hình ảnh vào các hàng hóa tương ứng trên hệ thống.
                            </p>
                            <Button onClick={() => {
                                onClose();
                                onSuccess();
                            }} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md">
                                Đóng cửa sổ
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
