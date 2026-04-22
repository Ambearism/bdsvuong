import { Card, Empty, Flex, Spin, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import * as Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import { useMemo } from 'react'

import { useGetLeadSourceChartsQuery } from '@/api/opportunity'
import type { LeadSourceType, LeadSourceChartItem, OpportunityStageType } from '@/types/opportunity'
import { DEAL_STAGES, LeadSourceLabels, PERIOD_TYPE } from '@/config/constant'

const { Title } = Typography

type LeadSourceRow = {
    key: string
    channel: string
    lead: number
    generatedDeal: number
}

const LeadSource = () => {
    const { data: opportunityData, isLoading } = useGetLeadSourceChartsQuery(
        {
            period_type: PERIOD_TYPE.ALL,
        },
        { refetchOnMountOrArgChange: true },
    )

    const rows: LeadSourceRow[] = useMemo(() => {
        const items = (opportunityData?.data?.items ?? []) as LeadSourceChartItem[]
        if (!items.length) return []

        const resultMap = new Map<string, LeadSourceRow>()

        items.forEach(item => {
            const source = item.lead_source as LeadSourceType | null
            if (source === undefined) return

            const label = source === null ? 'Khác' : LeadSourceLabels[source]
            const key = String(source)
            const finalLabel = label || 'Khác'

            const existing = resultMap.get(key) ?? {
                key,
                channel: finalLabel,
                lead: 0,
                generatedDeal: 0,
            }

            existing.lead += 1

            if (item.stage && DEAL_STAGES.includes(item.stage as OpportunityStageType)) {
                existing.generatedDeal += 1
            }

            resultMap.set(key, existing)
        })

        return Array.from(resultMap.values()).sort((a, b) => {
            if (a.key === 'null') return 1
            if (b.key === 'null') return -1
            return b.lead - a.lead
        })
    }, [opportunityData])

    const pieData = useMemo<Highcharts.PointOptionsObject[]>(() => {
        if (!rows.length) return []

        return rows.map(row => ({
            name: row.channel,
            y: row.lead,
        }))
    }, [rows])

    const options = useMemo<Highcharts.Options>(
        () => ({
            chart: {
                type: 'pie',
                height: 350,
            },
            title: {
                text: undefined,
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b><br/>Lead: {point.y}',
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.percentage:.1f}%',
                    },
                    showInLegend: true,
                },
            },
            legend: {
                enabled: true,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
            },
            credits: {
                enabled: false,
            },
            series: [
                {
                    name: 'Leads',
                    type: 'pie',
                    data: pieData,
                },
            ],
        }),
        [pieData],
    )

    const columns: ColumnsType<LeadSourceRow> = [
        {
            title: 'Kênh',
            dataIndex: 'channel',
            key: 'channel',
            width: '40%',
            align: 'center',
        },
        {
            title: 'Lead',
            dataIndex: 'lead',
            key: 'lead',
            width: '30%',
            align: 'center',
        },
        {
            title: 'Deal Sinh Ra',
            dataIndex: 'generatedDeal',
            key: 'generatedDeal',
            width: '30%',
            align: 'center',
        },
    ]

    const isNoData = !rows.length

    return (
        <Card bodyStyle={{ padding: 0 }} className="h-full p-0">
            <div className="p-6">
                <Title level={5}>Nguồn Lead</Title>

                {isLoading ? (
                    <Flex align="center" justify="center" className="h-80">
                        <Spin size="large" />
                    </Flex>
                ) : isNoData ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" className="!my-10" />
                ) : (
                    <div className="flex justify-center mb-6">
                        <div className="w-full max-w-125">
                            <HighchartsReact highcharts={Highcharts} options={options} />
                        </div>
                    </div>
                )}
            </div>

            {!isLoading && !isNoData && (
                <Table<LeadSourceRow>
                    columns={columns}
                    dataSource={rows}
                    pagination={false}
                    rowKey="key"
                    size="small"
                    className="[&_th::before]:!bg-transparent"
                />
            )}
        </Card>
    )
}

export default LeadSource
