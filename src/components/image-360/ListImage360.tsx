import React, { useState } from 'react'
import { Table, Card, Tag, Space, Tooltip, Button, Popconfirm, message, Image } from 'antd'
import { useDeleteImage360Mutation, useGetImage360ListQuery } from '@/api/image-360'
import { app } from '@/config/app'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import type { Image360Item } from '@/types/image-360'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router'
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import Image360ViewerModal from '@/components/modals/image-360/Image360ViewerModal'
import { useGetEnumOptionsQuery } from '@/api/types'
import { Flex, Form, Input, Select } from 'antd'
import type { Image360ListParams } from '@/types/image-360'

const ListImage360: React.FC = () => {
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    const [form] = Form.useForm<Image360ListParams>()
    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)
    const [searchParams, setSearchParams] = useState<Image360ListParams>({})

    const { data: enumData, isLoading: loadingEnums } = useGetEnumOptionsQuery(['view_types', 'product_types'])
    const { data, isLoading, refetch } = useGetImage360ListQuery(
        { ...searchParams, page },
        { refetchOnMountOrArgChange: true },
    )

    const totalImage360 = data?.data?.total || 0

    const [deleteImage360] = useDeleteImage360Mutation()

    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)
    const [viewingImageUrl, setViewingImageUrl] = useState('')

    const handleOpenViewerModal = (url: string) => {
        setViewingImageUrl(url)
        setIsViewerModalOpen(true)
    }

    const handleCloseViewerModal = () => {
        setIsViewerModalOpen(false)
        setViewingImageUrl('')
    }

    const handleSearch = (values: Image360ListParams) => {
        setSearchParams(values)
        setPage(app.DEFAULT_PAGE)
    }

    const handleResetFilter = () => {
        form.resetFields()
        setSearchParams({})
        setPage(app.DEFAULT_PAGE)
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteImage360({ panorama_id: id }).unwrap()
            message.success('Xóa ảnh 360 thành công!')
            refetch()
        } catch {
            message.error('Xóa ảnh 360 thất bại!')
        }
    }

    const columns: ColumnsType<Image360Item> = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '5%',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'panorama_url',
            width: '10%',
            render: (_: Image360Item, record: Image360Item) => <Image className="!h-20" src={record.panorama_url} />,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            width: '15%',
        },
        {
            title: 'Album',
            dataIndex: 'album_name',
            width: '15%',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category_name',
            width: 120,
        },
        {
            title: 'Loại hình',
            dataIndex: 'type_product_name',
            width: 120,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'display_type',
            width: 100,
            align: 'center',
            render: display_type =>
                display_type ? <Tag color="success">Công khai</Tag> : <Tag color="warning">Riêng tư</Tag>,
        },

        {
            title: 'Hành động',
            key: 'actions',
            fixed: 'right',
            width: '10%',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem ảnh 360">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleOpenViewerModal(record.panorama_url)}
                        />
                    </Tooltip>
                    {hasPermission(RESOURCE_TYPE.VIEW_360, ACTION.UPDATE) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/image-360/${record.id}/update`)}
                                size="small"
                                color="cyan"
                                variant="outlined"
                            />
                        </Tooltip>
                    )}

                    {hasPermission(RESOURCE_TYPE.VIEW_360, ACTION.DELETE) && (
                        <Popconfirm
                            title="Bạn có chắc muốn xoá ảnh 360 này?"
                            okText="Xoá"
                            cancelText="Hủy"
                            onConfirm={() => handleDelete(record.id!)}>
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
        <Card>
            <Form form={form} onFinish={handleSearch} onValuesChange={(_, values) => handleSearch(values)}>
                <Flex wrap={false} gap="middle" align="center" justify="space-start" className="!mb-4">
                    <Tooltip title="Tìm theo tiêu đề">
                        <Form.Item name="keyword" className="!mb-0 w-1/3">
                            <Input placeholder="Tìm theo tiêu đề" allowClear prefix={<SearchOutlined />} />
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
                        <Form.Item name="type_product_id" className="!mb-0 w-1/3">
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

            <Table<Image360Item>
                dataSource={data?.data?.items || []}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                bordered
                scroll={{ x: true }}
                pagination={{
                    current: page,
                    pageSize: app.DEFAULT_PAGE_SIZE,
                    total: totalImage360,
                    onChange: setPage,
                    responsive: true,
                    showSizeChanger: false,
                    showTotal: () => `Tổng số ${totalImage360} bản ghi`,
                }}
            />

            <Image360ViewerModal
                open={isViewerModalOpen}
                onClose={handleCloseViewerModal}
                image_url={viewingImageUrl}
            />
        </Card>
    )
}

export default ListImage360
