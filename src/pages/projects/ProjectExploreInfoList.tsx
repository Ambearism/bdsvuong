import { useGetExploresQuery, useExportExploresMutation } from '@/api/explore'
import ImportExploreModal from '@/components/modals/explores/ImportExploreModal'
import { useParams, useNavigate } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
    Table,
    Spin,
    Button,
    message,
    Space,
    Flex,
    Card,
    Breadcrumb,
    Alert,
    Typography,
    Divider,
    Input,
    Form,
    Row,
    Col,
    Select,
    InputNumber,
} from 'antd'
import { GoHome } from 'react-icons/go'
import {
    FileExcelOutlined,
    UploadOutlined,
    SettingOutlined,
    InfoCircleOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    ClearOutlined,
} from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { ExploreOutput } from '@/types/explore'
import { useGetProjectExploreQuery } from '@/api/project'
import { useMemo, useState } from 'react'
import { formatter, parser } from '@/utils/number-utils'

export interface ExploreColumnConfig {
    title: string
    key: string
    width?: number
    fixed?: 'left' | 'right'
    render?: (val: unknown) => React.ReactNode
}

import { EXPLORE_COLUMNS_CONFIG, FILTERABLE_FIELDS } from '@/config/constant'
import { app } from '@/config/app'

const { Text, Link } = Typography

