'use client';

import React, { useState } from 'react';
import { Card, CardContent, Button, Input, Select, Textarea } from '../ui';
import { Save, ArrowLeft, Plus } from 'lucide-react';
import { Project } from '../../types';

interface ProjectFormProps {
    mode: 'create' | 'edit';
    initialData?: Project;
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
    const defaultData: Partial<Project> = {
        name: '', alias: '', province: '', district: '', address: '',
        type: '', assignee: '', status: 'Đang mở bán', isVisible: true, isFeatured: false,
        developer: '', totalArea: '', totalUnits: 0, totalBlocks: 0, blockHeight: '',
        elevatorsPerBlock: '', propertyTypes: '', constructionDensity: '', legalStatus: '',
        designStandardMin: 0, designStandardMax: 0, startingPrice: 0, pricePerSqm: 0,
        hotline: '', fanpage: '', description: '', highlightLinks: [],
    };

    const [formData, setFormData] = useState<Partial<Project>>({ ...defaultData, ...initialData });
    const [activeTab, setActiveTab] = useState('basic');

    const handleChange = (field: keyof Project, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Mock save action
        console.log('Saved project data:', formData);
        window.dispatchEvent(new CustomEvent('routeChange', { detail: 'project_list' }));
    };

    const TABS = [
        { id: 'basic', label: 'Thông tin cơ bản' },
        { id: 'details', label: 'Thông tin chi tiết' },
        { id: 'highlights', label: 'Thông tin nổi bật' },
        { id: 'description', label: 'Mô tả' },
        { id: 'location', label: 'Vị trí dự án' },
        { id: 'floor_plan', label: 'Mặt bằng' },
        { id: 'amenities', label: 'Tiện ích nội khu' },
        { id: 'gallery', label: 'Quản lý ảnh' },
        { id: 'tour360', label: 'Liên kết tour 360' },
        { id: 'progress', label: 'Tiến độ dự án' },
        { id: 'search', label: 'Tra cứu dự án' },
        { id: 'seo', label: 'SEO' },
    ];

