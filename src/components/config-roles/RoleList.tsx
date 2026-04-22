import { useCreateRoleMutation, useDeleteRoleMutation, useGetRolesQuery, useUpdateRoleMutation } from '@/api/role'
import type { RoleItem } from '@/types/role'
import { Button, Card, Flex, Form, Input, List, Modal, Typography, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import RoleTransferModal from '@/components/modals/RoleTransferModal'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'

const { Text } = Typography

type RoleListProps = {
    selectedRoleId: number | null
    onSelect: (id: number) => void
}

const RoleList: React.FC<RoleListProps> = ({ selectedRoleId, onSelect }) => {
    const { hasPermission } = usePermission()
    const { data, isLoading, refetch } = useGetRolesQuery({})
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation()
    const [deleteRole] = useDeleteRoleMutation()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [transferData, setTransferData] = useState<{ id: number; name: string; total: number } | null>(null)
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null)
    const [form] = Form.useForm()

    const roles = React.useMemo(() => {
        return [...(data?.data?.items || [])].sort((a, b) => a.id - b.id)
    }, [data])

    useEffect(() => {
        if (!roles.length) return
        if (!selectedRoleId) {
            onSelect(roles[0].id)
        }
    }, [roles, selectedRoleId, onSelect])

    const handleOpenModal = (role?: RoleItem) => {
        if (role) {
            setEditingRole(role)
            form.setFieldsValue({ name: role.name })
        } else {
            setEditingRole(null)
            form.resetFields()
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingRole(null)
        form.resetFields()
    }

    const handleSubmit = async (values: { name: string }) => {
        try {
            if (editingRole) {
                await updateRole({ id: editingRole.id, payload: values }).unwrap()
                message.success('Cập nhật vai trò thành công')
            } else {
                await createRole(values).unwrap()
                message.success('Tạo vai trò thành công')
            }
            refetch()
            handleCloseModal()
        } catch {
            message.error('Có lỗi xảy ra, vui lòng thử lại')
        }
    }

    const handleDelete = async (id: number, replacementId?: number) => {
        try {
            await deleteRole({ id, replacement_id: replacementId }).unwrap()
            message.success('Xóa vai trò thành công')
            setIsTransferModalOpen(false)
            setTransferData(null)
            if (selectedRoleId === id) {
                onSelect(roles.find(role => role.id !== id)?.id || 0)
            }
            refetch()
        } catch (error: unknown) {
            const errorData = (error as { data?: { status?: { message?: string }; errors?: { total: number } } })?.data
            if (errorData?.errors?.total && errorData.errors.total > 0) {
                const role = roles.find(roleItem => roleItem.id === id)
                setTransferData({
                    id,
                    name: role?.name || 'Vai trò',
                    total: errorData.errors.total,
                })
                setIsTransferModalOpen(true)
            } else {
                message.error(errorData?.status?.message || 'Xóa vai trò thất bại')
            }
        }
    }

    return (
        <Card
            title="Danh sách vai trò"
            extra={
                hasPermission(RESOURCE_TYPE.ROLE, ACTION.CREATE) && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                        Tạo mới
                    </Button>
                )
            }
            className="h-full flex flex-col [&>.ant-card-body]:p-4 [&>.ant-card-body]:flex-1 [&>.ant-card-body]:overflow-y-auto">
            <List
                loading={isLoading}
                dataSource={roles}
                split={false}
                renderItem={item => (
                    <List.Item
                        className={classNames(
                            'cursor-pointer transition-all hover:bg-slate-50 border rounded-lg mb-3 p-3',
                            selectedRoleId === item.id
                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                : 'border-slate-200',
                        )}
                        onClick={() => onSelect(item.id)}
                        actions={
                            [
                                hasPermission(RESOURCE_TYPE.ROLE, ACTION.UPDATE) && (
                                    <Button
                                        key="edit"
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleOpenModal(item)
                                        }}
                                    />
                                ),
                                hasPermission(RESOURCE_TYPE.ROLE, ACTION.DELETE) && (
                                    <Button
                                        key="delete"
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={e => {
                                            e.stopPropagation()
                                            Modal.confirm({
                                                title: 'Xóa vai trò',
                                                content: 'Bạn có chắc chắn muốn xóa vai trò này?',
                                                okText: 'Xóa',
                                                okType: 'danger',
                                                cancelText: 'Hủy',
                                                onOk: () => handleDelete(item.id),
                                            })
                                        }}
                                    />
                                ),
                            ].filter(Boolean) as React.ReactNode[]
                        }>
                        <List.Item.Meta
                            title={
                                <Text
                                    strong={selectedRoleId === item.id}
                                    className={selectedRoleId === item.id ? 'text-blue-600' : ''}>
                                    {item.name}
                                </Text>
                            }
                            className="ml-2"
                        />
                    </List.Item>
                )}
            />

            <Modal
                title={editingRole ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Tên vai trò"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}>
                        <Input placeholder="Nhập tên vai trò" />
                    </Form.Item>
                    <Flex justify="end" gap="small">
                        <Button onClick={handleCloseModal}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                            {editingRole ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </Flex>
                </Form>
            </Modal>

            <RoleTransferModal
                open={isTransferModalOpen}
                transferData={transferData}
                allRoles={roles}
                onOk={replacementId => handleDelete(transferData!.id, replacementId)}
                onCancel={() => {
                    setIsTransferModalOpen(false)
                    setTransferData(null)
                }}
            />
        </Card>
    )
}

export default RoleList
