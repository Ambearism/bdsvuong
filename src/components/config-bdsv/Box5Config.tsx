import { Card, Form, Input, Button, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { TextEditor } from '@/components/tiptap'
import { colors } from '@/config/colors'

const { TextArea } = Input

const Box5Config = () => {
    return (
        <Card size="small" className="!rounded-tl-none !py-2">
            <Form.Item
                name="about_title_box_5"
                layout="horizontal"
                label="Title"
                colon={false}
                className="!px-1"
                labelCol={{ className: 'custom-label' }}>
                <Input placeholder="Tiêu đề box 5" />
            </Form.Item>

            <Form.Item
                name="about_text_5"
                layout="horizontal"
                label="Text"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!px-1">
                <TextEditor />
            </Form.Item>

            <Form.List name="about_box_5">
                {(fields, { add, remove }) => (
                    <div className="flex !px-1">
                        <div className="font-medium custom-label flex justify-between items-center">Item List</div>
                        <div className="flex-1">
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="border-b-1 last:border-b-1 border-gray-400 mb-4">
                                    <Row gutter={[16, 16]} align="middle">
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                {...restField}
                                                label="Tiêu đề"
                                                name={[name, 'title']}
                                                className="mb-2">
                                                <Input placeholder="Tiêu đề" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                label="Ảnh"
                                                name={[name, 'image']}
                                                className="mb-0">
                                                <Input placeholder="URL ảnh" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <div className="flex">
                                                <Form.Item
                                                    {...restField}
                                                    label="Nội dung"
                                                    name={[name, 'text']}
                                                    className="mb-0 flex-1">
                                                    <TextArea rows={5} placeholder="Nội dung chi tiết..." />
                                                </Form.Item>
                                                <div className="font-medium mb-2 w-[50px] flex justify-end items-center">
                                                    <Button
                                                        type="primary"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(name)}
                                                        className="w-[50px] flex justify-end items-center"
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            <Form.Item className="!mb-0">
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: colors.yellow, borderColor: colors.yellow }}
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}>
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

export default Box5Config
