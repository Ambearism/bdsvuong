import { useChangeOpportunityStageMutation } from '@/api/opportunity'
import type { EnumData } from '@/api/types'
import type { ApiResponse } from '@/types'
import {
    LeadSourceLabels,
    OpportunityStageColors,
    type OpportunityItem,
    type OpportunityStageType,
} from '@/types/opportunity'
import { Badge, Button, Card, Flex, message, Select, Space, Table, Tag, Typography, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCallback, useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router'
import { UserOutlined, PlusOutlined } from '@ant-design/icons'
import type { CustomerHubOutletContext } from '@/pages/customers/hub/CustomerHub'
import { app } from '@/config/app'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import { OPPORTUNITY_TYPE } from '@/config/constant'

const pageSize = app.DEFAULT_PAGE_SIZE

const DealsHubCustomerTable = ({ enumData }: { enumData: ApiResponse<EnumData> | undefined }) => {
    const { hasPermission } = usePermission()
    const navigate = useNavigate()
    const { customerData, dealsData, leadsAndDealsPagination, handleLeadsAndDealsPagination, refetchLeadsAndDeals } =
        useOutletContext<CustomerHubOutletContext>()

    const [changeStage] = useChangeOpportunityStageMutation()

    const handleStageChange = useCallback(
        (id: number, newStage: OpportunityStageType, currentName: string, currentAssignedTo: number | undefined) => {
            changeStage({
                opportunity_id: id,
                payload: {
                    stage: newStage,
                    name: currentName,
                    assigned_to: currentAssignedTo,
                },
            })
                .unwrap()
                .then(() => {
                    message.success('Cập nhật trạng thái thành công')
                    refetchLeadsAndDeals()
                })
                .catch(() => {
                    message.error('Cập nhật trạng thái thất bại')
                })
        },
        [changeStage, refetchLeadsAndDeals],
    )

    const stageSelectOptions = useMemo(
        () =>
            enumData?.data?.opportunity_stage?.map(item => {
                const color = OpportunityStageColors[Number(item.value) as OpportunityStageType]
                return {
                    value: Number(item.value),
                    label: <Badge color={color} text={item.label} />,
                    tagLabel: <Tag color={color}>{item.label}</Tag>,
                }
            }),
        [enumData],
    )

    const dealsColumns: ColumnsType<OpportunityItem> = [
        {
            title: 'Tên Deal',
            key: 'name',
            width: 250,
            render: (_, record) => (
                <Typography.Link className="font-medium" onClick={() => navigate(`/deals/${record.id}/update`)}>
                    {record.name}
                </Typography.Link>
            ),
        },
        {
            title: 'Nguồn',
            dataIndex: 'lead_source',
            width: 150,
            render: (source: number) =>
                source ? (
                    <Typography.Text type="secondary">
                        {enumData?.data?.lead_source?.find(item => item.value == source)?.label ||
                            LeadSourceLabels[source as keyof typeof LeadSourceLabels] ||
                            app.EMPTY_DISPLAY}
                    </Typography.Text>
                ) : (
                    app.EMPTY_DISPLAY
                ),
        },
        {
            title: 'Phụ Trách',
            key: 'assigned_to',
            width: 180,
            render: (_, record) => (
                <Typography.Link
                    className="font-medium"
                    onClick={() => navigate(`/accounts/${record.assigned_to_info?.id}/update`)}>
                    {record.assigned_to_info?.full_name || app.EMPTY_DISPLAY}
                </Typography.Link>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'stage',
            key: 'stage',
            width: 180,
            render: (stage: OpportunityStageType, record) => {
                const canUpdate = hasPermission(RESOURCE_TYPE.DEAL, ACTION.UPDATE)
                return (
                    <Select
                        value={stage}
                        className="w-full"
                        variant="borderless"
                        popupMatchSelectWidth={false}
                        optionLabelProp="tagLabel"
                        disabled={!canUpdate}
                        onChange={val => handleStageChange(record.id, val, record.name, record.assigned_to)}
                        options={stageSelectOptions}
                    />
                )
            },
        },
        {
            title: 'Cập Nhật',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 180,
            render: (updated_at, record) => updated_at || record.created_at,
        },
    ]

    const deals = dealsData?.data.items || []

    return (
        <Card
            title={
                <Flex justify="space-between" align="center">
                    <Space align="center" size={4}>
                        <UserOutlined />
                        <span>Deals Liên Quan ({deals.length})</span>
                    </Space>
                    {hasPermission(RESOURCE_TYPE.DEAL, ACTION.CREATE) && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`/deals/create?customer_id=${customerData?.id}`)}>
                            Thêm Deal
                        </Button>
                    )}
                </Flex>
            }
            className="w-full">
            <Table<OpportunityItem>
                rowKey="id"
                columns={dealsColumns}
                dataSource={deals}
                scroll={{ x: 'max-content' }}
                pagination={{
                    current: leadsAndDealsPagination[OPPORTUNITY_TYPE.DEAL],
                    pageSize: pageSize,
                    total: dealsData?.data?.total ?? 0,
                    onChange: targetPage => {
                        handleLeadsAndDealsPagination(OPPORTUNITY_TYPE.DEAL, targetPage)
                    },
                }}
                locale={{ emptyText: <Empty description="Chưa có Deals liên kết" /> }}
            />
        </Card>
    )
}

export default DealsHubCustomerTable
