import { useChangeOpportunityStageMutation } from '@/api/opportunity'
import type { EnumData } from '@/api/types'
import type { ApiResponse } from '@/types'
import { OpportunityStageColors, type OpportunityItem, type OpportunityStageType } from '@/types/opportunity'
import { Badge, Button, Card, Flex, message, Select, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCallback, useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router'
import { RiseOutlined } from '@ant-design/icons'
import type { HubOutletContext } from '@/pages/products/hub/ProductHub'
import { app } from '@/config/app'
import { padId } from '@/lib/utils'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import { OPPORTUNITY_TYPE } from '@/config/constant'

const { Text } = Typography

const pageSize = app.DEFAULT_PAGE_SIZE

const DealsHubProductTable = ({ enumData }: { enumData: ApiResponse<EnumData> | undefined }) => {
    const { hasPermission } = usePermission()
    const navigate = useNavigate()
    const { productData, dealsData, leadsAndDealsPagination, handleLeadsAndDealsPagination, refetchLeadsAndDeals } =
        useOutletContext<HubOutletContext>()

    const [changeStage] = useChangeOpportunityStageMutation()

    const handleStageChange = useCallback(
        (id: number, newStage: OpportunityStageType, currentName: string, currentAssignedTo?: number) => {
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
            title: 'ID KH',
            dataIndex: 'id',
            render: (id: number, record) => (
                <Button
                    size="small"
                    type="default"
                    className="!bg-gray-100 !border !border-gray-300"
                    onClick={() => navigate(`/deals/${record.id}/update`)}>
                    {record.code || padId(id)}
                </Button>
            ),
            fixed: 'left',
            width: '20%',
        },
        {
            title: 'Ngân Sách',
            key: 'budget',
            render: (_, record) => (
                <Typography.Text>{record.budget_max ? `${record.budget_max} tỷ` : app.EMPTY_DISPLAY}</Typography.Text>
            ),
            width: '20%',
        },
        {
            title: 'Phụ Trách',
            key: 'assigned_to',
            render: (_, record) => (
                <Typography.Link
                    className="font-medium"
                    onClick={() => navigate(`/accounts/${record.assigned_to_info?.id}/update`)}>
                    {record.assigned_to_info?.full_name || app.EMPTY_DISPLAY}
                </Typography.Link>
            ),
            width: '20%',
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'stage',
            key: 'stage',
            render: (stage: OpportunityStageType, record) => (
                <Select
                    value={stage}
                    className="w-full"
                    variant="borderless"
                    popupMatchSelectWidth={false}
                    optionLabelProp="tagLabel"
                    disabled={!hasPermission(RESOURCE_TYPE.DEAL, ACTION.UPDATE)}
                    onChange={val => handleStageChange(record.id, val, record.name, record.assigned_to)}
                    options={stageSelectOptions}
                />
            ),
            width: '20%',
        },
        {
            title: 'Cập Nhật',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: '20%',
            render: (updated_at, record) => updated_at || record.created_at,
        },
    ]

    const deals = dealsData?.data.items || []

    return (
        <Card>
            <Flex justify="space-between" align="center" className="!mb-4">
                <Space>
                    <RiseOutlined />
                    <Text strong>Deals Liên Quan ({deals.length})</Text>
                </Space>
                {hasPermission(RESOURCE_TYPE.DEAL, ACTION.CREATE) && (
                    <Button type="primary" onClick={() => navigate(`/deals/create?product_id=${productData?.id}`)}>
                        Thêm Deal
                    </Button>
                )}
            </Flex>
            <Table<OpportunityItem>
                rowKey="id"
                columns={dealsColumns}
                dataSource={deals}
                bordered
                size="small"
                pagination={{
                    current: leadsAndDealsPagination[OPPORTUNITY_TYPE.DEAL],
                    pageSize: pageSize,
                    total: dealsData?.data?.total ?? 0,
                    onChange: targetPage => {
                        handleLeadsAndDealsPagination(OPPORTUNITY_TYPE.DEAL, targetPage)
                    },
                }}
            />
        </Card>
    )
}

export default DealsHubProductTable
