import { Card, Form } from 'antd'
import Input from 'antd/es/input/Input'
const Social = () => {
    return (
        <Card size="small" className="!rounded-tl-none">
            <Form.Item
                label="Facebook"
                name="facebook"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0 ">
                <Input placeholder="https://www.facebook.com/..." />
            </Form.Item>

            <Form.Item
                label="Google+"
                name="google_plus"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0">
                <Input placeholder="https://plus.google.com/..." />
            </Form.Item>

            <Form.Item
                label="Youtube"
                name="youtube"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0 ">
                <Input placeholder="https://www.youtube.com/..." />
            </Form.Item>
        </Card>
    )
}

export default Social
