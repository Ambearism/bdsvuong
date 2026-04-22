import { Card, Typography, Flex, Spin, Empty } from 'antd'
import { OpportunityStage, OpportunityStageColors, OpportunityStageLabels } from '@/config/constant'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Funnel from 'highcharts/modules/funnel'
import { useMemo, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useGetDashboardStatisticsQuery } from '@/api/dashboard'

const initModule = (module: unknown) => {
    if (typeof module === 'function') {
        ;(module as (h: typeof Highcharts) => void)(Highcharts)
    } else if (module && typeof (module as { default?: unknown }).default === 'function') {
        ;(module as { default: (h: typeof Highcharts) => void }).default(Highcharts)
    }
}

initModule(Funnel)

const { Title } = Typography

const STAGE_ORDER = [
    OpportunityStage.LEAD_MOI,
    OpportunityStage.DANG_CHAM,
    OpportunityStage.HEN_XEM_NHA,
    OpportunityStage.DEAL_MO,
    OpportunityStage.DAM_PHAN,
    OpportunityStage.DAT_COC,
    OpportunityStage.GD_HOAN_TAT,
]

interface TooltipPoint {
    name: string
    color: string
    y: number
    percent: number
}

const TooltipContent = ({ point }: { point: TooltipPoint }) => {
    return (
        <div className="min-w-45 font-sans">
            <div className="text-sm font-bold text-gray-800">{point.name}</div>
            <div className="mt-2 mb-2">
                <Flex align="center" justify="space-between" gap={24}>
                    <Flex align="center">
                        <span
                            className="mr-2 inline-block h-2 w-2 rounded"
                            style={{ backgroundColor: point.color }}></span>
                        <span className="text-xs text-gray-500">{point.name}</span>
                    </Flex>
                    <span className="text-xs font-bold text-gray-800">
                        {Highcharts.numberFormat(point.y || 0, 0, ',', '.')}
                    </span>
                </Flex>
                <Flex align="center" justify="space-between" gap={24} className="mt-1">
                    <span className="text-xs text-gray-500 pl-4">Tỷ lệ</span>
                    <span className="text-xs font-bold text-gray-800">{point.percent}%</span>
                </Flex>
            </div>
        </div>
    )
}

const LeadPipeline = () => {
    const { data: dashboardStats, isLoading } = useGetDashboardStatisticsQuery({
        period_type: 'all',
    })

    const chartRef = useRef<HighchartsReact.RefObject>(null)

    const funnelData = useMemo(() => {
        if (!dashboardStats?.data?.funnel) return []

        const funnelItems = dashboardStats.data.funnel
        const stageMap = new Map(funnelItems.map(item => [item.stage_id, item]))

        const mappedStages = STAGE_ORDER.map(stage => {
            const item = stageMap.get(stage)
            const count = item?.count || 0
            const percent = item?.conversion_rate ? Number(item.conversion_rate.toFixed(1)) : 0

            const isLeft = (
                [
                    OpportunityStage.DANG_CHAM,
                    OpportunityStage.DEAL_MO,
                    OpportunityStage.DAM_PHAN,
                    OpportunityStage.DAT_COC,
                ] as number[]
            ).includes(stage)

            return {
                name: OpportunityStageLabels[stage],
                y: count,
                color: OpportunityStageColors[stage],
                percent: percent,
                isLeft,
                dataLabels: [
                    {
                        enabled: true,
                        format: '<b>{point.percent}%</b>',
                        inside: true,
                        align: 'center',
                        verticalAlign: 'middle',
                        style: {
                            color: '#FFFFFF',
                            textOutline: 'none',
                            fontSize: '12px',
                            fontWeight: 'bold',
                        },
                    },
                    {
                        enabled: true,
                        format: '<b>{point.name}</b> ({point.y:,.0f})',
                        allowOverlap: true,
                        style: {
                            color: '#333333',
                            textOutline: 'none',
                            fontSize: '13px',
                            fontWeight: 'normal',
                            textAlign: 'center',
                        },
                    },
                ],
            }
        })
        return mappedStages.filter(stage => stage.y > 0)
    }, [dashboardStats])

    const isNoData = !funnelData || funnelData.length === 0 || funnelData.every(item => item.y === 0)

    const options = useMemo<Highcharts.Options>(
        () => ({
            chart: {
                type: 'funnel',
                height: null,
            },
            title: {
                text: undefined,
            },
            plotOptions: {
                funnel: {
                    neckWidth: '20%',
                    neckHeight: '30%',
                    width: '70%',
                    height: '90%',
                    center: ['50%', '50%'],
                },
            },
            legend: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
            tooltip: {
                useHTML: true,
                backgroundColor: '#ffffff',
                borderColor: 'transparent',
                borderRadius: 4,
                borderWidth: 0,
                shadow: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    offsetX: 0,
                    offsetY: 2,
                    width: 6,
                },
                padding: 12,
                formatter() {
                    interface FormatterContext {
                        point: TooltipPoint
                    }
                    const context = this as unknown as FormatterContext
                    return renderToStaticMarkup(<TooltipContent point={context.point} />)
                },
            },
            series: [
                {
                    name: 'Lead Pipeline',
                    type: 'funnel',
                    data: funnelData,
                },
            ],
        }),
        [funnelData],
    )

    return (
        <Card className="h-full flex flex-col" bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Title level={5}>Tiến trình Lead → Deal → Giao dịch</Title>
            {isLoading ? (
                <Flex align="center" justify="center" className="flex-1">
                    <Spin size="large" />
                </Flex>
            ) : isNoData ? (
                <div className="flex-1 flex items-center justify-center">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />
                </div>
            ) : (
                <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                    <div className="h-full w-full flex items-center justify-center">
                        <HighchartsReact
                            ref={chartRef}
                            highcharts={Highcharts}
                            options={options}
                            containerProps={{ className: 'h-125 w-full' }}
                        />
                    </div>
                </div>
            )}
        </Card>
    )
}
export default LeadPipeline