    return (
        <Card className="border-slate-200 shadow-md bg-white">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">Cập nhật dự án</h2>
            </div>

            {/* Tabs Scrollable Container */}
            <div className="w-full overflow-x-auto border-b border-slate-100 custom-scrollbar bg-slate-50">
                <div className="flex px-4 min-w-max">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <CardContent className="p-8">
                {activeTab === 'basic' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Tên dự án <span className="text-red-500">*</span></label>
                                <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nhập tên dự án" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Liên kết tĩnh</label>
                                <Input value={formData.alias} onChange={e => handleChange('alias', e.target.value)} placeholder="du-an-abc" className="h-10 text-slate-600 bg-slate-50" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Dự án cha</label>
                                <Select value={formData.parentProject || ''} onChange={e => handleChange('parentProject', e.target.value)} className="h-10 text-slate-500">
                                    <option value="">Chọn dự án cha</option>
                                    <option value="vinhomes">Vinhomes Smart City</option>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                <Select value={formData.province} onChange={e => handleChange('province', e.target.value)} className="h-10 text-slate-700">
                                    <option value="">Chọn Tỉnh/Thành</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Phường/Xã <span className="text-red-500">*</span></label>
                                <Select value={formData.district} onChange={e => handleChange('district', e.target.value)} className="h-10 text-slate-700">
                                    <option value="">Chọn Phường/Xã</option>
                                    <option value="Hà Đông">Hà Đông</option>
                                    <option value="Nam Từ Liêm">Nam Từ Liêm</option>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Địa chỉ <span className="text-red-500">*</span></label>
                                <Input value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="Địa chỉ chi tiết" className="h-10" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Phân loại <span className="text-red-500">*</span></label>
                                <Select value={formData.type} onChange={e => handleChange('type', e.target.value)} className="h-10 text-slate-700">
                                    <option value="">Chọn phân loại</option>
                                    <option value="Căn hộ / Chung cư">Căn hộ / Chung cư</option>
                                    <option value="Khu đô thị">Khu đô thị</option>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Chuyên viên phụ trách <span className="text-red-500">*</span></label>
                                <Select value={formData.assignee} onChange={e => handleChange('assignee', e.target.value)} className="h-10 text-slate-700">
                                    <option value="">Chọn chuyên viên</option>
                                    <option value="Nguyen Van A">Nguyen Van A</option>
                                    <option value="Bui Thi B">Bui Thi B</option>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Trạng thái <span className="text-red-500">*</span></label>
                                <Select value={formData.status} onChange={e => handleChange('status', e.target.value)} className="h-10 text-slate-700">
                                    <option value="Đang mở bán">Đang mở bán</option>
                                    <option value="Sắp mở bán">Sắp mở bán</option>
                                    <option value="Đang bàn giao">Đang bàn giao</option>
                                    <option value="Đã bán xong">Đã bán xong</option>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-6 pt-4 border-t border-slate-100">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Cài đặt hiển thị</label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-4 h-4 rounded flex items-center justify-center border transition-colors border-indigo-600 bg-indigo-600">
                                            {formData.isVisible && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="checkbox" className="sr-only" checked={formData.isVisible} onChange={e => handleChange('isVisible', e.target.checked)} />
                                        <span className="text-sm font-medium text-slate-700 select-none group-hover:text-indigo-600">Hiển thị</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${formData.isFeatured ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                                            {formData.isFeatured && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="checkbox" className="sr-only" checked={formData.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} />
                                        <span className="text-sm font-medium text-slate-700 select-none group-hover:text-indigo-600">Nổi bật</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Chủ đầu tư</label>
                                <Input value={formData.developer} onChange={e => handleChange('developer', e.target.value)} placeholder="Nhập tên CDT" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Diện tích dự án (m²)</label>
                                <Input value={formData.totalArea} onChange={e => handleChange('totalArea', e.target.value)} placeholder="Ví dụ: 10,000" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Số căn hộ</label>
                                <Input type="number" value={formData.totalUnits || ''} onChange={e => handleChange('totalUnits', parseInt(e.target.value))} placeholder="Nhập số căn hộ" className="h-10" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Số tòa nhà</label>
                                <Input type="number" value={formData.totalBlocks || ''} onChange={e => handleChange('totalBlocks', parseInt(e.target.value))} placeholder="Nhập số tòa nhà" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Độ cao mỗi tòa</label>
                                <Input value={formData.blockHeight} onChange={e => handleChange('blockHeight', e.target.value)} placeholder="VD: 30-35 tầng" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Số thang máy / tòa</label>
                                <Input value={formData.elevatorsPerBlock} onChange={e => handleChange('elevatorsPerBlock', e.target.value)} placeholder="Nhập số thang máy" className="h-10" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Các loại hình chính</label>
                                <Input value={formData.propertyTypes} onChange={e => handleChange('propertyTypes', e.target.value)} placeholder="VD: Chung cư, Biệt thự" className="h-10" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Mật độ xây dựng</label>
                                <Input value={formData.constructionDensity} onChange={e => handleChange('constructionDensity', e.target.value)} placeholder="VD: 30% quỹ đất" className="h-10" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Pháp lý</label>
                                <Select value={formData.legalStatus} onChange={e => handleChange('legalStatus', e.target.value)} className="h-10 text-slate-700">
                                    <option value="">Chọn pháp lý</option>
                                    <option value="Sổ hồng lâu dài">Sổ hồng lâu dài</option>
                                    <option value="Sổ 50 năm">Sổ 50 năm</option>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Quy chuẩn thiết kế mỗi căn (m²)</label>
                                <div className="flex gap-2 items-center text-slate-500">
                                    <Input type="number" value={formData.designStandardMin || ''} onChange={e => handleChange('designStandardMin', parseInt(e.target.value))} placeholder="Từ diện tích" className="h-10 text-center" />
                                    <span>-</span>
                                    <Input type="number" value={formData.designStandardMax || ''} onChange={e => handleChange('designStandardMax', parseInt(e.target.value))} placeholder="Đến diện tích" className="h-10 text-center" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Giá khởi điểm (Tỷ)</label>
                                <Input type="number" value={formData.startingPrice || ''} onChange={e => handleChange('startingPrice', parseFloat(e.target.value))} placeholder="VD: 3.5" className="h-10" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Giá bán / m² (Triệu VNĐ)</label>
                                <Input type="number" value={formData.pricePerSqm || ''} onChange={e => handleChange('pricePerSqm', parseFloat(e.target.value))} placeholder="VD: 35.5" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Hotline</label>
                                <Input value={formData.hotline} onChange={e => handleChange('hotline', e.target.value)} placeholder="Nhập hotline" className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Fanpage</label>
                                <Input value={formData.fanpage} onChange={e => handleChange('fanpage', e.target.value)} placeholder="URL fanpage" className="h-10" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'highlights' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Button variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 gap-2 font-bold h-10 px-5 text-sm">
                            <Plus size={16} /> Thêm liên kết nổi bật
                        </Button>
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 relative mt-4">
                            <table className="w-full text-left bg-white">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide">Tiêu đề / Icon</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide">Đường dẫn</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide w-24 text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.highlightLinks && formData.highlightLinks.length > 0 ? formData.highlightLinks.map((link, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3"><Input value={link.title} className="h-9 bg-slate-50" readOnly /></td>
                                            <td className="px-4 py-3"><Input value={link.url} className="h-9 bg-slate-50" readOnly /></td>
                                            <td className="px-4 py-3 text-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400 italic text-sm">Chưa có liên kết nào</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'description' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="text-sm font-semibold text-slate-700 block mt-2">Nội dung mô tả (Hỗ trợ định dạng văn bản giàu)</label>
                        <p className="text-xs text-slate-400 mb-2 italic">Kích thước khuyến nghị của ảnh: 1280 x 720 px.</p>
                        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                            {/* Toolbar Mock */}
                            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                                    <button className="p-1.5 text-slate-600 hover:bg-white hover:shadow-sm rounded"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg></button>
                                </div>
                                <div className="flex items-center gap-1 px-2 border-r border-slate-200">
                                    <button className="p-1.5 text-slate-600 font-bold hover:bg-white hover:shadow-sm rounded font-serif">B</button>
                                    <button className="p-1.5 text-slate-600 italic hover:bg-white hover:shadow-sm rounded font-serif">I</button>
                                    <button className="p-1.5 text-slate-600 underline hover:bg-white hover:shadow-sm rounded font-serif">U</button>
                                </div>
                                <div className="flex items-center gap-1 px-2">
                                    <button className="p-1.5 text-slate-600 hover:bg-white hover:shadow-sm rounded"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12H3M21 6H3M21 18H3" /></svg></button>
                                    <button className="p-1.5 text-slate-600 hover:bg-white hover:shadow-sm rounded"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /></svg></button>
                                    <button className="p-1.5 text-slate-600 hover:bg-white hover:shadow-sm rounded"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg></button>
                                </div>
                            </div>
                            <Textarea
                                value={formData.description}
                                onChange={e => handleChange('description', e.target.value)}
                                className="min-h-[300px] border-0 rounded-none focus:ring-0 resize-y p-5 leading-relaxed"
                                placeholder="Nhập mô tả dự án..."
                            />
                        </div>
                    </div>
                )}

                {['location', 'floor_plan', 'amenities', 'gallery', 'tour360', 'progress', 'search', 'seo'].includes(activeTab) && (
                    <div className="py-16 text-center animate-in fade-in duration-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Chức năng đang phát triển</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">Nội dung của tab &quot;{TABS.find(t => t.id === activeTab)?.label}&quot; sẽ được cập nhật trong phiên bản tiếp theo.</p>
                    </div>
                )}
            </CardContent>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-center gap-4">
                <Button variant="outline" className="h-10 px-6 font-bold text-slate-600 bg-white hover:bg-slate-50" onClick={() => window.dispatchEvent(new CustomEvent('routeChange', { detail: 'project_list' }))}>
                    Trở về
                </Button>
                <Button className="h-10 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" onClick={handleSave}>
                    Lưu
                </Button>
            </div>
        </Card>
    );
}
