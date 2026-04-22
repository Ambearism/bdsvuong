import {
    Table,
    Typography,
    Space,
    Button,
    Popconfirm,
    message,
    Card,
    Breadcrumb,
    Tooltip,
    Flex,
    Select,
    Input,
    DatePicker,
    Tag,
} from 'antd'
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { PRODUCT_TYPE, PRODUCT_TRANSACTION } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { GoHome } from 'react-icons/go'
import { app } from '@/config/app'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePermission } from '@/hooks/usePermission'
import { useGetEnumOptionsQuery } from '@/api/types'
import dayjs from 'dayjs'
import { useDeleteConsignMutation, useGetConsignListQuery } from '@/api/consign'
import type { ConsignItem, ConsignListRequest } from '@/types/consign'
import DetailConsignModal from '@/components/modals/consigns/DetailConsignModal'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

const ListConsign = () => {
    useDocumentTitle('Danh sách ký gửi')
    const { hasPermission } = usePermission()
    const [page, setPage] = useState(app.DEFAULT_PAGE)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [selected, setSelected] = useState<ConsignItem | null>(null)
    const [openDetail, setOpenDetail] = useState(false)

    type TransactionMeta = {
        color: string
        label: string
        status: string
    }

    type ProductTypeMeta = {
        color: string
    }

    const transactionMap: Record<string, TransactionMeta> = {
        [PRODUCT_TRANSACTION.RENT]: {
            color: 'red',
            label: 'Thuê',
            status: 'Chờ thuê',
        },
        [PRODUCT_TRANSACTION.SELL]: {
            color: 'green',
            label: 'Bán',
            status: 'Chờ bán',
        },
        [PRODUCT_TRANSACTION.ALL]: {
            color: 'gold',
            label: 'Bán & thuê',
            status: 'Chờ bán/thuê',
        },
    }

    const productTypeMap: Record<string, ProductTypeMeta> = {
        [PRODUCT_TYPE.APARTMENT]: {
            color: 'magenta',
        },
        [PRODUCT_TYPE.KIOSK]: {
            color: 'red',
        },
        [PRODUCT_TYPE.TOWNHOUSE]: {
            color: 'volcano',
        },
        [PRODUCT_TYPE.VILLA]: {
            color: 'orange',
        },
        [PRODUCT_TYPE.PRIVATE_HOUSE]: {
            color: 'gold',
        },
        [PRODUCT_TYPE.LAND]: {
            color: 'lime',
        },
        [PRODUCT_TYPE.FARM_VILLA]: {
            color: 'green',
        },
        [PRODUCT_TYPE.OTHER]: {
            color: 'cyan',
        },
        [PRODUCT_TYPE.RESORT]: {
            color: 'blue',
        },
    }

    const { data: enumData } = useGetEnumOptionsQuery(['transaction_types', 'product_types'])

    const [filters, setFilters] = useState<ConsignListRequest>({})

    const { data, isLoading, refetch } = useGetConsignListQuery(
        {
            page,
            keyword: filters.keyword,
            type_transaction_id: filters.type_transaction_id,
            type_product_id: filters.type_product_id,
            start_date: filters.start_date,
            end_date: filters.end_date,
        },
        { refetchOnMountOrArgChange: true },
    )

    const consigns = data?.data?.items || []
    const totalConsign = data?.data?.total || 0

    const [deleteConsign] = useDeleteConsignMutation()

    const handleDelete = async (consign_id: number) => {
        try {
            setDeletingId(consign_id)
            await deleteConsign({ consign_id }).unwrap()
            message.success(`Đã xoá mã ký gửi #${consign_id}`)
            await refetch()
        } catch {
            message.error(`Xoá mã ký gửi #${consign_id} thất bại`)
        } finally {
            setDeletingId(null)
        }
    }

    const columns: ColumnsType<ConsignItem> = [
        {
            title: 'Mã',
            dataIndex: 'id',
            render: (_: ConsignItem, record: ConsignItem) => <Text>#{record.id}</Text>,
        },
        {
            title: 'Tên KH',
            dataIndex: 'name_customer',
            render: (_: ConsignItem, record: ConsignItem) => <Text>{record.name_customer}</Text>,
        },
        {
            title: 'SĐT',
            dataIndex: 'phone_customer',
            render: (_: ConsignItem, record: ConsignItem) => <Text>{record.name_customer}</Text>,
        },
        {
            title: 'Email',
            dataIndex: 'email_customer',
            render: (_: ConsignItem, record: ConsignItem) => <Text>{record.name_customer}</Text>,
        },
        {
            title: 'Mục đích',
            dataIndex: 'type_transaction_id',
            render: (_: ConsignItem, record: ConsignItem) => (
                <Tag className="!text-xs" color={transactionMap[String(record.type_transaction_id)]?.color}>
                    {transactionMap[String(record.type_transaction_id)]?.label}
                </Tag>
            ),
        },
        {
            title: 'Thông tin BĐS',
            dataIndex: 'product_type_name',
            render: (_: ConsignItem, record: ConsignItem) => (
                <Tag className="!text-xs" color={productTypeMap[String(record.type_product_name)]?.color}>
                    {record.type_product_name}
                </Tag>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            render: (_: ConsignItem, record: ConsignItem) => <Text className="line-clamp-2">{record.note}</Text>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            render: (_: ConsignItem, record: ConsignItem) => (
                <Text className="!text-xs">{dayjs(record.created_at, 'HH:mm:ss DD/MM/YYYY').format('DD/MM/YYYY')}</Text>
            ),
        },

        {
            title: 'Thao tác',
            dataIndex: 'price_sell',
            align: 'center',
            render: (_: ConsignItem, record: ConsignItem) => (
                <Space>
                    {hasPermission(RESOURCE_TYPE.DEAL, ACTION.UPDATE) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                size="small"
                                type="default"
                                icon={<EyeOutlined />}
                                className="!bg-gray-100 !border !border-gray-300"
                                onClick={() => {
                                    setSelected(record)
                                    setOpenDetail(true)
                                }}></Button>
                        </Tooltip>
                    )}

                    {hasPermission(RESOURCE_TYPE.DEAL, ACTION.DELETE) && (
                        <Popconfirm
                            title="Xác nhận xoá"
                            description={`Bạn có chắc muốn xoá mã ký gửi #${record.id}? Hành động này không thể hoàn tác.`}
                            okText="Xoá"
                            cancelText="Huỷ"
                            okButtonProps={{ danger: true, loading: deletingId === record.id }}
                            onConfirm={() => handleDelete(record.id)}>
                            <Tooltip title="Xóa">
                                <Button icon={<DeleteOutlined />} size="small" danger />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <>
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
                                    title: 'Danh sách ký gửi',
                                    className: 'text-md font-medium',
                                    href: '/consigns',
                                },
                            ]}
                        />
                    </Flex>
                </Card>

                <Card>
                    <Flex wrap={false} gap="middle" align="center" justify="flex-start" className="!mb-4">
                        <Tooltip title="Tìm kiếm theo tên, SĐT, email khách hàng">
                            <Input
                                allowClear
                                placeholder="Tìm kiếm theo tên, SĐT, email khách hàng"
                                className="!w-1/5"
                                value={filters.keyword}
                                onChange={e => {
                                    setFilters(prev => ({ ...prev, keyword: e.target.value }))
                                    setPage(1)
                                }}
                            />
                        </Tooltip>

                        <Tooltip title="Lọc theo mục đích">
                            <Select
                                placeholder="Mục đích"
                                className="!w-1/5"
                                allowClear
                                value={filters.type_transaction_id}
                                onChange={value => {
                                    setFilters(prev => ({ ...prev, type_transaction_id: value }))
                                    setPage(1)
                                }}
                                options={enumData?.data?.transaction_types}
                            />
                        </Tooltip>

                        <Tooltip title="Lọc theo loại hàng">
                            <Select
                                placeholder="Loại hàng"
                                className="!w-1/5"
                                allowClear
                                value={filters.type_product_id}
                                onChange={value => {
                                    setFilters(prev => ({ ...prev, type_product_id: value }))
                                    setPage(1)
                                }}
                                options={enumData?.data?.product_types}
                            />
                        </Tooltip>

                        <Tooltip title="Lọc theo khoảng thời gian tạo">
                            <DatePicker.RangePicker
                                className="!w-1/4"
                                value={
                                    filters.start_date && filters.end_date
                                        ? [dayjs(filters.start_date), dayjs(filters.end_date)]
                                        : null
                                }
                                onChange={values => {
                                    const start = values?.[0]?.format('YYYY-MM-DD') ?? null
                                    const end = values?.[1]?.format('YYYY-MM-DD') ?? null

                                    setFilters(prev => ({
                                        ...prev,
                                        start_date: start,
                                        end_date: end,
                                    }))
                                    setPage(1)
                                }}
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Tooltip>

                        <Button
                            type="primary"
                            className="ml-auto"
                            onClick={() => {
                                setFilters({})
                                setPage(1)
                                refetch()
                            }}>
                            Reset
                        </Button>
                    </Flex>

                    <Table
                        columns={columns}
                        dataSource={consigns}
                        loading={isLoading}
                        pagination={
                            totalConsign > app.DEFAULT_PAGE_SIZE && {
                                current: page,
                                pageSize: app.DEFAULT_PAGE_SIZE,
                                total: totalConsign,
                                onChange: setPage,
                                responsive: true,
                            }
                        }
                        rowKey="id"
                        bordered
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            </Space>

            <DetailConsignModal
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                consign={selected ?? undefined}
            />
        </>
    )
}

export default ListConsign
