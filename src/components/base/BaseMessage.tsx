import { Card } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import React from 'react'

interface BaseMessageProps {
    text: string
}

export const BaseMessage: React.FC<BaseMessageProps> = ({ text }) => (
    <Card size="small" className="!rounded-tl-none">
        <div className="text-center py-10 px-5 text-yellow-500">
            <ExclamationCircleOutlined className="text-5xl mb-4" />
            <p className="text-base m-0">{text}</p>
        </div>
    </Card>
)
