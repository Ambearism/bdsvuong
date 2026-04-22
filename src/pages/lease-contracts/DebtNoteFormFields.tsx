import { useGetAccountListQuery } from '@/api/account'
import { app } from '@/config/app'
import { DEBT_NOTE_TYPE, type TypeOfDebtNoteType } from '@/config/constant'
import type { DebtNoteCreateInput } from '@/types/debt-note'
import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd'
import type { Dayjs } from 'dayjs'

const { TextArea } = Input

export type DebtNoteFormValues = Omit<DebtNoteCreateInput, 'reminder_date'> & {
    reminder_date: Dayjs
}

const DEBT_NOTE_TYPE_OPTIONS: Array<{ label: string; value: TypeOfDebtNoteType }> = [
    { label: 'Chung', value: DEBT_NOTE_TYPE.GENERAL },
    { label: 'Phạt', value: DEBT_NOTE_TYPE.PUNISHMENT },
    { label: 'Dịch vụ', value: DEBT_NOTE_TYPE.SERVICE },
    { label: 'Khác', value: DEBT_NOTE_TYPE.OTHER },
]

export default function DebtNoteFormFields() {
    const { data: accountData, isLoading: loadingAccounts } = useGetAccountListQuery({
        per_page: app.FETCH_ALL,
        is_option: true,
    })

    return (
        <>
            <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề ghi chú nợ' }]}
                className="!mb-3">
                <Input placeholder="VD: Phạt chậm thanh toán, Phí sửa chữa..." />
            </Form.Item>

            <Row gutter={12}>
                <Col span={12}>
                    <Form.Item
                        label="Phân loại"
                        name="type"
                        rules={[{ required: true, message: 'Vui lòng chọn phân loại' }]}
                        className="!mb-3">
                        <Select placeholder="Chọn phân loại" options={DEBT_NOTE_TYPE_OPTIONS} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Số tiền" name="amount" className="!mb-3">
                        <InputNumber className="!w-full" min={0} addonAfter="triệu" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={12}>
                <Col span={12}>
                    <Form.Item
                        label="Người phụ trách"
                        name="assigned_to"
                        rules={[{ required: true, message: 'Vui lòng chọn người phụ trách' }]}
                        className="!mb-3">
                        <Select
                            placeholder="Chọn người phụ trách"
                            loading={loadingAccounts}
                            options={accountData?.data?.list?.map(acc => ({
                                value: acc.id,
                                label: acc.full_name,
                            }))}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Ngày nhắc"
                        name="reminder_date"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày nhắc' }]}
                        className="!mb-3">
                        <DatePicker className="!w-full" format="DD/MM/YYYY" placeholder="Chọn ngày nhắc" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Nội dung chi tiết" name="content" className="!mb-6">
                <TextArea rows={4} placeholder="Mô tả chi tiết nguyên nhân, cam kết của khách..." />
            </Form.Item>
        </>
    )
}
