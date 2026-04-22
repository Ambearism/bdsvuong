import React from 'react'
import { Modal, Form, Input, Select, Button, Flex, Typography, Row, Col, message, type FormInstance } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useCreateCustomerMutation } from '@/api/customer'
import type { CustomerCreateInput, CustomerItem } from '@/types/customer'
import { CARE_COLOR_CLASSES } from '@/config/colors'
import { LEAD_SOURCE_OPTIONS, REGEX_PHONE } from '@/config/constant'

const labelClassName = 'text-slate-500 !text-[10.5px] font-medium'

interface AddCustomerModalProps {
    open: boolean
    onCancel: () => void
    onSubmit: (customer: CustomerItem) => void
    form: FormInstance
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ open, onCancel, onSubmit, form }) => {
    const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation()

    const handleCancel = () => {
        onCancel()
    }

    const buildPayload = (values: Record<string, unknown>): CustomerCreateInput => {
        const leadSourceVal =
            values.source != null && !Number.isNaN(Number(values.source)) ? Number(values.source) : undefined
        return {
            name: String(values.fullName || ''),
            phone: String(values.phone || ''),
            email: values.email ? String(values.email) : undefined,
            address: values.address ? String(values.address) : undefined,
            note: values.notes ? String(values.notes) : undefined,
            lead_source: leadSourceVal,
            gender: true,
            is_supplier: false,
            is_agency: false,
            is_master: false,
            is_relative: false,
            is_relatived: false,
            is_share: false,
        }
    }

    const handleSubmit = async () => {
        const values = form.getFieldsValue()
        const hasData = String(values.fullName || '').trim() || String(values.phone || '').trim()
        if (!hasData) {
            message.error('Tạo khách hàng thất bại')
            handleCancel()
            return
        }
        try {
            const payload = buildPayload(values)
            const res = await createCustomer(payload).unwrap()
            const newCustomer = res?.data
            if (newCustomer) {
                message.success('Đã thêm khách hàng thành công')
                onSubmit(newCustomer)
                handleCancel()
            }
        } catch (err: unknown) {
            const error = err as { data?: { status?: { message?: string }; errors?: Array<{ msg?: string }> } }
            const apiErrorMessage = error?.data?.status?.message || error?.data?.errors?.[0]?.msg
            if (apiErrorMessage) {
                form.setFields([{ name: 'phone', errors: [apiErrorMessage] }])
            } else {
                message.error(apiErrorMessage)
            }
        }
    }

    return (
        <Modal
            title="Thêm Khách Hàng Mới"
            open={open}
            onCancel={handleCancel}
            afterClose={() => form.resetFields()}
            footer={null}
            width={600}
            centered>
            <Form form={form} layout="vertical" className="mt-4">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label={<span className={labelClassName}>HỌ VÀ TÊN</span>} name="fullName">
                            <Input
                                placeholder="VD: Nguyễn Văn A"
                                prefix={<UserOutlined className="!text-neutral-400" />}
                                className="!h-10"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<span className={labelClassName}>SỐ ĐIỆN THOẠI</span>}
                            name="phone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: REGEX_PHONE, message: 'Số điện thoại không hợp lệ' },
                            ]}>
                            <Input
                                placeholder="VD: 0912 xxx xxx"
                                prefix={<PhoneOutlined className="!text-neutral-400" />}
                                className="!h-10"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label={<span className={labelClassName}>EMAIL</span>} name="email">
                            <Input
                                placeholder="email@example.com"
                                prefix={<MailOutlined className="!text-neutral-400" />}
                                className="!h-10"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<span className={labelClassName}>ĐỊA CHỈ LIÊN HỆ</span>} name="address">
                            <Input
                                placeholder="VD: Hà Đông, Hà Nội"
                                prefix={<EnvironmentOutlined className="!text-neutral-400" />}
                                className="!h-10"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mb-4 mt-4 p-4 rounded-lg !bg-slate-50">
                    <Flex align="center" gap={8} className="mb-4">
                        <span className="text-xs">◆</span>
                        <Typography.Text strong className="text-base text-slate-500 !text-[10.5px]">
                            PHÂN LOẠI KHÁCH HÀNG
                        </Typography.Text>
                    </Flex>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={<span className={labelClassName}>NHÓM KHÁCH HÀNG</span>}
                                name="customerGroup">
                                <Select placeholder="Chọn nhóm khách hàng" className="!h-10" defaultValue="Chủ nhà">
                                    <Select.Option value="Chủ nhà">Chủ nhà</Select.Option>
                                    <Select.Option value="Khách hàng">Khách hàng</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={<span className={labelClassName}>NGUỒN GỐC</span>} name="source">
                                <Select
                                    placeholder="Chọn nguồn gốc"
                                    className="!h-10"
                                    allowClear
                                    options={LEAD_SOURCE_OPTIONS}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <Form.Item label={<span className={labelClassName}>GHI CHÚ THÊM</span>} name="notes">
                    <Input.TextArea
                        rows={4}
                        placeholder="Nhu cầu sơ bộ, tính cách, giờ rảnh..."
                        className="!resize-none"
                    />
                </Form.Item>

                <Flex justify="flex-end" gap={12} className="mt-6 pt-4">
                    <Button onClick={handleCancel}>Hủy bỏ</Button>
                    <Button
                        type="primary"
                        className={`${CARE_COLOR_CLASSES.primary.bg} ${CARE_COLOR_CLASSES.primary.border} ${CARE_COLOR_CLASSES.primaryHover.bgHover} ${CARE_COLOR_CLASSES.primaryHover.borderHover}`}
                        loading={isCreating}
                        onClick={handleSubmit}>
                        Lưu Khách Hàng
                    </Button>
                </Flex>
            </Form>
        </Modal>
    )
}

export default AddCustomerModal
