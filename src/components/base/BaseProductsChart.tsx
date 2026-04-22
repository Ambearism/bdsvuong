import { baseChartOptions } from '@/config/chart'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useMemo, useRef } from 'react'

import { Flex, Card, Typography, Spin, Empty } from 'antd'
import { formatNumber } from '@/utils/number-utils'
import { renderToStaticMarkup } from 'react-dom/server'

const getActualPointValue = (point: Highcharts.Point) => {
    const pointOptions = point.options as Highcharts.PointOptionsObject & {
        custom?: {
            actualY?: number
        }
    }

    return pointOptions.custom?.actualY ?? Number(point.y ?? 0)
}

const TooltipContent = ({ points, hideTotalValue }: { points: Highcharts.Point[]; hideTotalValue?: boolean }) => {
    const linePoint = points.find(p => p.series.type === 'line')
    const columnPoints = points.filter(p => p.series.type === 'column')
    const columnTotal = columnPoints.reduce((sum, point) => sum + getActualPointValue(point), 0)
    const lineValue = linePoint?.y || 0

    return (
        <div className="min-w-45 font-sans">
            <div className="text-sm font-bold text-gray-800">{points?.[0]?.key}</div>
            <div className="mt-2 mb-2">
                {!hideTotalValue && (
                    <Flex align="center" justify="space-between" gap={24}>
                        <Flex align="center">
                            <span className="text-xs text-gray-500">Tổng Giá Trị</span>
                        </Flex>
                        <span className="text-xs font-bold text-gray-800">{formatNumber(lineValue)} tỷ</span>
                    </Flex>
                )}
                {hideTotalValue && linePoint && (
                    <Flex align="center" justify="space-between" gap={24}>
                        <Flex align="center">
                            <span
                                className="mr-2 inline-block h-2 w-2 rounded-[2px]"
                                style={{ backgroundColor: linePoint.series.color as string }}></span>
                            <span className="text-xs text-gray-500">{linePoint.series.name}</span>
                        </Flex>
                        <span className="text-xs font-bold text-gray-800">{formatNumber(columnTotal)}</span>
                    </Flex>
                )}
                {!hideTotalValue && (
                    <Flex align="center" justify="space-between" gap={24}>
                        <Flex align="center">
                            <span className="text-xs text-gray-500">Số Lượng</span>
                        </Flex>
                        <span className="text-xs font-bold text-gray-800">{formatNumber(columnTotal)}</span>
                    </Flex>
                )}
            </div>
            {columnPoints.map((point, index) => (
                <Flex key={index} align="center" justify="space-between" gap={24}>
                    <Flex align="center">
                        <span
                            className="mr-2 inline-block h-2 w-2 rounded-[2px]"
                            style={{ backgroundColor: point.series.color as string }}></span>
                        <span className="text-xs text-gray-500">{point.series.name}</span>
                    </Flex>
                    <span className="text-xs font-bold text-gray-800">{formatNumber(getActualPointValue(point))}</span>
                </Flex>
            ))}
        </div>
    )
}

type Props = {
    title: string
    categories: string[]
    series: Highcharts.SeriesOptionsType[]
    hideTotalValue?: boolean
    columnWidth?: number
    minVisibleColumnValue?: number
    isLoading?: boolean
    isNoData?: boolean
}

const BaseProductsChart = ({
    title,
    categories,
    series,
    hideTotalValue,
    columnWidth,
    minVisibleColumnValue,
    isLoading,
    isNoData,
}: Props) => {
    const normalizedSeries = useMemo(
        () =>
            series.map(item => {
                if (item.type !== 'column' || !minVisibleColumnValue || minVisibleColumnValue <= 0) {
                    return item
                }

                const columnSeries = item as Highcharts.SeriesColumnOptions

                return {
                    ...columnSeries,
                    data: (columnSeries.data || []).map(point => {
                        if (typeof point !== 'number' || point <= 0 || point >= minVisibleColumnValue) {
                            return point
                        }

                        return {
                            y: minVisibleColumnValue,
                            custom: {
                                actualY: point,
                            },
                        }
                    }),
                }
            }),
        [series, minVisibleColumnValue],
    )

    const options: Highcharts.Options = useMemo(
        () => ({
            ...baseChartOptions,
            chart: {
                ...baseChartOptions.chart,
            },
            plotOptions: {
                ...baseChartOptions.plotOptions,
                column: {
                    ...baseChartOptions.plotOptions?.column,
                    pointWidth: columnWidth,
                },
            },
            xAxis: {
                ...baseChartOptions.xAxis,
                categories: categories,
            },
            tooltip: {
                ...baseChartOptions.tooltip,
                formatter: function () {
                    const points = (this.points || []) as Highcharts.Point[]
                    return renderToStaticMarkup(<TooltipContent points={points} hideTotalValue={hideTotalValue} />)
                },
            },
            series: normalizedSeries,
        }),
        [categories, normalizedSeries, hideTotalValue, columnWidth],
    )

    const { Title } = Typography
    const chartRef = useRef<HighchartsReact.RefObject>(null)

    return (
        <Card>
            <Title level={5}>{title}</Title>
            {isLoading ? (
                <Flex align="center" justify="center" className="h-80">
                    <Spin size="large" />
                </Flex>
            ) : isNoData ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" className="!my-10" />
            ) : (
                <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
            )}
        </Card>
    )
}

export default BaseProductsChart
