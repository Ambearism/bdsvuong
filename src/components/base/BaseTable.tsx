import { Card, Table } from 'antd'
import type { TableProps } from 'antd'
import type { ReactNode, ComponentProps } from 'react'

type BaseTableProps<T> = {
    data: T[]
    columns: TableProps<T>['columns']
    loading?: boolean
    rowKey?: TableProps<T>['rowKey']
    total?: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    scrollX?: number
    size?: 'small' | 'middle' | 'large'

    cardTitle?: ReactNode
    cardExtra?: ReactNode
    cardProps?: ComponentProps<typeof Card>

    tableProps?: Omit<
        TableProps<T>,
        'dataSource' | 'columns' | 'loading' | 'pagination' | 'rowKey' | 'title' | 'sticky'
    >
}

function BaseTable<T extends object>({
    data,
    columns,
    loading,
    rowKey = 'id',
    total,
    page,
    pageSize,
    onPageChange,
    scrollX = 900,
    size = 'middle',
    cardTitle,
    cardExtra,
    cardProps,
    tableProps,
}: BaseTableProps<T>) {
    return (
        <Card className="base-table-card" title={cardTitle} extra={cardExtra} style={{ padding: 0 }} {...cardProps}>
            <Table<T>
                rowKey={rowKey}
                loading={loading}
                columns={columns}
                dataSource={data}
                bordered
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: t => `Tổng ${t} bản ghi`,
                    onChange: onPageChange,
                    className: 'base-table__pagination',
                }}
                scroll={{ x: scrollX }}
                size={size}
                sticky={{ offsetHeader: 0 }}
                rootClassName="base-table"
                {...tableProps}
            />
        </Card>
    )
}

export default BaseTable
