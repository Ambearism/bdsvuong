import { useDeleteTour360Mutation, useGetTour360ListQuery } from '@/api/tour360'
import { useGetEnumOptionsQuery } from '@/api/types'
import { app } from '@/config/app'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePermission } from '@/hooks/usePermission'
import type { Tour360Item, Tour360ListParams } from '@/types/tour360'
import { DeleteOutlined, EditOutlined, EyeOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons'
import {
    Breadcrumb,
    Button,
    Card,
    Flex,
    Form,
    Input,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'

const ListTour360 = () => {
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    const [form] = Form.useForm<Tour360ListParams>()
    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)
    const [searchParams, setSearchParams] = useState<Tour360ListParams>({})

    useDocumentTitle('Danh sách Tour 360')

    const { data: enumData, isLoading: loadingEnums } = useGetEnumOptionsQuery(['view_types', 'product_types'])
    const {
        data: tour360Data,
        isLoading,
        refetch,
    } = useGetTour360ListQuery(
        {
            ...searchParams,
            page,
        },
        { refetchOnMountOrArgChange: true },
    )

    const [deleteTour360] = useDeleteTour360Mutation()

    const handleDelete = async (id: number) => {
        try {
            await deleteTour360({ tour360_id: id }).unwrap()
            message.success('Xóa tour 360 thành công!')
            refetch()
        } catch {
            message.error('Xóa tour 360 thất bại!')
        }
    }

    const handleSearch = (values: Tour360ListParams) => {
        setSearchParams(values)
        setPage(app.DEFAULT_PAGE)
    }

    const handleResetFilter = () => {
        form.resetFields()
        setSearchParams({})
        setPage(app.DEFAULT_PAGE)
    }

    const columns: ColumnsType<Tour360Item> = [
        {
            title: 'Tên hiển thị',
            dataIndex: 'display_name',
            key: 'display_name',
            width: 300,
            className: 'font-semibold',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category_name',
            key: 'category_name',
            width: 100,
        },
        {
            title: 'Loại hình',
            dataIndex: 'type_name',
            key: 'type_name',
            width: 100,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'publish',
            key: 'publish',
            width: 40,
            align: 'center',
            render: publish => (publish ? <Tag color="success">Xuất bản</Tag> : <Tag color="warning">Nháp</Tag>),
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            width: 60,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    {record.zip_url && (
                        <Tooltip title="Xem Tour">
                            <Button
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => window.open(record.zip_url, '_blank')}
                            />
                        </Tooltip>
                    )}
                    {hasPermission(RESOURCE_TYPE.TOUR_360, ACTION.UPDATE) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/tour360s/${record.id}/update`)}
                                size="small"
                                color="cyan"
                                variant="outlined"
                            />
                        </Tooltip>
                    )}

                    {hasPermission(RESOURCE_TYPE.TOUR_360, ACTION.DELETE) && (
                        <Popconfirm
                            title="Xóa tour 360"
                            description="Bạn có chắc chắn muốn xóa tour này không?"
                            onConfirm={() => handleDelete(record.id!)}
                            okText="Xóa"
                            cancelText="Hủy"
                            placement="topRight">
                            <Tooltip title="Xóa">
                                <Button icon={<DeleteOutlined />} size="small" danger />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ]

    const totalTour360 = tour360Data?.data?.total || 0

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
                                title: 'Danh sách Tour 360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Flex gap="small">
                        <Button type="primary" icon={<LinkOutlined />} href="/tour360-link" className="w-fit">
                            Liên kết tour 360
                        </Button>
                        {hasPermission(RESOURCE_TYPE.TOUR_360, ACTION.CREATE) && (
                            <Button type="primary" icon={<PlusOutlined />} href="/tour360s/create" className="w-fit">
                                Tạo mới
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <Card>
                <Form form={form} onFinish={handleSearch} onValuesChange={(_, values) => handleSearch(values)}>
                    <Flex wrap={false} gap="middle" align="center" justify="space-start" className="!mb-4">
                        <Tooltip title="Tìm theo tên hiển thị">
                            <Form.Item name="keyword" className="!mb-0 w-1/3">
                                <Input placeholder="Tìm theo tên hiển thị" allowClear />
                            </Form.Item>
                        </Tooltip>
                        <Tooltip title="Lọc theo danh mục">
                            <Form.Item name="category_id" className="!mb-0 w-1/3">
                                <Select
                                    placeholder="Lọc theo danh mục"
                                    className="w-full"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    loading={loadingEnums}
                                    options={enumData?.data?.view_types}
                                />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip title="Lọc theo loại hình">
                            <Form.Item name="type_id" className="!mb-0 w-1/3">
                                <Select
                                    placeholder="Lọc theo loại hình"
                                    className="w-full"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    loading={loadingEnums}
                                    options={enumData?.data?.product_types}
                                />
                            </Form.Item>
                        </Tooltip>
                        <Button type="primary" onClick={handleResetFilter}>
                            Reset
                        </Button>
                    </Flex>
                </Form>

                <Table<Tour360Item>
                    dataSource={tour360Data?.data?.items || []}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    bordered
                    scroll={{ x: true }}
                    pagination={{
                        current: page,
                        pageSize: app.DEFAULT_PAGE_SIZE,
                        total: totalTour360,
                        onChange: setPage,
                        responsive: true,
                        showSizeChanger: false,
                        showTotal: () => `Tổng số ${totalTour360} bản ghi`,
                    }}
                />
            </Card>
        </Space>
    )
}

export default ListTour360
