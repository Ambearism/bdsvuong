import { useGetDashboardProductLogsDailyQuery } from '@/api/dashboard'
import { baseChartOptions } from '@/config/chart'
import { chartColors, COLOR_CLASS_MAP, colors } from '@/config/colors'
import { CHART_LOG_TYPE } from '@/config/constant'
import { type ChartLogType } from '@/types/dashboard'
import { getDataSeries, processProductLogs } from '@/utils/dashboard'
import { Flex, Spin, Empty } from 'antd'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useMemo, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

interface ChartSeriesConfig {
    type: 'column' | 'line'
    logType: ChartLogType | 'TOTAL'
    name: string
    color: string
    yAxis?: number
}

const CHART_SERIES_CONFIG: ChartSeriesConfig[] = [
    { type: 'column', logType: CHART_LOG_TYPE.CREATE, name: 'Thêm Mới', color: colors.red },
    { type: 'column', logType: CHART_LOG_TYPE.EDIT_PRICE, name: 'Thay Đổi Giá', color: colors.green },
    { type: 'column', logType: CHART_LOG_TYPE.CHANGE_STATUS, name: 'Thay Đổi Trạng Thái', color: colors.yellow },
    { type: 'column', logType: CHART_LOG_TYPE.EDIT_INFO, name: 'Thay Đổi Thông Tin', color: colors.blue },
    { type: 'line', logType: 'TOTAL', name: 'Tổng Cập Nhật', color: chartColors.value, yAxis: 1 },
]

const TooltipContent = ({ points }: { points: Highcharts.Point[] }) => {
    const linePoint = points.find(p => p.series.type === 'line')
    const columnPoints = points.filter(p => p.series.type === 'column')
    const columnTotal = columnPoints.reduce((sum, point) => sum + (point.y || 0), 0)

    return (
        <div className="min-w-45 font-sans">
            <div className="text-sm font-bold text-gray-800">{points?.[0]?.key}</div>
            <div className="mt-2 mb-2">
                {linePoint && (
                    <Flex align="center" justify="space-between" gap={24}>
                        <span className="text-xs text-gray-500">{linePoint.series.name}</span>
                        <span className="text-xs font-bold text-gray-800">{columnTotal}</span>
                    </Flex>
                )}
            </div>
            {columnPoints.map((point, index) => (
                <Flex key={index} align="center" justify="space-between" gap={24}>
                    <Flex align="center">
                        <span
                            className={`mr-2 inline-block h-2 w-2 rounded ${COLOR_CLASS_MAP[point.series.color as string] || ''}`}></span>
                        <span className="text-xs text-gray-500">{point.series.name}</span>
                    </Flex>
                    <span className="text-xs font-bold text-gray-800">{point.y}</span>
                </Flex>
            ))}
        </div>
    )
}

const UpdatedProductsChart = () => {
    const { data: dashboardData, isLoading } = useGetDashboardProductLogsDailyQuery({
        period_type: 'last_7_days',
    })
    const chartRef = useRef<HighchartsReact.RefObject>(null)

    const { categories, series } = useMemo(() => {
        const items = dashboardData?.data?.items ?? []
        const { categories: chartCategories, dataByDate } = processProductLogs(items)
        const chartSeries: Highcharts.SeriesOptionsType[] = CHART_SERIES_CONFIG.map(
            ({ type, name, logType, color, yAxis }) => ({
                type,
                name,
                color,
                data: getDataSeries(chartCategories, dataByDate, logType),
                ...(yAxis !== undefined && { yAxis }),
            }),
        )
        return { categories: chartCategories, series: chartSeries }
    }, [dashboardData])

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
                    pointWidth: 100,
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
                    return renderToStaticMarkup(<TooltipContent points={points} />)
                },
            },
            series: series,
        }),
        [categories, series],
    )

    const isNoData = !dashboardData?.data?.items || dashboardData.data.items.length === 0

    return (
        <div>
            <div className="mb-6 font-inter text-lg font-semibold leading-7 capitalize align-middle text-gray-700">
                Biểu Đồ Cập Nhật Hàng Hóa
            </div>
            {isLoading ? (
                <Flex align="center" justify="center" className="h-80">
                    <Spin size="large" />
                </Flex>
            ) : isNoData ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" className="!my-10" />
            ) : (
                <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
            )}
        </div>
    )
}

export default UpdatedProductsChart
