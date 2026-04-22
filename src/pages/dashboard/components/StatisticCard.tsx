import { Card, Flex, Skeleton, Typography } from 'antd'
import React from 'react'

const { Title, Text } = Typography

export interface StatisticCardProps {
    title: string
    value: string | number
    unit?: string
    trend?: string
    loading?: boolean
    description?: string
    rawValue?: number
}

const StatisticCard: React.FC<StatisticCardProps> = ({
    title,
    value,
    unit = '',
    trend,
    loading,
    description,
    rawValue,
}) => {
    const showComparison = description && rawValue !== undefined && rawValue > 0

    return (
        <Card className="h-full !shadow-sm hover:!shadow-md transition-shadow">
            <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
                <Flex vertical gap={4}>
                    <Flex align="start" className="h-8">
                        <Text
                            type="secondary"
                            className="text-xs font-medium uppercase tracking-wider line-clamp-2 !leading-tight">
                            {title}
                        </Text>
                    </Flex>
                    <Flex justify="space-between" align="baseline">
                        <Flex align="baseline" gap={4}>
                            <Title level={3} className="!mb-0 !font-bold">
                                {value}
                            </Title>
                            {unit && <Text className="text-sm font-semibold text-gray-500">{unit}</Text>}
                        </Flex>
                        {showComparison && (
                            <Text
                                className={
                                    trend === 'up'
                                        ? 'text-green-500 font-bold'
                                        : trend === 'down'
                                          ? 'text-red-500 font-bold'
                                          : 'text-gray-500 font-bold'
                                }>
                                {description}
                            </Text>
                        )}
                    </Flex>
                </Flex>
            </Skeleton>
        </Card>
    )
}

export default React.memo(StatisticCard)
