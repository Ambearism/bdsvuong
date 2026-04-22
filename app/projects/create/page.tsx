'use client';

import React, { useState } from 'react';
import { Card, CardContent, Button, Input } from '../../../components/ui';
import { ProjectForm } from '../../../components/projects/ProjectForm';
import { Home, ChevronRight } from 'lucide-react';

export default function CreateProjectPage() {
    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'project_list' }));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Home size={16} className="text-slate-400" />
                    <ChevronRight size={14} />
                    <span
                        className="hover:text-indigo-600 cursor-pointer transition-colors"
                        onClick={handleBack}
                    >
                        Danh sách dự án
                    </span>
                    <ChevronRight size={14} />
                    <span className="font-semibold text-slate-900">Thêm dự án mới</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-9 px-4 text-xs font-semibold">Phân quyền</Button>
                    <Button className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white">Quản lý tab</Button>
                </div>
            </div>

            <ProjectForm mode="create" />
        </div>
    );
}
