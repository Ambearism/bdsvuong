import { useGetGroupCustomerListQuery } from '@/api/group-customer'
import GroupCustomerModal from '@/components/modals/group-customer/GroupCustomerModal'
import type { GroupCustomerFlat, GroupCustomerItem as RowItem } from '@/utils/tree'
import { buildPartialTree } from '@/utils/tree'
import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, Input, Pagination, Space, Table, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const ListGroupCustomer = () => {
    useDocumentTitle('Nhóm khách hàng')
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [openCreate, setOpenCreate] = useState(false)
    const [openUpdate, setOpenUpdate] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, pageSize])

    const {
        data,
        isLoading,
        refetch: refetchList,
    } = useGetGroupCustomerListQuery(
        {
            page,
            per_page: pageSize,
            keyword: debouncedSearch || undefined,
            offset: (page - 1) * pageSize,
        },
        { refetchOnMountOrArgChange: true },
    )

    const total = data?.data?.total ?? 0

    const treeData: RowItem[] = useMemo(() => {
        const rawItems: GroupCustomerFlat[] = (data?.data?.items ?? []) as GroupCustomerFlat[]
        return buildPartialTree(rawItems)
    }, [data])

    const columns: ColumnsType<RowItem> = [
        {
            title: 'Tên nhóm',
            dataIndex: 'name',
            key: 'name',
            render: record => (
                <div className="flex flex-col">
                    <span className="inline-flex items-baseline">
                        <span className="text-red-600 mr-1">{record.id}.</span>
                        <b className="font-bold">{record.name}</b>
                    </span>
                    {record.content && <span className="text-gray-500">{record.content}</span>}
                </div>
            ),
        },
        {
            title: 'Tên nhóm cha',
            dataIndex: ['parent', 'name'],
            key: 'parent',
            width: 180,
            render: v => v ?? '—',
            responsive: ['md'],
        },
        {
            title: 'Tạo lúc',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 200,
            render: (v: string) => dayjs(v).format('DD-MM-YYYY HH:mm:ss'),
            responsive: ['md'],
        },
        {
            title: 'Cập nhật',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 200,
            render: (v: string) => dayjs(v).format('DD-MM-YYYY HH:mm:ss'),
            responsive: ['lg'],
        },
        {
            title: '',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: record => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/customer-groups/${record.id}/detail`)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setEditingId(record.id)
                                setOpenUpdate(true)
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ]

    const handlePageChange = (p: number, size?: number) => {
        setPage(p)
        if (size) setPageSize(size)
    }

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
                                    title: 'Nhóm khách hàng',
                                    className: 'text-md font-medium',
                                    href: '/customer-groups',
                                },
                            ]}
                        />

                        <Tag>{total}</Tag>

                        <Button className="ml-auto" type="primary" onClick={() => setOpenCreate(true)}>
                            <PlusOutlined /> Tạo mới
                        </Button>
                    </Flex>
                </Card>

                <Card
                // title="Danh sách (dạng cây + phân trang)"
                >
                    <Flex wrap={false} gap="middle" align="center" justify="space-between" className="!mb-4">
                        <Input
                            placeholder="Tìm theo tên nhóm"
                            allowClear
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="max-w-[420px]"
                        />
                    </Flex>

                    <Table<RowItem>
                        loading={isLoading}
                        columns={columns}
                        dataSource={treeData}
                        rowKey="id"
                        pagination={false}
                        expandable={{
                            defaultExpandAllRows: true,
                            indentSize: 16,
                        }}
                        bordered
                    />

                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        className="flex justify-end !mt-3"
                    />
                </Card>
            </Space>

            <GroupCustomerModal
                open={openCreate}
                onCancel={() => setOpenCreate(false)}
                onSuccess={async () => {
                    setOpenCreate(false)
                    await refetchList()
                }}
                mode="create"
            />

            <GroupCustomerModal
                open={openUpdate}
                onCancel={() => setOpenUpdate(false)}
                onSuccess={async () => {
                    setOpenUpdate(false)
                    await refetchList()
                }}
                mode="update"
                editingId={editingId}
            />
        </>
    )
}

export default ListGroupCustomer
