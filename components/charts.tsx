import React from 'react';
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { FunnelStage, LeadSource, RevenueData, InventoryCategory } from '../types';
import { formatNumber, formatCurrencyTy } from '../utils';

// --- Customized Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-lg text-sm ring-1 ring-slate-100 z-50">
        <p className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label ? label : payload[0].payload.name || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></span>
            <span className="text-slate-600 font-medium">{entry.name}: </span>
            <span className="font-bold text-slate-800 ml-auto pl-4">
              {(typeof entry.value === 'number' && entry.value > 1000) || (entry.name && (entry.name.includes('Doanh thu') || entry.name.includes('Giá trị')))
                ? formatCurrencyTy(entry.value) 
                : formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Funnel Chart ---
export const LeadFunnelChart = ({ data }: { data: FunnelStage[] }) => {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <FunnelChart>
        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Funnel
          dataKey="count"
          nameKey="stage"
          data={data}
          isAnimationActive
          x="20%" 
          width="60%"
        >
          {/* Inner Percentage Label */}
          <LabelList
            position="center"
            fill="#fff"
            stroke="none"
            dataKey="count"
            content={(props: any) => {
                const { x, y, width, height, value } = props;
                if (height < 22) return null;
                const firstVal = data[0].count;
                const percent = Math.round((value / firstVal) * 100);
                
                return (
                     <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold drop-shadow-sm pointer-events-none">
                        {percent}%
                     </text>
                );
            }}
          />
          
          {/* Alternating Side Labels */}
          <LabelList
            position="right"
            stroke="none"
            dataKey="stage"
            content={(props: any) => {
                const { x, y, width, height, value, index } = props;
                const item = data[index];
                
                // Render Label on Right for Even indices
                if (index % 2 === 0) {
                    return (
                        <g>
                            <line x1={x + width} y1={y + height / 2} x2={x + width + 20} y2={y + height / 2} stroke="#cbd5e1" strokeDasharray="3 3" />
                            <circle cx={x + width + 20} cy={y + height / 2} r={3} fill="#fff" stroke="#94a3b8" strokeWidth={1.5} />
                            <text x={x + width + 30} y={y + height / 2} dominantBaseline="middle" className="text-xs">
                                <tspan className="font-bold fill-slate-800 uppercase text-[11px] tracking-wide">{value}</tspan>
                                <tspan x={x + width + 30} dy="1.4em" className="fill-slate-500 font-medium">{formatNumber(item.count)} Khách</tspan>
                            </text>
                        </g>
                    )
                }
                
                // Render Label on Left for Odd indices
                if (index % 2 !== 0) {
                    return (
                        <g>
                             <line x1={x} y1={y + height / 2} x2={x - 20} y2={y + height / 2} stroke="#cbd5e1" strokeDasharray="3 3" />
                             <circle cx={x - 20} cy={y + height / 2} r={3} fill="#fff" stroke="#94a3b8" strokeWidth={1.5} />
                             <text x={x - 30} y={y + height / 2} textAnchor="end" dominantBaseline="middle" className="text-xs">
                                <tspan className="font-bold fill-slate-800 uppercase text-[11px] tracking-wide">{value}</tspan>
                                <tspan x={x - 30} dy="1.4em" className="fill-slate-500 font-medium">{formatNumber(item.count)} Khách</tspan>
                            </text>
                        </g>
                    )
                }
                return null;
            }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
};

// --- Pie Chart ---
export const SourcePieChart = ({ data, onSelect }: { data: LeadSource[], onSelect: (name: string) => void }) => {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={4}
          dataKey="value"
          onClick={(data) => onSelect(data.name)}
          cursor="pointer"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconType="circle"
            iconSize={8}
            formatter={(value, entry: any) => (
                <span className="text-xs text-slate-600 font-medium ml-1">
                    {value} <span className="text-slate-400">({Math.round((entry.payload.percent || 0) * 100)}%)</span>
                </span>
            )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- Area Chart (Revenue) ---
export const RevenueLineChart = ({ data }: { data: RevenueData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
            dy={10} 
        />
        <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(val) => `${val} tỷ`}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
        
        <Area 
            type="monotone" 
            name="Hoàn tất (Đã thu)" 
            dataKey="completed" 
            stroke="#3b82f6" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorCompleted)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
        />
        <Area 
            type="monotone" 
            name="Đang chờ xử lý" 
            dataKey="pending" 
            stroke="#8b5cf6" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorPending)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#7c3aed' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// --- Bar Chart ---
export const InventoryBarChart = ({ data }: { data: InventoryCategory[] }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} hide />
        <YAxis 
            dataKey="category" 
            type="category" 
            width={90} 
            tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }} 
            axisLine={false} 
            tickLine={false} 
        />
        <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
        <Bar name="Đang Bán" dataKey="sell" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16}>
            <LabelList dataKey="sell" position="right" fontSize={11} formatter={(val: number) => `${formatNumber(val)} tỷ`} fill="#64748b" />
        </Bar>
        <Bar name="Cho Thuê" dataKey="rent" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16}>
            <LabelList dataKey="rent" position="right" fontSize={11} formatter={(val: number) => `${formatNumber(val)} tỷ`} fill="#64748b" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};