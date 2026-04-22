import React from 'react'
import { Card, Typography, Tag, Flex, Empty, Button } from 'antd'
import { ShopOutlined, ArrowRightOutlined } from '@ant-design/icons'
import type { OpportunityItem } from '@/types/opportunity'
import { useNavigate } from 'react-router'
import { useGetProductDetailQuery } from '@/api/product'
import { PRODUCT_TRANSACTION_LABEL_MAPPED } from '@/config/constant'
import type { TypeOfTransactionType } from '@/types'

const { Text } = Typography

interface LinkedProductCardProps {
    opportunity: OpportunityItem
}

const ProductDetail = ({ productId }: { productId: number }) => {
    const navigate = useNavigate()
    const { data } = useGetProductDetailQuery({ product_id: productId }, { skip: !productId })
    const product = data?.data

    if (!product) return null

    return (
        <div
            className="p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            onClick={() => navigate(`/products/${productId}/hub`)}>
            <Flex justify="space-between" align="start">
                <div className="flex-1 min-w-0">
                    <Flex gap={6} align="center" className="mb-1">
                        <ShopOutlined className="text-blue-500" />
                        <Text strong className="!text-sm truncate">
                            {product.product_code || `#${product.id}`}
                        </Text>
                    </Flex>
                    <Text className="!text-sm !text-gray-700 block truncate">{product.name}</Text>
                    {product.address && (
                        <Text className="!text-xs !text-gray-400 block truncate mt-0.5">{product.address}</Text>
                    )}
                </div>
                <Flex vertical align="end" gap={4} className="flex-shrink-0 ml-2">
                    {product.type_transaction_id && (
                        <Tag color="green" className="!m-0 !text-xs">
                            {PRODUCT_TRANSACTION_LABEL_MAPPED[product.type_transaction_id as TypeOfTransactionType]}
                        </Tag>
                    )}
                    <ArrowRightOutlined className="text-gray-300 text-xs" />
                </Flex>
            </Flex>
        </div>
    )
}

const LinkedProductCard: React.FC<LinkedProductCardProps> = ({ opportunity }) => {
    return (
        <Card
            size="small"
            title={
                <Text strong className="!text-xs !uppercase !tracking-wider !text-gray-500">
                    Sản phẩm quan tâm
                </Text>
            }>
            {opportunity.product_id ? (
                <ProductDetail productId={opportunity.product_id} />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa liên kết sản phẩm" className="!my-4">
                    <Button type="link" size="small">
                        + Thêm sản phẩm
                    </Button>
                </Empty>
            )}
        </Card>
    )
}

export default React.memo(LinkedProductCard)
