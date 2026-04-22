import React, { useState, useCallback } from 'react'
import { Modal, Input, message } from 'antd'

interface LostReasonModalProps {
    open: boolean
    onConfirm: (reason: string) => void
    onCancel: () => void
}

const LostReasonModal: React.FC<LostReasonModalProps> = ({ open, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('')

    const handleOk = useCallback(() => {
        if (!reason.trim()) {
            message.warning('Vui lòng nhập lý do Lost')
            return
        }
        onConfirm(reason.trim())
        setReason('')
    }, [reason, onConfirm])

    const handleCancel = useCallback(() => {
        setReason('')
        onCancel()
    }, [onCancel])

    return (
        <Modal
            title="Lý do Lost"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ disabled: !reason.trim() }}
            destroyOnHidden>
            <p className="mb-2">Vui lòng nhập lý do chuyển sang Lost:</p>
            <Input.TextArea
                rows={4}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Nhập lý do Lost..."
            />
        </Modal>
    )
}

export default React.memo(LostReasonModal)
