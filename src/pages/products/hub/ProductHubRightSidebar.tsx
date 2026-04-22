import { Card, Row, Col, Tag, Descriptions, Space, Typography, Flex, Spin, List, Badge } from 'antd'
import { EnvironmentOutlined, SwapRightOutlined } from '@ant-design/icons'
import type { ProductItem } from '@/types/product'
import { renderProductCode, withPrice, withPricePerM2, withTotalPrice } from '@/lib/utils'
import { OpportunityStage, PRODUCT_TRANSACTION, PRODUCT_TRANSACTION_LABEL_MAPPED } from '@/config/constant'
import type { TypeOfTransactionType } from '@/types'
import { useMemo } from 'react'
import { formatNumber } from '@/utils/number-utils'
import { useNavigate } from 'react-router'
import type { OpportunityItem } from '@/types/opportunity'

const { Title, Text } = Typography

const ProductHubRightSidebar = ({
    productData,
    isLoading,
    leads,
    deals,
}: {
    productData: ProductItem | undefined
    isLoading: boolean
    leads: OpportunityItem[]
    deals: OpportunityItem[]
}) => {
    const navigate = useNavigate()

    const prices = useMemo(() => {
        if (productData) {
            switch (productData.type_transaction_id) {
                case PRODUCT_TRANSACTION.RENT:
                    return [withPrice(productData.price_rent)]

                case PRODUCT_TRANSACTION.SELL:
                case PRODUCT_TRANSACTION.ALL:
                default:
                    return [withTotalPrice(productData.total_price_sell), withPricePerM2(productData.price_sell)]
            }
        }
    }, [productData])

    const viewTourCount = useMemo(() => {
        if (!productData) return 0

        return [...leads, ...deals].filter(
            opportunity =>
                opportunity.product_id === productData.id && opportunity.stage === OpportunityStage.HEN_XEM_NHA,
        ).length
    }, [deals, leads, productData])

    const handleClickListItem = () => navigate('leads-deals')

    if (isLoading) {
        return (
            <Flex align="center" justify="center" className="h-80">
                <Spin size="large" />
            </Flex>
        )
    }

    if (!productData) return null

    return (
        <Space direction="vertical" size="middle" className="!w-full sticky top-20">
            <Card>
                <Space direction="vertical" size="small" className="!w-full">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Tag color="blue">{renderProductCode(productData)}</Tag>
                        </Col>
                        <Col>
                            <Tag color="green">
                                {
                                    PRODUCT_TRANSACTION_LABEL_MAPPED[
                                        productData.type_transaction_id as TypeOfTransactionType
                                    ]
                                }
                            </Tag>
                        </Col>
                    </Row>

                    <Title level={5} className="!m-0">
                        {productData.name}
                    </Title>

                    <Space size="small">
                        <EnvironmentOutlined />
                        <Text type="secondary">{productData.address}</Text>
                    </Space>

                    {prices && (
                        <Card size="small">
                            <Row>
                                <Col span={12}>
                                    <Text type="secondary">
                                        {productData.type_transaction_id === PRODUCT_TRANSACTION.RENT
                                            ? 'GIÁ THUÊ'
                                            : 'GIÁ BÁN'}
                                    </Text>
                                    <Title level={5} className="!m-0">
                                        {prices[0]}
                                    </Title>
                                </Col>
                                {!!prices[1] && (
                                    <Col span={12}>
                                        <Text type="secondary">ĐƠN GIÁ</Text>
                                        <Title level={5} className="!m-0">
                                            {prices[1]}
                                        </Title>
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    )}

                    <Card size="small">
                        <Row>
                            <Col span={12}>
                                <Text type="secondary">LƯỢT XEM TIN</Text>
                                <Title level={5} className="!m-0">
                                    {productData.hit_count}
                                </Title>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">LƯỢT ĐI XEM</Text>
                                <Title level={5} className="!m-0">
                                    {viewTourCount}
                                </Title>
                            </Col>
                        </Row>
                    </Card>

                    <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Diện tích">{formatNumber(productData.acreage)} m²</Descriptions.Item>
                        <Descriptions.Item label="Pháp lý">{productData.status_product_name}</Descriptions.Item>
                    </Descriptions>
                </Space>
            </Card>

            <Card
                title="LIÊN KẾT NHANH"
                styles={{
                    body: {
                        padding: 16,
                    },
                }}>
                <List>
                    <List.Item
                        actions={[<Badge key="lead" count={leads.length} />, <SwapRightOutlined key="swap-right" />]}
                        onClick={handleClickListItem}
                        className="cursor-pointer transition-colors duration-300 hover:bg-gray-100 !px-2">
                        Leads quan tâm
                    </List.Item>
                    <List.Item
                        actions={[<Badge key="deal" count={deals.length} />, <SwapRightOutlined key="swap-right" />]}
                        onClick={handleClickListItem}
                        className="cursor-pointer transition-colors duration-300 hover:bg-gray-100 !px-2">
                        Deals đang chạy
                    </List.Item>
                </List>
            </Card>
        </Space>
    )
}

export default ProductHubRightSidebar
