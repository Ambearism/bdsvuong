import React from 'react';
import { Construction } from 'lucide-react';
import { Card, CardContent } from './ui';

export const ComingSoon: React.FC = () => {
    return (
        <div className="flex items-center justify-center p-8 min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
            <Card className="w-full max-w-lg border-dashed border-2 border-slate-200 bg-white/50 backdrop-blur-sm shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shadow-inner">
                        <Construction size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tính năng đang phát triển</h2>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                            Màn hình này hiện đang trong quá trình xây dựng và hoàn thiện. Vui lòng quay lại sau!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
