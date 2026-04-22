import BaseProductsChart from '@/components/base/BaseProductsChart'
import { useMemo } from 'react'
import Highcharts from 'highcharts'
import { useGetDashboardInventoryQuery } from '@/api/dashboard'
import { chartColors } from '@/config/colors'
import { MIN_VISIBLE_COLUMN_RATIO } from '@/config/constant'

const SoldSellProductsChart = () => {
    const { data: dashboardData, isLoading } = useGetDashboardInventoryQuery({
        period_type: 'all',
    })

    const { categories, sellSeries, minVisibleColumnValue } = useMemo(() => {
        const data = dashboardData?.data?.by_type_data ?? []

        const chartCategories = data.map(item => item.product_type_name)

        const getSeriesData = <T extends keyof (typeof data)[number]>(field: T) =>
            data.map(item => Number(item[field] ?? 0))

        const maxSellCount = Math.max(
            0,
            ...data.map(
                item =>
                    Number(item.sell_deposit_count ?? 0) +
                    Number(item.sell_sold_count ?? 0) +
                    Number(item.sell_cancelled_count ?? 0),
            ),
        )

        const minSellColumnValue =
            maxSellCount > 0 ? Math.max(1, Math.ceil(maxSellCount * MIN_VISIBLE_COLUMN_RATIO)) : 0

        const chartSellSeries: Highcharts.SeriesOptionsType[] = [
            {
                type: 'column',
                name: 'Đã Cọc',
                data: getSeriesData('sell_deposit_count'),
                color: chartColors.deposit,
                yAxis: 1,
            },
            {
                type: 'column',
                name: 'Đã Bán',
                data: getSeriesData('sell_sold_count'),
                color: chartColors.sold,
                yAxis: 1,
            },
            {
                type: 'column',
                name: 'Hủy Hàng',
                data: getSeriesData('sell_cancelled_count'),
                color: chartColors.cancelled,
                yAxis: 1,
            },
            {
                type: 'line',
                name: 'Giá Trị Hàng Hóa',
                data: getSeriesData('sell_value'),
                color: chartColors.value,
            },
        ]

        return {
            categories: chartCategories,
            sellSeries: chartSellSeries,
            minVisibleColumnValue: minSellColumnValue,
        }
    }, [dashboardData])

    const isNoData = !dashboardData?.data?.by_type_data || dashboardData.data.by_type_data.length === 0

    return (
        <BaseProductsChart
            title="Biểu đồ BĐS Bán (tỷ)"
            categories={categories}
            series={sellSeries}
            minVisibleColumnValue={minVisibleColumnValue}
            isLoading={isLoading}
            isNoData={isNoData}
        />
    )
}

export default SoldSellProductsChart
