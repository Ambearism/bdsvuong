import { useGetDashboardStatisticsQuery } from '@/api/dashboard'
import { useGetEnumOptionsQuery } from '@/api/types'
import { PERIOD_TYPE, PERIOD_TYPE_OPTIONS } from '@/config/constant'
import { type DashboardInventoryByPeriodParams } from '@/types/dashboard'
import { type PeriodType } from '@/types'
import { Button, Col, Flex, Row, Select, Space, Typography } from 'antd'
import { useMemo, useState, useCallback } from 'react'
import { formatValue } from '@/utils/dashboard'
import StatisticCard from '@/pages/dashboard/components/StatisticCard'

const { Title } = Typography

type ProductStatsParams = DashboardInventoryByPeriodParams & { product_type_id?: number }

const ProductStats = ({
    title = 'Tổng Quan Hàng Hóa',
    filterParams,
    onFilterChange,
    showFilters = true,
}: {
    title?: string
    filterParams?: ProductStatsParams
    onFilterChange?: (params: ProductStatsParams) => void
    showFilters?: boolean
}) => {
    const [internalParams, setInternalParams] = useState<ProductStatsParams>({
        period_type: PERIOD_TYPE.LAST_7_DAYS,
    })

    const params = filterParams || internalParams

    const updateParams = useCallback(
        (value: ProductStatsParams | ((prev: ProductStatsParams) => ProductStatsParams)) => {
            const next = typeof value === 'function' ? value(params) : value
            if (onFilterChange) {
                onFilterChange(next)
            } else {
                setInternalParams(next)
            }
        },
        [onFilterChange, params],
    )

    const { data: statsData, isLoading } = useGetDashboardStatisticsQuery(params)
    const { data: enumsData } = useGetEnumOptionsQuery(['product_types'])

    const overview = useMemo(() => statsData?.data?.overview, [statsData])

    const productTypeOptions = useMemo(() => {
        return (
            enumsData?.data?.product_types?.map(productType => ({
                value: productType.value,
                label: productType.label,
            })) || []
        )
    }, [enumsData])

    const handleReset = useCallback(() => {
        updateParams({ period_type: PERIOD_TYPE.LAST_7_DAYS })
    }, [updateParams])

    const handlePeriodChange = useCallback(
        (periodType: PeriodType) => {
            updateParams((prev: ProductStatsParams) => ({ ...prev, period_type: periodType }))
        },
        [updateParams],
    )

    const handleProductTypeChange = useCallback(
        (productTypeId: number | undefined) => {
            updateParams((prev: ProductStatsParams) => ({ ...prev, product_type_id: productTypeId }))
        },
        [updateParams],
    )

    return (
        <div className="w-full">
            {showFilters && (
                <Flex justify="space-between" align="center" className="!mb-4">
                    <Title level={4} className="!mb-0">
                        {title}
                    </Title>
                    <Space size="middle">
                        <Select
                            className="min-w-40"
                            value={params.period_type}
                            options={PERIOD_TYPE_OPTIONS}
                            onChange={handlePeriodChange}
                        />
                        <Select
                            className="min-w-40"
                            placeholder="Tất cả Hàng Hóa"
                            allowClear
                            value={params.product_type_id}
                            options={productTypeOptions}
                            onChange={handleProductTypeChange}
                        />
                        <Button type="primary" onClick={handleReset} className="!bg-[#005082]">
                            Reset Bộ Lọc
                        </Button>
                    </Space>
                </Flex>
            )}

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={6} lg={4}>
                    <StatisticCard
                        title="Lead Mới"
                        value={formatValue(overview?.new_leads.value)}
                        unit={overview?.new_leads.unit || ''}
                        trend={overview?.new_leads.trend}
                        loading={isLoading}
                        rawValue={overview?.new_leads.value}
                    />
                </Col>
                <Col xs={24} sm={6} lg={4}>
                    <StatisticCard
                        title="Deal Đang Mở"
                        value={formatValue(overview?.open_deals.value)}
                        unit={overview?.open_deals.unit || ''}
                        trend={overview?.open_deals.trend}
                        loading={isLoading}
                        rawValue={overview?.open_deals.value}
                    />
                </Col>
                <Col xs={24} sm={6} lg={4}>
                    <StatisticCard
                        title="Deal Chốt Thành Công"
                        value={formatValue(overview?.won_deals.value)}
                        unit={overview?.won_deals.unit || ''}
                        trend={overview?.won_deals.trend}
                        loading={isLoading}
                        rawValue={overview?.won_deals.value}
                    />
                </Col>
                <Col xs={24} sm={6} lg={4}>
                    <StatisticCard
                        title="Giao Dịch Hoàn Tất (Giá Trị)"
                        value={formatValue(overview?.completed_transactions.value)}
                        unit={overview?.completed_transactions.unit || ''}
                        trend={overview?.completed_transactions.trend}
                        loading={isLoading}
                        rawValue={overview?.completed_transactions.value}
                    />
                </Col>
                <Col xs={24} sm={6} lg={4}>
                    <StatisticCard
                        title="Giá Trị Hàng Tồn"
                        value={formatValue(overview?.inventory_value.value)}
                        unit={overview?.inventory_value.unit || ''}
                        trend={overview?.inventory_value.trend}
                        loading={isLoading}
                        rawValue={overview?.inventory_value.value}
                    />
                </Col>
                <Col xs={24} sm={6} lg={4}>
                    <StatisticCard
                        title="Tỷ Lệ Lead -> Giao Dịch"
                        value={formatValue(overview?.lead_to_transaction_rate.value)}
                        unit={overview?.lead_to_transaction_rate.unit || '%'}
                        loading={isLoading}
                        rawValue={overview?.lead_to_transaction_rate.value}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ProductStats
