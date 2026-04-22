import { Row, Col, Form, Input, Select, Checkbox, InputNumber } from 'antd'
import { TextEditor } from '@/components/tiptap'

interface PrivateHouseDetailCardProps {
    directionOptions?: { label: string; value: string | number }[]
}

const PrivateHouseDetailCard = ({ directionOptions }: PrivateHouseDetailCardProps) => {
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
                    <Form.Item label="Hướng ban công" name="direction_balcony_id">
                        <Select
                            showSearch
                            placeholder="Chọn hướng ban công"
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
                <Col span={6}>
                    <Form.Item
                        label="Số phòng ngủ"
                        name="number_bedrooms"
                        rules={[
                            { type: 'integer', message: 'Số phòng ngủ phải là số nguyên' },
                            { type: 'number', min: 0, message: 'Số phòng ngủ không được nhỏ hơn 0' },
                        ]}>
                        <InputNumber className="!w-full" precision={0} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        label="Số phòng vệ sinh"
                        name="number_toilets"
                        rules={[
                            { type: 'integer', message: 'Số phòng vệ sinh phải là số nguyên' },
                            { type: 'number', min: 0, message: 'Số phòng vệ sinh không được nhỏ hơn 0' },
                        ]}>
                        <InputNumber className="!w-full" precision={0} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
                <TextEditor />
            </Form.Item>
        </>
    )
}

export default PrivateHouseDetailCard
