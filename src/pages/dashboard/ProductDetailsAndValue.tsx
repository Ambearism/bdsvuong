import { useGetDashboardDetailsInventoryQuery } from '@/api/dashboard'
import { useGetEnumOptionsQuery } from '@/api/types'
import { PRODUCT_TRANSACTION, PRODUCT_TRANSACTION_OPTION, SHOW_ONLY_OPTION } from '@/config/constant'
import DetailsAndValueTable from '@/pages/dashboard/DetailsAndValueTable'
import type {
    ByTypeData,
    DashboardInventoryLocalFilter,
    DashboardProductDetailsAndValueItem,
    DashboardProductValueItem,
} from '@/types/dashboard'
import { Button, Flex, Select, Tooltip, Typography } from 'antd'
import classNames from 'classnames'
import { useState } from 'react'

const { Text } = Typography

function buildTotalRow(data: DashboardProductDetailsAndValueItem[]): DashboardProductDetailsAndValueItem {
    const totalRow = {
        type_product_name_or_total: 'Tổng cộng',
    } as DashboardProductDetailsAndValueItem

    data.forEach(item => {
        Object.entries(item).forEach(([_blockKey, _blockValue]) => {
            const blockKey = _blockKey as keyof DashboardProductDetailsAndValueItem
            const blockValue = _blockValue as DashboardProductValueItem

            if (blockKey === 'type_product_name_or_total') return

            if (!totalRow[blockKey]) {
                totalRow[blockKey] = {} as DashboardProductValueItem
            }

            Object.entries(blockValue).forEach(([_scopeKey, _scopeValue]) => {
                const scopeKey = _scopeKey as keyof DashboardProductValueItem
                const scopeValue = _scopeValue as DashboardProductValueItem[keyof DashboardProductValueItem]

                if (!totalRow[blockKey][scopeKey]) {
                    totalRow[blockKey][scopeKey] = {
                        count: 0,
                        value: 0,
                        fee: 0,
                    }
                }

                totalRow[blockKey][scopeKey].count += scopeValue.count || 0
                totalRow[blockKey][scopeKey].value += scopeValue.value || 0
                totalRow[blockKey][scopeKey].fee += scopeValue.fee || 0
            })
        })
    })

    return totalRow as DashboardProductDetailsAndValueItem
}

const combineData = (raw: ByTypeData): DashboardProductDetailsAndValueItem => {
    return {
        type_product_name_or_total: raw.product_type_name,
        owner: {
            SELL: {
                count: raw.sell_owner_count,
                value: raw.sell_owner_value,
                fee: raw.sell_owner_fee,
            },
            RENT: {
                count: raw.rent_owner_count,
                value: raw.rent_owner_value,
                fee: raw.rent_owner_fee,
            },
        },
        broker: {
            SELL: {
                count: raw.sell_broker_count,
                value: raw.sell_broker_value,
                fee: raw.sell_broker_fee,
            },
            RENT: {
                count: raw.rent_broker_count,
                value: raw.rent_broker_value,
                fee: raw.rent_broker_fee,
            },
        },
        total_by_type: {
            SELL: {
                count: raw.sell_count,
                value: raw.sell_value,
                fee: raw.sell_fee,
            },
            RENT: {
                count: raw.rent_count,
                value: raw.rent_value,
                fee: raw.rent_fee,
            },
        },
        waiting_sale: {
            SELL: {
                count: raw.sell_waiting_count,
                value: raw.sell_waiting_value,
                fee: raw.sell_waiting_fee,
            },
            RENT: {
                count: raw.rent_waiting_count,
                value: raw.rent_waiting_value,
                fee: raw.rent_waiting_fee,
            },
        },
        not_sold: {
            SELL: {
                count: raw.sell_not_waiting_count,
                value: raw.sell_not_waiting_value,
                fee: raw.sell_not_waiting_fee,
            },
            RENT: {
                count: raw.rent_not_waiting_count,
                value: raw.rent_not_waiting_value,
                fee: raw.rent_not_waiting_fee,
            },
        },
        deposited: {
            SELL: {
                count: raw.sell_deposit_count,
                value: raw.sell_deposit_value,
                fee: raw.sell_deposit_fee,
            },
            RENT: {
                count: raw.rent_deposit_count,
                value: raw.rent_deposit_value,
                fee: raw.rent_deposit_fee,
            },
        },
        sold: {
            SELL: {
                count: raw.sell_sold_count,
                value: raw.sell_sold_value,
                fee: raw.sell_sold_fee,
            },
            RENT: {
                count: raw.rent_sold_count,
                value: raw.rent_sold_value,
                fee: raw.rent_sold_fee,
            },
        },
        cancelled: {
            SELL: {
                count: raw.sell_cancelled_count,
                value: raw.sell_cancelled_value,
                fee: raw.sell_cancelled_fee,
            },
            RENT: {
                count: raw.rent_cancelled_count,
                value: raw.rent_cancelled_value,
                fee: raw.rent_cancelled_fee,
            },
        },
        total: {
            SELL: {
                count: raw.sell_cancelled_count,
                value: raw.sell_cancelled_value,
                fee: raw.sell_cancelled_fee,
            },
            RENT: {
                count: raw.rent_cancelled_count,
                value: raw.rent_cancelled_value,
                fee: raw.rent_cancelled_fee,
            },
        },
    }
}

