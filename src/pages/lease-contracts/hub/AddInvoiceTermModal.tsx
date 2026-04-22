import BaseFileUpload from '@/components/base/BaseFileUpload'
import { LEASE_CONTRACT_INVOICE_STATUS, UPLOAD } from '@/config/constant'
import { useCreateLeaseContractInvoiceMutation } from '@/api/lease-contract'
import { Button, DatePicker, Flex, Form, Input, InputNumber, Modal, message } from 'antd'
import type { Dayjs } from 'dayjs'

type AddInvoiceTermModalProps = {
    open: boolean
    leaseContractId?: number
    onCancel: () => void
    onSuccess?: () => void
}

type AddInvoiceTermForm = {
    termLabel: string
    dueDate: Dayjs
    amount: number
    file_urls?: string | string[]
}

export default function AddInvoiceTermModal({ open, leaseContractId, onCancel, onSuccess }: AddInvoiceTermModalProps) {
    const [form] = Form.useForm<AddInvoiceTermForm>()
    const [createInvoice, { isLoading }] = useCreateLeaseContractInvoiceMutation()

    const handleSubmit = async () => {
        if (!leaseContractId) return

        try {
            const values = await form.validateFields()

            await createInvoice({
                lease_contract_id: leaseContractId,
                title: values.termLabel,
                period_start: null,
                period_end: null,
                due_date: values.dueDate.format('YYYY-MM-DD'),
                amount: Number(values.amount || 0),
                status: LEASE_CONTRACT_INVOICE_STATUS.UNPAID,
                file_urls: values.file_urls,
            }).unwrap()

            message.success('Thêm kỳ hạn thành công')
            form.resetFields()
            onSuccess?.()
        } catch (error) {
            if (error && typeof error === 'object' && 'errorFields' in error) return
            message.error('Không thể thêm kỳ hạn')
        }
    }

    return (
        <Modal
            centered
            title="Thêm Kỳ Hạn Thanh Toán"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
            destroyOnHidden>
            <Form form={form} layout="vertical" className="!mt-8">
                <Form.Item
                    label="Tên Kỳ Hạn"
                    name="termLabel"
                    rules={[{ required: true, message: 'Vui lòng nhập tên kỳ hạn' }]}
                    className="!mb-6">
                    <Input placeholder="VD: Kỳ tháng 12/2023" />
                </Form.Item>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Form.Item
                        label="Hạn Thanh Toán"
                        name="dueDate"
                        rules={[{ required: true, message: 'Vui lòng chọn hạn thanh toán' }]}
                        className="!mb-6">
                        <DatePicker format="DD/MM/YYYY" className="!w-full" />
                    </Form.Item>

                    <Form.Item
                        label="Số Tiền Cần Thu"
                        name="amount"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền cần thu' },
                            {
                                validator: (_, value: number | undefined) =>
                                    value && value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(new Error('Vui lòng nhập số tiền thực nhận lớn hơn 0')),
                            },
                        ]}
                        className="!mb-6">
                        <InputNumber<number> className="!w-full" addonAfter="triệu" />
                    </Form.Item>
                </div>

                <Form.Item label="Chứng Từ" name="file_urls">
                    <BaseFileUpload folder="lease_contracts_invoices/" maxCount={UPLOAD.MAX_FILE_UPLOAD_DOCS} />
                </Form.Item>

                <Flex justify="space-between" gap={16} className="!mt-8">
                    <Button className="!px-8" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="primary" className="!px-10" loading={isLoading} onClick={handleSubmit}>
                        Lưu kỳ hạn
                    </Button>
                </Flex>
            </Form>
        </Modal>
    )
}
