import { Card, Form, Input, Button, InputNumber, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { TextEditor } from '@/components/tiptap'
import { colors } from '@/config/colors'

const Box2Config = () => {
    return (
        <Card size="small" className="!rounded-tl-none !py-2">
            <Form.Item
                name="about_title_box_2"
                layout="horizontal"
                label="Title"
                colon={false}
                className="!px-1"
                labelCol={{ className: 'custom-label' }}>
                <Input placeholder="Tiêu đề" />
            </Form.Item>

            <Form.Item
                name="about_text_2"
                layout="horizontal"
                label="Text"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!px-1">
                <TextEditor />
            </Form.Item>

            <Form.List name="about_skill">
                {(fields, { add, remove }) => (
                    <div className="flex !px-1">
                        <div className="font-medium custom-label flex justify-between items-center">Skill</div>
                        <div className="flex-1">
                            {fields.map(({ key, name, ...restField }) => (
                                <Row
                                    key={key}
                                    gutter={[16, 16]}
                                    className="border-b-1 last:border-b-1 border-gray-300 mb-2">
                                    <Col xs={24} md={6}>
                                        <Form.Item {...restField} name={[name, 'percent']} className="!mb-0 h-full">
                                            <InputNumber<number>
                                                min={0}
                                                max={100}
                                                addonAfter="%"
                                                placeholder="%"
                                                className="w-full h-full"
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} md={18} className="order-2 sm:order-none">
                                        <div className="flex">
                                            <Form.Item {...restField} name={[name, 'title']} className="!mb-0 flex-1">
                                                <Input placeholder="Tên skill..." />
                                            </Form.Item>
                                            <div className="font-medium mb-2 w-[50px] flex justify-end">
                                                <Button
                                                    type="primary"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            ))}

                            <Form.Item className="!mb-0">
                                <Button
                                    type="primary"
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}
                                    style={{ backgroundColor: colors.yellow, borderColor: colors.yellow }}>
                                    Thêm
                                </Button>
                            </Form.Item>
                        </div>
                    </div>
                )}
            </Form.List>
        </Card>
    )
}

export default Box2Config
