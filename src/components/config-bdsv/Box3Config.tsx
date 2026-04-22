import { Card, Form, Input } from 'antd'
import { TextEditor } from '@/components/tiptap'

const Box3Config = () => {
    return (
        <Card size="small" className="!rounded-tl-none !py-2">
            <Form.Item
                name="about_title_box_3"
                layout="horizontal"
                label="Title"
                colon={false}
                className="!px-1"
                labelCol={{ className: 'custom-label' }}>
                <Input placeholder="Tiêu đề box 3" />
            </Form.Item>

            <Form.Item
                name="about_text_3"
                layout="horizontal"
                label="Text"
                colon={false}
                className="!px-1 !mb-0"
                labelCol={{ className: 'custom-label' }}>
                <TextEditor />
            </Form.Item>
        </Card>
    )
}

export default Box3Config
