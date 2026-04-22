import { Breadcrumb, Card, Flex, Row, Col, Space } from 'antd'
import { GoHome } from 'react-icons/go'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import PerformanceRankingChart from '@/pages/dashboard/sales-performance/PerformanceRankingChart'
import TransactionValueChart from '@/pages/dashboard/sales-performance/TransactionValueChart'
import EmployeePerformanceDetails from '@/pages/dashboard/sales-performance/EmployeePerformanceDetails'

const SalesPerformancePage = () => {
    useDocumentTitle('Báo Cáo Hiệu Suất Sales')
    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Báo Cáo Hiệu Suất Sales',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <EmployeePerformanceDetails />
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <PerformanceRankingChart />
                </Col>
                <Col xs={24} lg={12}>
                    <TransactionValueChart />
                </Col>
            </Row>
        </Space>
    )
}

export default SalesPerformancePage
