import { Row, Col, Form, Input, Select, Checkbox, InputNumber } from 'antd'
import { TextEditor } from '@/components/tiptap'

interface LandDetailCardProps {
    directionOptions?: { label: string; value: string | number }[]
}

const LandDetailCard = ({ directionOptions }: LandDetailCardProps) => {
    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Địa chỉ" name="address" rules={[{ max: 255 }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Số nhà" name="number" rules={[{ max: 10 }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Tình trạng" name="finish_house" valuePropName="checked">
                        <Checkbox>Đã hoàn thiện</Checkbox>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item label="Hướng nhà" name="direction_house_id">
                        <Select
                            showSearch
                            placeholder="Chọn hướng nhà"
                            allowClear
                            options={directionOptions}
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Mặt tiền" name="street_frontage" rules={[{ type: 'number', min: 0 }]}>
                        <InputNumber className="!w-full" />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Mặt đường" name="gateway" rules={[{ type: 'number', min: 0 }]}>
                        <InputNumber className="!w-full" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
                <TextEditor />
            </Form.Item>
        </>
    )
}

export default LandDetailCard
