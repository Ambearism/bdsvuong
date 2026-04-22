import { Card, Form, Input } from 'antd'

const HotlineConfig = () => {
    return (
        <Card size="small" className="!rounded-tl-none">
            <Form.Item
                label="Số hotline"
                name="hotline"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0">
                <Input placeholder="098 7906817 - 0906 205 123" />
            </Form.Item>
        </Card>
    )
}

export default HotlineConfig
