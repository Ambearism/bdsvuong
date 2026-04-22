import { useGetAccountListQuery } from '@/api/account'
import { app } from '@/config/app'
import { ACTION, ACTION_LABEL } from '@/config/permission'
import { Button, Card, Checkbox, Table, message, Spin, Input } from 'antd'
import { useEffect, useState } from 'react'

import type { AccountItem } from '@/types/account'
import { MAX_LENGTH_255 } from '@/config/constant'

export interface PermissionItem {
    account_id: number
    action: string
}

export interface BasePermissionsTabProps<TMutationArg> {
    id: number
    useGetPermissionsQuery: (id: number) => {
        data?: { data: PermissionItem[] }
        isLoading: boolean
        refetch: () => void
    }
    useUpdatePermissionsMutation: () => readonly [
        (args: TMutationArg) => {
            unwrap: () => Promise<unknown>
        },
        { isLoading: boolean },
    ]
    idFieldName: string
    onSuccess?: () => void
}

const BasePermissionsTab = <TMutationArg,>({
    id,
    useGetPermissionsQuery,
    useUpdatePermissionsMutation,
    idFieldName,
    onSuccess,
}: BasePermissionsTabProps<TMutationArg>) => {
    const { data: accountsData, isLoading: loadingAccounts } = useGetAccountListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
    })
    const { data: permissionsData, isLoading: loadingPermissions, refetch } = useGetPermissionsQuery(id)
    const [updatePermissions, { isLoading: isUpdating }] = useUpdatePermissionsMutation()

    const [permissions, setPermissions] = useState<PermissionItem[]>([])
    const [searchKeyword, setSearchKeyword] = useState('')

    useEffect(() => {
        if (permissionsData?.data) {
            setPermissions(permissionsData.data)
        }
    }, [permissionsData])

    const handleCheckboxChange = (accountId: number, action: string, checked: boolean) => {
        if (checked) {
            setPermissions([...permissions, { account_id: accountId, action }])
        } else {
            setPermissions(
                permissions.filter(
                    permission => !(permission.account_id === accountId && permission.action === action),
                ),
            )
        }
    }

    const handleSave = async () => {
        try {
            await updatePermissions({
                [idFieldName]: id,
                payload: { items: permissions },
            } as unknown as TMutationArg).unwrap()
            message.success('Cập nhật quyền thành công')
            if (onSuccess) {
                onSuccess()
            }
            refetch()
        } catch {
            message.error('Cập nhật quyền thất bại')
        }
    }

    const columns = [
        {
            title: 'Tài khoản',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text: string, record: AccountItem) => (
                <div>
                    <div>{text}</div>
                    <div className="text-gray-400 text-xs">{record.email}</div>
                </div>
            ),
        },
        ...Object.values(ACTION)
            .filter(action => action !== ACTION.CREATE && action !== ACTION.DELETE)
            .map(action => ({
                title: ACTION_LABEL[action as keyof typeof ACTION_LABEL] || action.toUpperCase(),
                key: action,
                align: 'center' as const,
                onCell: (record: AccountItem) => ({
                    onClick: () => {
                        const isChecked = permissions.some(
                            permission => permission.account_id === record.id && permission.action === action,
                        )
                        handleCheckboxChange(record.id, action, !isChecked)
                    },
                    className: 'cursor-pointer hover:bg-gray-50 transition-colors',
                }),
                render: (_: unknown, record: AccountItem) => (
                    <Checkbox
                        checked={permissions.some(
                            permission => permission.account_id === record.id && permission.action === action,
                        )}
                        onClick={event => event.stopPropagation()}
                        onChange={event => handleCheckboxChange(record.id, action, event.target.checked)}
                    />
                ),
            })),
    ]

    const accounts = (accountsData?.data?.list || []).filter((account: AccountItem) => {
        const keyword = searchKeyword.toLowerCase()
        return (
            account.full_name?.toLowerCase().includes(keyword) ||
            account.email?.toLowerCase().includes(keyword) ||
            account.account_name?.toLowerCase().includes(keyword)
        )
    })

    return (
        <Card size="small" className="!rounded-tl-none">
            <Spin spinning={loadingAccounts || loadingPermissions || isUpdating}>
                <div className="mb-4">
                    <Input.Search
                        placeholder="Tìm kiếm theo tên, email hoặc tên đăng nhập..."
                        allowClear
                        maxLength={MAX_LENGTH_255}
                        onChange={event => setSearchKeyword(event.target.value)}
                        className="max-w-md"
                    />
                </div>
                <Table
                    dataSource={accounts}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                    size="small"
                    bordered
                />
                <div className="flex justify-center mt-6">
                    <Button type="primary" onClick={handleSave} loading={isUpdating}>
                        Lưu Phân Quyền
                    </Button>
                </div>
            </Spin>
        </Card>
    )
}

export default BasePermissionsTab
