import BaseProductsChart from '@/components/base/BaseProductsChart'
import { useMemo } from 'react'
import Highcharts from 'highcharts'
import { useGetDashboardInventoryQuery } from '@/api/dashboard'
import { chartColors } from '@/config/colors'
import { MILLION_PER_BILLION, MIN_VISIBLE_COLUMN_RATIO } from '@/config/constant'

const SoldRentProductsChart = () => {
    const { data: dashboardData, isLoading } = useGetDashboardInventoryQuery({
        period_type: 'all',
    })

    const { categories, rentSeries, minVisibleColumnValue } = useMemo(() => {
        const data = dashboardData?.data?.by_type_data ?? []

        const chartCategories = data.map(item => item.product_type_name)

        const getSeriesData = <T extends keyof (typeof data)[number]>(field: T) =>
            data.map(item => Number(item[field] ?? 0))

        const maxRentCount = Math.max(
            0,
            ...data.map(
                item =>
                    Number(item.rent_deposit_count ?? 0) +
                    Number(item.rent_sold_count ?? 0) +
                    Number(item.rent_cancelled_count ?? 0),
            ),
        )

        const minRentColumnValue =
            maxRentCount > 0 ? Math.max(1, Math.ceil(maxRentCount * MIN_VISIBLE_COLUMN_RATIO)) : 0

        const chartRentSeries: Highcharts.SeriesOptionsType[] = [
            {
                type: 'column',
                name: 'Đã Cọc',
                data: getSeriesData('rent_deposit_count'),
                color: chartColors.deposit,
                yAxis: 1,
            },
            {
                type: 'column',
                name: 'Đã Thuê',
                data: getSeriesData('rent_sold_count'),
                color: chartColors.sold,
                yAxis: 1,
            },
            {
                type: 'column',
                name: 'Hủy Hàng',
                data: getSeriesData('rent_cancelled_count'),
                color: chartColors.cancelled,
                yAxis: 1,
            },
            {
                type: 'line',
                name: 'Giá Trị Hàng Hóa',
                data: getSeriesData('rent_value').map(v => v / MILLION_PER_BILLION),
                color: chartColors.value,
            },
        ]

        return {
            categories: chartCategories,
            rentSeries: chartRentSeries,
            minVisibleColumnValue: minRentColumnValue,
        }
    }, [dashboardData])

    const isNoData = !dashboardData?.data?.by_type_data || dashboardData.data.by_type_data.length === 0

    return (
        <BaseProductsChart
            title="Biểu đồ BĐS Cho Thuê (tỷ)"
            categories={categories}
            series={rentSeries}
            minVisibleColumnValue={minVisibleColumnValue}
            isLoading={isLoading}
            isNoData={isNoData}
        />
    )
}

export default SoldRentProductsChart
