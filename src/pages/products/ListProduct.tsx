import {
    Table,
    Tag,
    Typography,
    Space,
    Button,
    Card,
    Breadcrumb,
    Tooltip,
    Flex,
    Select,
    Input,
    DatePicker,
    Popover,
} from 'antd'
import { EditOutlined, PlusOutlined, LinkOutlined, FileTextOutlined, ProductOutlined } from '@ant-design/icons'
import { useGetProductListQuery } from '@/api/product'
import type { ProductItem, ProductListParams } from '@/types/product'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { PRODUCT_TYPE, PRODUCT_TRANSACTION, PRODUCT_TYPE_ID, PRODUCT_SORT_OPTIONS } from '@/config/constant'
import { ACTION } from '@/config/permission'
import { GoHome } from 'react-icons/go'
import { app } from '@/config/app'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetEnumOptionsQuery } from '@/api/types'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { formatNumber } from '@/utils/number-utils'
import { renderProductCode } from '@/lib/utils'

const { Text } = Typography

const ProductList = () => {
    useDocumentTitle('Danh sách hàng hoá')
    const navigate = useNavigate()
    const [page, setPage] = useState(app.DEFAULT_PAGE)

    const typeProductSlugToId: Record<string, number> = {
        apartment: PRODUCT_TYPE_ID.APARTMENT,
        townhouse: PRODUCT_TYPE_ID.TOWNHOUSE,
        villa: PRODUCT_TYPE_ID.VILLA,
        'private-house': PRODUCT_TYPE_ID.PRIVATE_HOUSE,
        'land-plot': PRODUCT_TYPE_ID.LAND,
        'garden-villa-farm': PRODUCT_TYPE_ID.FARM_VILLA,
        'other-real-estate': PRODUCT_TYPE_ID.OTHER,
        'kiosk-commercial-floor': PRODUCT_TYPE_ID.KIOSK,
        'resort-hotel': PRODUCT_TYPE_ID.RESORT,
    }

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

    const { typeTransactionParam, typeProductParam } = useParams()

    type FilterParams = {
        type_transaction_name?: string
        type_product_id?: number
    }

    const initialFiltersFromParams: FilterParams = {
        type_transaction_name: typeTransactionParam?.toUpperCase(),
        type_product_id:
            typeProductParam && typeProductParam !== 'all' ? typeProductSlugToId[typeProductParam] : undefined,
    }

    const [filters, setFilters] = useState<ProductListParams>(initialFiltersFromParams)

    useEffect(() => {
        const next: FilterParams = {
            type_transaction_name: typeTransactionParam?.toUpperCase(),
            type_product_id:
                typeProductParam && typeProductParam !== 'all' ? typeProductSlugToId[typeProductParam] : undefined,
        }
        setFilters(previousFilters => ({
            ...previousFilters,
            type_transaction_name: next.type_transaction_name,
            type_product_id: next.type_product_id,
        }))
        setPage(app.DEFAULT_PAGE)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeTransactionParam, typeProductParam])

    const { data: enumData } = useGetEnumOptionsQuery(['transaction_types', 'product_types', 'product_status'])

    const { data, isLoading } = useGetProductListQuery(
        {
            page,
            keyword: filters.keyword,
            id: filters.id,
            type_transaction_name: filters.type_transaction_name,
            type_product_id: filters.type_product_id,
            status_product_id: filters.status_product_id,
            status_transaction_sell_id: filters.status_transaction_sell_id,
            status_transaction_rent_id: filters.status_transaction_rent_id,
            zone_province_id: filters.zone_province_id,
            zone_ward_id: filters.zone_ward_id,
            project_id: filters.project_id,
            start_date: filters.start_date,
            end_date: filters.end_date,
            sort_by: filters.sort_by,
        },
        { refetchOnMountOrArgChange: true },
    )

    const products = data?.data?.items || []
    const totalProduct = data?.data?.total || 0

    const getPermissions = (record: ProductItem) => {
        const itemPermissions = record.product_permissions
        return {
            canView: itemPermissions ? itemPermissions.includes(ACTION.READ) : true,
            canUpdate: itemPermissions ? itemPermissions.includes(ACTION.UPDATE) : true,
        }
    }

    const columns: ColumnsType<ProductItem> = [
        {
            title: 'Mã HH',
            dataIndex: 'id',
            fixed: 'left',
            render: (_: ProductItem, record: ProductItem) => (
                <Flex vertical justify="center" align="center" gap={4}>
                    <Text className="!text-xs">{renderProductCode(record)}</Text>
                </Flex>
            ),
        },
        {
            title: 'Hàng hoá',
            dataIndex: 'name',
            width: 250,
            render: (_: string, record: ProductItem) => {
                const { canUpdate } = getPermissions(record)
                if (!canUpdate) return <Text className="!text-xs line-clamp-2 !leading-snug">{record.name}</Text>
                return (
                    <Typography.Link
                        className="!text-xs line-clamp-2 !leading-snug"
                        onClick={() => navigate(`/products/${record.id}/update`)}
                        title={record.name}>
                        {record.name}
                    </Typography.Link>
                )
            },
        },
        {
            title: 'Mục đích',
            dataIndex: 'type_transaction_id',
            render: (_: ProductItem, record: ProductItem) => {
                let typeTransaction = String(record.type_transaction_id)

                if (typeTransaction === PRODUCT_TRANSACTION.ALL && filters.type_transaction_name) {
                    typeTransaction = filters.type_transaction_name
                }

                return (
                    <Tag className="!text-xs" color={transactionMap[typeTransaction]?.color}>
                        {transactionMap[typeTransaction]?.label}
                    </Tag>
                )
            },
        },
        {
            title: 'Loại hàng',
            dataIndex: 'product_type_name',
            render: (_: ProductItem, record: ProductItem) => (
                <Tag className="!text-xs" color={productTypeMap[String(record.product_type_name)]?.color}>
                    {record.product_type_name}
                </Tag>
            ),
        },
        {
            title: 'Dự án',
            dataIndex: 'project_name',
            width: 200,
            render: (_: ProductItem, record: ProductItem) => (
                <Text className="!text-xs">{record.project_name || app.EMPTY_DISPLAY}</Text>
            ),
        },
        {
            title: 'Phường xã',
            dataIndex: 'zone_ward_name',
            render: (_: ProductItem, record: ProductItem) => <Text className="!text-xs">{record.zone_ward_name}</Text>,
        },
        {
            title: 'Diện tích',
            dataIndex: 'acreage',
            render: (_: ProductItem, record: ProductItem) => (
                <Text className="!text-xs">{formatNumber(record.acreage)}m²</Text>
            ),
        },

        {
            title: 'Giá thuê',
            dataIndex: 'price_rent',
            render: (_: ProductItem, record: ProductItem) => (
                <Space direction="vertical">
                    <>
                        <Text className="!text-xs">{formatNumber(record.price_rent)} triệu/tháng</Text>
                    </>
                </Space>
            ),
        },
        {
            title: 'Giá bán',
            dataIndex: 'price_sell',
            render: (_: ProductItem, record: ProductItem) => (
                <Space direction="vertical">
                    <>
                        <Text className="!text-xs">{formatNumber(record.price_sell)} triệu/m²</Text>
                        <Text className="!text-xs">{formatNumber(record.total_price_sell)} tỷ</Text>
                    </>
                </Space>
            ),
        },
        {
            title: 'Phí môi giới',
            dataIndex: 'price_brokerage',
            render: (_: ProductItem, record: ProductItem) => (
                <Text className="!text-xs">{formatNumber(record.price_brokerage)}tr</Text>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            render: (_: ProductItem, record: ProductItem) => (
                <Text className="!text-xs">{dayjs(record.created_at, 'HH:mm:ss DD/MM/YYYY').format('DD/MM/YYYY')}</Text>
            ),
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updated_at',
            render: (_: ProductItem, record: ProductItem) => (
                <Text className="!text-xs">
                    {record.updated_at
                        ? dayjs(record.updated_at, 'HH:mm:ss DD/MM/YYYY').format('DD/MM/YYYY')
                        : app.EMPTY_DISPLAY}
                </Text>
            ),
        },

        {
            title: 'Thao tác',
            dataIndex: 'price_sell',
            fixed: 'right',
            align: 'center',
            render: (_: ProductItem, record: ProductItem) => {
                const { canUpdate } = getPermissions(record)

                return (
                    <Space>
                        {record.publish_status && (
                            <Tooltip title="Xem trên trang">
                                <Button
                                    icon={<LinkOutlined />}
                                    size="small"
                                    href={`${app.CLIENT_URL}/${record.slug}`}
                                    target="_blank"
                                />
                            </Tooltip>
                        )}

                        <Tooltip title="Xem Hub">
                            <Button
                                icon={<ProductOutlined />}
                                onClick={() => navigate(`/products/${record.id}/hub`)}
                                size="small"
                                variant="outlined"
                            />
                        </Tooltip>

                        {record.note && (
                            <Popover
                                content={
                                    <div
                                        className="max-w-75 max-h-75 overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: record.note }}
                                    />
                                }
                                title="Ghi chú">
                                <Button icon={<FileTextOutlined />} size="small" />
                            </Popover>
                        )}

                        {canUpdate && (
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/products/${record.id}/update`)}
                                    size="small"
                                    color="cyan"
                                    variant="outlined"
                                />
                            </Tooltip>
                        )}
                    </Space>
                )
            },
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
                                    title: 'Danh sách hàng hoá',
                                    className: 'text-md font-medium',
                                },
                            ]}
                        />

                        <Button type="primary" onClick={() => (window.location.href = '/products/create')}>
                            <PlusOutlined /> Tạo hàng hóa mới
                        </Button>
                    </Flex>
                </Card>

                <Card>
                    <Flex wrap={false} gap="middle" align="center" justify="space-between" className="!mb-4">
                        <Tooltip title="Tìm kiếm theo mã, tên hàng hoá">
                            <Input
                                allowClear
                                placeholder="Tìm theo mã hàng hoá, tên..."
                                className="!w-1/5"
                                value={filters.keyword}
                                onChange={event => {
                                    setFilters(previousFilters => ({ ...previousFilters, keyword: event.target.value }))
                                    setPage(app.DEFAULT_PAGE)
                                }}
                            />
                        </Tooltip>

                        <Tooltip title="Lọc theo mục đích">
                            <Select
                                placeholder="Mục đích"
                                className="!w-1/10"
                                allowClear
                                value={filters.type_transaction_name}
                                onChange={value => {
                                    setFilters(previousFilters => ({
                                        ...previousFilters,
                                        type_transaction_name: value,
                                    }))
                                    setPage(app.DEFAULT_PAGE)
                                }}
                                options={enumData?.data?.transaction_types}
                            />
                        </Tooltip>

                        <Tooltip title="Lọc theo loại hàng">
                            <Select
                                placeholder="Loại hàng"
                                className="!w-1/6"
                                allowClear
                                value={filters.type_product_id}
                                onChange={value => {
                                    setFilters(previousFilters => ({ ...previousFilters, type_product_id: value }))
                                    setPage(app.DEFAULT_PAGE)
                                }}
                                options={enumData?.data?.product_types}
                            />
                        </Tooltip>

                        <Tooltip title="Lọc theo trạng thái">
                            <Select
                                placeholder="Trạng thái"
                                className="!w-1/10"
                                allowClear
                                value={filters.status_product_id}
                                onChange={value => {
                                    setFilters(previousFilters => ({ ...previousFilters, status_product_id: value }))
                                    setPage(app.DEFAULT_PAGE)
                                }}
                                options={enumData?.data?.product_status}
                            />
                        </Tooltip>

                        <Tooltip title="Lọc theo khoảng thời gian tạo">
                            <Space.Compact className="!w-1/4">
                                <DatePicker
                                    placeholder="Từ ngày"
                                    format="DD-MM-YYYY"
                                    className="w-full"
                                    allowClear
                                    value={filters.start_date ? dayjs(filters.start_date) : null}
                                    onChange={date => {
                                        setFilters(previousFilters => ({
                                            ...previousFilters,
                                            start_date: date?.format('YYYY-MM-DD') ?? null,
                                        }))
                                        setPage(app.DEFAULT_PAGE)
                                    }}
                                />
                                <Input
                                    className="!w-12 !text-center !pointer-events-none !bg-gray-100 border-l-0 border-r-0"
                                    placeholder="→"
                                    disabled
                                />
                                <DatePicker
                                    placeholder="Đến ngày"
                                    format="DD-MM-YYYY"
                                    className="w-full"
                                    allowClear
                                    value={filters.end_date ? dayjs(filters.end_date) : null}
                                    onChange={date => {
                                        setFilters(previousFilters => ({
                                            ...previousFilters,
                                            end_date: date?.format('YYYY-MM-DD') ?? null,
                                        }))
                                        setPage(app.DEFAULT_PAGE)
                                    }}
                                />
                            </Space.Compact>
                        </Tooltip>

                        <Tooltip title="Sắp xếp">
                            <Select
                                placeholder="Sắp xếp"
                                className="!w-1/6"
                                allowClear
                                value={filters.sort_by}
                                onChange={value => {
                                    setFilters(previousFilters => ({ ...previousFilters, sort_by: value }))
                                    setPage(app.DEFAULT_PAGE)
                                }}
                                options={PRODUCT_SORT_OPTIONS}
                            />
                        </Tooltip>

                        <Button
                            type="primary"
                            onClick={() => {
                                setFilters({})
                                setPage(app.DEFAULT_PAGE)
                            }}>
                            Reset
                        </Button>
                    </Flex>

                    <Table
                        className="no-padding-table header-table-xs"
                        columns={columns}
                        dataSource={products}
                        loading={isLoading}
                        pagination={{
                            current: page,
                            pageSize: app.DEFAULT_PAGE_SIZE,
                            total: totalProduct,
                            onChange: setPage,
                            responsive: true,
                            showSizeChanger: false,
                            showTotal: () => `Tổng số ${totalProduct} bản ghi`,
                        }}
                        rowKey="id"
                        bordered
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            </Space>
        </>
    )
}

export default ProductList
