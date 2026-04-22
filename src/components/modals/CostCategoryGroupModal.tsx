import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Switch, Row, Col, Select } from 'antd'
import type { CostCategoryGroup } from '@/types/cost-category'
import { COST_CATEGORY_TYPE_OPTIONS, REGEX_NO_SPACE } from '@/config/constant'
import { useApiError } from '@/utils/error'

const { TextArea } = Input

interface CostCategoryGroupModalProps {
    open: boolean
    onCancel: () => void
    onOk: (values: Partial<CostCategoryGroup>) => Promise<void>
    initialValues: Partial<CostCategoryGroup> | null
    zIndex?: number
}

const CostCategoryGroupModal: React.FC<CostCategoryGroupModalProps> = ({
    open,
    onCancel,
    onOk,
    initialValues,
    zIndex,
}) => {
    const { handleError } = useApiError()
    const [form] = Form.useForm()

    useEffect(() => {
        if (open && initialValues) {
            form.resetFields()
            form.setFieldsValue(initialValues)
        } else if (open) {
            form.resetFields()
        }
    }, [open, initialValues, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            await onOk(values)
        } catch (err) {
            handleError(err, 'Thao tác thất bại!', form)
        }
    }

    return (
        <Modal
            title={initialValues?.id ? 'Chỉnh sửa Nhóm' : 'Thêm Nhóm Chi Phí'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            zIndex={zIndex}
            centered>
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="code"
                            label="Mã Nhóm"
                            rules={[
                                { required: true, message: 'Nhập mã nhóm' },
                                {
                                    pattern: REGEX_NO_SPACE,
                                    message: 'Mã danh mục không được chứa khoảng trắng',
                                },
                            ]}>
                            <Input
                                placeholder="TAX_LEGAL"
                                onChange={event => form.setFieldValue('code', event.target.value.toUpperCase())}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="display_order"
                            label="Thứ tự"
                            rules={[{ type: 'integer', min: 1, message: 'Thứ tự phải là số nguyên lớn hơn 0' }]}>
                            <InputNumber className="!w-full" min={0} precision={0} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name="name"
                    label="Tên Nhóm"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên nhóm' },
                        { max: 255, message: 'Tên nhóm không được vượt quá 255 ký tự' },
                    ]}>
                    <Input placeholder="VD: Chi phí vận hành" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={2} />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="type" label="Loại Nhóm" rules={[{ required: true }]}>
                            <Select placeholder="Chọn loại nhóm" options={COST_CATEGORY_TYPE_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="is_active" label="Đang hoạt động" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default CostCategoryGroupModal
