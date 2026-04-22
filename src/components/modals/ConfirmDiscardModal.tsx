import React from 'react'
import { Modal, Button, Typography, Space } from 'antd'

const { Text } = Typography

interface ConfirmDiscardModalProps {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDiscardModal: React.FC<ConfirmDiscardModalProps> = ({ open, onConfirm, onCancel }) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={450}
            closable={true}
            transitionName=""
            maskTransitionName=""
            className="confirm-modal">
            <div className="text-center p-4">
                <Space direction="vertical" size="small" className="w-full mb-4">
                    <Text strong className="text-6 block text-bold">
                        Thông tin đang nhập chưa được lưu.
                    </Text>
                    <Text className="text-5 text-bold">
                        Nếu thoát khỏi màn hình này, toàn bộ thông tin vừa nhập sẽ không được ghi nhận.
                    </Text>
                </Space>

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={onConfirm}
                        className="w-40 h-10 border-none !bg-blue-50 !text-blue-600 hover:!bg-blue-100 transition-all font-medium">
                        Thoát
                    </Button>
                    <Button type="primary" onClick={onCancel} className="w-40 h-10 font-medium">
                        Quay lại
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmDiscardModal
