import React, { useState, useMemo } from 'react'
import { GoHome } from 'react-icons/go'
import { app } from '@/config/app'
import {
    Table,
    Card,
    Tag,
    Space,
    Typography,
    Button,
    Popconfirm,
    message,
    Flex,
    Select,
    Row,
    Col,
    Statistic,
    Breadcrumb,
    Tooltip,
    Input,
} from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'
import {
    useGetTransactionListQuery,
    useDeleteTransactionMutation,
    useGetTransactionStatisticsQuery,
} from '@/api/transaction'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetAccountListQuery } from '@/api/account'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { ColumnsType } from 'antd/es/table'
import type { TransactionItem, TransactionStage } from '@/types/opportunity'
import type { AccountItem } from '@/types/account'
import { TransactionStageLabels, TransactionStageColors } from '@/types/opportunity'
import { formatNumber } from '@/utils/number-utils'
import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { NeedTypeLabels, NeedTypeTagColors, NEED_TYPE_OPTIONS } from '@/config/constant'

const TransactionList: React.FC = () => {
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    useDocumentTitle('Danh sách giao dịch')

    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)
    const [pageSize, setPageSize] = useState<number>(app.DEFAULT_PAGE_SIZE)
    const [stageFilter, setStageFilter] = useState<TransactionStage | undefined>(undefined)
    const [assignedTo, setAssignedTo] = useState<number | undefined>(undefined)
    const [needFilter, setNeedFilter] = useState<string | undefined>(undefined)
    const [keyword, setKeyword] = useState<string | undefined>(undefined)

    const { data: accountData, isLoading: loadingAccounts } = useGetAccountListQuery({
        per_page: app.FETCH_ALL,
        is_option: true,
    })

    const { data, isLoading, refetch } = useGetTransactionListQuery(
        {
            page,
            per_page: pageSize,
            stage: stageFilter,
            assigned_to: assignedTo,
            transaction_type: needFilter,
            keyword,
        },
        { refetchOnMountOrArgChange: true },
    )

    const { data: statsData, refetch: refetchStats } = useGetTransactionStatisticsQuery(
        {},
        {
            refetchOnMountOrArgChange: true,
        },
    )
    const stats = statsData?.data

    const { data: enumData } = useGetEnumOptionsQuery(['transaction_stage'])

    const items = (data?.data?.items ?? []) as TransactionItem[]
    const total = data?.data?.total ?? 0

    const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()
    const [deletingId, setDeletingId] = useState<number | undefined>(undefined)

    const handleDelete = async (id: number) => {
        try {
            setDeletingId(id)
            await deleteTransaction({ transaction_id: id }).unwrap()
            message.success('Đã xoá giao dịch')
            refetch()
            refetchStats()
        } catch {
            message.error('Xoá giao dịch thất bại')
        } finally {
            setDeletingId(undefined)
        }
    }

    const stageOptions = useMemo(() => {
        return enumData?.data?.transaction_stage || []
    }, [enumData])

    const expertOptions = useMemo(() => {
        const list = accountData?.data?.list || []
        return list.map((item: AccountItem) => ({
            label: item.full_name,
            value: item.id,
        }))
    }, [accountData])

    const columns: ColumnsType<TransactionItem> = [
        {
            title: 'Mã GD',
            dataIndex: 'transaction_code',
            width: 100,
            render: (code: string, record) => (
                <Button
                    type="default"
                    className="!bg-gray-100 !border !border-gray-300 !h-8 !px-3 !text-sm !font-medium"
                    onClick={() => navigate(`/transactions/${record.id}/update`)}>
                    {code || record.id}
                </Button>
            ),
            fixed: 'left',
        },
        {
            title: 'Khách hàng',
            key: 'customer_name',
            width: 240,
            ellipsis: true,
            render: (_, record) => (
                <Typography.Link
                    className="font-medium !text-sm"
                    onClick={() => navigate(`/customers/${record.customer?.id}/hub`)}>
                    {record.customer_name || record.customer?.name || app.EMPTY_DISPLAY}
                </Typography.Link>
            ),
        },
        {
            title: 'Hàng hoá',
            key: 'product',
            width: 220,
            ellipsis: true,
            render: (_, record) => (
                <Typography.Text type="secondary" className="!text-sm">
                    {record.product?.name || app.EMPTY_DISPLAY}
                </Typography.Text>
            ),
        },
        {
            title: 'Loại GD',
            dataIndex: 'transaction_type',
            width: 150,
            render: (type: string) =>
                type ? (
                    <Tag
                        className="!px-3 !py-1 !text-sm"
                        color={NeedTypeTagColors[type as keyof typeof NeedTypeTagColors] || app.TAG_COLOR_DEFAULT}>
                        {NeedTypeLabels[type as keyof typeof NeedTypeLabels] || type}
                    </Tag>
                ) : (
                    app.EMPTY_DISPLAY
                ),
        },
        {
            title: 'Giá GD',
            dataIndex: 'final_price',
            width: 140,
            render: (price: number) => (
                <Typography.Text className="font-medium !text-sm">
                    {price ? `${formatNumber(price)} tỷ` : app.EMPTY_DISPLAY}
                </Typography.Text>
            ),
        },
        {
            title: 'Hoa hồng',
            dataIndex: 'commission_total',
            width: 140,
            render: (amount: number) => (
                <Typography.Text className="!text-sm">
                    {amount ? `${formatNumber(amount)} tr` : app.EMPTY_DISPLAY}
                </Typography.Text>
            ),
        },
        {
            title: 'Chuyên viên',
            key: 'assigned_to',
            width: 180,
            render: (_, record) => (
                <Typography.Link
                    className="font-medium !text-sm"
                    onClick={() => navigate(`/accounts/${record.assigned_to_info?.id}/update`)}>
                    {record.assigned_to_info?.full_name || app.EMPTY_DISPLAY}
                </Typography.Link>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'stage',
            width: 170,
            render: (stage: TransactionStage) => (
                <Tag className="!px-3 !py-1 !text-sm" color={TransactionStageColors[stage] || 'default'}>
                    {enumData?.data?.transaction_stage?.find(item => item.value == stage)?.label ||
                        TransactionStageLabels[stage] ||
                        app.EMPTY_DISPLAY}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            width: 150,
            render: (text: string) => (
                <Typography.Text type="secondary" className="!text-sm">
                    {text || app.EMPTY_DISPLAY}
                </Typography.Text>
            ),
        },
        {
            title: 'Hoàn tất',
            dataIndex: 'completed_at',
            width: 150,
            render: (text: string) => (
                <Typography.Text type="secondary" className="!text-sm">
                    {text || app.EMPTY_DISPLAY}
                </Typography.Text>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    {hasPermission(RESOURCE_TYPE.CONTRACT, ACTION.UPDATE) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/transactions/${record.id}/update`)}
                                size="small"
                            />
                        </Tooltip>
                    )}
                    {hasPermission(RESOURCE_TYPE.CONTRACT, ACTION.DELETE) && (
                        <Popconfirm
                            title="Xoá giao dịch?"
                            description={`Bạn có chắc muốn xoá ${record.transaction_code || record.id}?`}
                            okText="Xoá"
                            cancelText="Huỷ"
                            okButtonProps={{ danger: true, loading: isDeleting && deletingId === record.id }}
                            onConfirm={() => handleDelete(record.id)}
                            placement="left">
                            <Tooltip title="Xóa">
                                <Button
                                    danger
                                    size="small"
                                    loading={isDeleting && deletingId === record.id}
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Danh sách giao dịch',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    {hasPermission(RESOURCE_TYPE.CONTRACT, ACTION.CREATE) && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/transactions/create')}>
                            Tạo Giao Dịch
                        </Button>
                    )}
                </Flex>
            </Card>

            <Row gutter={16}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic title="Tổng Giao Dịch" value={stats?.total_count || 0} />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic title="GD Tháng Này" value={stats?.this_month_count || 0} />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Tổng Doanh Thu (Tỷ)"
                            value={stats?.total_value ? formatNumber(stats.total_value) : 0}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Tổng Hoa Hồng (Tr)"
                            value={stats?.total_commission ? formatNumber(stats.total_commission) : 0}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Flex wrap={false} gap="middle" align="center" justify="space-start">
                    <Tooltip title="Tìm kiếm theo mã giao dịch">
                        <Input
                            className="!w-1/4"
                            placeholder="Tìm theo mã GD"
                            allowClear
                            value={keyword}
                            onChange={e => {
                                setKeyword(e.target.value)
                                setPage(app.DEFAULT_PAGE)
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo loại giao dịch">
                        <Select
                            className="!w-1/4"
                            value={needFilter}
                            options={NEED_TYPE_OPTIONS}
                            onChange={val => {
                                setNeedFilter(val)
                                setPage(app.DEFAULT_PAGE)
                            }}
                            placeholder="Loại GD"
                            allowClear
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo trạng thái">
                        <Select
                            className="!w-1/4"
                            value={stageFilter}
                            options={stageOptions}
                            onChange={val => {
                                setStageFilter(val)
                                setPage(app.DEFAULT_PAGE)
                            }}
                            placeholder="Trạng Thái GD"
                            allowClear
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo chuyên viên">
                        <Select
                            className="!w-1/4"
                            placeholder="Chuyên viên"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={loadingAccounts}
                            value={assignedTo}
                            onChange={val => {
                                setAssignedTo(val)
                                setPage(app.DEFAULT_PAGE)
                            }}
                            options={expertOptions}
                        />
                    </Tooltip>

                    <Button
                        type="primary"
                        onClick={() => {
                            setStageFilter(undefined)
                            setAssignedTo(undefined)
                            setNeedFilter(undefined)
                            setKeyword(undefined)
                            setPage(app.DEFAULT_PAGE)
                        }}
                        className="ml-auto">
                        Reset
                    </Button>
                </Flex>
            </Card>

            <Card>
                <Table<TransactionItem>
                    className="[&_.ant-table-cell]:!text-sm [&_.ant-table-tbody>tr>td]:!py-3"
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={items}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: false,
                        showTotal: () => `Tổng số ${total} bản ghi`,
                        onChange: (p, ps) => {
                            setPage(p)
                            setPageSize(ps)
                        },
                    }}
                    scroll={{ x: 1660 }}
                    bordered
                    size="middle"
                />
            </Card>
        </Space>
    )
}

export default TransactionList
