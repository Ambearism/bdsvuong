
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Switch, Input, Select, Badge, Skeleton, toast } from '../../../components/ui';
import { ReminderRuleConfig } from '../../../types';
import { getReminderRules, saveReminderRule } from '../../../data/reminderFactory';
import { Save, AlertTriangle, Zap, Clock, DollarSign } from 'lucide-react';

export default function ReminderRulesPage() {
    const [rules, setRules] = useState<ReminderRuleConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getReminderRules().then(res => {
            setRules(res);
            setLoading(false);
        });
    }, []);

    const handleToggleRule = async (id: string, enabled: boolean) => {
        const rule = rules.find(r => r.id === id);
        if(rule) {
            const updated = {...rule, isEnabled: enabled};
            await saveReminderRule(updated);
            setRules(prev => prev.map(r => r.id === id ? updated : r));
            toast(`Đã ${enabled ? 'bật' : 'tắt'} rule: ${rule.name}`);
        }
    };

    if (loading) return <div className="p-8"><Skeleton className="h-64 w-full"/></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Cấu hình Tự Động Nhắc Việc (Rules Engine)</h1>
                    <p className="text-slate-500 text-sm mt-1">Thiết lập các quy tắc để hệ thống tự động sinh ra nhắc việc.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-600"/>
                        <h3 className="font-bold text-slate-800">Quy tắc Thanh Toán & Công Nợ</h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        {rules.filter(r => r.category === 'payment').map(rule => (
                            <div key={rule.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-indigo-200 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-800">{rule.name}</span>
                                        <Badge variant="outline" className="text-[10px]">AUTO</Badge>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        Điều kiện: {rule.conditions.map(c => `${c.metric} ${c.operator} ${c.value}`).join(' AND ')}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                        <Zap size={12} className="text-amber-500"/> Action: Set level <b>{rule.actions.setLevel}</b>
                                    </div>
                                </div>
                                <Switch checked={rule.isEnabled} onChange={(v) => handleToggleRule(rule.id, v)} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-indigo-600"/>
                        <h3 className="font-bold text-slate-800">Quy tắc Thuế & Pháp Lý</h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        {rules.filter(r => r.category === 'tax').map(rule => (
                            <div key={rule.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-indigo-200 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-800">{rule.name}</span>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        Điều kiện: {rule.conditions.map(c => `${c.metric} ${c.operator} ${c.value}%`).join(' AND ')}
                                    </div>
                                </div>
                                <Switch checked={rule.isEnabled} onChange={(v) => handleToggleRule(rule.id, v)} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
