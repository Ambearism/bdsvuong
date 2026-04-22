import React, { useEffect } from 'react'
import { Modal, Form, Input, Switch, Row, Col, Card, Flex, Typography } from 'antd'
import type { CostCategoryItem } from '@/types/cost-category'
import { REGEX_NO_SPACE } from '@/config/constant'
import { useApiError } from '@/utils/error'

const { TextArea } = Input
const { Text } = Typography

interface CostCategoryItemModalProps {
    open: boolean
    onCancel: () => void
    onOk: (values: Partial<CostCategoryItem>) => Promise<void>
    initialValues: Partial<CostCategoryItem> | null
    zIndex?: number
}

const CostCategoryItemModal: React.FC<CostCategoryItemModalProps> = ({
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
            if (!values.group_id && initialValues?.group_id) {
                values.group_id = initialValues.group_id
            }
            await onOk(values)
        } catch (err) {
            handleError(err, 'Thao tác thất bại!', form)
        }
    }

    return (
        <Modal
            title={initialValues?.id ? 'Chỉnh sửa Mục Chi Phí' : 'Thêm Mục Chi Phí'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            width={700}
            zIndex={zIndex}
            centered>
            <Form form={form} layout="vertical">
                <Form.Item name="group_id" hidden>
                    <Input />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="code"
                            label="Mã Mục"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã mục' },
                                {
                                    pattern: REGEX_NO_SPACE,
                                    message: 'Mã danh mục không được chứa khoảng trắng',
                                },
                            ]}>
                            <Input
                                placeholder="VAT"
                                onChange={event => form.setFieldValue('code', event.target.value.toUpperCase())}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item
                            name="name"
                            label="Tên Mục"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên mục' },
                                { max: 255, message: 'Tên mục không được vượt quá 255 ký tự' },
                            ]}>
                            <Input placeholder="VD: Thuế GTGT" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="description" label="Mô tả">
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="examples" label="Ví dụ áp dụng">
                            <TextArea rows={2} placeholder="VD: Thuế 5%..." />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card size="small" bodyStyle={{ padding: 12 }}>
                            <Flex justify="space-between" align="center">
                                <Flex vertical>
                                    <Text strong>Liên quan khách thuê</Text>
                                    <Text type="secondary" className="text-xs">
                                        Yêu cầu chọn khách khi nhập phí
                                    </Text>
                                </Flex>
                                <Form.Item name="tenant_related_flag" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                            </Flex>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" bodyStyle={{ padding: 12 }}>
                            <Flex justify="space-between" align="center">
                                <Flex vertical>
                                    <Text strong>Bắt buộc đính kèm</Text>
                                    <Text type="secondary" className="text-xs">
                                        Phải upload ảnh/file khi nhập
                                    </Text>
                                </Flex>
                                <Form.Item name="requires_attachment" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                            </Flex>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" bodyStyle={{ padding: 12 }}>
                            <Flex justify="space-between" align="center">
                                <Flex vertical>
                                    <Text strong>Tính thuế</Text>
                                    <Text type="secondary" className="text-xs">
                                        Ghi nhận khoản thu tính thuế
                                    </Text>
                                </Flex>
                                <Form.Item name="is_tax_deductible" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                            </Flex>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" bodyStyle={{ padding: 12 }}>
                            <Flex justify="space-between" align="center">
                                <Flex vertical>
                                    <Text strong>Đang hoạt động</Text>
                                    <Text type="secondary" className="text-xs">
                                        Cho phép chọn khi nhập liệu
                                    </Text>
                                </Flex>
                                <Form.Item name="is_active" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default CostCategoryItemModal
