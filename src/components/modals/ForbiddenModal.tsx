import React from 'react'
import { Modal, Result, Button } from 'antd'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { uiSelector, closeForbiddenModal } from '@/redux/slice/uiSlice'

const ForbiddenModal: React.FC = () => {
    const dispatch = useAppDispatch()
    const { isForbiddenModalOpen } = useAppSelector(uiSelector)

    const handleClose = () => {
        dispatch(closeForbiddenModal())
    }

    return (
        <Modal open={isForbiddenModalOpen} onCancel={handleClose} footer={null} centered width={500}>
            <Result
                status="403"
                title="403"
                subTitle="Xin lỗi, bạn không có quyền thực hiện hành động này. Vui lòng liên hệ quản trị viên."
                extra={
                    <Button type="primary" onClick={handleClose}>
                        Đóng
                    </Button>
                }
            />
        </Modal>
    )
}

export default ForbiddenModal
