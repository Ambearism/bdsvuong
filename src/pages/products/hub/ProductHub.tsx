import { Breadcrumb, Button, Card, Col, Flex, Row, Space, Tabs } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { GoHome } from 'react-icons/go'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import ProductHubRightSidebar from '@/pages/products/hub/ProductHubRightSidebar'
import { useGetProductDetailQuery } from '@/api/product'
import type { ProductItem } from '@/types/product'
import type { ApiResponse, TypeOfOpportunityType } from '@/types'
import { OPPORTUNITY_TYPE } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import Loading from '@/components/Loading'
import { usePermission } from '@/hooks/usePermission'
import { useGetOpportunityListQuery } from '@/api/opportunity'
import { app } from '@/config/app'
import type { OpportunityListResponse } from '@/types/opportunity'

export interface HubOutletContext {
    productData: ProductItem | undefined
    isLoading: boolean
    leadsData: ApiResponse<OpportunityListResponse> | undefined
    dealsData: ApiResponse<OpportunityListResponse> | undefined
    refetchLeadsAndDeals: () => void
    leadsAndDealsPagination: Record<TypeOfOpportunityType, number>
    handleLeadsAndDealsPagination: (type: TypeOfOpportunityType, page: number) => void
}

const TAB_ITEMS = [
    {
        key: 'overview',
        label: 'Tổng quan',
    },
    {
        key: 'timeline',
        label: 'Timeline',
    },
    {
        key: 'leads-deals',
        label: 'Leads / Deals',
    },
    {
        key: 'media-360',
        label: 'Media 360',
    },
]

const pageSize = app.DEFAULT_PAGE_SIZE

const ProductHub: React.FC = () => {
    const { hasPermission } = usePermission()
    useDocumentTitle('Hub hàng hoá')

    const { product_id } = useParams<{ product_id: string }>()
    const productId = Number(product_id)
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabKey, setActiveTabKey] = useState<string>('overview')

    const [leadsAndDealsPagination, setLeadsAndDealsPagination] = useState<Record<TypeOfOpportunityType, number>>({
        [OPPORTUNITY_TYPE.LEAD]: app.DEFAULT_PAGE,
        [OPPORTUNITY_TYPE.DEAL]: app.DEFAULT_PAGE,
    })
    const { data: dealsData, refetch: refetchDeals } = useGetOpportunityListQuery(
        {
            page: leadsAndDealsPagination[OPPORTUNITY_TYPE.DEAL],
            per_page: pageSize,
            product_id: productId,
            type: OPPORTUNITY_TYPE.DEAL,
        },
        { refetchOnMountOrArgChange: true, skip: !productId },
    )
    const deals = dealsData?.data.items || []

    const { data: leadsData, refetch: refetchLeads } = useGetOpportunityListQuery(
        {
            page: leadsAndDealsPagination[OPPORTUNITY_TYPE.LEAD],
            per_page: pageSize,
            product_id: productId,
            type: OPPORTUNITY_TYPE.LEAD,
        },
        {
            refetchOnMountOrArgChange: true,
            skip: !productId,
        },
    )

    const leads = leadsData?.data.items || []

    const { data, isLoading, isError } = useGetProductDetailQuery(
        { product_id: productId },
        {
            skip: Number.isNaN(productId),
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
        },
    )
    const productData = data?.data

    useEffect(() => {
        if (productData && productData.product_permissions) {
            const canRead = productData.product_permissions.includes(ACTION.READ)
            if (!canRead) {
                navigate('/404', { replace: true })
            }
        }
    }, [productData, navigate])

    useEffect(() => {
        if (isError) {
            navigate('/404', { replace: true })
        }
    }, [isError, navigate])

    useEffect(() => {
        const currentTab = location.pathname.split('/').filter(Boolean).at(-1)

        if (currentTab && TAB_ITEMS.find(tabItem => tabItem.key === currentTab)) {
            setActiveTabKey(currentTab)
        } else {
            setActiveTabKey('overview')
        }
    }, [location.pathname])

    const handleTabChange = (key: string) => {
        setActiveTabKey(key)
        navigate(key)
    }

    const refetchLeadsAndDeals = () => {
        refetchLeads()
        refetchDeals()
    }

    const handleLeadsAndDealsPagination = (type: TypeOfOpportunityType, page: number) => {
        setLeadsAndDealsPagination(prev => ({
            ...prev,
            [type]: page,
        }))
    }

    const canUpdate = productData?.product_permissions?.includes(ACTION.UPDATE)

    if (isLoading) {
        return <Loading />
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                title: (
                                    <Link to="/">
                                        <GoHome size={24} />
                                    </Link>
                                ),
                            },
                            {
                                title: <Link to="/products">Danh sách hàng hoá</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Hub hàng hóa',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />

                    <Flex gap="middle">
                        {canUpdate && (
                            <Button type="primary" onClick={() => navigate(`/products/${productData?.id}/update`)}>
                                <EditOutlined /> Chỉnh sửa
                            </Button>
                        )}

                        {hasPermission(RESOURCE_TYPE.LEAD, ACTION.CREATE) && (
                            <Button
                                type="primary"
                                onClick={() => navigate(`/leads/create?product_id=${productData?.id}`)}>
                                <PlusOutlined /> Tạo Lead
                            </Button>
                        )}

                        {hasPermission(RESOURCE_TYPE.DEAL, ACTION.CREATE) && (
                            <Button
                                type="primary"
                                onClick={() => navigate(`/deals/create?product_id=${productData?.id}`)}>
                                <PlusOutlined /> Tạo Deal
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <Tabs activeKey={activeTabKey} onChange={handleTabChange} items={TAB_ITEMS} />
            <Row gutter={16} className="mb-4">
                <Col xs={24} md={8} xxl={6} className="order-first sm:order-last">
                    <ProductHubRightSidebar
                        productData={productData}
                        isLoading={isLoading}
                        leads={leads}
                        deals={deals}
                    />
                </Col>
                <Col xs={24} md={16} xxl={18} className="order-last sm:order-first">
                    <Outlet
                        context={{
                            productData,
                            isLoading,
                            leadsData,
                            dealsData,
                            refetchLeadsAndDeals,
                            leadsAndDealsPagination,
                            handleLeadsAndDealsPagination,
                        }}
                    />
                </Col>
            </Row>
        </Space>
    )
}

export default ProductHub
