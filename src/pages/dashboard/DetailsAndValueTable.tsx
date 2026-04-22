import {
    DASHBOARD_TABLE_SHOW_ONLY,
    HIGHLIGHT_BG_COLOR,
    PRODUCT_TRANSACTION,
    SELECTED_BG_COLOR,
} from '@/config/constant'
import { sumToBillion } from '@/lib/utils'
import type {
    DashboardInventoryLocalFilter,
    DashboardProductDetailsAndValueItem,
    DashboardTableShowOnlyType,
    DashboardTransactionKeyType,
} from '@/types/dashboard'
import { formatNumber } from '@/utils/number-utils'
import { Flex, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import classNames from 'classnames'
import { useState } from 'react'

const { Text } = Typography

const onClickHeaderCell = ({
    selectedColumnKey,
    key,
    setSelectedColumnKey,
    setSelectedRowIndex,
}: {
    selectedColumnKey: string | null
    key: string
    setSelectedColumnKey: React.Dispatch<React.SetStateAction<string | null>>
    setSelectedRowIndex: React.Dispatch<React.SetStateAction<number | null>>
}) => ({
    onClick: () => {
        setSelectedColumnKey(prev => (prev === key ? null : key))
        setSelectedRowIndex(null)
    },
    className: classNames(selectedColumnKey === key && SELECTED_BG_COLOR),
})

const renderValuesCell = (
    collection: DashboardProductDetailsAndValueItem[keyof Omit<
        DashboardProductDetailsAndValueItem,
        'type_product_name_or_total'
    >],
    transactionKey: DashboardTransactionKeyType | undefined,
    productShowOnly: DashboardTableShowOnlyType | undefined,
    unit: string,
) => {
    if (!collection) return

    const { count, value, fee } =
        !transactionKey || transactionKey === PRODUCT_TRANSACTION.ALL
            ? {
                  count: collection['SELL'].count + collection['RENT'].count,
                  value: sumToBillion(collection['SELL'].value, collection['RENT'].value),
                  fee: sumToBillion(collection['SELL'].fee, collection['RENT'].fee),
              }
            : {
                  count: collection[transactionKey].count,
                  value: collection[transactionKey].value,
                  fee: collection[transactionKey].fee,
              }

    const showCount = !productShowOnly || productShowOnly === DASHBOARD_TABLE_SHOW_ONLY.COUNT
    const showValue = !productShowOnly || productShowOnly === DASHBOARD_TABLE_SHOW_ONLY.VALUE
    const showFee = !productShowOnly || productShowOnly === DASHBOARD_TABLE_SHOW_ONLY.FEE

    const showOnlyCount = showCount && !showValue && !showFee

    return (
        <Flex vertical gap={4}>
            {showCount && (
                <Text
                    type={value ? (showOnlyCount ? undefined : 'danger') : 'secondary'}
                    className={showOnlyCount ? '!text-xs font-medium' : '!text-sm font-semibold'}>
                    {formatNumber(count)}
                </Text>
            )}
            {showValue && (
                <Text type={value ? undefined : 'secondary'} className="!text-xs font-medium">
                    {formatNumber(value)} {unit}
                </Text>
            )}
            {showFee && (
                <Text type={fee ? undefined : 'secondary'} className="!text-xs font-medium">
                    {formatNumber(fee)} {unit}
                </Text>
            )}
        </Flex>
    )
}

const getColumns = (
    transactionKey: DashboardTransactionKeyType | undefined,
    productShowOnly: DashboardTableShowOnlyType | undefined,
    selectedColumnKey: string | null,
    setSelectedColumnKey: React.Dispatch<React.SetStateAction<string | null>>,
    setSelectedRowIndex: React.Dispatch<React.SetStateAction<number | null>>,
    dataLength: number,
    unit: string,
): ColumnsType<DashboardProductDetailsAndValueItem> => [
    {
        title: 'Loại BDS',
        dataIndex: 'type_product_name_or_total',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'type_product_name_or_total',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'type_product_name_or_total' && SELECTED_BG_COLOR),
        }),
        render: (
            _: DashboardProductDetailsAndValueItem,
            record: DashboardProductDetailsAndValueItem,
            index: number,
        ) => {
            const isLastRow = index === dataLength - 1
            return (
                <Flex vertical gap={4}>
                    <Text className={isLastRow ? '!text-sm font-bold' : '!text-xs'}>
                        {record.type_product_name_or_total}
                    </Text>
                </Flex>
            )
        },
    },
    {
        title: 'Chính chủ',
        dataIndex: 'owner',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'owner',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'owner' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.owner, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Môi giới',
        dataIndex: 'broker',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'broker',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'broker' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.broker, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Tổng',
        dataIndex: 'total_by_type',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'total_by_type',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(HIGHLIGHT_BG_COLOR, selectedColumnKey === 'total_by_type' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.total_by_type, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Chờ bán',
        dataIndex: 'waiting_sale',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'waiting_sale',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'waiting_sale' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.waiting_sale, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Chưa bán',
        dataIndex: 'not_sold',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'not_sold',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'not_sold' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.not_sold, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Đã cọc',
        dataIndex: 'deposited',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'deposited',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'deposited' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.deposited, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Đã bán',
        dataIndex: 'sold',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'sold',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'sold' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.sold, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Huỷ hàng',
        dataIndex: 'cancelled',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'cancelled',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(selectedColumnKey === 'cancelled' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.cancelled, transactionKey, productShowOnly, unit),
    },
    {
        title: 'Tổng',
        dataIndex: 'total_by_type',
        align: 'right',
        onHeaderCell: () =>
            onClickHeaderCell({
                selectedColumnKey,
                key: 'total_by_type',
                setSelectedColumnKey,
                setSelectedRowIndex,
            }),
        onCell: () => ({
            className: classNames(HIGHLIGHT_BG_COLOR, selectedColumnKey === 'total_by_type' && SELECTED_BG_COLOR),
        }),
        render: (_: DashboardProductDetailsAndValueItem, record: DashboardProductDetailsAndValueItem) =>
            renderValuesCell(record.total_by_type, transactionKey, productShowOnly, unit),
    },
]

const DetailsAndValueTable = ({
    filter,
    data,
    loading,
    unit,
}: {
    filter: DashboardInventoryLocalFilter
    data: DashboardProductDetailsAndValueItem[]
    loading: boolean
    unit: string
}) => {
    const [selectedColumnKey, setSelectedColumnKey] = useState<string | null>(null)
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)

    const onClickRow = (index: number | undefined) => () => {
        if (index !== undefined) {
            setSelectedRowIndex(prev => (prev === index ? null : index))
            setSelectedColumnKey(null)
        }
    }

    return (
        <Table
            className="no-padding-table header-table-xs dashboard-statistics-table"
            size="small"
            rowKey="type_product_name_or_total"
            columns={getColumns(
                filter.product_transaction_type,
                filter.product_show_only,
                selectedColumnKey,
                setSelectedColumnKey,
                setSelectedRowIndex,
                data.length,
                unit,
            )}
            dataSource={data}
            loading={loading}
            bordered
            rowClassName={(_, index) => (index !== undefined && selectedRowIndex === index ? SELECTED_BG_COLOR : '')}
            onRow={(_, index) => ({
                onClick: onClickRow(index),
                className: classNames(index === data.length - 1 && HIGHLIGHT_BG_COLOR),
            })}
            scroll={{ x: 'max-content' }}
            pagination={false}
        />
    )
}

export default DetailsAndValueTable
