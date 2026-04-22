import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, message } from 'antd'
import dayjs from 'dayjs'
import type {
    TaxPaymentHistoryItem,
    TaxPaymentHistoryCreateInput,
    TaxPaymentHistoryUpdateInput,
} from '@/types/tax-payment-history'
import { useCreateTaxPaymentHistoryMutation, useUpdateTaxPaymentHistoryMutation } from '@/api/tax-payment-history'
import { useApiError } from '@/utils/error'

interface Props {
    open: boolean
    caseId: number
    editingItem?: TaxPaymentHistoryItem
    onCancel: () => void
    onSuccess?: () => void
}

const TaxHistoryModal = ({ open, caseId, editingItem, onCancel, onSuccess }: Props) => {
    const [form] = Form.useForm()
    const [createTaxHistory, { isLoading: isCreating }] = useCreateTaxPaymentHistoryMutation()
    const [updateTaxHistory, { isLoading: isUpdating }] = useUpdateTaxPaymentHistoryMutation()
    const { handleError } = useApiError()

    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue({
                    ...editingItem,
                    payment_date: dayjs(editingItem.payment_date),
                })
            } else {
                form.resetFields()
                form.setFieldsValue({
                    payment_date: dayjs(),
                })
            }
        }
    }, [open, editingItem, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            const payload = {
                ...values,
                payment_date: values.amount
                    ? values.payment_date.format('YYYY-MM-DD')
                    : values.payment_date.format('YYYY-MM-DD'),
                care_case_id: caseId,
            }

            if (editingItem) {
                await updateTaxHistory({
                    id: editingItem.id,
                    payload: payload as TaxPaymentHistoryUpdateInput,
                    care_case_id: caseId,
                }).unwrap()
                message.success('Cập nhật lịch sử nộp thuế thành công')
            } else {
                await createTaxHistory(payload as TaxPaymentHistoryCreateInput).unwrap()
                message.success('Thêm lịch sử nộp thuế thành công')
            }
            onSuccess?.()
            onCancel()
        } catch (error: unknown) {
            handleError(error, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    }

    return (
        <Modal
            title={editingItem ? 'Sửa lịch sử nộp thuế' : 'Ghi nhận nộp thuế'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isCreating || isUpdating}>
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item name="period" label="Kỳ nộp" rules={[{ required: true, message: 'Vui lòng nhập kỳ nộp' }]}>
                    <Input placeholder="Ví dụ: Quý 1/2024, Tháng 3/2024..." />
                </Form.Item>
                <Form.Item
                    name="payment_date"
                    label="Ngày nộp"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày nộp' }]}>
                    <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
                <Form.Item
                    name="amount"
                    label="Số tiền (triệu VNĐ)"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số tiền' },
                        { type: 'number', min: 0.01, message: 'Số tiền nộp phải từ 10,000đ trở lên' },
                    ]}>
                    <InputNumber className="w-full" placeholder="Nhập số tiền..." addonAfter="triệu" />
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có..." />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default TaxHistoryModal
