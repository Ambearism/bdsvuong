import { CHART_LOG_TYPE } from '@/config/constant'
import {
    type AggregatedLogData,
    type ChartLogType,
    type DashboardProductLogItem,
    type ProductLogTypeKey,
} from '@/types/dashboard'
export interface ProcessedProductLogs {
    categories: string[]
    dataByDate: Record<string, AggregatedLogData>
}

const LOG_TYPE_TO_CHART_TYPE: Record<ProductLogTypeKey, ChartLogType> = {
    CREATE: CHART_LOG_TYPE.CREATE,
    EDIT_PRICE: CHART_LOG_TYPE.EDIT_PRICE,
    CHANGE_STATUS: CHART_LOG_TYPE.CHANGE_STATUS,
    EDIT_INFO: CHART_LOG_TYPE.EDIT_INFO,
    EDIT_SUPPLIER: CHART_LOG_TYPE.EDIT_INFO,
    EDIT_SELL_STATUS: CHART_LOG_TYPE.CHANGE_STATUS,
}

export const getDateKey = (createdAt: string): string => {
    const [, datePart] = createdAt.split(' ')
    if (!datePart) return createdAt
    const [day, month] = datePart.split('/')
    return day && month ? `${day}/${month}` : datePart
}

const createEmptyAggregatedData = (): AggregatedLogData => ({
    CREATE: 0,
    EDIT_PRICE: 0,
    CHANGE_STATUS: 0,
    EDIT_INFO: 0,
    TOTAL: 0,
})

export const processProductLogs = (items: DashboardProductLogItem[]): ProcessedProductLogs => {
    const dataByDate = items.reduce<Record<string, AggregatedLogData>>((acc, item) => {
        const dateKey = getDateKey(item.created_at)
        if (!acc[dateKey]) {
            acc[dateKey] = createEmptyAggregatedData()
        }
        const chartType = LOG_TYPE_TO_CHART_TYPE[item.type]
        acc[dateKey][chartType]++
        acc[dateKey].TOTAL++
        return acc
    }, {})
    const categories = Object.keys(dataByDate).reverse()
    return { categories, dataByDate }
}
export const getDataSeries = (
    categories: string[],
    dataByDate: Record<string, AggregatedLogData>,
    type: ChartLogType | 'TOTAL',
): number[] => categories.map(date => dataByDate[date]?.[type] ?? 0)

export const formatValue = (val: number | undefined) => {
    if (val === undefined) return '0'
    return val.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })
}

export const formatChange = (val: number | undefined, suffix: string = '', isPercent: boolean = false) => {
    if (val === undefined || val === 0) return undefined
    const prefix = val > 0 ? '+' : ''
    const formatted = formatValue(val)
    return `${prefix}${formatted}${isPercent ? '%' : ''} ${suffix}`
}
