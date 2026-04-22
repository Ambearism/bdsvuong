import { stripHtml } from '@/lib/utils'
import type { HubOutletContext } from '@/pages/products/hub/ProductHub'
import { Card, Empty, Flex, Spin, Typography } from 'antd'
import trim from 'lodash/trim'
import { useOutletContext } from 'react-router'

const { Title } = Typography

const OverviewHubProduct = () => {
    const { productData, isLoading } = useOutletContext<HubOutletContext>()

    if (isLoading) {
        return (
            <Flex align="center" justify="center" className="h-80">
                <Spin size="large" />
            </Flex>
        )
    }

    if (!productData) return null

    return (
        <Card>
            <Title level={5}>Mô tả đặc điểm</Title>
            {trim(stripHtml(productData.description)) ? (
                <div
                    className="prose max-w-none prose-table:max-w-full"
                    dangerouslySetInnerHTML={{
                        __html: productData.description,
                    }}
                />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" className="!my-10" />
            )}
        </Card>
    )
}

export default OverviewHubProduct
