import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import InventoryValueByCategory from '@/pages/dashboard/overview/InventoryValueByCategory'
import LeadPipeline from '@/pages/dashboard/overview/LeadPipeline'
import LeadSource from '@/pages/dashboard/overview/LeadSource'
import OverviewKPI from '@/pages/dashboard/overview/OverviewKPI'
import { OverviewInventoryProvider } from '@/pages/dashboard/overview/OverviewProvider'
import TransactionRevenue from '@/pages/dashboard/overview/TransactionRevenue'
import { Col, Row } from 'antd'
import { usePermission } from '@/hooks/usePermission'
import { RESOURCE_TYPE, ACTION } from '@/config/permission'

const OverviewDashboard = () => {
    useDocumentTitle('Tổng Quan Hàng Hoá')
    const { hasPermission } = usePermission()
    const canReadDashboard = hasPermission(RESOURCE_TYPE.DASHBOARD, ACTION.READ)

    if (!canReadDashboard) {
        return null
    }

    return (
        <OverviewInventoryProvider>
            <OverviewKPI />
            <Row gutter={[24, 24]} className="!mt-6">
                <Col xs={24} lg={16}>
                    <LeadPipeline />
                </Col>
                <Col xs={24} lg={8}>
                    <LeadSource />
                </Col>
            </Row>
            <Row gutter={[24, 24]} className="!mt-6">
                <Col xs={24} lg={16}>
                    <TransactionRevenue />
                </Col>
                <Col xs={24} lg={8}>
                    <InventoryValueByCategory />
                </Col>
            </Row>
        </OverviewInventoryProvider>
    )
}

export default OverviewDashboard
