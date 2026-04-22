import React, { useState } from 'react'
import { Modal, Space, Typography, Select, message } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import type { RoleItem } from '@/types/role'

const { Text } = Typography

interface RoleTransferModalProps {
    open: boolean
    transferData: { id: number; name: string; total: number } | null
    allRoles: RoleItem[]
    confirmLoading?: boolean
    onOk: (replacementId: number) => void
    onCancel: () => void
}

const RoleTransferModal: React.FC<RoleTransferModalProps> = ({
    open,
    transferData,
    allRoles,
    confirmLoading,
    onOk,
    onCancel,
}) => {
    const [replacementId, setReplacementId] = useState<number | undefined>(undefined)

    const handleOk = () => {
        if (!replacementId) {
            message.warning('Vui lòng chọn vai trò thay thế')
            return
        }
        onOk(replacementId)
        setReplacementId(undefined)
    }

    const handleCancel = () => {
        setReplacementId(undefined)
        onCancel()
    }

    return (
        <Modal
            title={
                <Space>
                    <WarningOutlined className="text-orange-500" />
                    <span>Xác nhận xóa vai trò</span>
                </Space>
            }
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            okText="Xác nhận"
            cancelText="Hủy"
            destroyOnClose>
            {transferData && (
                <div className="py-4">
                    <Text>
                        Vai trò <Text strong>{transferData.name}</Text> hiện đang được gắn cho{' '}
                        <Text type="danger" strong>
                            {transferData.total}
                        </Text>{' '}
                        Tài Khoản. Để xóa vai trò này, vui lòng chọn 1 vai trò thay thế cho toàn bộ nhân viên đang được
                        gắn.
                    </Text>
                    <div className="mt-4">
                        <div className="mb-2">
                            <Text strong>Chọn vai trò thay thế:</Text>
                        </div>
                        <Select
                            className="w-full"
                            placeholder="Chọn vai trò"
                            value={replacementId}
                            onChange={setReplacementId}
                            showSearch
                            optionFilterProp="label"
                            options={allRoles
                                ?.filter(role => role.id !== transferData.id)
                                ?.map(role => ({
                                    label: role.name,
                                    value: role.id,
                                }))}
                        />
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default RoleTransferModal
