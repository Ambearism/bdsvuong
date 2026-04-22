import { LinkOutlined, ProductOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, message, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'

import { useLazyGetProductDetailQuery } from '@/api/product'
import { useGetTransactionListQuery } from '@/api/transaction'
import { useGetOpportunityListQuery } from '@/api/opportunity'
import {
    OpportunityStageColors,
    OpportunityStageLabels,
    TransactionStageLabels,
    TransactionStageColors,
    OPPORTUNITY_TYPE,
} from '@/config/constant'
import type { OpportunityStageType, TransactionStageType } from '@/config/constant'
import { app } from '@/config/app'
import type { CustomerHubOutletContext } from './CustomerHub'
import { formatNumber } from '@/utils/number-utils'
import type { LinkedProductItem } from '@/types/customer'
import type { ProductItem } from '@/types/product'

const { Text } = Typography

const LinkedProductsHubCustomer = () => {
    const { customerData, isLoading } = useOutletContext<CustomerHubOutletContext>()

    const [fetchedProductsMap, setFetchedProductsMap] = useState<Map<number, ProductItem>>(new Map())
    const [triggerGetProduct] = useLazyGetProductDetailQuery()

    const { data: allTransactionsData } = useGetTransactionListQuery(
        {
            customer_id: customerData?.id,
            page: app.DEFAULT_PAGE,
            per_page: app.FETCH_ALL,
        },
        { skip: !customerData?.id },
    )

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

    const leads = useMemo(() => {
        const items = allLeadsData?.data.items || []
        return items.filter(item => item.customer_id === customerData?.id)
    }, [allLeadsData, customerData?.id])

    const deals = useMemo(() => {
        const items = allDealsData?.data.items || []
        return items.filter(item => item.customer_id === customerData?.id)
    }, [allDealsData, customerData?.id])

    const transactions = useMemo(() => {
        const items = allTransactionsData?.data.items || []
        return items.filter(item => item.customer_id === customerData?.id)
    }, [allTransactionsData, customerData?.id])

    useEffect(() => {
        const fetchProducts = async () => {
            const ids = new Set<number>()

            leads.forEach(lead => lead.product_id && ids.add(lead.product_id))
            deals.forEach(deal => deal.product_id && ids.add(deal.product_id))
            transactions.forEach(transaction => transaction.product_id && ids.add(transaction.product_id))

            const uniqueIds = Array.from(ids)
            if (uniqueIds.length === 0) return

            const results = await Promise.all(
                uniqueIds.map(id =>
                    triggerGetProduct({ product_id: id })
                        .unwrap()
                        .catch(() => null),
                ),
            )

            const newMap = new Map<number, ProductItem>()
            results.forEach(res => {
                if (res?.data) {
                    newMap.set(res.data.id, res.data)
                }
            })
            setFetchedProductsMap(newMap)
        }

        if (leads.length > 0 || deals.length > 0 || transactions.length > 0) {
            fetchProducts()
        }
    }, [leads, deals, transactions, triggerGetProduct])

    const productsMap = new Map<number, LinkedProductItem>()

    const getProductInfo = (id: number) => {
        const realProduct = fetchedProductsMap.get(id)
        return {
            name: realProduct?.name,
            code: realProduct?.product_code,
            price: realProduct?.total_price_sell || realProduct?.price_sell || undefined,
            ownership: realProduct?.account_responsible_name,
        }
    }

    leads.forEach(lead => {
        if (lead.product_id) {
            const productId = lead.product_id
            const info = getProductInfo(productId)

            const productName = info.name || lead.product_rel?.name || `Bất động sản #${productId}`
            const productCode = info.code || lead.product_rel?.code

            const stage = lead.stage
            const roleLabel = OpportunityStageLabels[stage] || 'Quan tâm'

            const existing = productsMap.get(productId)

            productsMap.set(productId, {
                id: productId,
                name: productName,
                code: productCode,
                role: roleLabel,
                rawRole: stage,
                price: info.price || existing?.price,
                note: lead.notes || existing?.note,
                slug: undefined,
                ownership: info.ownership || existing?.ownership,
                isTransaction: false,
            })
        }
    })

    deals.forEach(deal => {
        if (deal.product_id) {
            const productId = deal.product_id
            const info = getProductInfo(productId)

            const productName = info.name || deal.product_rel?.name || `Bất động sản #${productId}`
            const productCode = info.code || deal.product_rel?.code

            const existing = productsMap.get(productId)

            const stage = deal.stage
            const roleLabel = OpportunityStageLabels[stage] || 'Quan tâm'

            if (!existing || existing.rawRole < stage) {
                productsMap.set(productId, {
                    id: productId,
                    name: productName,
                    code: productCode,
                    role: roleLabel,
                    rawRole: stage,
                    price: info.price || deal.budget_min || existing?.price,
                    note: deal.notes,
                    slug: undefined,
                    ownership: info.ownership || existing?.ownership,
                    isTransaction: false,
                })
            }
        }
    })

    transactions.forEach(trans => {
        if (trans.product_id) {
            const productId = trans.product_id
            const info = getProductInfo(productId)

            const productName = info.name || trans.product_rel?.name || `Bất động sản #${productId}`
            const productCode = info.code || trans.product_rel?.code

            const existing = productsMap.get(productId)

            const stage = trans.stage
            const roleLabel = TransactionStageLabels[stage] || 'Giao dịch'

            productsMap.set(productId, {
                id: productId,
                name: productName,
                code: productCode,
                role: roleLabel,
                rawRole: stage,
                price: info.price || trans.final_price || existing?.price,
                note: trans.notes || existing?.note,
                slug: undefined,
                ownership: info.ownership || existing?.ownership,
                isTransaction: true,
                transactionStage: stage,
            })
        }
    })

    const products = Array.from(productsMap.values())

    const columns: ColumnsType<LinkedProductItem> = [
        {
            title: 'Bất Động Sản',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (_: string, record: LinkedProductItem) => (
                <Flex vertical>
                    <Text strong className="text-blue-600">
                        {record.name}
                    </Text>
                    <Text type="secondary" className="text-xs">
                        {record.code ?? `#${record.id}`}
                    </Text>
                </Flex>
            ),
        },
        {
            title: 'Vai Trò',
            dataIndex: 'role',
            key: 'role',
            width: 150,
            render: (role: string, record: LinkedProductItem) => {
                let color = 'default'
                if (record.isTransaction && record.transactionStage) {
                    color = TransactionStageColors[record.transactionStage as TransactionStageType] || 'default'
                } else {
                    color = OpportunityStageColors[record.rawRole as OpportunityStageType] || 'default'
                }
                return <Tag color={color}>{role}</Tag>
            },
        },
        {
            title: 'Giá Trị',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (price: number) => (price ? `${formatNumber(price)} tỷ` : app.EMPTY_DISPLAY),
        },
        {
            title: 'Sở Hữu',
            dataIndex: 'ownership',
            key: 'ownership',
            width: 180,
            render: (ownership: string) => ownership || app.EMPTY_DISPLAY,
        },
        {
            title: 'Ghi Chú',
            dataIndex: 'note',
            key: 'note',
            width: 200,
            render: (note: string) => (
                <Text type="secondary" ellipsis={{ tooltip: note }}>
                    {note || app.EMPTY_DISPLAY}
                </Text>
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_: unknown, record: LinkedProductItem) => (
                <Button
                    icon={<LinkOutlined />}
                    size="small"
                    onClick={() => {
                        if (!app.WEBSITE_URL) {
                            message.error('URL website chưa được cấu hình')
                            return
                        }
                        window.open(`${app.WEBSITE_URL}/products/${record.id}/update`, '_blank')
                    }}
                />
            ),
        },
    ]

    return (
        <Card
            title={
                <Space align="center" size={4}>
                    <ProductOutlined />
                    <span>BĐS Liên Kết</span>
                </Space>
            }
            className="w-full">
            <Table
                dataSource={products}
                columns={columns}
                rowKey="id"
                pagination={false}
                loading={isLoading}
                scroll={{ x: 'max-content' }}
                locale={{ emptyText: <Empty description="Chưa có BĐS liên kết" /> }}
            />
        </Card>
    )
}

export default LinkedProductsHubCustomer
