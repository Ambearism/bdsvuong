import { Breadcrumb, Button, Card, Flex, Space, Tabs } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { GoHome } from 'react-icons/go'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetCustomerDetailQuery } from '@/api/customer'
import type { CustomerItem } from '@/types/customer'
import type { ApiResponse, TypeOfOpportunityType } from '@/types'
import { OPPORTUNITY_TYPE } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import Loading from '@/components/Loading'
import { useGetOpportunityListQuery } from '@/api/opportunity'
import { app } from '@/config/app'
import type { OpportunityListResponse } from '@/types/opportunity'

export interface CustomerHubOutletContext {
    customerData: CustomerItem | undefined
    isLoading: boolean
    leadsData: ApiResponse<OpportunityListResponse> | undefined
    dealsData: ApiResponse<OpportunityListResponse> | undefined
    refetchLeadsAndDeals: () => void
    refetchCustomer: () => void
    leadsAndDealsPagination: Record<TypeOfOpportunityType, number>
    handleLeadsAndDealsPagination: (type: TypeOfOpportunityType, page: number) => void
}

const TAB_ITEMS = [
    {
        key: 'overview',
        label: 'Tổng quan',
    },
    {
        key: 'products-projects',
        label: 'BĐS & Dự án',
    },
    {
        key: 'relations',
        label: 'Quan hệ KH-KH',
    },
    {
        key: 'leads-deals',
        label: 'Leads / Deals',
    },
    {
        key: 'timeline',
        label: 'Timeline',
    },
]

const pageSize = app.DEFAULT_PAGE_SIZE

const CustomerHub: React.FC = () => {
    const { hasPermission } = usePermission()
    useDocumentTitle('Hub khách hàng')

    const { customer_id } = useParams<{ customer_id: string }>()
    const customerId = Number(customer_id)
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabKey, setActiveTabKey] = useState<string>('overview')

    const [leadsAndDealsPagination, setLeadsAndDealsPagination] = useState<Record<TypeOfOpportunityType, number>>({
        [OPPORTUNITY_TYPE.LEAD]: app.DEFAULT_PAGE,
        [OPPORTUNITY_TYPE.DEAL]: app.DEFAULT_PAGE,
    })
    const {
        data,
        isLoading,
        isError,
        refetch: refetchCustomer,
    } = useGetCustomerDetailQuery(
        { customer_id: customerId },
        {
            skip: Number.isNaN(customerId),
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
        },
    )
    const customerData = data?.data

    useEffect(() => {
        if (customerData && customerData.customer_permissions) {
            const canRead = customerData.customer_permissions.includes(ACTION.READ)
            if (!canRead) {
                navigate('/404', { replace: true })
            }
        }
    }, [customerData, navigate])

    useEffect(() => {
        if (isError) {
            navigate('/404', { replace: true })
        }
    }, [isError, navigate])

    const { data: dealsDataRaw, refetch: refetchDeals } = useGetOpportunityListQuery(
        {
            page: leadsAndDealsPagination[OPPORTUNITY_TYPE.DEAL],
            per_page: pageSize,
            customer_id: customerId,
            type: OPPORTUNITY_TYPE.DEAL,
            keyword: customerData?.phone,
        },
        { refetchOnMountOrArgChange: true, skip: !customerId || !customerData },
    )

    const dealsData = dealsDataRaw
        ? {
              ...dealsDataRaw,
              data: {
                  ...dealsDataRaw.data,
                  items: dealsDataRaw.data.items.filter(
                      item => item.customer_id === customerId || item.phone === customerData?.phone,
                  ),
                  // Use actual filtered count instead of backend total to avoid pagination mismatch
                  total: dealsDataRaw.data.items.filter(
                      item => item.customer_id === customerId || item.phone === customerData?.phone,
                  ).length,
              },
          }
        : undefined

    const { data: leadsDataRaw, refetch: refetchLeads } = useGetOpportunityListQuery(
        {
            page: leadsAndDealsPagination[OPPORTUNITY_TYPE.LEAD],
            per_page: pageSize,
            customer_id: customerId,
            type: OPPORTUNITY_TYPE.LEAD,
            keyword: customerData?.phone,
        },
        {
            refetchOnMountOrArgChange: true,
            skip: !customerId || !customerData,
        },
    )

    const leadsData = leadsDataRaw
        ? {
              ...leadsDataRaw,
              data: {
                  ...leadsDataRaw.data,
                  items: leadsDataRaw.data.items.filter(
                      item => item.customer_id === customerId || item.phone === customerData?.phone,
                  ),
                  // Use actual filtered count instead of backend total to avoid pagination mismatch
                  total: leadsDataRaw.data.items.filter(
                      item => item.customer_id === customerId || item.phone === customerData?.phone,
                  ).length,
              },
          }
        : undefined

    useEffect(() => {
        const currentTab = location.pathname.split('/').filter(Boolean).at(-1)
        if (currentTab === 'hub') {
            setActiveTabKey('overview')
        } else if (currentTab && TAB_ITEMS.find(tabItem => tabItem.key === currentTab)) {
            setActiveTabKey(currentTab)
        } else {
            setActiveTabKey('overview')
        }
    }, [location.pathname])

    const handleTabChange = (key: string) => {
        setActiveTabKey(key)
        navigate(`/customers/${customerId}/hub/${key}`)
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

    const canUpdate = customerData?.customer_permissions?.includes(ACTION.UPDATE)

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
                                title: <Link to="/customers">Danh sách khách hàng</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: <Link to={`/customers/${customerId}/hub`}>Hub khách hàng</Link>,
                                className: 'text-md font-medium',
                            },
                        ]}
                    />

                    <Flex gap="middle">
                        {canUpdate && (
                            <Button type="primary" onClick={() => navigate(`/customers/${customerData?.id}/update`)}>
                                <EditOutlined /> Chỉnh sửa
                            </Button>
                        )}

                        {hasPermission(RESOURCE_TYPE.LEAD, ACTION.CREATE) && (
                            <Button
                                type="primary"
                                onClick={() => navigate(`/leads/create?customer_id=${customerData?.id}`)}>
                                <PlusOutlined /> Tạo Lead
                            </Button>
                        )}

                        {hasPermission(RESOURCE_TYPE.DEAL, ACTION.CREATE) && (
                            <Button
                                type="primary"
                                onClick={() => navigate(`/deals/create?customer_id=${customerData?.id}`)}>
                                <PlusOutlined /> Tạo Deal
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <Tabs activeKey={activeTabKey} onChange={handleTabChange} items={TAB_ITEMS} />
            <div className="mb-4">
                <Outlet
                    context={{
                        customerData,
                        isLoading,
                        leadsData,
                        dealsData,
                        refetchLeadsAndDeals,
                        refetchCustomer,
                        leadsAndDealsPagination,
                        handleLeadsAndDealsPagination,
                    }}
                />
            </div>
        </Space>
    )
}

export default CustomerHub
