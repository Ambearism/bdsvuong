import { Card, Form } from 'antd'
import TextArea from 'antd/es/input/TextArea'
const Content = () => {
    return (
        <Card size="small" className="!rounded-tl-none">
            <Form.Item
                label="Textlink footer"
                name="textlink_footer"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0">
                <TextArea rows={4} placeholder='<a href="https://batdongsan.com.vn">Link 1</a>' />
            </Form.Item>

            <Form.Item
                label="Extra code"
                name="extra_code"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0">
                <TextArea rows={4} placeholder="google tag, etc" />
            </Form.Item>
        </Card>
    )
}

export default Content
