import { useGetDashboardOverviewInventoryQuery } from '@/api/dashboard'
import { PERIOD_TYPE } from '@/config/constant'
import type {
    DashboardInventoryByPeriodParams,
    DashboardTransactionKeyType,
    OverviewByTypeData,
} from '@/types/dashboard'
import { createContext, useContext, useState, type ReactNode } from 'react'

type OverviewInventoryProviderProps = {
    children: ReactNode
}

type OverviewInventoryContextValue = {
    valueInventoryByTypeChart: OverviewByTypeData[]
    isLoading: boolean
    localFilters: OverviewInventoryLocalFilter
    filterParams: DashboardInventoryByPeriodParams
}

type OverviewInventoryLocalFilter = {
    product_transaction_type: DashboardTransactionKeyType | undefined
}

const OverviewInventoryContext = createContext<OverviewInventoryContextValue | undefined>(undefined)

const DEFAULT_LOCAL_FILTER: OverviewInventoryLocalFilter = {
    product_transaction_type: undefined,
}

const DEFAULT_FILTER_PARAMS: DashboardInventoryByPeriodParams = {
    period_type: PERIOD_TYPE.ALL,
}

export const OverviewInventoryProvider = ({ children }: OverviewInventoryProviderProps) => {
    const [localFilters] = useState<OverviewInventoryLocalFilter>(DEFAULT_LOCAL_FILTER)
    const [filterParams] = useState<DashboardInventoryByPeriodParams>(DEFAULT_FILTER_PARAMS)

    const { data: overviewInventoryData, isLoading: isOverviewInventoryLoading } =
        useGetDashboardOverviewInventoryQuery(filterParams)

    // const handleToggleFilterButton = (periodType: PeriodType) => () => {
    //     setFilterParams({
    //         period_type: periodType,
    //         start_date: undefined,
    //         end_date: undefined,
    //     })
    // }

    return (
        <OverviewInventoryContext.Provider
            value={{
                valueInventoryByTypeChart: overviewInventoryData?.data.value_inventory_by_type_chart || [],
                isLoading: isOverviewInventoryLoading,
                localFilters,
                filterParams,
            }}>
            {/* <Flex gap={12} justify="end" className="!mb-4">
                <Button
                    type={filterParams.period_type === PERIOD_TYPE.LAST_7_DAYS ? 'primary' : 'default'}
                    onClick={handleToggleFilterButton(PERIOD_TYPE.LAST_7_DAYS)}>
                    7 Ngày Gần Nhất
                </Button>
                <Button
                    type={filterParams.period_type === PERIOD_TYPE.THIS_MONTH ? 'primary' : 'default'}
                    onClick={handleToggleFilterButton(PERIOD_TYPE.THIS_MONTH)}>
                    Tháng này
                </Button>
                <DatePicker.RangePicker
                    format="DD-MM-YYYY"
                    className={classNames('!w-1/8', {
                        '!bg-blue-500 !text-white [&_.ant-picker-separator]:!text-white [&_.ant-picker-suffix]:!text-white [&_.ant-picker-clear]:!text-white':
                            filterParams.period_type === PERIOD_TYPE.CUSTOM,
                    })}
                    value={
                        filterParams.start_date && filterParams.end_date
                            ? [dayjs(filterParams.start_date), dayjs(filterParams.end_date)]
                            : null
                    }
                    onChange={values => {
                        if (!values) {
                            setFilterParams(DEFAULT_FILTER_PARAMS)
                        } else {
                            const start = values?.[0]?.format('YYYY-MM-DD')
                            const end = values?.[1]?.format('YYYY-MM-DD')

                            setFilterParams({
                                period_type: PERIOD_TYPE.CUSTOM,
                                start_date: start,
                                end_date: end,
                            })
                        }
                    }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                />
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
                <Button
                    type="primary"
                    onClick={() => {
                        setLocalFilters(DEFAULT_LOCAL_FILTER)
                        setFilterParams(DEFAULT_FILTER_PARAMS)
                    }}>
                    Reset
                </Button>
            </Flex> */}
            {children}
        </OverviewInventoryContext.Provider>
    )
}

export const useOverviewInventory = () => {
    const context = useContext(OverviewInventoryContext)

    if (!context) {
        throw new Error('useOverviewInventory must be used within OverviewInventoryProvider')
    }

    return context
}
