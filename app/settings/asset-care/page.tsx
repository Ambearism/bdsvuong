
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Switch, Skeleton, toast, Badge } from '../../../components/ui';
import { AssetCareFeeConfig } from '../../../types';
import { getAssetCareFeeConfig, saveAssetCareFeeConfig } from '../../../data/financeFactory';
import { Save, AlertCircle, Percent, Calculator, DollarSign } from 'lucide-react';

export default function AssetCareFeeSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<AssetCareFeeConfig | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLoading(true);
        getAssetCareFeeConfig().then(res => {
            setConfig(res);
            setLoading(false);
        });
    }, []);

    const handleChange = (field: keyof AssetCareFeeConfig, value: any) => {
        if (!config) return;
        setConfig({ ...config, [field]: value });
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        await saveAssetCareFeeConfig(config);
        toast("Đã lưu cấu hình phí dịch vụ", "success");
        setSaving(false);
        setIsDirty(false);
    };

    if (loading || !config) return <div className="p-8"><Skeleton className="h-64 w-full rounded-2xl"/></div>;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cấu hình Phí Dịch Vụ Asset Care</h1>
                    <p className="text-slate-500 text-sm mt-1">Quy định cách tính phí quản lý tài sản thu từ Chủ nhà.</p>
                </div>
                <Button className="shadow-lg shadow-indigo-200 gap-2" onClick={handleSave} disabled={!isDirty || saving}>
                    {saving ? "Đang lưu..." : <><Save size={18}/> Lưu Cấu Hình</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Configuration Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Calculator size={18} className="text-indigo-600"/> Cơ sở tính phí (Fee Basis)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select 
                                    label="Chu kỳ tính phí"
                                    value={config.cycle}
                                    onChange={(v) => handleChange('cycle', v)}
                                    options={[
                                        {label: 'Theo Tháng (Monthly)', value: 'MONTH'},
                                        {label: 'Theo Quý (Quarterly)', value: 'QUARTER'}
                                    ]}
                                />
                                <Select 
                                    label="Nguồn doanh thu tính phí"
                                    value={config.basis}
                                    onChange={(v) => handleChange('basis', v)}
                                    options={[
                                        {label: 'Tất cả doanh thu APPROVED', value: 'REVENUE_ALL'},
                                        {label: 'Chỉ tiền thuê (Rent Only)', value: 'REVENUE_RENT_ONLY'}
                                    ]}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div>
                                    <span className="text-sm font-bold text-slate-700 block">Loại trừ tiền cọc (Deposits)?</span>
                                    <span className="text-xs text-slate-500">Không tính phí trên các khoản tiền cọc giữ chỗ</span>
                                </div>
                                <Switch checked={config.excludeDeposits} onChange={(v) => handleChange('excludeDeposits', v)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Percent size={18} className="text-emerald-600"/> Công thức tính (Formula)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-3">Phương pháp tính</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={config.formula === 'PERCENT'} onChange={() => handleChange('formula', 'PERCENT')} className="text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium">Theo % Doanh thu</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={config.formula === 'FIXED'} onChange={() => handleChange('formula', 'FIXED')} className="text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium">Cố định (Fixed)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={config.formula === 'HYBRID'} onChange={() => handleChange('formula', 'HYBRID')} className="text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium">Hỗn hợp (% + Fixed)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl">
                                {(config.formula === 'PERCENT' || config.formula === 'HYBRID') && (
                                    <Input 
                                        label="Tỷ lệ phí (%)" 
                                        type="number" 
                                        value={config.percentRate} 
                                        onChange={(e) => handleChange('percentRate', parseFloat(e.target.value))}
                                        icon={<Percent size={14}/>}
                                    />
                                )}
                                {(config.formula === 'FIXED' || config.formula === 'HYBRID') && (
                                    <Input 
                                        label="Phí cố định (VNĐ)" 
                                        type="number" 
                                        value={config.fixedAmount} 
                                        onChange={(e) => handleChange('fixedAmount', parseFloat(e.target.value))}
                                        icon={<DollarSign size={14}/>}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label="Phí tối thiểu (Floor)" 
                                    type="number" 
                                    value={config.minFee} 
                                    onChange={(e) => handleChange('minFee', parseFloat(e.target.value))}
                                    placeholder="0"
                                />
                                <Input 
                                    label="Phí tối đa (Cap)" 
                                    type="number" 
                                    value={config.maxFee} 
                                    onChange={(e) => handleChange('maxFee', parseFloat(e.target.value))}
                                    placeholder="Không giới hạn"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Logic Explanation */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-indigo-900 text-white border-none shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertCircle size={20}/> Quy tắc áp dụng</h3>
                            <ul className="space-y-3 text-sm opacity-90">
                                <li className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"/>
                                    <span>Chỉ tính trên các dòng tiền đã được <b>APPROVED</b> trong kỳ.</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"/>
                                    <span>Hệ thống sẽ chốt số liệu vào ngày cuối cùng của chu kỳ (Tháng/Quý).</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"/>
                                    <span>Phí được ghi nhận là một khoản "Chi phí quản lý" tự động trừ vào số dư của Chủ nhà.</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
