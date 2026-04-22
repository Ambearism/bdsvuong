import { useGetGroupLinkProductListQuery } from '@/api/group-link-product'
import { app } from '@/config/app'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { GroupLinkProductItem, GroupLinkProductListParams } from '@/types/group-link-product'
import { EditOutlined, LinkOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, Form, Input, Space, Table, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useMemo, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { MAX_LENGTH_255 } from '@/config/constant'
import { usePermission } from '@/hooks/usePermission'

const GroupLinkProductList: React.FC = () => {
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    const [form] = Form.useForm<GroupLinkProductListParams>()
    const [page, setPage] = useState(app.DEFAULT_PAGE)
    const [filters, setFilters] = useState<GroupLinkProductListParams>({})
    const debouncedFilters = useDebounce(filters, 500)

    useDocumentTitle('Quản lý tổ hợp Link')

    const queryParams = useMemo(
        () => ({
            page,
            ...debouncedFilters,
        }),
        [page, debouncedFilters],
    )

    const { data, isLoading } = useGetGroupLinkProductListQuery(queryParams, {
        refetchOnMountOrArgChange: true,
    })

    const handleValuesChange = (changedValues: Partial<GroupLinkProductListParams>) => {
        setFilters(prev => ({ ...prev, ...changedValues }))
        setPage(app.DEFAULT_PAGE)
    }

    const handleResetFilter = () => {
        form.resetFields()
        setFilters({})
        setPage(app.DEFAULT_PAGE)
    }

    const totalItems = data?.data.total || 0

    const columns: ColumnsType<GroupLinkProductItem> = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
            key: 'id',
            align: 'center',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title: string, record: GroupLinkProductItem) => (
                <Flex vertical>
                    {hasPermission(RESOURCE_TYPE.GROUP_LINK, ACTION.UPDATE) ? (
                        <Typography.Link
                            className="line-clamp-2 font-medium"
                            onClick={() => navigate(`/group-link-products/${record.id}/update`)}>
                            {title}
                        </Typography.Link>
                    ) : (
                        <Typography.Text className="line-clamp-2 font-medium">{title}</Typography.Text>
                    )}
                    <div className="text-xs text-gray-500">{record.url}</div>
                </Flex>
            ),
        },
        {
            title: 'Show Desc',
            dataIndex: 'not_show_description',
            width: 120,
            align: 'center',
            key: 'not_show_description',
            render: (notShow: boolean) => (
                <div className={notShow ? 'text-red-500' : 'text-green-500'}>{notShow ? 'HIDE' : 'SHOW'}</div>
            ),
        },
        {
            title: 'Lượt xem',
            dataIndex: 'hitcount',
            key: 'hitcount',
            align: 'center',
            width: 100,
            render: (count: number) => <div className="font-medium text-blue-500">{count}</div>,
        },
        {
            title: 'Thời gian',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 180,
            render: (text: string, record: GroupLinkProductItem) => (
                <div className="text-gray-600 text-sm">{text || record.created_at || app.EMPTY_DISPLAY}</div>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem trên trang">
                        <Button
                            icon={<LinkOutlined />}
                            size="small"
                            href={`${app.CLIENT_URL}/${record.url}`}
                            target="_blank"
                        />
                    </Tooltip>
                    {hasPermission(RESOURCE_TYPE.GROUP_LINK, ACTION.UPDATE) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                color="cyan"
                                variant="outlined"
                                href={`/group-link-products/${record.id}/update`}
                                onClick={e => {
                                    e.preventDefault()
                                    navigate(`/group-link-products/${record.id}/update`)
                                }}
                            />
                        </Tooltip>
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
                                title: 'Quản lý tổ hợp Link',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <Card>
                <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
                    <Flex wrap={false} gap="middle" align="center" justify="space-start" className="!mb-4">
                        <Form.Item name="keyword" className="!mb-0 w-full">
                            <Input placeholder="Tìm kiếm theo tiêu đề, url..." allowClear maxLength={MAX_LENGTH_255} />
                        </Form.Item>

                        <Button type="primary" onClick={handleResetFilter} className="ml-auto">
                            Reset
                        </Button>
                    </Flex>
                </Form>

                <Table<GroupLinkProductItem>
                    dataSource={data?.data.items || []}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    bordered
                    scroll={{ x: true }}
                    pagination={{
                        current: page,
                        pageSize: app.DEFAULT_PAGE_SIZE,
                        total: totalItems,
                        onChange: setPage,
                        showSizeChanger: false,
                        responsive: true,
                        showTotal: () => `Tổng số ${totalItems} bản ghi`,
                    }}
                />
            </Card>
        </Space>
    )
}

export default GroupLinkProductList
