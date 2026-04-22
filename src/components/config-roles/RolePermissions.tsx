import { useGetAllPermissionsQuery, useGetRolePermissionsQuery, useUpdateRolePermissionsMutation } from '@/api/role'
import Loading from '@/components/Loading'
import { ACTION, RESOURCE_TYPE, RESOURCE_TYPE_LABEL } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import type { PermissionItem } from '@/types/permission'
import { Button, Card, Col, Collapse, Empty, Row, Switch, Typography, message } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

const { Text } = Typography

type RolePermissionsProps = {
    roleId: number | null
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ roleId }) => {
    const { hasPermission } = usePermission()
    const { data: allPermissionsData, isLoading: isLoadingAll } = useGetAllPermissionsQuery()
    const { data: rolePermissionsData, isFetching: isFetchingRole } = useGetRolePermissionsQuery(roleId!, {
        skip: !roleId,
        refetchOnMountOrArgChange: true,
    })

    const [updateRolePermissions, { isLoading: isUpdating }] = useUpdateRolePermissionsMutation()

    const [selectedActionIds, setSelectedActionIds] = useState<number[]>([])

    const groupedPermissions = useMemo(() => {
        return allPermissionsData?.data || {}
    }, [allPermissionsData])

    useEffect(() => {
        if (rolePermissionsData?.data?.actions) {
            setSelectedActionIds(rolePermissionsData.data.actions.map(action => action.id))
        } else {
            setSelectedActionIds([])
        }
    }, [rolePermissionsData, roleId])

    const handleToggle = (permission: PermissionItem, checked: boolean) => {
        if (!hasPermission(RESOURCE_TYPE.ROLE, ACTION.UPDATE)) return

        setSelectedActionIds(prev => {
            let next = [...prev]
            const moduleName = permission.module_name
            const action = permission.action

            const allPermissions = Object.values(groupedPermissions).flat()

            if (checked) {
                if (!next.includes(permission.id)) {
                    next.push(permission.id)
                }

                if (([ACTION.CREATE, ACTION.UPDATE, ACTION.DELETE] as string[]).includes(action)) {
                    const readPermission = allPermissions.find(
                        permissionItem =>
                            permissionItem.module_name === moduleName && permissionItem.action === ACTION.READ,
                    )
                    if (readPermission && !next.includes(readPermission.id)) {
                        next.push(readPermission.id)
                    }
                }
            } else {
                next = next.filter(id => id !== permission.id)

                if (action === ACTION.READ) {
                    const linkedActions = [ACTION.CREATE, ACTION.UPDATE, ACTION.DELETE] as string[]
                    const linkedActionIds = allPermissions
                        .filter(
                            permissionItem =>
                                permissionItem.module_name === moduleName &&
                                linkedActions.includes(permissionItem.action),
                        )
                        .map(permissionItem => permissionItem.id)
                    next = next.filter(id => !linkedActionIds.includes(id))
                }
            }
            return next
        })
    }

    const handleSave = async () => {
        if (!roleId) return
        try {
            await updateRolePermissions({
                roleId,
                payload: { action_ids: [...new Set(selectedActionIds)] },
            }).unwrap()
            message.success('Cập nhật quyền thành công')
        } catch {
            message.error('Cập nhật quyền thất bại')
        }
    }

    if (!roleId) {
        return (
            <Card className="h-full flex items-center justify-center">
                <Empty description="Vui lòng chọn vai trò để phân quyền" />
            </Card>
        )
    }

    if (isLoadingAll) return <Loading />

    const moduleKeys = Object.keys(groupedPermissions)

    return (
        <Card
            title="Phân quyền chi tiết"
            className="h-full flex flex-col [&>.ant-card-body]:flex-1 [&>.ant-card-body]:overflow-y-auto"
            actions={
                [
                    hasPermission(RESOURCE_TYPE.ROLE, ACTION.UPDATE) && (
                        <div key="save" className="w-full px-4 flex justify-center">
                            <Button type="primary" onClick={handleSave} loading={isUpdating || isFetchingRole}>
                                Lưu thay đổi
                            </Button>
                        </div>
                    ),
                ].filter(Boolean) as React.ReactNode[]
            }>
            {isFetchingRole ? (
                <div className="py-20 flex justify-center">
                    <Loading />
                </div>
            ) : (
                <Collapse
                    items={moduleKeys.map(module => ({
                        key: module,
                        label: (
                            <Text strong>
                                {RESOURCE_TYPE_LABEL[module as keyof typeof RESOURCE_TYPE_LABEL] || module}
                            </Text>
                        ),
                        children: (
                            <Row gutter={[16, 16]}>
                                {groupedPermissions[module].map(permission => (
                                    <Col span={12} key={permission.id}>
                                        <div
                                            className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors h-full"
                                            onClick={() => {
                                                if (hasPermission(RESOURCE_TYPE.ROLE, ACTION.UPDATE)) {
                                                    handleToggle(permission, !selectedActionIds.includes(permission.id))
                                                }
                                            }}>
                                            <Text className="flex-1 mr-2">{permission.name}</Text>
                                            <Switch
                                                disabled={!hasPermission(RESOURCE_TYPE.ROLE, ACTION.UPDATE)}
                                                checked={selectedActionIds.includes(permission.id)}
                                                onChange={(checked, event) => {
                                                    event.stopPropagation()
                                                    handleToggle(permission, checked)
                                                }}
                                                size="small"
                                            />
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        ),
                    }))}
                />
            )}
        </Card>
    )
}

export default RolePermissions
