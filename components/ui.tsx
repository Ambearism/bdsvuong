
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils';
import { ChevronDown, Check, Loader2, X, ChevronLeft, ChevronRight, Search, CheckSquare, Square, Circle, CircleDot } from 'lucide-react';

export const Card = ({ className, children, onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div onClick={onClick} className={cn("bg-white rounded-lg border border-slate-200 shadow-sm", className)} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6 pb-2", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("font-bold text-base text-slate-800 mb-1", className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6", className)} {...props}>
        {children}
    </div>
);

export const Button = ({ className, variant = 'primary', size = 'md', children, disabled, onClick, type = 'button', ...props }: any) => {
    const variants: any = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border border-transparent",
        secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm border border-transparent",
        outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white",
        ghost: "text-slate-600 hover:bg-slate-100 border border-transparent",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-transparent",
    };
    const sizes: any = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9 p-0 flex items-center justify-center",
    };
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};

export interface SelectOption {
    label: string;
    value: string;
}

export const Select = ({ label, value, onChange, options, className, wrapperClassName, placeholder, error, showClear, disabled }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find((o: SelectOption) => o.value === value)?.label;

    return (
        <div className={cn("space-y-2", wrapperClassName ? wrapperClassName : "w-full")} ref={ref}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-10 px-3 bg-white border rounded-lg flex items-center justify-between text-sm transition-all text-left shadow-sm text-slate-900",
                        error ? "border-rose-300 bg-rose-50" : isOpen ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-200 hover:border-slate-300",
                        !value && "text-slate-400",
                        disabled && "opacity-50 cursor-not-allowed bg-slate-50",
                        className
                    )}
                >
                    <span className="truncate pr-2">{selectedLabel || placeholder || "Chọn..."}</span>
                    <div className="flex items-center gap-1 shrink-0">
                        {showClear && value && (
                            <div
                                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                                className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={12} />
                            </div>
                        )}
                        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                        {options.length > 0 ? options.map((option: SelectOption) => (
                            <div
                                key={option.value}
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className={cn(
                                    "px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between",
                                    value === option.value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700"
                                )}
                            >
                                {option.label}
                                {value === option.value && <Check size={14} className="text-indigo-600" />}
                            </div>
                        )) : (
                            <div className="p-3 text-center text-xs text-slate-400">Không có dữ liệu</div>
                        )}
                    </div>
                )}
            </div>
            {error && <span className="text-xs text-rose-500 ml-1">{error}</span>}
        </div>
    );
};

export const Input = ({ label, error, icon, className, wrapperClassName, ...props }: any) => (
    <div className={cn("space-y-2 w-full", wrapperClassName)}>
        {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
        <div className="relative group">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">{icon}</div>}
            <input
                className={cn(
                    "w-full h-10 bg-white border rounded-lg px-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm",
                    icon && "pl-10",
                    error ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10" : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 hover:border-slate-300",
                    props.disabled && "opacity-60 cursor-not-allowed bg-slate-50",
                    className
                )}
                {...props}
            />
        </div>
        {error && <span className="text-xs text-rose-500 ml-1">{error}</span>}
    </div>
);

export const Textarea = ({ label, className, wrapperClassName, ...props }: any) => (
    <div className={cn("space-y-2 w-full", wrapperClassName)}>
        {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
        <textarea
            className={cn(
                "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 hover:border-slate-300 placeholder:text-slate-400 resize-none shadow-sm",
                className
            )}
            {...props}
        />
    </div>
);

export const Badge = ({ children, variant = 'neutral', className }: any) => {
    const variants: any = {
        neutral: "bg-slate-100 text-slate-700 border-slate-300",
        success: "bg-emerald-50 text-emerald-700 border-emerald-300",
        warning: "bg-amber-50 text-amber-700 border-amber-300",
        danger: "bg-rose-50 text-rose-700 border-rose-300",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-300",
        outline: "bg-white border-slate-300 text-slate-600",
        live: "bg-indigo-50/80 text-indigo-500 border-indigo-200/50 uppercase tracking-widest",
    };
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 text-[10px] font-bold border rounded-md uppercase tracking-wide", variants[variant], className)}>
            {children}
        </span>
    );
};

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)} {...props} />
);

