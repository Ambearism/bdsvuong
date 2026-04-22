import React from 'react'
import { Modal, Button, Flex, type FormInstance } from 'antd'
import { CARE_COLOR_CLASSES } from '@/config/colors'
import CareCaseForm from '@/components/care/CareCaseForm'
import type { CustomerItem } from '@/types/customer'

interface CreateCareCaseModalProps {
    open: boolean
    onCancel: () => void
    onOk: (values: Record<string, unknown>) => void
    form: FormInstance
    loading?: boolean
    onOpenAddCustomerModal: () => void
    newlyCreatedCustomer?: CustomerItem | null
}

const CreateCareCaseModal: React.FC<CreateCareCaseModalProps> = ({
    open,
    onCancel,
    onOk,
    form,
    loading = false,
    onOpenAddCustomerModal,
    newlyCreatedCustomer,
}) => {
    const handleConfirmSubmit = () => {
        form.validateFields().then(() => {
            const values = form.getFieldsValue()
            onOk(values)
        })
    }

    return (
        <Modal
            title="Mở Case Chăm Sóc (Care)"
            open={open}
            onCancel={onCancel}
            afterClose={() => form.resetFields()}
            footer={null}
            width={600}
            centered
            maskClosable={false}>
            <CareCaseForm
                form={form}
                isEdit={false}
                onOpenAddCustomerModal={onOpenAddCustomerModal}
                newlyCreatedCustomer={newlyCreatedCustomer}
            />

            <Flex justify="flex-end" gap={12} className="mt-6 pt-4">
                <Button onClick={onCancel}>Hủy bỏ</Button>
                <Button
                    type="primary"
                    className={`${CARE_COLOR_CLASSES.primary.bg} ${CARE_COLOR_CLASSES.primary.border} ${CARE_COLOR_CLASSES.primaryHover.bgHover} ${CARE_COLOR_CLASSES.primaryHover.borderHover}`}
                    loading={loading}
                    onClick={handleConfirmSubmit}>
                    Xác nhận Mở Case
                </Button>
            </Flex>
        </Modal>
    )
}

export default CreateCareCaseModal
