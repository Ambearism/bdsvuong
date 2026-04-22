import { useGetCustomerListQuery } from '@/api/customer'
import DetailCustomerModal from '@/components/modals/customers/DetailCustomerModal'
import { ACTION } from '@/config/permission'

import type { CustomerItem } from '@/types/customer'
import { EditOutlined, MailOutlined, PhoneOutlined, PlusOutlined, SolutionOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, Space, Table, Tag, Tooltip, Typography, Avatar } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { useMemo, useState } from 'react'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'
import { useGetEnumOptionsQuery } from '@/api/types'
import { LeadSourceLabels } from '@/config/constant'
import { app } from '@/config/app'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const ListCustomer: React.FC = () => {
    useDocumentTitle('Danh sách khách hàng')
    const navigate = useNavigate()

    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)

    const [openDetail, setOpenDetail] = useState(false)
    const [selected, setSelected] = useState<CustomerItem | null>(null)

    const { data, isLoading } = useGetCustomerListQuery(
        { page, per_page: pageSize },
        { refetchOnMountOrArgChange: true },
    )
    const items = useMemo(() => (data?.data?.items ?? []) as CustomerItem[], [data])
    const total = data?.data?.total ?? 0

    const { data: enumData } = useGetEnumOptionsQuery(['lead_source'])

    const padId = (id: number) => `#K${String(id)}`
    const genderTag = (gender: boolean | null | undefined) =>
        gender === true ? <Tag color="cyan">Nam</Tag> : gender === false ? <Tag color="pink">Nữ</Tag> : <Tag>-</Tag>

    const getPermissions = (record: CustomerItem) => {
        const itemPermissions = record.customer_permissions
        return {
            canRead: itemPermissions ? itemPermissions.includes(ACTION.READ) : true,
            canUpdate: itemPermissions ? itemPermissions.includes(ACTION.UPDATE) : true,
        }
    }

    const columns: ColumnsType<CustomerItem> = [
        {
            title: 'Mã',
            dataIndex: 'id',
            width: 90,
            render: (id: number, record) => {
                const { canRead } = getPermissions(record)
                return canRead ? (
                    <Button
                        size="small"
                        type="default"
                        className="!bg-gray-100 !border !border-gray-300"
                        onClick={() => {
                            setSelected(record)
                            setOpenDetail(true)
                        }}>
                        {padId(id)}
                    </Button>
                ) : (
                    padId(id)
                )
            },
            fixed: 'left',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'name',
            width: 200,
            render: (_, record) => (
                <Space size={8} wrap>
                    <Typography.Text className="font-medium">{record.name}</Typography.Text>
                    {genderTag(record.gender)}
                </Space>
            ),
        },
        {
            title: 'Liên hệ',
            dataIndex: 'phone',
            width: 220,
            render: (phone: string | null, record) => (
                <Flex vertical justify="center" gap={2}>
                    <Space size={6}>
                        <PhoneOutlined className="text-red-500!" />
                        <Typography.Text className="text-red-500!" type={phone ? undefined : 'secondary'}>
                            {phone ?? '-'}
                        </Typography.Text>
                    </Space>
                    {record.email && (
                        <Space size={6}>
                            <MailOutlined className="text-gray-500" />
                            <Typography.Text type="secondary">{record.email}</Typography.Text>
                        </Space>
                    )}
                </Flex>
            ),
            responsive: ['sm'],
        },
        {
            title: 'Nguồn',
            dataIndex: 'lead_source',
            render: (source: number) =>
                source ? (
                    <Typography.Text type="secondary">
                        {enumData?.data?.lead_source?.find(item => item.value == source)?.label ||
                            LeadSourceLabels[source as keyof typeof LeadSourceLabels] ||
                            app.EMPTY_DISPLAY}
                    </Typography.Text>
                ) : (
                    app.EMPTY_DISPLAY
                ),
            responsive: ['lg'],
        },
        {
            title: 'Phụ trách',
            key: 'assigned_to',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar src={record.assigned_to_info?.image_url} size="small">
                        {record.assigned_to_info?.full_name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography.Link
                        className="font-medium whitespace-nowrap"
                        onClick={() => navigate(`/accounts/${record.assigned_to_info?.id}/update`)}>
                        {record.assigned_to_info?.full_name || '-'}
                    </Typography.Link>
                </Space>
            ),
        },
        {
            title: 'Leads/Deals',
            key: 'leads_deals',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <Space split={<Typography.Text type="secondary">/</Typography.Text>}>
                    <Tag color="blue" className="font-bold min-w-7.5 text-center border-none bg-blue-50 text-blue-600">
                        {record.total_leads}
                    </Tag>
                    <Tag
                        color="orange"
                        className="font-bold min-w-7.5 text-center border-none bg-orange-50 text-orange-600">
                        {record.total_deals}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            width: 150,
            render: (_, record) => {
                return <Typography.Text>{record.created_at}</Typography.Text>
            },
            responsive: ['lg'],
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            align: 'center',
            render: (record: CustomerItem) => {
                const { canRead, canUpdate } = getPermissions(record)

                return (
                    <Space>
                        {canRead && (
                            <Tooltip title="Xem Hub">
                                <Button
                                    icon={<SolutionOutlined />}
                                    onClick={() => navigate(`/customers/${record.id}/hub`)}
                                    size="small"
                                />
                            </Tooltip>
                        )}
                        {canUpdate && (
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/customers/${record.id}/update`)}
                                    size="small"
                                />
                            </Tooltip>
                        )}
                    </Space>
                )
            },
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
                                title: 'Danh sách khách hàng',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />

                    <Button className="ml-auto" type="primary" onClick={() => navigate('/customers/create')}>
                        <PlusOutlined /> Tạo mới
                    </Button>
                </Flex>
            </Card>
            <Card>
                <Table<CustomerItem>
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={items}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: false,
                        showTotal: () => `Tổng số ${total} bản ghi`,
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage)
                            setPageSize(nextPageSize)
                        },
                    }}
                    scroll={{ x: 'max-content' }}
                    bordered
                />
            </Card>

            <DetailCustomerModal
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                customer={selected ?? undefined}
            />
        </Space>
    )
}

export default ListCustomer
