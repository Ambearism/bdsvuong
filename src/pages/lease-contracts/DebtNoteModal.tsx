import { useCreateLeaseContractDebtNoteMutation } from '@/api/lease-contract'
import { DEBT_NOTE_TARGET_TYPE, DEBT_NOTE_TYPE } from '@/config/constant'
import type { LeaseContractItem } from '@/types/lease-contract'
import { Button, Form, Input, InputNumber, Modal, Space, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import DebtNoteFormFields, { type DebtNoteFormValues } from '@/pages/lease-contracts/DebtNoteFormFields'

export type DebtNoteCreateValues = DebtNoteFormValues

type DebtNoteModalProps = {
    open: boolean
    leaseContract?: LeaseContractItem
    onCancel: () => void
    onSuccess?: () => void
}

const DebtNoteModal = ({ open, leaseContract, onCancel, onSuccess }: DebtNoteModalProps) => {
    const [form] = Form.useForm<DebtNoteCreateValues>()
    const [createDebtNote, { isLoading }] = useCreateLeaseContractDebtNoteMutation()

    useEffect(() => {
        if (!open) {
            form.resetFields()
            return
        }

        if (leaseContract?.id) {
            form.setFieldsValue({
                target_id: leaseContract.id,
                target_type: DEBT_NOTE_TARGET_TYPE.LEASE_CONTRACT,
                type: DEBT_NOTE_TYPE.GENERAL,
            })
        }
    }, [form, leaseContract?.id, open])

    const handleSubmit = async (values: DebtNoteCreateValues) => {
        if (!leaseContract?.id) return

        try {
            await createDebtNote({
                ...values,
                reminder_date: values.reminder_date?.format('YYYY-MM-DD') || '',
                target_id: leaseContract.id,
                target_type: DEBT_NOTE_TARGET_TYPE.LEASE_CONTRACT,
            }).unwrap()

            message.success('Lưu ghi chú nợ thành công')
            onSuccess?.()
            onCancel()
        } catch {
            message.error('Lưu ghi chú nợ thất bại, vui lòng thử lại')
        }
    }

    return (
        <Modal
            open={open}
            title="Thêm Ghi Chú Nợ"
            onCancel={onCancel}
            footer={null}
            width={560}
            centered
            destroyOnHidden>
            <Form<DebtNoteCreateValues>
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    type: DEBT_NOTE_TYPE.GENERAL,
                }}>
                <DebtNoteFormFields />

                <Form.Item name="target_id" hidden>
                    <InputNumber />
                </Form.Item>
                <Form.Item name="target_type" hidden>
                    <Input />
                </Form.Item>

                <Space className="!w-full !justify-between">
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={isLoading} icon={<SaveOutlined />}>
                        Lưu Ghi Chú
                    </Button>
                </Space>
            </Form>
        </Modal>
    )
}

export default DebtNoteModal
