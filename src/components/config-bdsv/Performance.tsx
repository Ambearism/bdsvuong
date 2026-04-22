import { Card, Form, Input } from 'antd'

const Performance = () => {
    return (
        <Card size="small" className="!rounded-tl-none">
            <Form.Item
                label="Thời gian tải trang"
                name="page_load_time"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0 ">
                <Input placeholder="0.17635703086853" />
            </Form.Item>
            <Form.Item
                label="Tổng số query"
                name="total_queries"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0">
                <Input placeholder="39" />
            </Form.Item>
        </Card>
    )
}

export default Performance
