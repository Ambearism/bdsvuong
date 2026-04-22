import { Card, Form } from 'antd'
import { TextEditor } from '@/components/tiptap'

const Box1Config = () => {
    return (
        <Card size="small" className="!rounded-tl-none !py-2">
            <Form.Item
                name="about_text_1"
                layout="horizontal"
                label="Text"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!px-1 !mb-0">
                <TextEditor />
            </Form.Item>
        </Card>
    )
}

export default Box1Config
