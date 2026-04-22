'use client';

import React, { useState, useEffect } from 'react';
import { getProjectById } from '../../../data/mockProjects';
import { Project } from '../../../types';
import { MapPin, Share2, ChevronLeft, Building2, Home as HomeIcon, LayoutPanelLeft, DollarSign, ChevronDown } from 'lucide-react';
import { formatNumber } from '../../../utils';

export default function ClientProjectView({ params }: { params: { id: string } }) {
    const { id } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tong_quan');
    const [showFullDesc, setShowFullDesc] = useState(false);

    useEffect(() => {
        getProjectById(id).then(res => {
            setProject(res);
            setLoading(false);
        });
    }, [id]);

    const handleBack = () => {
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'project_list' }));
        // Or history.back() if no global single-page router is used for this public view
        window.history.back();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium tracking-wide">Đang tải dữ liệu dự án...</div>;
    if (!project) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-rose-500 font-medium">Không tìm thấy dự án</div>;

    const TABS = [
        { id: 'tong_quan', label: 'Tổng quan' },
        { id: 'mat_bang', label: 'Mặt bằng dự án' },
        { id: 'vi_tri', label: 'Vị trí dự án' },
        { id: 'cung_khu_vuc', label: 'Dự án cùng khu vực' },
    ];

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Top Red Header Navbar Mock */}
            <div className="bg-[#cc0000] text-white h-14 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-md">
                <button onClick={handleBack} className="p-2 mr-4 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="font-black text-xl tracking-tight leading-none flex flex-col justify-center">
                    <div>BATDONGSAN</div>
                    <div className="text-2xl mt-[-2px]">VƯƠNG</div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={handleBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
                        <ChevronLeft size={16} /> Quay lại
                    </button>
                    <button className="flex items-center gap-2 text-[#cc0000] border border-[#cc0000] hover:bg-red-50 font-bold px-4 py-1.5 rounded-md text-sm transition-colors">
                        <Share2 size={16} /> Chia sẻ
                    </button>
                </div>

                {/* Title & Info */}
                <div className="flex items-start gap-4 mb-6 relative">
                    {project.coverImage ? (
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Building2 className="text-slate-300" size={32} />
                        </div>
                    )}

                    <div className="pt-1">
                        <h1 className="text-3xl font-black text-[#cc0000] tracking-tight mb-2">{project.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-indigo-500" />
                                <span className="text-blue-600 hover:underline cursor-pointer">Xem bản đồ</span>
                                <span className="text-slate-400 ml-1"> {project.address || `${project.district}, ${project.province}`}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-300 hidden md:block" />
                            <div className="flex items-center gap-1.5">
                                <span>Đánh giá bởi chuyên viên :</span>
                                <div className="flex text-[#cc0000]">
                                    {Array(5).fill(0).map((_, i) => (
                                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Images Grid */}
                {project.images && project.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 h-[300px] md:h-[450px]">
                        <div className="md:col-span-2 h-full rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200">
                            <img src={project.images[0]} alt="Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                <button className="flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black/70 transition-colors">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                    Xem tất cả ({project.images.length})
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-rows-2 gap-3 h-full">
                            <div className="rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200">
                                <img src={project.images[1] || project.images[0]} alt="Grid 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <LayoutPanelLeft size={32} className="mb-2 drop-shadow-md" />
                                    <span className="font-bold drop-shadow-md tracking-wide">Mặt bằng</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 rounded-xl overflow-hidden">
                                {project.images.slice(2, 4).map((img, i) => (
                                    <div key={i} className="rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200">
                                        <img src={img || project.images[0]} alt="Grid" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                ))}
                                {project.images.length < 4 && (
                                    <div className="rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200">
                                        <img src={project.images[0]} alt="Grid" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Tabs */}
                <div className="border-b-2 border-slate-100 flex gap-8 mb-8 overflow-x-auto custom-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-[15px] font-bold whitespace-nowrap transition-colors relative isolate ${isActive(activeTab, tab.id)}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-[-2px] inset-x-0 h-[2px] bg-[#cc0000] z-10" />}
                        </button>
                    ))}
                </div>

                {/* Tab Content - Overview */}
                {activeTab === 'tong_quan' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2">

                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Row 1 */}
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                                    <DollarSign className="text-[#cc0000]" size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-500 mb-1">Giá khởi điểm</div>
                                    <div className="text-xl font-black text-slate-900">{project.startingPrice ? `${project.startingPrice} Tỷ` : 'Đang cập nhật'}</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                                    <HomeIcon className="text-[#cc0000]" size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-500 mb-1">Số Căn Hộ</div>
                                    <div className="text-xl font-black text-slate-900">{project.totalUnits ? formatNumber(project.totalUnits) : 'Đang cập nhật'}</div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                                    <Building2 className="text-[#cc0000]" size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-500 mb-1">Chủ đầu tư</div>
                                    <div className="text-xl font-black text-slate-900">{project.developer || 'Đang cập nhật'}</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                                    <LayoutPanelLeft className="text-[#cc0000]" size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-500 mb-1">Diện tích</div>
                                    <div className="text-xl font-black text-slate-900">{project.totalArea ? `${project.totalArea} m²` : 'Đang cập nhật'}</div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Detailed Overview */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tổng quan</h2>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-medium mb-8">
                                <MapPin size={16} className="text-indigo-500" />
                                <span className="text-blue-600 hover:underline cursor-pointer">Xem bản đồ</span>
                                <span className="text-slate-500 ml-1">{project.address || `${project.district}, ${project.province}`}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0.5 max-w-4xl">
                                {renderDetailRow('Số toà', project.totalBlocks ? formatNumber(project.totalBlocks) : undefined)}
                                {renderDetailRow('Độ cao mỗi toà', project.blockHeight)}
                                {renderDetailRow('Quy chuẩn thiết kế mỗi căn', project.designStandardMin ? `${project.designStandardMin}m² - ${project.designStandardMax}m²` : undefined)}
                                {renderDetailRow('Các loại hình chính', project.propertyTypes)}
                                {renderDetailRow('Pháp lý', project.legalStatus)}
                                {renderDetailRow('Mật độ xây dựng', project.constructionDensity)}
                            </div>

                            <div className="mt-8 max-w-4xl">
                                <div className={`text-slate-600 leading-relaxed text-[15px] space-y-4 ${showFullDesc ? '' : 'line-clamp-[8] relative'}`}>
                                    {project.description ? (
                                        project.description.split('\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))
                                    ) : (
                                        <p className="italic text-slate-400">Đang cập nhật mô tả dự án...</p>
                                    )}

                                    {!showFullDesc && project.description && project.description.length > 300 && (
                                        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                    )}
                                </div>

                                {project.description && project.description.length > 300 && (
                                    <button
                                        onClick={() => setShowFullDesc(!showFullDesc)}
                                        className="mt-4 flex items-center gap-1 text-[#cc0000] font-bold text-sm hover:text-red-800 transition-colors"
                                    >
                                        {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                                        <ChevronDown size={16} className={`transition-transform duration-300 ${showFullDesc ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* More sections below based on tabs... */}
                        {['mat_bang', 'vi_tri', 'cung_khu_vuc'].map(tabId => (
                            <div key={tabId} className="pt-12 border-t border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">
                                    {TABS.find(t => t.id === tabId)?.label}
                                </h2>
                                <div className="h-64 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    <LayoutPanelLeft size={48} className="mb-4 text-slate-300" />
                                    <p className="font-semibold tracking-wide">Đang cập nhật nội dung</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab !== 'tong_quan' && (
                    <div className="py-20 animate-in fade-in text-center">
                        <div className="h-40 max-w-lg mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-inner">
                            <span className="font-semibold text-lg text-slate-500">Nội dung tab {TABS.find(t => t.id === activeTab)?.label}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function isActive(current: string, target: string) {
    return current === target ? 'text-[#cc0000]' : 'text-slate-500 hover:text-slate-800';
}

function renderDetailRow(label: string, value?: string) {
    return (
        <div className="py-4 border-b border-slate-100 group">
            <div className="text-sm font-semibold text-slate-500 mb-1">{label}</div>
            <div className="text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{value || 'Đang cập nhật'}</div>
        </div>
    );
}
