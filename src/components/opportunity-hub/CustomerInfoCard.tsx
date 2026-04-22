import React from 'react'
import { Card, Avatar, Space, Typography, Flex, Tooltip } from 'antd'
import { PhoneOutlined, MailOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons'
import type { OpportunityItem } from '@/types/opportunity'

const { Text, Title } = Typography

interface CustomerInfoCardProps {
    opportunity: OpportunityItem
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ opportunity }) => {
    const customerName = opportunity.customer_rel?.name || opportunity.name || 'N/A'
    const phone = opportunity.customer_rel?.phone || opportunity.phone
    const email = opportunity.customer_rel?.email || opportunity.email
    const gender = opportunity.gender

    const firstLetter = customerName.charAt(0)?.toUpperCase() || '?'

    return (
        <Card
            size="small"
            title={
                <Text strong className="!text-xs !uppercase !tracking-wider !text-gray-500">
                    Thông tin khách hàng
                </Text>
            }>
            <Flex gap={12} align="start">
                <Avatar
                    size={48}
                    className="!bg-blue-500 !text-white !text-lg !flex-shrink-0 !flex !items-center !justify-center">
                    {firstLetter}
                </Avatar>
                <div className="flex-1 min-w-0">
                    <Title level={5} className="!m-0 !mb-1 truncate">
                        {customerName}
                    </Title>

                    {phone && (
                        <Flex align="center" gap={6} className="mb-1">
                            <PhoneOutlined className="text-gray-400 text-xs" />
                            <a href={`tel:${phone}`} className="text-blue-500 hover:text-blue-600 text-sm">
                                {phone}
                            </a>
                        </Flex>
                    )}

                    {email && (
                        <Flex align="center" gap={6} className="mb-1">
                            <MailOutlined className="text-gray-400 text-xs" />
                            <Text className="!text-sm truncate">{email}</Text>
                        </Flex>
                    )}

                    {gender !== undefined && gender !== null && (
                        <Flex align="center" gap={6}>
                            {gender ? (
                                <Tooltip title="Nam">
                                    <ManOutlined className="text-blue-400 text-xs" />
                                </Tooltip>
                            ) : (
                                <Tooltip title="Nữ">
                                    <WomanOutlined className="text-pink-400 text-xs" />
                                </Tooltip>
                            )}
                            <Text className="!text-sm !text-gray-500">{gender ? 'Nam' : 'Nữ'}</Text>
                        </Flex>
                    )}

                    {opportunity.customer_id && (
                        <Space className="mt-2">
                            <a
                                href={`/customers/${opportunity.customer_id}/hub`}
                                className="text-xs text-blue-500 hover:text-blue-600">
                                Xem hồ sơ KH →
                            </a>
                        </Space>
                    )}
                </div>
            </Flex>
        </Card>
    )
}

export default React.memo(CustomerInfoCard)
