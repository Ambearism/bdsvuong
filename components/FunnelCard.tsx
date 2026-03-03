
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Button } from './ui';
import { FunnelStage, FunnelStageKey } from '../types';
import { formatNumber, cn } from '../utils';
import { RotateCcw, Filter, Info } from 'lucide-react';

interface FunnelCardProps {
  data: FunnelStage[];
  selectedStage?: string;
  onSelectStage: (key: FunnelStageKey) => void;
  isLoading?: boolean;
}

// --- Geometry Constants ---
const VIEWBOX_WIDTH = 900; // Increased width for labels
const VIEWBOX_HEIGHT = 500;
const CENTER_X = VIEWBOX_WIDTH / 2;
const FUNNEL_TOP_Y = 50;
const FUNNEL_HEIGHT = 400; 
const MAX_FUNNEL_WIDTH = 420; // Slightly narrower to fit side labels
const MIN_FUNNEL_WIDTH = 140; 
const GAP = 6; 

export const FunnelCard: React.FC<FunnelCardProps> = ({ 
  data, 
  selectedStage, 
  onSelectStage, 
  isLoading 
}) => {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<FunnelStage | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltipRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        tooltipRef.current.style.left = `${x + 16}px`;
        tooltipRef.current.style.top = `${y + 16}px`;
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full min-h-[500px]">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Skeleton className="h-[350px] w-[60%] rounded-b-3xl" />
          <div className="w-full grid grid-cols-2 gap-8 px-12">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Filter className="text-slate-400" size={32} />
        </div>
        <h3 className="text-slate-800 font-semibold mb-2">Chưa có dữ liệu phễu</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">Không tìm thấy dữ liệu trong khoảng thời gian này.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RotateCcw size={14} className="mr-2" /> Tải lại trang
        </Button>
      </Card>
    );
  }

  const stageHeight = (FUNNEL_HEIGHT - (data.length - 1) * GAP) / data.length;

  const getStageGeometry = (index: number) => {
    const yTop = FUNNEL_TOP_Y + index * (stageHeight + GAP);
    const yBottom = yTop + stageHeight;

    const tTop = index / data.length;
    const tBottom = (index + 1) / data.length;

    const wTop = MAX_FUNNEL_WIDTH - tTop * (MAX_FUNNEL_WIDTH - MIN_FUNNEL_WIDTH);
    const wBottom = MAX_FUNNEL_WIDTH - tBottom * (MAX_FUNNEL_WIDTH - MIN_FUNNEL_WIDTH);

    const xTopLeft = CENTER_X - wTop / 2;
    const xTopRight = CENTER_X + wTop / 2;
    const xBottomLeft = CENTER_X - wBottom / 2;
    const xBottomRight = CENTER_X + wBottom / 2;

    const path = `M ${xTopLeft},${yTop} L ${xTopRight},${yTop} L ${xBottomRight},${yBottom} L ${xBottomLeft},${yBottom} Z`;
    const yCenter = yTop + stageHeight / 2;

    return { path, yCenter, wTop, wBottom };
  };

  return (
    <Card className="h-full overflow-hidden bg-white relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tiến Trình Lead → Deal → Giao Dịch</CardTitle>
        <div className="text-slate-400" title="Biểu đồ phễu chuyển đổi"><Info size={16}/></div>
      </CardHeader>
      
      <CardContent className="p-0 relative w-full aspect-[16/9] min-h-[500px]">
        <svg 
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} 
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
              setHoveredStage(null);
              setTooltipData(null);
          }}
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Draw connecting lines behind stages if needed, or just labels */}
          
          {data.map((stage, index) => {
            const geo = getStageGeometry(index);
            const isHovered = hoveredStage === stage.key;
            const isSelected = selectedStage === stage.key;
            const isDimmed = selectedStage && !isSelected;
            
            // Calculate label position
            const tCenter = (index + 0.5) / data.length;
            const wCenter = MAX_FUNNEL_WIDTH - tCenter * (MAX_FUNNEL_WIDTH - MIN_FUNNEL_WIDTH);
            const xRightEdge = CENTER_X + wCenter / 2;
            const xLeftEdge = CENTER_X - wCenter / 2;
            
            // Alternating labels: Even index -> Right, Odd index -> Left
            const isRightSide = index % 2 === 0;

            const stroke = isSelected || isHovered ? "white" : "none";
            const strokeWidth = isSelected ? 3 : (isHovered ? 2 : 0);

            return (
              <g 
                key={stage.key}
                onClick={() => onSelectStage(stage.key)}
                onMouseEnter={() => {
                    setHoveredStage(stage.key);
                    setTooltipData(stage);
                }}
                className="cursor-pointer transition-all duration-300"
                style={{ opacity: isDimmed && !isHovered ? 0.4 : 1 }}
              >
                {/* 1. Funnel Shape */}
                <path
                  d={geo.path}
                  fill={stage.color}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  filter={isSelected ? "url(#shadow)" : undefined}
                  className="transition-all duration-300 ease-in-out hover:brightness-110"
                />

                {/* Top Cap */}
                {index === 0 && (
                  <ellipse 
                    cx={CENTER_X} 
                    cy={FUNNEL_TOP_Y} 
                    rx={geo.wTop / 2} 
                    ry={12} 
                    fill="rgba(255,255,255,0.2)" 
                    stroke="rgba(255,255,255,0.4)" 
                    strokeWidth="1"
                  />
                )}

                {/* 2. Inner Percentage */}
                <text
                  x={CENTER_X}
                  y={geo.yCenter}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="white"
                  style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
                  className={cn(
                    "font-bold text-lg tracking-wide pointer-events-none transition-transform duration-200",
                    isHovered ? "scale-110" : "scale-100"
                  )}
                >
                  {formatNumber(stage.percent)}%
                </text>

                {/* 3. Side Labels (Static SVG) */}
                <g className="pointer-events-none">
                    {isRightSide ? (
                        <>
                            {/* Line */}
                            <line 
                                x1={xRightEdge + 10} y1={geo.yCenter} 
                                x2={xRightEdge + 60} y2={geo.yCenter} 
                                stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3"
                            />
                            {/* Dot */}
                            <circle cx={xRightEdge + 60} cy={geo.yCenter} r="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
                            {/* Text */}
                            <text x={xRightEdge + 70} y={geo.yCenter} dominantBaseline="middle" className="text-xs">
                                <tspan x={xRightEdge + 70} dy="-0.6em" className="font-bold fill-slate-700 uppercase tracking-tight text-[11px]">{stage.label}</tspan>
                                <tspan x={xRightEdge + 70} dy="1.4em" className="fill-slate-500 font-medium">{formatNumber(stage.count)} Leads</tspan>
                            </text>
                        </>
                    ) : (
                        <>
                            {/* Line */}
                            <line 
                                x1={xLeftEdge - 10} y1={geo.yCenter} 
                                x2={xLeftEdge - 60} y2={geo.yCenter} 
                                stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3"
                            />
                            {/* Dot */}
                            <circle cx={xLeftEdge - 60} cy={geo.yCenter} r="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
                            {/* Text */}
                            <text x={xLeftEdge - 70} y={geo.yCenter} dominantBaseline="middle" textAnchor="end" className="text-xs">
                                <tspan x={xLeftEdge - 70} dy="-0.6em" className="font-bold fill-slate-700 uppercase tracking-tight text-[11px]">{stage.label}</tspan>
                                <tspan x={xLeftEdge - 70} dy="1.4em" className="fill-slate-500 font-medium">{formatNumber(stage.count)} Leads</tspan>
                            </text>
                        </>
                    )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* --- Floating Tooltip --- */}
        <div 
            ref={tooltipRef}
            className={cn(
                "fixed z-[9999] pointer-events-none transition-opacity duration-150 ease-out",
                tooltipData ? "opacity-100" : "opacity-0"
            )}
            style={{ left: 0, top: 0 }}
        >
            {tooltipData && (
                <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl backdrop-blur-sm border border-slate-700 min-w-[160px]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tooltipData.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            {tooltipData.label}
                        </span>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                         <div>
                             <div className="text-[10px] text-slate-400">Số lượng Lead</div>
                             <div className="text-lg font-bold text-white leading-none mt-0.5">
                                 {formatNumber(tooltipData.count)}
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-[10px] text-slate-400">Tỷ lệ</div>
                             <div className="text-base font-bold text-emerald-400 leading-none mt-0.5">
                                 {tooltipData.percent}%
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
};
