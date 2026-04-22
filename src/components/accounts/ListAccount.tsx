import React, { useState } from 'react'
import dayjs from 'dayjs'
import { Avatar, Button, Card, Select, Space, Switch, Table, Tooltip, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router'
import { LinkOutlined, EditOutlined } from '@ant-design/icons'
import {
    useGetAccountListAllQuery,
    useGetAccountListQuery,
    useUpdateAccountRoleMutation,
    useUpdateAccountStatusMutation,
} from '@/api/account'
import { useGetRolesQuery } from '@/api/role'
import type { AccountItem } from '@/types/account'
import { app } from '@/config/app'
import { ACCOUNT_TYPE } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import AccountTransferModal from '@/components/modals/AccountTransferModal'

const { Text } = Typography

const ListAccount: React.FC = () => {
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)
    const {
        data: accountData,
        isLoading,
        refetch,
    } = useGetAccountListAllQuery({ page, per_page: app.DEFAULT_PAGE_SIZE }, { refetchOnMountOrArgChange: true })
    const { data: roleData } = useGetRolesQuery({ page: app.DEFAULT_PAGE_SIZE, per_page: app.DEFAULT_PAGE_SIZE })

    const [updateAccountRole] = useUpdateAccountRoleMutation()
    const [updateAccountStatus, { isLoading: isUpdatingStatus }] = useUpdateAccountStatusMutation()

    const { data: activeAccountData, refetch: refetchActiveAccounts } = useGetAccountListQuery({
        per_page: app.FETCH_ALL,
    })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [transferData, setTransferData] = useState<{ id: number; name: string; total: number } | null>(null)

    React.useEffect(() => {
        if (isModalOpen) {
            refetchActiveAccounts()
        }
    }, [isModalOpen, refetchActiveAccounts])

    const roleOptions =
        roleData?.data?.items?.map(role => ({
            label: role.name,
            value: role.id,
        })) || []

    const handleUpdateRole = async (accountId: number, roleId: number) => {
        try {
            await updateAccountRole({ id: accountId, payload: { role_id: roleId } }).unwrap()
            message.success('Cập nhật vai trò thành công!')
            refetch()
        } catch {
            message.error('Cập nhật vai trò thất bại!')
        }
    }

    const handleUpdateStatus = async (accountId: number, isActive: boolean, replacementId?: number) => {
        try {
            await updateAccountStatus({
                id: accountId,
                payload: { is_active: isActive, replacement_id: replacementId },
            }).unwrap()
            message.success('Cập nhật trạng thái thành công!')
            setIsModalOpen(false)
            setTransferData(null)
            refetch()
        } catch (error: unknown) {
            const errorData = (error as { data?: { errors?: { total: number }; status?: { message?: string } } })?.data
            if (errorData?.errors?.total && errorData.errors.total > 0) {
                const record = accountData?.data?.list.find(account => account.id === accountId)
                setTransferData({
                    id: accountId,
                    name: record?.full_name || record?.account_name || 'Nhân viên',
                    total: errorData.errors.total,
                })
                setIsModalOpen(true)
            } else {
                message.error(errorData?.status?.message || 'Cập nhật trạng thái thất bại!')
            }
        }
    }

    const columns: ColumnsType<AccountItem> = [
        {
            title: 'ID NV',
            dataIndex: 'id',
            width: 80,
            render: id => <Text type="secondary">{id}</Text>,
        },
        {
            title: 'Tên NV',
            dataIndex: 'full_name',
            width: 200,
            render: (name, record) => (
                <Space>
                    <Avatar src={record.image_url || undefined} alt={name}>
                        {name?.[0]}
                    </Avatar>
                    <Text strong>{name || record.account_name}</Text>
                </Space>
            ),
        },
        {
            title: 'Số ĐT',
            dataIndex: 'phone',
            width: 120,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: 200,
        },
        {
            title: 'Chức Danh',
            dataIndex: 'job_title',
            width: 150,
            render: jobTitle => <Text className="text-xs">{jobTitle || '--'}</Text>,
        },
        {
            title: 'Năm KN',
            dataIndex: 'experience_years',
            width: 80,
            align: 'center',
            render: years => <Text className="text-xs">{years || '--'}</Text>,
        },
        {
            title: 'Facebook',
            dataIndex: 'facebook',
            width: 80,
            align: 'center',
            render: url =>
                url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 text-lg">
                        <LinkOutlined />
                    </a>
                ) : (
                    <Text type="secondary">--</Text>
                ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role_id',
            width: 150,
            render: (roleId, record) => {
                if (record.type_account_id === ACCOUNT_TYPE.ADMIN) {
                    return (
                        <Text strong className="!text-red-600">
                            ADMIN
                        </Text>
                    )
                }
                return (
                    <Select
                        value={roleId}
                        className="w-full"
                        onChange={value => handleUpdateRole(record.id, value)}
                        options={roleOptions}
                        size="small"
                        disabled={!hasPermission(RESOURCE_TYPE.STAFF, ACTION.UPDATE)}
                    />
                )
            },
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            width: 150,
            render: date => (
                <Text type="secondary" className="text-xs">
                    {date ? dayjs(date).format('HH:mm DD/MM/YYYY') : app.EMPTY_DISPLAY}
                </Text>
            ),
        },
        {
            title: 'Cập Nhật Cuối',
            dataIndex: 'updated_at',
            width: 150,
            render: date => (
                <Text type="secondary" className="text-xs">
                    {date ? dayjs(date).format('HH:mm DD/MM/YYYY') : app.EMPTY_DISPLAY}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            width: 60,
            render: (isActive, record) => (
                <Switch
                    size="small"
                    checked={isActive}
                    onChange={checked => handleUpdateStatus(record.id, checked)}
                    disabled={
                        !hasPermission(RESOURCE_TYPE.STAFF, ACTION.UPDATE) ||
                        record.type_account_id === ACCOUNT_TYPE.ADMIN
                    }
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    {hasPermission(RESOURCE_TYPE.STAFF, ACTION.UPDATE) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/accounts/${record.id}/update`)}
                                size="small"
                                color="cyan"
                                variant="outlined"
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <Card>
            <Table<AccountItem>
                dataSource={accountData?.data?.list}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                bordered
                scroll={{ x: 'max-content' }}
                pagination={{
                    current: page,
                    pageSize: app.DEFAULT_PAGE_SIZE,
                    total: accountData?.data?.total || 0,
                    onChange: setPage,
                    showSizeChanger: false,
                    showTotal: () => `Tổng số ${accountData?.data?.total || 0} bản ghi`,
                }}
            />

            <AccountTransferModal
                open={isModalOpen}
                transferData={transferData}
                allAccounts={activeAccountData?.data?.list || []}
                confirmLoading={isUpdatingStatus}
                onOk={replacementId => {
                    if (transferData) {
                        handleUpdateStatus(transferData.id, false, replacementId)
                    }
                }}
                onCancel={() => {
                    setIsModalOpen(false)
                    setTransferData(null)
                }}
            />
        </Card>
    )
}

export default ListAccount
