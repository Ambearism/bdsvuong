import React from 'react'
import { Tabs, Card } from 'antd'
import Image360ToProjectTab from '@/components/image-360/tab-link-image-360/Image360ToProjectTab'
import Image360ToProductTab from '@/components/image-360/tab-link-image-360/Image360ToProductTab'

const LinkManager: React.FC = () => {
    const items = [
        {
            key: 'image360_to_project',
            label: 'Ảnh 360 → Dự án',
            children: <Image360ToProjectTab />,
        },
        {
            key: 'image360_to_product',
            label: 'Ảnh 360 → Hàng hoá',
            children: <Image360ToProductTab />,
        },
    ]

    return (
        <Card>
            <Tabs type="card" defaultActiveKey="image360_to_project" items={items} />
        </Card>
    )
}

export default LinkManager
