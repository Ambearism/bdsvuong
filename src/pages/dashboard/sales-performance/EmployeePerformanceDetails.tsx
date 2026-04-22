import { useGetAccountStatisticsQuery } from '@/api/account'
import { MILLION_PER_BILLION } from '@/config/constant'
import type { AccountStatisticItem } from '@/types/account'
import { Card, Table, Typography, Space, Flex, Spin, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

const EmployeePerformanceDetails = () => {
    const {
        data: statistics,
        isLoading,
        isFetching,
    } = useGetAccountStatisticsQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    })

    const columns: ColumnsType<AccountStatisticItem> = [
        {
            title: 'Chuyên Viên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: text => <Text strong>{text}</Text>,
        },
        {
            title: 'Lead',
            key: 'lead_stats',
            render: (_, record) => (
                <Flex vertical className="text-xs">
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Mới</Text>
                        <Text strong>{record.stats.lead_stats.new}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Đang chăm</Text>
                        <Text strong>{record.stats.lead_stats.nurturing}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Hủy</Text>
                        <Text strong>{record.stats.lead_stats.cancelled}</Text>
                    </Flex>
                </Flex>
            ),
        },
        {
            title: 'Deal',
            key: 'deal_stats',
            render: (_, record) => (
                <Flex vertical className="text-xs">
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Mở</Text>
                        <Text strong>{record.stats.deal_stats.open}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Giao Dịch</Text>
                        <Text strong>{record.stats.deal_stats.traded}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Hủy</Text>
                        <Text strong>{record.stats.deal_stats.cancelled}</Text>
                    </Flex>
                </Flex>
            ),
        },
        {
            title: 'GD Thành Công',
            dataIndex: ['stats', 'successful_transactions'],
            key: 'successful_transactions',
            align: 'center',
            render: value => <Text>{value}</Text>,
        },
        {
            title: 'Hợp Đồng',
            key: 'contract_stats',
            render: (_, record) => (
                <Flex vertical className="text-xs">
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Mua</Text>
                        <Text strong>{record.stats.contract_stats.buy}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Thuê</Text>
                        <Text strong>{record.stats.contract_stats.rent}</Text>
                    </Flex>
                </Flex>
            ),
        },
        {
            title: '% Lead -> Deal',
            dataIndex: ['stats', 'conversion_rates', 'lead_to_deal'],
            key: 'lead_to_deal',
            align: 'center',
            render: value => <Text>{value}%</Text>,
        },
        {
            title: '% Lead -> GD',
            dataIndex: ['stats', 'conversion_rates', 'lead_to_gd'],
            key: 'lead_to_gd',
            align: 'center',
            render: value => <Text>{value}%</Text>,
        },
        {
            title: '% Deal -> GD',
            dataIndex: ['stats', 'conversion_rates', 'deal_to_gd'],
            key: 'deal_to_gd',
            align: 'center',
            render: value => <Text>{value}%</Text>,
        },
        {
            title: 'Doanh Thu (tỷ)',
            key: 'revenue_stats',
            render: (_, record) => (
                <Flex vertical className="text-xs">
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Tổng</Text>
                        <Text strong>{record.stats.revenue_stats.total.toLocaleString('vi-VN')}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Trung bình/GD</Text>
                        <Text strong>{record.stats.revenue_stats.avg_per_deal.toLocaleString('vi-VN')}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={8}>
                        <Text type="secondary">Phí</Text>
                        <Text strong>
                            {(record.stats.revenue_stats.commission / MILLION_PER_BILLION).toLocaleString('vi-VN')}
                        </Text>
                    </Flex>
                </Flex>
            ),
        },
    ]

    return (
        <Card>
            <Space direction="vertical" className="w-full" size="middle">
                <Title level={5} className="m-0">
                    Hiệu suất chi tiết theo Nhân viên
                </Title>

                {isLoading || isFetching ? (
                    <Flex align="center" justify="center" className="h-64">
                        <Spin size="large" />
                    </Flex>
                ) : !statistics?.data?.list?.length ? (
                    <Flex align="center" justify="center" className="h-64">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />
                    </Flex>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={statistics.data.list}
                        rowKey="account_id"
                        pagination={false}
                        size="small"
                        bordered
                        className="no-padding-table header-table-xs"
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </Space>
        </Card>
    )
}

export default EmployeePerformanceDetails
