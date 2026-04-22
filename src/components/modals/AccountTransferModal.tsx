import React, { useState } from 'react'
import { Modal, Space, Typography, Select, message } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import type { AccountItem } from '@/types/account'

const { Text } = Typography

interface AccountTransferModalProps {
    open: boolean
    transferData: { id: number; name: string; total: number } | null
    allAccounts: AccountItem[]
    confirmLoading?: boolean
    onOk: (replacementId: number) => void
    onCancel: () => void
}

const AccountTransferModal: React.FC<AccountTransferModalProps> = ({
    open,
    transferData,
    allAccounts,
    confirmLoading,
    onOk,
    onCancel,
}) => {
    const [replacementId, setReplacementId] = useState<number | undefined>(undefined)

    const handleOk = () => {
        if (!replacementId) {
            message.warning('Vui lòng chọn nhân viên thay thế')
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
                    <span>Xác nhận vô hiệu hóa nhân viên</span>
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
                        Nhân viên <Text strong>{transferData.name}</Text> hiện đang được gắn cho{' '}
                        <Text type="danger" strong>
                            {transferData.total}
                        </Text>{' '}
                        mục dữ liệu (Hàng Hóa, Dự Án, Leads, Khách Hàng, Giao Dịch...). Để vô hiệu hóa nhân viên này,
                        vui lòng chọn 1 nhân viên thay thế cho toàn bộ công việc đang được gắn.
                    </Text>
                    <div className="mt-4">
                        <div className="mb-2">
                            <Text strong>Chọn nhân viên thay thế:</Text>
                        </div>
                        <Select
                            className="w-full"
                            placeholder="Chọn nhân viên"
                            value={replacementId}
                            onChange={setReplacementId}
                            showSearch
                            optionFilterProp="label"
                            options={allAccounts
                                ?.filter(account => account.id !== transferData.id && account.is_active)
                                ?.map(account => ({
                                    label: `${account.full_name || account.account_name} (${account.id})`,
                                    value: account.id,
                                }))}
                        />
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default AccountTransferModal
