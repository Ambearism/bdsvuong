import { useGetEmployeeConversionRateQuery } from '@/api/dashboard'
import { colors } from '@/config/colors'
import { PERIOD_TYPE, PERIOD_TYPE_OPTIONS } from '@/config/constant'
import type { PeriodType } from '@/types'
import { Card, Empty, Flex, Select, Spin, Typography } from 'antd'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useMemo, useState } from 'react'

const { Title } = Typography

const PerformanceRankingChart = () => {
    const [periodType, setPeriodType] = useState<PeriodType>(PERIOD_TYPE.THIS_MONTH)

    const { data: conversionRates, isLoading } = useGetEmployeeConversionRateQuery({
        period_type: periodType,
    })

    const seriesData = useMemo(() => {
        if (!conversionRates?.data) return []

        const colorPalette = [colors.green, colors.yellow, colors.red, colors.blue, colors.primary]

        return conversionRates.data.map((item, index) => ({
            name: item.name,
            y: item.value,
            color: colorPalette[index % colorPalette.length],
        }))
    }, [conversionRates])

    const options: Highcharts.Options = useMemo(
        () => ({
            chart: {
                type: 'column',
                height: 350,
            },
            title: {
                text: '',
            },
            xAxis: {
                categories: seriesData.map(d => d.name),
                crosshair: true,
                lineWidth: 0,
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Hiệu suất Lead → Giao dịch',
                },
                labels: {
                    format: '{value}%',
                },
                gridLineDashStyle: 'Dash',
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat:
                    '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true,
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}%',
                        style: {
                            color: '#FFFFFF',
                            textOutline: 'none',
                        },
                        inside: true,
                        verticalAlign: 'bottom',
                    },
                },
            },
            series: [
                {
                    name: 'Conversion Rate',
                    type: 'column',
                    data: seriesData,
                    showInLegend: false,
                },
            ],
            credits: {
                enabled: false,
            },
        }),
        [seriesData],
    )

    const averageConversionRate = useMemo(() => {
        if (!seriesData.length) return 0
        const total = seriesData.reduce((acc, curr) => acc + curr.y, 0)
        return (total / seriesData.length).toFixed(2)
    }, [seriesData])

    return (
        <Card className="h-full flex flex-col" bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Flex justify="space-between" align="center" className="mb-4">
                <Title level={5} style={{ margin: 0 }}>
                    Xếp hạng hiệu suất
                </Title>
                <Select
                    defaultValue={PERIOD_TYPE.THIS_MONTH}
                    value={periodType}
                    onChange={value => setPeriodType(value)}
                    options={PERIOD_TYPE_OPTIONS}
                />
            </Flex>

            <div className="text-gray-500 mb-2">Hiệu suất Lead → Giao dịch</div>
            <div className="text-2xl font-bold mb-4">{averageConversionRate}%</div>

            {isLoading ? (
                <Flex align="center" justify="center" flex={1}>
                    <Spin size="large" />
                </Flex>
            ) : seriesData.length === 0 ? (
                <Flex align="center" justify="center" flex={1}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />
                </Flex>
            ) : (
                <HighchartsReact highcharts={Highcharts} options={options} />
            )}
        </Card>
    )
}

export default PerformanceRankingChart
