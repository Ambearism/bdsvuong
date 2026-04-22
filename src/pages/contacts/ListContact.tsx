import {
    Table,
    Typography,
    Space,
    Button,
    Popconfirm,
    message,
    Card,
    Breadcrumb,
    Tooltip,
    Flex,
    Input,
    DatePicker,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { GoHome } from 'react-icons/go'
import { app } from '@/config/app'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import dayjs from 'dayjs'
import { useDeleteContactMutation, useGetContactListQuery } from '@/api/contact'
import type { ContactItem, ContactListRequest } from '@/types/contact'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

const ListContact = () => {
    useDocumentTitle('Danh sách liên hệ')
    const [page, setPage] = useState(app.DEFAULT_PAGE)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [filters, setFilters] = useState<ContactListRequest>({})

    const { data, isLoading, refetch } = useGetContactListQuery(
        {
            page,
            keyword: filters.keyword,
            start_date: filters.start_date,
            end_date: filters.end_date,
        },
        { refetchOnMountOrArgChange: true },
    )

    const contacts = data?.data?.items || []
    const totalContact = data?.data?.total || 0

    const [deleteContact] = useDeleteContactMutation()

    const handleDelete = async (contact_id: number) => {
        try {
            setDeletingId(contact_id)
            await deleteContact({ contact_id }).unwrap()
            message.success(`Đã xoá liên hệ #${contact_id}`)
            await refetch()
        } catch {
            message.error(`Xoá liên hệ #${contact_id} thất bại`)
        } finally {
            setDeletingId(null)
        }
    }

    const columns: ColumnsType<ContactItem> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: number) => <Text>#{id}</Text>,
        },
        {
            title: 'Tên KH',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Tin nhắn',
            dataIndex: 'message',
            key: 'message',
            render: (text: string) => <Text className="line-clamp-2">{text}</Text>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at: string) => <Text className="!text-xs">{created_at}</Text>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            align: 'center',
            render: (_: unknown, record: ContactItem) => (
                <Space>
                    <Popconfirm
                        title="Xác nhận xoá"
                        description={`Bạn có chắc muốn xoá liên hệ #${record.id}? Hành động này không thể hoàn tác.`}
                        okText="Xoá"
                        cancelText="Huỷ"
                        okButtonProps={{ danger: true, loading: deletingId === record.id }}
                        onConfirm={() => handleDelete(record.id)}>
                        <Tooltip title="Xóa">
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Tooltip>
                    </Popconfirm>
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
                                title: 'Danh sách liên hệ',
                                className: 'text-md font-medium',
                                href: '/contacts',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <Card>
                <Flex wrap="wrap" gap="middle" align="center" justify="flex-end" className="!mb-4">
                    <Tooltip title="Tìm kiếm theo tên, SĐT, email">
                        <Input
                            allowClear
                            placeholder="Tìm kiếm theo tên, SĐT, email"
                            className="!w-1/3"
                            value={filters.keyword}
                            onChange={e => {
                                setFilters(prev => ({ ...prev, keyword: e.target.value }))
                                setPage(app.DEFAULT_PAGE)
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Lọc theo khoảng thời gian tạo">
                        <DatePicker.RangePicker
                            className="!w-1/3"
                            value={
                                filters.start_date && filters.end_date
                                    ? [dayjs(filters.start_date), dayjs(filters.end_date)]
                                    : null
                            }
                            onChange={values => {
                                const start = values?.[0]?.format('YYYY-MM-DD') ?? null
                                const end = values?.[1]?.format('YYYY-MM-DD') ?? null
                                setFilters(prev => ({
                                    ...prev,
                                    start_date: start,
                                    end_date: end,
                                }))
                                setPage(app.DEFAULT_PAGE)
                            }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        onClick={() => {
                            setFilters({})
                            setPage(app.DEFAULT_PAGE)
                            refetch()
                        }}>
                        Reset
                    </Button>
                </Flex>
                <Table
                    columns={columns}
                    dataSource={contacts}
                    loading={isLoading}
                    pagination={
                        totalContact > app.DEFAULT_PAGE_SIZE
                            ? {
                                  current: page,
                                  pageSize: app.DEFAULT_PAGE_SIZE,
                                  total: totalContact,
                                  onChange: setPage,
                                  responsive: true,
                              }
                            : false
                    }
                    rowKey="id"
                    bordered
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </Space>
    )
}

export default ListContact
