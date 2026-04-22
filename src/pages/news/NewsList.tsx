import { useGetCategoryListQuery } from '@/api/category'
import { useGetNewsListQuery } from '@/api/news'
import { useGetProjectListQuery } from '@/api/project'
import { app } from '@/config/app'
import { ANTD_PRESETS, CATEGORY_MAP, antdOrderToApiDir } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePermission } from '@/hooks/usePermission'
import type { CategoryItem } from '@/types/category'
import type { NewsItem, NewsListParams, NewsSortField } from '@/types/news'
import type { ProjectItem } from '@/types/project'
import { EditOutlined, LinkOutlined, PlusOutlined, StarFilled } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, Form, Input, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterValue, SorterResult, TablePaginationConfig } from 'antd/es/table/interface'
import React, { useMemo, useState } from 'react'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'

const NewsList: React.FC = () => {
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    const [form] = Form.useForm<NewsListParams>()
    const [page, setPage] = useState(app.DEFAULT_PAGE)
    const [filters, setFilters] = useState<NewsListParams>({})

    useDocumentTitle('Danh sách bài viết')

    const queryParams = {
        page,
        ...filters,
    }

    const { data, isLoading } = useGetNewsListQuery(queryParams, {
        refetchOnMountOrArgChange: true,
    })

    const { data: categoriesData, isLoading: loadingCategories } = useGetCategoryListQuery({
        type: CATEGORY_MAP.NEWS.value,
        accept_news: CATEGORY_MAP.NEWS.acceptNews,
    })

    const { data: projectListData, isLoading: loadingProjects } = useGetProjectListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
    })

    const handleValuesChange = (changedValues: Partial<NewsListParams>) => {
        setFilters(prev => ({ ...prev, ...changedValues }))
        setPage(app.DEFAULT_PAGE)
    }

    const handleResetFilter = () => {
        form.resetFields()
        setFilters({})
        setPage(app.DEFAULT_PAGE)
    }

    const handleTableChange = (
        _pagination: TablePaginationConfig,
        _filters: Record<string, FilterValue | null>,
        sorter: SorterResult<NewsItem> | SorterResult<NewsItem>[],
    ) => {
        const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter
        setFilters(prev => ({
            ...prev,
            order_by: activeSorter.order ? (activeSorter.field as NewsSortField) : undefined,
            order_dir: activeSorter.order ? antdOrderToApiDir(activeSorter.order) : undefined,
        }))
    }

    const columns: ColumnsType<NewsItem> = [
        {
            title: 'Tên bài viết',
            dataIndex: 'name',
            width: 300,
            key: 'name',
            sorter: true,
            render: (name: string, record: NewsItem) => (
                <Typography.Link className="line-clamp-2" onClick={() => navigate(`/news/${record.id}/update`)}>
                    {name}
                </Typography.Link>
            ),
        },
        {
            title: 'Nổi bật',
            dataIndex: 'is_hot',
            key: 'is_hot',
            align: 'center',
            width: 100,
            sorter: true,
            render: (_: NewsItem, record: NewsItem) => (
                <Flex vertical justify="center" align="center">
                    {record.is_hot && <StarFilled className="!text-yellow-400 text-lg" />}
                </Flex>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'categories',
            key: 'categories',
            render: (categories?: { id: number; category_name: string; url: string }[]) =>
                !categories?.length ? (
                    <span className="text-gray-400">{app.EMPTY_DISPLAY}</span>
                ) : (
                    <Flex gap={4} wrap="wrap">
                        {categories.map((category, index) => (
                            <Tag key={index} color={ANTD_PRESETS[category.id % ANTD_PRESETS.length]}>
                                {category.category_name}
                            </Tag>
                        ))}
                    </Flex>
                ),
        },
        {
            title: 'Thời gian đăng',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: true,
            render: (text: string) => <div className="text-gray-600">{text || app.EMPTY_DISPLAY}</div>,
        },
        {
            title: 'Cập nhật',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: true,
            render: (text: string) => <div className="text-gray-600">{text || app.EMPTY_DISPLAY}</div>,
        },
        {
            title: 'Lượt xem',
            dataIndex: 'hitcount',
            key: 'hitcount',
            align: 'center',
            width: 100,
            sorter: true,
            render: (count: number) => <div className="font-medium text-blue-500">{count || 0}</div>,
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    {record.publish && (
                        <Tooltip title="Xem trên trang">
                            <Button
                                icon={<LinkOutlined />}
                                size="small"
                                href={`${app.CLIENT_URL}/tin-tuc/${record.name_slug}`}
                                target="_blank"
                            />
                        </Tooltip>
                    )}

                    {hasPermission(RESOURCE_TYPE.NEW, ACTION.UPDATE) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                color="cyan"
                                variant="outlined"
                                href={`/news/${record.id}/update`}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ]

    const flattenedCategoryOptions = useMemo(() => {
        const flattenCategories = (
            categories: CategoryItem[],
            prefix = '',
        ): Array<{ value: number; label: string }> => {
            const result: Array<{ value: number; label: string }> = []

            categories.forEach(category => {
                result.push({
                    value: category.id,
                    label: prefix + category.name,
                })

                if (category.children && category.children.length > 0) {
                    result.push(...flattenCategories(category.children, prefix + app.PARENT_PREFIX))
                }
            })
            return result
        }
        return categoriesData?.data.items ? flattenCategories(categoriesData.data.items) : []
    }, [categoriesData])

    const projectOptions = useMemo(
        () =>
            projectListData?.data.items?.map((proj: ProjectItem) => ({
                value: proj.id,
                label: proj.name,
            })) || [],
        [projectListData],
    )

    const totalNews = data?.data.total || 0

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
                                title: 'Danh sách bài viết',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    {hasPermission(RESOURCE_TYPE.NEW, ACTION.CREATE) && (
                        <Button type="primary" icon={<PlusOutlined />} href={'/news/create'} className="w-fit">
                            Tạo mới
                        </Button>
                    )}
                </Flex>
            </Card>

            <Card>
                <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
                    <Flex wrap={false} gap="middle" align="center" justify="space-start" className="!mb-4">
                        <Tooltip title="Tìm kiếm theo tiêu đề">
                            <Form.Item name="keyword" className="!mb-0 w-1/2">
                                <Input placeholder="Tìm kiếm theo tiêu đề" allowClear maxLength={255} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip title="Lọc theo danh mục">
                            <Form.Item name="category_id" className="!mb-0 w-1/4">
                                <Select
                                    placeholder="Lọc theo danh mục"
                                    className="w-full"
                                    loading={loadingCategories}
                                    allowClear
                                    showSearch
                                    options={flattenedCategoryOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip title="Lọc theo dự án">
                            <Form.Item name="project_id" className="!mb-0 w-1/4">
                                <Select
                                    placeholder="Lọc theo dự án"
                                    className="w-full"
                                    loading={loadingProjects}
                                    allowClear
                                    showSearch
                                    options={projectOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Tooltip>

                        <Button type="primary" onClick={handleResetFilter} className="ml-auto">
                            Reset
                        </Button>
                    </Flex>
                </Form>

                <Table<NewsItem>
                    dataSource={data?.data.items || []}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    bordered
                    scroll={{ x: true }}
                    onChange={handleTableChange}
                    pagination={{
                        current: page,
                        pageSize: app.DEFAULT_PAGE_SIZE,
                        total: totalNews,
                        onChange: setPage,
                        showSizeChanger: false,
                        responsive: true,
                        showTotal: () => `Tổng số ${totalNews} bản ghi`,
                    }}
                />
            </Card>
        </Space>
    )
}

export default NewsList
