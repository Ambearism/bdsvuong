import type { CustomerHubOutletContext } from '@/pages/customers/hub/CustomerHub'
import { Card, Spin, Typography, Flex, Avatar, Tag, Space, List, Badge } from 'antd'
import { useOutletContext, useNavigate } from 'react-router'
import { UserOutlined, PhoneOutlined, MailOutlined, SwapRightOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import { useGetTransactionListQuery } from '@/api/transaction'
import { app } from '@/config/app'
import { useGetOpportunityListQuery } from '@/api/opportunity'
import { OPPORTUNITY_TYPE } from '@/config/constant'

const { Title, Text } = Typography

const OverviewHubCustomer = () => {
    const navigate = useNavigate()
    const { customerData, isLoading } = useOutletContext<CustomerHubOutletContext>()

    const buyingDeals = customerData?.total_deals ?? 0
    const caringLeads = customerData?.total_leads ?? 0
    const totalLeadsDealsCount = buyingDeals + caringLeads

    const { data: allTransactionsData } = useGetTransactionListQuery(
        {
            customer_id: customerData?.id,
            page: app.DEFAULT_PAGE,
            per_page: app.FETCH_ALL,
        },
        { skip: !customerData?.id },
    )

    const transactions = useMemo(() => {
        const items = allTransactionsData?.data.items || []
        return items.filter(item => item.customer_id === customerData?.id)
    }, [allTransactionsData, customerData?.id])

    const { data: allLeadsData } = useGetOpportunityListQuery(
        {
            customer_id: customerData?.id,
            type: OPPORTUNITY_TYPE.LEAD,
        },
        { skip: !customerData?.id },
    )

    const { data: allDealsData } = useGetOpportunityListQuery(
        {
            customer_id: customerData?.id,
            type: OPPORTUNITY_TYPE.DEAL,
        },
        { skip: !customerData?.id },
    )

    const relatedProductsCount = useMemo(() => {
        const ids = new Set<string>()

        transactions.forEach(item => {
            if (item.product_id) ids.add(String(item.product_id))
        })

        const leads = allLeadsData?.data.items || []
        leads.forEach(item => {
            if (item.product_id && item.customer_id === customerData?.id) ids.add(String(item.product_id))
        })

        const deals = allDealsData?.data.items || []
        deals.forEach(item => {
            if (item.product_id && item.customer_id === customerData?.id) ids.add(String(item.product_id))
        })

        return ids.size
    }, [transactions, allLeadsData, allDealsData, customerData?.id])

    if (isLoading) {
        return (
            <Flex align="center" justify="center" className="h-80">
                <Spin size="large" />
            </Flex>
        )
    }

    if (!customerData) return null

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="w-full overflow-hidden [&>.ant-card-body]:p-0">
                <div className="h-24 bg-blue-600 w-full relative">
                    <div className="absolute -bottom-10 left-6">
                        <Avatar
                            size={80}
                            className="!bg-gray-100 !text-black !border-4 !border-white !text-3xl !flex !items-center !justify-center">
                            {customerData.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                    </div>
                </div>

                <div className="pt-12 px-6 pb-6">
                    <Flex align="center" gap={12}>
                        <Title level={4} className="!m-0">
                            {customerData.name}
                        </Title>
                        <Tag color="cyan">#{customerData.id}</Tag>
                    </Flex>

                    <Space direction="vertical" size="small" className="w-full mt-4">
                        {customerData.phone && (
                            <Space>
                                <PhoneOutlined className="text-gray-400" />
                                <Text>{customerData.phone}</Text>
                            </Space>
                        )}
                        {customerData.email && (
                            <Space>
                                <MailOutlined className="text-gray-400" />
                                <Text>{customerData.email}</Text>
                            </Space>
                        )}
                        <Space>
                            <UserOutlined className="text-gray-400" />
                            <Text>
                                Phụ trách: <strong>{customerData.assigned_to_info?.full_name}</strong>
                            </Text>
                        </Space>

                        <Flex gap="small" className="mt-2">
                            <Tag className="py-1 px-3 bg-green-50 text-green-600 border-none font-medium text-sm !m-0">
                                ĐÃ MUA {transactions.length} BĐS
                            </Tag>
                            <Tag className="py-1 px-3 bg-blue-50 text-blue-600 border-none font-medium text-sm !m-0">
                                {customerData.total_deals ?? 0} DEALS ĐANG CHĂM
                            </Tag>
                            <Tag className="py-1 px-3 bg-orange-50 text-orange-600 border-none font-medium text-sm !m-0">
                                {caringLeads} LEADS ĐANG CHĂM
                            </Tag>
                        </Flex>
                    </Space>
                </div>
            </Card>

            <Card title="LIÊN KẾT NHANH">
                <List
                    itemLayout="horizontal"
                    dataSource={[
                        {
                            title: 'BĐS Liên Quan',
                            count: relatedProductsCount,
                            onClick: () => navigate(`/customers/${customerData.id}/hub/products-projects`),
                        },
                        {
                            title: 'Leads / Deals',
                            count: totalLeadsDealsCount,
                            onClick: () => navigate(`/customers/${customerData.id}/hub/leads-deals`),
                        },
                    ]}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Badge
                                    key="count"
                                    count={item.count}
                                    color="#f0f0f0"
                                    className="[&_.ant-scroll-number-only-unit]:text-black"
                                />,
                                <SwapRightOutlined key="arrow" />,
                            ]}
                            className="cursor-pointer hover:bg-gray-50 !px-4 hover:rounded transition-colors"
                            onClick={item.onClick}>
                            <List.Item.Meta className="items-center" title={<Text>{item.title}</Text>} />
                        </List.Item>
                    )}
                />
            </Card>
        </Space>
    )
}

export default OverviewHubCustomer
