import { TextEditor } from '@/components/tiptap'
import { Checkbox, Col, Form, Input, Row } from 'antd'

const ResortDetailCard = () => {
    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Địa chỉ" name="address" rules={[{ max: 255 }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Tình trạng" name="finish_house" valuePropName="checked">
                        <Checkbox>Đã hoàn thiện</Checkbox>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
                <TextEditor />
            </Form.Item>
        </>
    )
}

export default ResortDetailCard