const ProjectExploreInfoList = () => {
    const navigate = useNavigate()
    const [formFilter] = Form.useForm()
    const { project_id } = useParams<{ project_id: string }>()
    const projectIdNumber = Number(project_id)
    useDocumentTitle('Thông tin tra cứu dự án')

    const [page, setPage] = useState(app.DEFAULT_PAGE)
    const [perPage, setPerPage] = useState(app.DEFAULT_PAGE_SIZE)
    const [filters, setFilters] = useState<Record<string, unknown>>({})
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)

    const [exportExplores, { isLoading: isExporting }] = useExportExploresMutation()

    const { data: configData, isLoading: isLoadingConfig } = useGetProjectExploreQuery({ project_id: projectIdNumber })
    const {
        data: exploreData,
        isLoading: isLoadingExplores,
        isFetching: isFetchingExplores,
        refetch,
    } = useGetExploresQuery({
        project_id: projectIdNumber,
        params: {
            page,
            per_page: perPage,
            ...filters,
        },
    })

    const displayFields = useMemo(() => configData?.data?.config_explore?.data || [], [configData])

    const activeFilters = useMemo(() => {
        return FILTERABLE_FIELDS.filter(field => displayFields.includes(field.key))
    }, [displayFields])

    const columns: ColumnsType<ExploreOutput> = useMemo(() => {
        const baseColumns: ColumnsType<ExploreOutput> = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 70,
                fixed: 'left',
            },
        ]

        const dynamicColumns = displayFields
            .map((field: string) => {
                const config = EXPLORE_COLUMNS_CONFIG[field]
                if (!config) return undefined

                const col: ColumnsType<ExploreOutput>[number] = {
                    ...config,
                    dataIndex: field,
                }

                if (['acreage', 'acreage_build'].includes(field)) {
                    col.render = (val: number) => val?.toLocaleString()
                }
                if (['is_corner', 'is_corner_center', 'is_rough', 'is_complete'].includes(field)) {
                    col.render = (val: boolean) => (val ? 'Có' : 'Không')
                }

                return col
            })
            .filter((col): col is ColumnsType<ExploreOutput>[number] => col !== undefined)

        return [...baseColumns, ...dynamicColumns]
    }, [displayFields])

    const handleTableChange = (pagination: TablePaginationConfig) => {
        setPage(pagination.current || app.DEFAULT_PAGE)
        setPerPage(pagination.pageSize || app.DEFAULT_PAGE_SIZE)
    }

    const handleExportExcel = async () => {
        try {
            const blob = await exportExplores({ project_id: projectIdNumber }).unwrap()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `thong_tin_tra_cuu_du_an_${projectIdNumber}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            message.success('Xuất excel thành công!')
        } catch {
            message.error('Xuất excel thất bại!')
        }
    }

    const handleImportSuccess = () => {
        setIsImportModalOpen(false)
        refetch()
    }

    const handleFilter = (values: Record<string, unknown>) => {
        setFilters(values)
        setPage(app.DEFAULT_PAGE)
    }

    const handleResetFilter = () => {
        formFilter.resetFields()
        setFilters({})
        setPage(app.DEFAULT_PAGE)
    }

    if (isLoadingConfig || isLoadingExplores) {
        return (
            <Flex justify="center" align="center" className="h-[400px]">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </Flex>
        )
    }

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
                                href: '/projects/explore',
                                title: 'Dự án tra cứu',
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Danh sách thông tin tra cứu',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Space>
                        <Button
                            icon={<SettingOutlined />}
                            onClick={() => navigate(`/projects/${projectIdNumber}/update?tab=explore`)}>
                            Sửa thông tin cấu hình
                        </Button>
                        <Button icon={<UploadOutlined />} onClick={() => setIsImportModalOpen(true)}>
                            Import Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={<FileExcelOutlined />}
                            onClick={handleExportExcel}
                            loading={isExporting}
                            className="bg-green-600 border-none">
                            Xuất Excel
                        </Button>
                    </Space>
                </Flex>
            </Card>

            <Alert
                message={
                    <Text strong>
                        <InfoCircleOutlined /> Hướng dẫn quản lý dữ liệu tra cứu
                    </Text>
                }
                description={
                    <div className="mt-1">
                        <Space direction="vertical" size={2} className="w-full">
                            <Text>
                                - <Text strong>Cấu hình hiển thị:</Text> Các cột bạn thấy trong bảng được đồng bộ từ mục{' '}
                                <Text code>Sửa thông tin cấu hình</Text>. Bạn có thể thêm/bớt cột tại đó.
                            </Text>
                            <Text>
                                - <Text strong>Xuất dữ liệu:</Text> Sử dụng nút <Text strong>Xuất Excel</Text> để tải
                                toàn bộ dữ liệu hiện có về máy.{' '}
                                <Text type="success">
                                    (Có thể dùng file này để chỉnh sửa và Import ngược lại để cập nhật hàng loạt bản
                                    ghi)
                                </Text>
                                .
                            </Text>
                            <Text>
                                - <Text strong>Cập nhật/Thêm mới:</Text> Tải file Excel mẫu (hoặc dùng chính file vừa
                                xuất), chỉnh sửa thông tin rồi nhấn <Text strong>Import Excel</Text>.
                                <Text italic className="ml-1">
                                    (Hệ thống dựa vào cột ID để phân biệt cập nhật hoặc tạo mới)
                                </Text>
                                .
                            </Text>
                            <Divider className="my-2" />
                            <Flex align="center" gap="small">
                                <QuestionCircleOutlined className="text-blue-500" />
                                <Text>
                                    Cần trợ giúp thêm? Hãy nhấn vào{' '}
                                    <Link onClick={() => navigate(`/projects/${projectIdNumber}/update?tab=explore`)}>
                                        đây
                                    </Link>{' '}
                                    để xem chi tiết cài đặt hiển thị cho từng dự án.
                                </Text>
                            </Flex>
                        </Space>
                    </div>
                }
                type="info"
                showIcon={false}
                className="shadow-sm"
            />

            <Card className="shadow-sm" size="small">
                <Form form={formFilter} layout="vertical" onFinish={handleFilter} className="mt-2">
                    <Row gutter={[16, 0]}>
                        {activeFilters.map(field => (
                            <Col xs={24} sm={12} md={4} key={field.key}>
                                <Form.Item name={field.key} label={field.label}>
                                    {field.type === 'text' && (
                                        <Input placeholder={`${field.label}...`} allowClear className="!w-full" />
                                    )}
                                    {field.type === 'number' && (
                                        <InputNumber
                                            placeholder={`${field.label}...`}
                                            className="!w-full"
                                            formatter={formatter}
                                            parser={parser}
                                        />
                                    )}
                                    {field.type === 'range' && (
                                        <Space.Compact className="!w-full">
                                            <Form.Item name={`${field.key}_min`} noStyle>
                                                <InputNumber
                                                    placeholder="Từ..."
                                                    className="!w-full"
                                                    formatter={formatter}
                                                    parser={parser}
                                                />
                                            </Form.Item>
                                            <Input
                                                className="!w-[32px] !text-center !bg-gray-50 !border-x-0 !pointer-events-none !px-0"
                                                value="~"
                                                readOnly
                                            />
                                            <Form.Item name={`${field.key}_max`} noStyle>
                                                <InputNumber
                                                    placeholder="Đến..."
                                                    className="!w-full"
                                                    formatter={formatter}
                                                    parser={parser}
                                                />
                                            </Form.Item>
                                        </Space.Compact>
                                    )}
                                    {field.type === 'select' && (
                                        <Select placeholder={`Chọn ${field.label}...`} allowClear className="!w-full">
                                            {field.options?.map(
                                                (opt: { label: string; value: string | number | boolean }) => (
                                                    <Select.Option key={String(opt.value)} value={opt.value}>
                                                        {opt.label}
                                                    </Select.Option>
                                                ),
                                            )}
                                        </Select>
                                    )}
                                    {field.type === 'boolean' && (
                                        <Select placeholder="Tất cả" allowClear className="!w-full">
                                            <Select.Option value={true}>Có</Select.Option>
                                            <Select.Option value={false}>Không</Select.Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                    <Row justify="end">
                        <Col>
                            <Form.Item>
                                <Space>
                                    <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                                        Tìm kiếm
                                    </Button>
                                    <Button icon={<ClearOutlined />} onClick={handleResetFilter}>
                                        Xóa lọc
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={exploreData?.data?.items || []}
                    loading={isFetchingExplores}
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                    onChange={handleTableChange}
                    pagination={{
                        current: page,
                        pageSize: perPage,
                        total: exploreData?.data?.total || 0,
                        showSizeChanger: true,
                        showTotal: total => `Tổng số ${total} bản ghi`,
                    }}
                />
            </Card>

            <ImportExploreModal
                open={isImportModalOpen}
                onCancel={() => setIsImportModalOpen(false)}
                projectId={projectIdNumber}
                onImportSuccess={handleImportSuccess}
            />
        </Space>
    )
}

export default ProjectExploreInfoList
