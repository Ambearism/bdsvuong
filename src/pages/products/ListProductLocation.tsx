import { Table, Typography, Space, Card, Button, Flex, Tooltip, Input, Breadcrumb, message } from 'antd'
import type { ProductLocationItem } from '@/types/product'
import { app } from '@/config/app'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { useGetProductLocationsQuery, useLazyExportProductLocationsQuery } from '@/api/product'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { SearchParams } from '@/types'
import { renderProductCode } from '@/lib/utils'
import { GoHome } from 'react-icons/go'
import { ACTION } from '@/config/permission'

const { Text } = Typography

export type ProductListParams = SearchParams

const ProductList = () => {
    useDocumentTitle('Danh sách vị trí hàng hoá')
    const navigate = useNavigate()
    const [page, setPage] = useState(app.DEFAULT_PAGE)
    const [filters, setFilters] = useState<ProductListParams>({
        page: 1,
        keyword: '',
        per_page: app.DEFAULT_PAGE_SIZE,
    })

    const debouncedKeyword = useDebounce(filters.keyword, 500)

    const { data, isLoading } = useGetProductLocationsQuery(
        {
            page,
            keyword: debouncedKeyword,
            per_page: filters.per_page,
        },
        {
            refetchOnMountOrArgChange: true,
        },
    )

    const productLocations = data?.data?.items ?? []
    const totalProduct = data?.data?.total ?? 0

    const getPermissions = (record: ProductLocationItem) => {
        const itemPermissions = record.product_permissions
        return {
            canView: itemPermissions ? itemPermissions.includes(ACTION.READ) : true,
            canUpdate: itemPermissions ? itemPermissions.includes(ACTION.UPDATE) : true,
        }
    }

    const [triggerExport, { isFetching: isExporting }] = useLazyExportProductLocationsQuery()

    const handleExportExcel = async () => {
        try {
            const blob = await triggerExport().unwrap()
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `vi-tri-hang-hoa_${dayjs().format('DD-MM-YYYY')}.xlsx`
            a.click()
            URL.revokeObjectURL(a.href)
        } catch {
            message.error('Lỗi khi tải file Excel')
        }
    }

    const columns: ColumnsType<ProductLocationItem> = [
        {
            title: 'Mã HH',
            dataIndex: 'product_code',
            width: 140,
            render: (_: ProductLocationItem, record: ProductLocationItem) => (
                <Text className="!text-xs">{renderProductCode(record)}</Text>
            ),
        },
        {
            title: 'Tên HH',
            dataIndex: 'name',
            width: 220,
            render: (_: ProductLocationItem, record: ProductLocationItem) => {
                const { canUpdate, canView } = getPermissions(record)
                return canUpdate || canView ? (
                    <Typography.Link className="!text-xs" onClick={() => navigate(`/products/${record.id}/update`)}>
                        {record.name}
                    </Typography.Link>
                ) : (
                    <Text className="!text-xs">{record.name}</Text>
                )
            },
        },
        {
            title: 'Tên Dự Án',
            dataIndex: 'project_name',
            width: 180,
            render: (_: ProductLocationItem, record: ProductLocationItem) => (
                <Text className="!text-xs">{record.project_name || '-'}</Text>
            ),
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            width: 260,
            render: (_: ProductLocationItem, record: ProductLocationItem) => (
                <Text className="!text-xs">{record.address || '-'}</Text>
            ),
        },
        {
            title: 'Phường/Xã',
            dataIndex: 'zone_ward_name',
            width: 160,
            render: (_: ProductLocationItem, record: ProductLocationItem) => (
                <Text className="!text-xs">{record.zone_ward_name || '-'}</Text>
            ),
        },
        {
            title: 'Kinh Độ',
            dataIndex: 'longitude',
            width: 140,
            render: (_: ProductLocationItem, record: ProductLocationItem) => (
                <Text className="!text-xs">{record.longitude ?? '-'}</Text>
            ),
        },
        {
            title: 'Vĩ Độ',
            dataIndex: 'latitude',
            width: 140,
            render: (_: ProductLocationItem, record: ProductLocationItem) => (
                <Text className="!text-xs">{record.latitude ?? '-'}</Text>
            ),
        },
        {
            title: 'Cập Nhật Cuối',
            dataIndex: 'updated_at',
            width: 140,
            render: (_: ProductLocationItem, record: ProductLocationItem) => (
                <Text className="!text-xs">{dayjs(record.updated_at || record.created_at).format('DD/MM/YYYY')}</Text>
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
                                    title: 'Danh sách Vị trí hàng hoá',
                                    className: 'text-md font-medium',
                                },
                            ]}
                        />
                    </Flex>
                </Card>

                <Card>
                    <Flex wrap={false} gap="middle" align="center" justify="space-between" className="!mb-4">
                        <Flex gap="small" className="w-full">
                            <Tooltip title="Tìm kiếm theo mã, tên hàng hoá">
                                <Input
                                    allowClear
                                    placeholder="Tìm theo mã hàng hoá, tên..."
                                    className="!w-1/5"
                                    value={filters.keyword}
                                    onChange={event => {
                                        setFilters(previousFilters => ({
                                            ...previousFilters,
                                            keyword: event.target.value,
                                        }))
                                        setPage(app.DEFAULT_PAGE)
                                    }}
                                />
                            </Tooltip>
                            <Button
                                type="primary"
                                onClick={() => {
                                    setFilters({
                                        page: app.DEFAULT_PAGE,
                                        keyword: '',
                                        per_page: app.DEFAULT_PAGE_SIZE,
                                    })
                                    setPage(app.DEFAULT_PAGE)
                                }}>
                                Reset
                            </Button>
                        </Flex>
                        <Flex gap="small">
                            <Button type="primary" loading={isExporting} onClick={handleExportExcel}>
                                Xuất Excel
                            </Button>
                        </Flex>
                    </Flex>

                    <Table
                        className="no-padding-table header-table-xs"
                        columns={columns}
                        dataSource={productLocations}
                        loading={isLoading}
                        pagination={
                            totalProduct > filters.per_page! && {
                                current: page,
                                pageSize: filters.per_page,
                                total: totalProduct,
                                onChange: (p, pageSize) => {
                                    if (pageSize && pageSize !== filters.per_page) {
                                        setFilters(prev => ({ ...prev, per_page: pageSize }))
                                        setPage(app.DEFAULT_PAGE)
                                        return
                                    }
                                    setPage(p)
                                },
                                responsive: true,
                            }
                        }
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