const DEFAULT_LOCAL_FILTER: DashboardInventoryLocalFilter = {
    product_transaction_type: undefined,
    product_show_only: undefined,
    product_type_ids: [],
}

const ProductDetailsAndValue = () => {
    const [localFilters, setLocalFilters] = useState<DashboardInventoryLocalFilter>(DEFAULT_LOCAL_FILTER)

    const { data: enumData } = useGetEnumOptionsQuery(['product_types'])
    const { data: inventoryData, isLoading: isInventoryLoading } = useGetDashboardDetailsInventoryQuery()

    const rawRows = (inventoryData?.data.by_type_data || []) as ByTypeData[]

    const rows =
        localFilters.product_type_ids.length > 0
            ? rawRows.filter(row => localFilters.product_type_ids.includes(row.product_type_id))
            : rawRows
    const combinedData = rows.map(combineData)
    const totalRow = buildTotalRow(combinedData)

    const fullData: DashboardProductDetailsAndValueItem[] = combinedData.length
        ? [...combinedData, totalRow]
        : [...combinedData]

    const unit = localFilters.product_transaction_type === PRODUCT_TRANSACTION.RENT ? 'triệu' : 'tỷ'

    return (
        <>
            <Text strong className="!text-lg">
                Chi Tiết Hàng Hóa & Giá Trị
            </Text>
            <Text className={classNames('!block', localFilters.product_show_only && 'invisible')}>
                • Dòng 1 trong ô = Số lượng • Dòng 2 = Giá trị ({unit}) • Dòng 3 = Phí ({unit})
            </Text>
            <Flex justify="start" gap={12} className="!my-4">
                <Tooltip title="Lọc theo mục đích">
                    <Select
                        placeholder="Loại hàng"
                        className="!w-1/8"
                        allowClear
                        value={localFilters.product_transaction_type}
                        options={PRODUCT_TRANSACTION_OPTION}
                        onChange={value => {
                            setLocalFilters(prev => ({ ...prev, product_transaction_type: value }))
                        }}
                    />
                </Tooltip>
                <Tooltip title="Chỉ định chỉ hiện theo">
                    <Select
                        placeholder="SL/Giá Trị/Phí"
                        className="!w-1/8"
                        allowClear
                        value={localFilters.product_show_only}
                        options={SHOW_ONLY_OPTION}
                        onChange={value => {
                            setLocalFilters(prev => ({ ...prev, product_show_only: value }))
                        }}
                    />
                </Tooltip>
                <Tooltip title="Lọc theo loại hình BĐS">
                    <Select
                        mode="multiple"
                        placeholder="Loại BĐS"
                        className="!w-1/4"
                        allowClear
                        value={localFilters.product_type_ids}
                        options={enumData?.data?.product_types}
                        onChange={(value: number[]) => {
                            setLocalFilters(prev => ({ ...prev, product_type_ids: value }))
                        }}
                    />
                </Tooltip>
                <Button
                    type="primary"
                    onClick={() => {
                        setLocalFilters(DEFAULT_LOCAL_FILTER)
                    }}>
                    Reset
                </Button>
            </Flex>
            <DetailsAndValueTable filter={localFilters} data={fullData} loading={isInventoryLoading} unit={unit} />
        </>
    )
}

export default ProductDetailsAndValue
