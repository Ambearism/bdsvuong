import {
    DASHBOARD_RENT_BAR_COLOR,
    DASHBOARD_SELL_BAR_COLOR,
    LEGEND_ITEM,
    MILLION_PER_BILLION,
    PRODUCT_TRANSACTION,
    PRODUCT_TYPE,
    PRODUCT_TYPE_ID,
} from '@/config/constant'
import { useOverviewInventory } from '@/pages/dashboard/overview/OverviewProvider'
import { compact, formatNumber } from '@/utils/number-utils'
import { Card, Empty, Flex, Spin, Typography } from 'antd'
import * as Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import { useMemo } from 'react'

const { Title } = Typography

const BAR_HEIGHT = 20
const NUMBER_OF_SERIES = 2
const SPACING = 10
const DEFAULT_MIN_LOG_AXIS_VALUE = 0.01
const MIN_VISIBLE_BAR_LENGTH = 8

type ChartPointCustom = {
    originalValue?: number
    originalUnit?: string
}

const getChartPointCustom = (point: Highcharts.Point) => {
    const pointOptions = point.options as Highcharts.PointOptionsObject & {
        custom?: ChartPointCustom
    }

    return pointOptions.custom
}

const formatTooltipValue = (value: number) => {
    if (value === 0) {
        return '0'
    }

    return formatNumber(value, value < 1 ? 3 : 2)
}

const InventoryValueByCategory = () => {
    const { valueInventoryByTypeChart, localFilters, isLoading } = useOverviewInventory()

    const options = useMemo<Highcharts.Options>(() => {
        const categories: string[] = []
        const sellData: Highcharts.PointOptionsObject[] = []
        const rentData: Highcharts.PointOptionsObject[] = []
        const positiveValues: number[] = []

        for (const productType of Object.entries(PRODUCT_TYPE_ID)) {
            const [typeKey, typeId] = productType as [keyof typeof PRODUCT_TYPE, number]
            const label = PRODUCT_TYPE[typeKey]
            const productDataById = valueInventoryByTypeChart.find(
                productData => productData.product_type_id === typeId,
            )

            const sellValue = Number(productDataById?.sell_value ?? 0)
            const originalRentValue = Number(productDataById?.rent_value ?? 0)
            const rentValue = originalRentValue > 0 ? originalRentValue / MILLION_PER_BILLION : 0

            if (label && (sellValue || rentValue)) {
                categories.push(label)
                sellData.push({ y: sellValue })
                rentData.push({
                    y: rentValue,
                    custom: {
                        originalValue: originalRentValue,
                        originalUnit: 'triệu',
                    },
                })

                if (sellValue > 0) {
                    positiveValues.push(sellValue)
                }

                if (rentValue > 0) {
                    positiveValues.push(rentValue)
                }
            }
        }

        const smallestPositiveValue = positiveValues.length ? Math.min(...positiveValues) : DEFAULT_MIN_LOG_AXIS_VALUE
        const logAxisMin =
            smallestPositiveValue > 0
                ? Math.min(DEFAULT_MIN_LOG_AXIS_VALUE, smallestPositiveValue / 10)
                : DEFAULT_MIN_LOG_AXIS_VALUE

        const showAll =
            localFilters.product_transaction_type === PRODUCT_TRANSACTION.ALL || !localFilters.product_transaction_type
        const showSell = localFilters.product_transaction_type === PRODUCT_TRANSACTION.SELL || showAll
        const showRent = localFilters.product_transaction_type === PRODUCT_TRANSACTION.RENT || showAll

        const chartOptions: Highcharts.Options = {
            chart: {
                type: 'bar',
                height: categories.length * (BAR_HEIGHT * NUMBER_OF_SERIES + SPACING) + 150,
            },
            title: {
                text: undefined,
            },
            xAxis: {
                categories,
                lineWidth: 0,
                tickLength: 0,
                labels: {
                    style: {
                        width: 100,
                    },
                },
            },
            yAxis: {
                type: 'logarithmic',
                min: logAxisMin,
                title: {
                    text: 'Giá Trị (Tỷ)',
                },
                gridLineDashStyle: 'Dash',
                labels: {
                    formatter() {
                        const parsedValue = Number(this.value)
                        return `${compact(parsedValue)}`
                    },
                },
                opposite: true,
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                symbolRadius: 0,
            },
            tooltip: {
                shared: false,
                formatter() {
                    if (this.y) {
                        return `${compact(this.y)} Tỷ`
                    }

                    return undefined
                },
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    pointPadding: 0.1,
                    pointWidth: 16,
                    dataLabels: {
                        enabled: true,
                        inside: false,
                        style: {
                            fontWeight: '600',
                            textOutline: 'none',
                        },
                        formatter() {
                            return this.y
                        },
                    },
                },
                series: {
                    states: {
                        inactive: { opacity: 1 },
                    },
                },
            },
            credits: { enabled: false },
            series: [
                {
                    name: LEGEND_ITEM.SELL,
                    type: 'bar',
                    color: DASHBOARD_SELL_BAR_COLOR,
                    data: sellData,
                    visible: showSell,
                    dataLabels: {
                        formatter() {
                            return this.y ? compact(this.y) : undefined
                        },
                    },
                },
                {
                    name: LEGEND_ITEM.RENT,
                    type: 'bar',
                    color: DASHBOARD_RENT_BAR_COLOR,
                    data: rentData,
                    visible: showRent,

                    dataLabels: {
                        formatter() {
                            return this.y ? compact(this.y) : undefined
                        },
                    },
                },
            ],
        }

        chartOptions.tooltip = {
            shared: false,
            formatter() {
                const value = Number(this.y ?? 0)

                if (value > 0) {
                    const pointCustom = getChartPointCustom(this)

                    if (this.series.name === LEGEND_ITEM.RENT && typeof pointCustom?.originalValue === 'number') {
                        return `${this.series.name}: ${formatTooltipValue(value)} tỷ (${formatTooltipValue(pointCustom.originalValue)} ${pointCustom.originalUnit})`
                    }

                    return `${this.series.name}: ${formatTooltipValue(value)} tỷ`
                }

                return undefined
            },
        }

        chartOptions.plotOptions = {
            ...chartOptions.plotOptions,
            bar: {
                ...chartOptions.plotOptions?.bar,
                minPointLength: MIN_VISIBLE_BAR_LENGTH,
            },
        }

        return chartOptions
    }, [valueInventoryByTypeChart, localFilters.product_transaction_type])

    const isNoData = !valueInventoryByTypeChart || valueInventoryByTypeChart.length === 0

    return (
        <Card>
            <Title level={5}>Giá Trị Hàng Hóa Theo Phân Loại</Title>

            {isLoading ? (
                <Flex align="center" justify="center" className="h-80">
                    <Spin size="large" />
                </Flex>
            ) : isNoData ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" className="!my-10" />
            ) : (
                <HighchartsReact highcharts={Highcharts} options={options} />
            )}
        </Card>
    )
}

export default InventoryValueByCategory
