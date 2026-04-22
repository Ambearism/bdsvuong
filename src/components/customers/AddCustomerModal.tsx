import { Form, Input, Button, Modal, Radio, Row, Col, message, Space } from 'antd'
import { useCreateCustomerMutation } from '@/api/customer'

const { TextArea } = Input

const AddCustomerModal = ({ visible, onCancel }: { visible: boolean; onCancel: () => void }) => {
    const [form] = Form.useForm()
    const [createCustomer, { isLoading }] = useCreateCustomerMutation()

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            await createCustomer(values).unwrap()
            message.success('Thêm khách hàng thành công')
            form.resetFields()
            onCancel()
        } catch {
            message.error('Thêm khách hàng thất bại')
        }
    }

    return (
        <Modal title="Thêm nhanh thông tin khách hàng" open={visible} onCancel={onCancel} footer={null} width={600}>
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item
                            label="Tên khách hàng"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Giới tính" name="gender">
                            <Radio.Group>
                                <Radio value={true}>Nam</Radio>
                                <Radio value={false}>Nữ</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Điện thoại" name="phone">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Email" name="email">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Địa chỉ" name="address">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Ghi chú" name="note">
                    <TextArea rows={3} />
                </Form.Item>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <Space>
                        <Button type="primary" onClick={handleSubmit} loading={isLoading}>
                            Thêm mới
                        </Button>
                        <Button onClick={onCancel}>Hủy</Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    )
}

export default AddCustomerModal
