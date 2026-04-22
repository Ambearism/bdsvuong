import { useGetEmployeeTransactionValueQuery } from '@/api/dashboard'
import { colors } from '@/config/colors'
import { PERIOD_TYPE, PERIOD_TYPE_OPTIONS } from '@/config/constant'
import type { PeriodType } from '@/types'
import { Card, Empty, Flex, Select, Spin, Typography } from 'antd'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useMemo, useState } from 'react'

const { Title } = Typography

const TransactionValueChart = () => {
    const [periodType, setPeriodType] = useState<PeriodType>(PERIOD_TYPE.THIS_MONTH)

    const { data: transactionValues, isLoading } = useGetEmployeeTransactionValueQuery({
        period_type: periodType,
    })

    const categories = useMemo(() => {
        return transactionValues?.data?.categories || []
    }, [transactionValues])

    const seriesData = useMemo(() => {
        if (!transactionValues?.data?.series) return []

        const colorPalette = [
            colors.blue,
            colors.green,
            colors.yellow,
            colors.red,
            colors.primary,
            colors.purple,
            colors.cyan,
            colors.magenta,
            colors.volcano,
            colors.orange,
            colors.gold,
            colors.lime,
        ]

        return transactionValues.data.series.map((item, index) => ({
            name: item.name,
            type: 'spline' as const,
            data: item.data,
            color: colorPalette[index % colorPalette.length],
            lineWidth: 2,
        }))
    }, [transactionValues])

    const isNoData =
        !transactionValues?.data?.series?.length || transactionValues.data.series.every(s => s.data.every(v => v === 0))

    const options: Highcharts.Options = useMemo(
        () => ({
            chart: {
                type: 'spline',
                height: 350,
            },
            title: {
                text: '',
            },
            xAxis: {
                categories: categories,
                crosshair: true,
                lineWidth: 0,
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Giá trị Giao Dịch (tỷ)',
                },
                gridLineDashStyle: 'Dash',
            },
            tooltip: {
                shared: true,
                useHTML: true,
                headerFormat: '<small>{point.key}</small><table>',
                pointFormat:
                    '<tr><td style="color: {series.color}">{series.name}: </td>' +
                    '<td style="text-align: right"><b>{point.y} tỷ</b></td></tr>',
                footerFormat: '</table>',
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4,
                        fillColor: colors.white,
                        lineWidth: 2,
                        lineColor: undefined,
                    },
                },
            },
            series: seriesData,
            credits: {
                enabled: false,
            },
            legend: {
                enabled: false,
            },
        }),
        [seriesData, categories],
    )

    return (
        <Card className="h-full flex flex-col" bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Flex justify="space-between" align="center" className="mb-4">
                <Title level={5} style={{ margin: 0 }}>
                    Giá Trị Giao Dịch
                </Title>
                <Select
                    defaultValue={PERIOD_TYPE.THIS_MONTH}
                    value={periodType}
                    onChange={value => setPeriodType(value)}
                    options={PERIOD_TYPE_OPTIONS}
                />
            </Flex>

            <div className="h-4"></div>

            {isLoading ? (
                <Flex align="center" justify="center" flex={1}>
                    <Spin size="large" />
                </Flex>
            ) : isNoData ? (
                <Flex align="center" justify="center" flex={1}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />
                </Flex>
            ) : (
                <HighchartsReact highcharts={Highcharts} options={options} />
            )}
        </Card>
    )
}

export default TransactionValueChart
