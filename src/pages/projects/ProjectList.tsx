import { useGetProjectListQuery } from '@/api/project'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import { app } from '@/config/app'
import { ANTD_PRESETS, MAX_LENGTH_255 } from '@/config/constant'
import { ACTION } from '@/config/permission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { ProjectItem } from '@/types/project'
import { EditOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, Input, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { GoHome } from 'react-icons/go'
import { MdLocationOn } from 'react-icons/md'
import { useNavigate } from 'react-router'

const { Option } = Select

const ProjectList = () => {
    const navigate = useNavigate()
    const [search, setSearch] = useState<string>()
    const [province, setProvince] = useState<number>()
    const [ward, setWard] = useState<number>()
    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)
    const [typeProject, setTypeProject] = useState<number>()

    const { data: provinceData, isLoading: loadingProvince } = useGetProvinceListQuery({ is_option: true })
    const { data: wardData, isLoading: loadingWard } = useGetWardsByProvinceIdQuery(
        { province_id: province!, is_option: true },
        { skip: !province },
    )
    const { data: projectTypesData, isLoading: loadingProjectTypes } = useGetEnumOptionsQuery(['project_types'])

    useDocumentTitle('Danh sách dự án')

    useEffect(() => {
        setWard(undefined)
    }, [province])

    const { data: projectData, isLoading } = useGetProjectListQuery(
        {
            keyword: search,
            zone_ward_id: ward,
            zone_province_id: province,
            type_project_id: typeProject,
            page,
        },
        { refetchOnMountOrArgChange: true },
    )

    const handleResetFilter = () => {
        setSearch(undefined)
        setTypeProject(undefined)
        setProvince(undefined)
        setWard(undefined)
        setPage(app.DEFAULT_PAGE)
    }

    const getPermissions = (record: ProjectItem) => {
        const itemPermissions = record.project_permissions
        return {
            canUpdate: itemPermissions ? itemPermissions.includes(ACTION.UPDATE) : true,
        }
    }

    const columns: ColumnsType<ProjectItem> = [
        {
            title: 'Tên dự án',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: ProjectItem) => (
                <Typography.Link className="line-clamp-2" onClick={() => navigate(`/projects/${record.id}/update`)}>
                    {name}
                </Typography.Link>
            ),
        },
        {
            title: 'Phân loại',
            dataIndex: 'type_project_label',
            key: 'type_project_label',
            render: (_, record) => (
                <Tag color={ANTD_PRESETS[record.type_project_id % ANTD_PRESETS.length]}>
                    {record.type_project_label}
                </Tag>
            ),
        },
        {
            title: 'Địa chỉ',
            key: 'address',
            render: (_, record) => (
                <div>
                    <div className="text-gray-700 font-semibold">
                        {record.zone_province_name ?? app.EMPTY_DISPLAY} → {record.zone_ward_name ?? app.EMPTY_DISPLAY}
                    </div>
                    <Flex align="start" gap={4} className="text-gray-400 text-sm">
                        <MdLocationOn className="mt-1 flex-shrink-0" />
                        <span className="line-clamp-2 italic">{record.address}</span>
                    </Flex>
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                const { canUpdate } = getPermissions(record)

                return (
                    <Space>
                        {record.publish_status && (
                            <Tooltip title="Xem trên trang">
                                <Button
                                    icon={<LinkOutlined />}
                                    size="small"
                                    href={`${app.CLIENT_URL}/thong-tin-du-an-${record.url_project}`}
                                    target="_blank"
                                />
                            </Tooltip>
                        )}

                        {canUpdate && (
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/projects/${record.id}/update`)}
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

    const totalProject = projectData?.data?.total || 0

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
                                title: 'Danh sách dự án',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Button type="primary" icon={<PlusOutlined />} href="/projects/create" className="w-fit">
                        Tạo mới
                    </Button>
                </Flex>
            </Card>

            <Card>
                <Flex wrap={false} gap="middle" align="center" justify="space-start" className="!mb-4">
                    <Tooltip title="Tìm theo tên dự án">
                        <Input
                            className="!w-1/4"
                            placeholder="Tìm theo tên dự án"
                            allowClear
                            value={search}
                            maxLength={MAX_LENGTH_255}
                            onChange={event => {
                                setSearch(event.target.value)
                                setPage(app.DEFAULT_PAGE)
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo loại dự án">
                        <Select
                            placeholder="Chọn phân loại dự án"
                            className="!w-1/4"
                            allowClear
                            value={typeProject}
                            loading={loadingProjectTypes}
                            showSearch
                            optionFilterProp="label"
                            onChange={value => {
                                setTypeProject(value)
                                setPage(app.DEFAULT_PAGE)
                            }}
                            options={projectTypesData?.data?.project_types}
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo tỉnh/thành">
                        <Select
                            placeholder="Chọn tỉnh/thành"
                            className="!w-1/4"
                            allowClear
                            value={province}
                            loading={loadingProvince}
                            onChange={value => {
                                setProvince(value)
                                setPage(app.DEFAULT_PAGE)
                            }}>
                            {provinceData?.data.items.map(item => (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Tooltip>

                    <Tooltip title="Lọc theo phường/xã">
                        <Select
                            placeholder="Chọn phường/xã"
                            className="!w-1/4"
                            allowClear
                            value={ward}
                            loading={loadingWard}
                            onChange={value => {
                                setWard(value)
                                setPage(app.DEFAULT_PAGE)
                            }}
                            disabled={!province}>
                            {wardData?.data.items.map(item => (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Tooltip>

                    <Button type="primary" onClick={handleResetFilter} className="ml-auto">
                        Reset
                    </Button>
                </Flex>

                <Table<ProjectItem>
                    dataSource={projectData?.data?.items || []}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    bordered
                    scroll={{ x: true }}
                    pagination={{
                        current: page,
                        pageSize: app.DEFAULT_PAGE_SIZE,
                        total: totalProject,
                        onChange: setPage,
                        responsive: true,
                        showSizeChanger: false,
                        showTotal: () => `Tổng số ${totalProject} bản ghi`,
                    }}
                />
            </Card>
        </Space>
    )
}

export default ProjectList
