import React, { useState } from 'react'
import { Table, Space, Button, Tag, Input, Popconfirm, message, Card, Col, Row, Breadcrumb, Tooltip } from 'antd'
import { useGetCategoryListQuery, useDeleteCategoryMutation } from '@/api/category'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { CategoryItem, CategoryType } from '@/types/category'
import { GoHome } from 'react-icons/go'
import { app } from '@/config/app'
import { CATEGORY_MAP } from '@/config/constant'

const { Search } = Input

type CategoryListProps = {
    pageTitle: string
    categoryType: CategoryType
    baseRoute: string
    projectId?: number
}

const CategoryList: React.FC<CategoryListProps> = ({ pageTitle, categoryType, baseRoute, projectId }) => {
    const [keyword, setKeyword] = useState('')
    const [page, setPage] = useState(app.DEFAULT_PAGE)

    const categoryConfig = CATEGORY_MAP[categoryType]
    const categoryTypeValue = categoryConfig.value
    const requireProjectId = categoryConfig.requireProjectId
    const acceptNews = categoryConfig.acceptNews

    const { data, isLoading, refetch } = useGetCategoryListQuery(
        {
            type: categoryTypeValue,
            keyword,
            project_id: requireProjectId ? projectId : undefined,
            accept_news: acceptNews,
            page,
        },
        { refetchOnMountOrArgChange: true },
    )

    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

    const handleDelete = async (id: number) => {
        try {
            await deleteCategory({ category_id: id }).unwrap()
            message.success('Xóa danh mục thành công!')
            refetch()
        } catch {
            message.error('Xóa danh mục thất bại!')
        }
    }

    const columns: ColumnsType<CategoryItem> = [
        {
            title: 'Danh mục',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Vị trí',
            dataIndex: 'position',
            key: 'position',
            align: 'center',
            width: 100,
            render: (position: number) => <div className="font-medium">{position || app.EMPTY_DISPLAY}</div>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 120,
            render: (status?: string) =>
                status ? <Tag color={['MENU', 'SHOW'].includes(status) ? 'green' : 'volcano'}>{status}</Tag> : null,
        },
        {
            title: 'Meta Robots',
            dataIndex: 'seo_robots',
            key: 'seo_robots',
            align: 'center',
            width: 150,
            render: (robots: string) => <div className="text-gray-600">{robots || app.EMPTY_DISPLAY}</div>,
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} href={`${baseRoute}/update/${record.id}`} size="small" />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa danh mục"
                        description="Bạn có chắc chắn muốn xóa danh mục này không?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        placement="topRight">
                        <Tooltip title="Xóa">
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const totalCategories = data?.data.total || 0

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card styles={{ body: { padding: 16 } }}>
                <Space direction="vertical" className="w-full">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: pageTitle,
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Button type="primary" icon={<PlusOutlined />} href={`${baseRoute}/create`} className="w-fit">
                        Tạo mới
                    </Button>
                </Space>
            </Card>

            <Card size="small">
                <Row gutter={16}>
                    <Col span={24}>
                        <Search
                            placeholder="Tìm theo tên danh mục"
                            enterButton
                            allowClear
                            onSearch={value => {
                                setKeyword(value)
                                setPage(1)
                            }}
                            size="large"
                        />
                    </Col>
                </Row>
            </Card>

            <Table<CategoryItem>
                dataSource={data?.data.items || []}
                columns={columns}
                loading={isLoading || isDeleting}
                rowKey="id"
                rowSelection={{ type: 'checkbox' }}
                bordered
                scroll={{ x: true }}
                pagination={
                    totalCategories > app.DEFAULT_PAGE_SIZE && {
                        current: page,
                        pageSize: app.DEFAULT_PAGE_SIZE,
                        total: totalCategories,
                        onChange: setPage,
                        responsive: true,
                    }
                }
            />
        </Space>
    )
}

export default CategoryList
