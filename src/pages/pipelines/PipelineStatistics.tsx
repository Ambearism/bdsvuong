import React from 'react'
import { Card, Statistic, Flex } from 'antd'

import type { PipelineStatisticsResponse } from '@/types/opportunity'

interface PipelineStatisticsProps {
    totalLeads?: number
    conversionRates?: PipelineStatisticsResponse['conversion_rates']
}

export const PipelineStatistics: React.FC<PipelineStatisticsProps> = ({ totalLeads, conversionRates }) => {
    return (
        <Flex gap={33} wrap="wrap">
            <Card size="small" className="shadow-sm !flex-1 !max-w-[200px]">
                <Statistic title={<span className="!whitespace-nowrap">Tổng Lead</span>} value={totalLeads ?? 0} />
            </Card>
            <Card size="small" className="shadow-sm !flex-1 !max-w-[200px]">
                <Statistic
                    title={<span className="!whitespace-nowrap">Lead Mới → Hẹn Xem Nhà</span>}
                    value={conversionRates?.lead_moi_to_hen_xem_nha ?? 0}
                    suffix="%"
                    precision={1}
                />
            </Card>
            <Card size="small" className="shadow-sm !flex-1 !max-w-[200px]">
                <Statistic
                    title={<span className="!whitespace-nowrap">Deal Mở → Đàm Phán</span>}
                    value={conversionRates?.deal_mo_to_dam_phan ?? 0}
                    suffix="%"
                    precision={1}
                />
            </Card>
            <Card size="small" className="shadow-sm !flex-1 !max-w-[200px]">
                <Statistic
                    title={<span className="!whitespace-nowrap">Đàm Phán → Đặt Cọc</span>}
                    value={conversionRates?.dam_phan_to_dat_coc ?? 0}
                    suffix="%"
                    precision={1}
                />
            </Card>
            <Card size="small" className="shadow-sm !flex-1 !max-w-[200px]">
                <Statistic
                    title={<span className="!whitespace-nowrap">Đặt Cọc → GD Hoàn Tất</span>}
                    value={conversionRates?.dat_coc_to_gd_hoan_tat ?? 0}
                    suffix="%"
                    precision={1}
                />
            </Card>
            <Card size="small" className="shadow-sm !flex-1 !max-w-[200px]">
                <Statistic
                    title={<span className="!whitespace-nowrap">Lead → Thất Bại</span>}
                    value={conversionRates?.lead_to_that_bai ?? 0}
                    suffix="%"
                    precision={1}
                />
            </Card>
            <Card size="small" className="shadow-sm !flex-1 !max-w-[200px]">
                <Statistic
                    title={<span className="!whitespace-nowrap">Deal → Thất Bại</span>}
                    value={conversionRates?.deal_to_that_bai ?? 0}
                    suffix="%"
                    precision={1}
                />
            </Card>
        </Flex>
    )
}
