import { useGetTransactionChartStatisticsQuery } from '@/api/transaction'
import { chartColors, COLOR_CLASS_MAP, colors } from '@/config/colors'
import {
    PERIOD_TYPE,
    TRANSACTION_REVENUE_CHART_STAGE,
    TransactionRevenueChartStageColors,
    TransactionRevenueChartStageLabels,
} from '@/config/constant'
import { Card, Empty, Flex, Spin, Typography } from 'antd'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useMemo } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { Title } = Typography

const compactValueFormatter = Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
})

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')} Tỷ`

const formatCompactValue = (value: number) => {
    if (value === 0) return '0'
    return compactValueFormatter.format(value)
}

type TooltipPoint = Highcharts.Point & {
    key?: string | number
}

const TooltipContent = ({ points }: { points: TooltipPoint[] }) => {
    return (
        <div className="min-w-45 font-sans">
            <div className="text-sm font-bold text-gray-800">{points?.[0]?.key ?? ''}</div>
            <div className="mt-2 mb-2">
                {points.map((point, index) => (
                    <Flex key={index} align="center" justify="space-between" gap={24}>
                        <Flex align="center">
                            <span
                                className={`mr-2 inline-block h-2 w-2 rounded ${COLOR_CLASS_MAP[point.series.color as string] || ''}`}
                                style={{
                                    backgroundColor: COLOR_CLASS_MAP[point.series.color as string]
                                        ? undefined
                                        : (point.series.color as string),
                                }}></span>
                            <span className="text-xs text-gray-500">{point.series.name}</span>
                        </Flex>
                        <span className="text-xs font-bold text-gray-800">{formatCurrency(Number(point.y ?? 0))}</span>
                    </Flex>
                ))}
            </div>
        </div>
    )
}

const TransactionRevenue = () => {
    const { data: chartStatistics, isLoading } = useGetTransactionChartStatisticsQuery(
        {
            period_type: PERIOD_TYPE.ALL,
        },
        {
            refetchOnMountOrArgChange: true,
        },
    )

    const categories = useMemo(() => chartStatistics?.data?.categories ?? [], [chartStatistics])

    const seriesData = useMemo<Highcharts.SeriesLineOptions[]>(() => {
        const series = chartStatistics?.data?.series ?? []
        const emptyData = categories.map(() => 0)

        return Object.values(TRANSACTION_REVENUE_CHART_STAGE).map(stageId => {
            const item = series.find(seriesItem => seriesItem.stage === stageId)

            return {
                name: TransactionRevenueChartStageLabels[stageId],
                type: 'line',
                data: item?.data ?? emptyData,
                color: TransactionRevenueChartStageColors[stageId],
                lineWidth: 2,
                custom: {
                    total: item?.total ?? 0,
                },
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 4,
                    fillColor: colors.white,
                    lineWidth: 2,
                    lineColor: TransactionRevenueChartStageColors[stageId],
                },
            }
        })
    }, [categories, chartStatistics])

    const isNoData = !categories.length || !seriesData.length

    const options = useMemo<Highcharts.Options>(
        () => ({
            chart: {
                type: 'line',
                height: 450,
            },
            title: {
                text: undefined,
            },
            xAxis: {
                categories,
                crosshair: true,
                lineColor: chartColors.axisLine,
                tickColor: chartColors.axisLine,
                gridLineWidth: 1,
                gridLineColor: chartColors.axisGrid,
                gridLineDashStyle: 'Dash',
            },
            yAxis: {
                min: 0,
                title: {
                    text: undefined,
                },
                gridLineDashStyle: 'Dash',
                labels: {
                    formatter() {
                        return formatCompactValue(Number(this.value))
                    },
                },
            },
            tooltip: {
                shared: true,
                useHTML: true,
                formatter() {
                    const context = this as Highcharts.Point & {
                        points?: TooltipPoint[]
                    }
                    const points = (context.points ?? [context]) as TooltipPoint[]

                    return renderToStaticMarkup(<TooltipContent points={points} />)
                },
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: true,
                    },
                },
                series: {
                    states: {
                        inactive: {
                            opacity: 1,
                        },
                    },
                },
            },
            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
                useHTML: true,
                symbolRadius: 999,
                itemStyle: {
                    fontSize: '13px',
                    fontWeight: '400',
                },
                labelFormatter() {
                    const total = Number((this.options.custom as { total?: number } | undefined)?.total ?? 0)
                    return `${this.name}: <b>${total}</b>`
                },
            },
            credits: {
                enabled: false,
            },
            series: seriesData,
        }),
        [categories, seriesData],
    )

    return (
        <Card className="h-full flex flex-col" bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Title level={5} style={{ margin: 0 }}>
                Giao dịch & doanh thu
            </Title>

            <div className="mt-10 flex-1">
                {isLoading ? (
                    <Flex align="center" justify="center" className="h-full">
                        <Spin size="large" />
                    </Flex>
                ) : isNoData ? (
                    <Flex align="center" justify="center" className="h-full">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />
                    </Flex>
                ) : (
                    <HighchartsReact highcharts={Highcharts} options={options} />
                )}
            </div>
        </Card>
    )
}

export default TransactionRevenue