export const Tabs = ({ activeTab, onChange, tabs, className }: { activeTab: string, onChange: (id: string) => void, tabs: { id: string, label: string }[], className?: string }) => (
    <div className={cn("flex p-1 bg-transparent rounded-lg border border-slate-100", className)}>
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                    "flex-1 py-1.5 px-4 rounded-full text-sm font-bold transition-all",
                    activeTab === tab.id ? "bg-white text-indigo-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                )}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

export const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onChange(!checked)}
    >
        <div className={cn(
            "w-5 h-5 rounded border flex items-center justify-center transition-all",
            checked ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300 group-hover:border-indigo-400"
        )}>
            {checked && <Check size={12} className="text-white" />}
        </div>
        <span className="text-sm text-slate-700 select-none group-hover:text-indigo-600 transition-colors">{label}</span>
    </div>
);

export const TooltipWrapper = ({ children, content }: { children?: React.ReactNode, content: string }) => {
    return (
        <div className="group relative inline-block">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
            </div>
        </div>
    )
}

export const Pagination = ({ page, total, size, onChange }: { page: number, total: number, size: number, onChange: (p: number) => void }) => {
    const totalPages = Math.ceil(total / size);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page === 1} onClick={() => onChange(page - 1)}>
                <ChevronLeft size={14} />
            </Button>
            <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-bold text-slate-700">{page}</span>
                <span className="text-sm text-slate-400">/</span>
                <span className="text-sm text-slate-500">{totalPages}</span>
            </div>
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
                <ChevronRight size={14} />
            </Button>
        </div>
    )
}

export const toast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const el = document.createElement('div');
    el.className = cn(
        "fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm font-bold animate-in slide-in-from-right-10 fade-in duration-300 z-[100] flex items-center gap-3 border",
        type === 'success' ? "bg-white text-emerald-600 border-emerald-100" :
            type === 'error' ? "bg-white text-rose-600 border-rose-100" : "bg-slate-900 text-white border-slate-800"
    );
    el.innerHTML = `
        <div class="${type === 'success' ? 'bg-emerald-50' : type === 'error' ? 'bg-rose-50' : 'bg-slate-700'} p-1 rounded-full">
            ${type === 'success' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' :
            type === 'error' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' :
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'}
        </div>
        ${message}
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => el.remove(), 300);
    }, 3000);
};

export const Switch = ({ checked, onChange, className, disabled }: { checked: boolean, onChange: (checked: boolean) => void, className?: string, disabled?: boolean }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-indigo-600" : "bg-slate-200",
                className
            )}
        >
            <span
                className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
};

export const RadioGroupItem = ({ value, label, checked, onChange, description }: { value: string, label: string, checked: boolean, onChange: (val: string) => void, description?: string }) => {
    return (
        <div
            onClick={() => onChange(value)}
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                checked ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 bg-white"
            )}
        >
            <div className={cn("mt-0.5 text-indigo-600", !checked && "text-slate-300")}>
                {checked ? <CircleDot size={18} /> : <Circle size={18} />}
            </div>
            <div>
                <div className={cn("text-sm font-bold", checked ? "text-indigo-900" : "text-slate-700")}>{label}</div>
                {description && <div className="text-xs text-slate-500 mt-1">{description}</div>}
            </div>
        </div>
    );
};

export const Table = ({ className, ...props }: any) => (
    <div className="w-full overflow-auto">
        <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
);

export const TableHeader = ({ className, ...props }: any) => (
    <thead className={cn("[&_tr]:border-b", className)} {...props} />
);

export const TableBody = ({ className, ...props }: any) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

export const TableRow = ({ className, ...props }: any) => (
    <tr
        className={cn(
            "border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100",
            className
        )}
        {...props}
    />
);

export const TableHead = ({ className, ...props }: any) => (
    <th
        className={cn(
            "h-10 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
);

export const TableCell = ({ className, ...props }: any) => (
    <td
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
    />
);

export const Avatar = ({ className, children, ...props }: any) => (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}>
        {children}
    </div>
);
