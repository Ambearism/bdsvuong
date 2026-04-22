import React, { useCallback, useMemo, useState } from 'react'
import {
    Table,
    Card,
    Tag,
    Space,
    Typography,
    Button,
    message,
    Flex,
    Select,
    Row,
    Col,
    Statistic,
    Tooltip,
    Input,
    Breadcrumb,
    Badge,
} from 'antd'
import { EditOutlined, HistoryOutlined, PhoneOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'
import {
    useGetOpportunityListQuery,
    useGetOpportunityStatisticsQuery,
    useChangeOpportunityStageMutation,
    useUpdateOpportunityMutation,
} from '@/api/opportunity'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import { useGetAccountListQuery } from '@/api/account'
import HistoryModal from '@/components/modals/HistoryModal'
import type { ColumnsType } from 'antd/es/table'
import type { OpportunityItem } from '@/types/opportunity'
import type { OpportunityStageType, OpportunityPriorityType } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { GoHome } from 'react-icons/go'
import { app } from '@/config/app'
import {
    DEAL_STAGES,
    OpportunityStage,
    OpportunityStageColors,
    OpportunityPriority,
    OpportunityPriorityColors,
    OPPORTUNITY_PRIORITY_OPTIONS,
    LeadSourceLabels,
    NeedTypeLabels,
    NeedTypeTagColors,
    OPPORTUNITY_TYPE,
} from '@/config/constant'

import LostReasonModal from '@/components/modals/LostReasonModal'
import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'

const CONVERTIBLE_STAGES = [OpportunityStage.DAT_COC, OpportunityStage.GD_HOAN_TAT] as OpportunityStageType[]

const pageSize = app.DEFAULT_PAGE_SIZE

const DealList: React.FC = () => {
    const navigate = useNavigate()
    useDocumentTitle('Danh sách Deal')
    const { hasPermission } = usePermission()
    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)
    const [stageFilter, setStageFilter] = useState<OpportunityStageType | undefined>(undefined)
    const [province, setProvince] = useState<number | undefined>(undefined)
    const [ward, setWard] = useState<number | undefined>(undefined)
    const [productType, setProductType] = useState<number | undefined>(undefined)
    const [assignedTo, setAssignedTo] = useState<number | undefined>(undefined)
    const [leadSource, setLeadSource] = useState<number[]>([])
    const [search, setSearch] = useState<string | undefined>(undefined)

    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [selectedHistoryId, setSelectedHistoryId] = useState<number | undefined>(undefined)

    const { data: provinceData, isLoading: loadingProvince } = useGetProvinceListQuery({ is_option: true })
    const { data: wardData, isLoading: loadingWard } = useGetWardsByProvinceIdQuery(
        { province_id: province!, is_option: true },
        { skip: !province },
    )
    const { data: accountData, isLoading: loadingAccounts } = useGetAccountListQuery({
        per_page: app.FETCH_ALL,
        is_option: true,
    })

    const { data: enumData } = useGetEnumOptionsQuery(['lead_source', 'opportunity_stage', 'product_types'])

    const { data: statsData, refetch: refetchStats } = useGetOpportunityStatisticsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })
    const stats = statsData?.data

    const {
        data: dealsData,
        isLoading,
        refetch,
    } = useGetOpportunityListQuery(
        {
            page,
            per_page: pageSize,
            stage: stageFilter,
            zone_province_id: province,
            zone_ward_id: ward,
            product_type_id: productType,
            assigned_to: assignedTo,
            lead_source_ids: leadSource.length ? leadSource : undefined,
            keyword: search,
            type: OPPORTUNITY_TYPE.DEAL,
        },
        { refetchOnMountOrArgChange: true },
    )

    const items = (dealsData?.data?.items ?? []) as OpportunityItem[]

    const [changeStage] = useChangeOpportunityStageMutation()
    const [updateOpportunity] = useUpdateOpportunityMutation()

    const [lostModalOpen, setLostModalOpen] = useState(false)
    const [pendingLostRecord, setPendingLostRecord] = useState<OpportunityItem | null>(null)

    const handleResetFilter = () => {
        setStageFilter(undefined)
        setProvince(undefined)
        setWard(undefined)
        setProductType(undefined)
        setAssignedTo(undefined)
        setLeadSource([])
        setSearch(undefined)
        setPage(app.DEFAULT_PAGE)
    }

    const stageOptions = useMemo(() => {
        const stages = enumData?.data?.opportunity_stage || []
        return [...stages.filter(stage => DEAL_STAGES.includes(Number(stage.value) as OpportunityStageType))]
    }, [enumData])

    const provinceOptions = useMemo(
        () =>
            provinceData?.data.items.map(item => ({
                value: item.id,
                label: item.name,
            })),
        [provinceData],
    )

    const wardOptions = useMemo(
        () =>
            wardData?.data.items.map(item => ({
                value: item.id,
                label: item.name,
            })),
        [wardData],
    )

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
                    refetch()
                    refetchStats()
                })
                .catch(() => {
                    message.error('Cập nhật trạng thái thất bại')
                })
        },
        [changeStage, refetch, refetchStats],
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

    const handlePriorityChange = useCallback(
        (id: number, newPriority: OpportunityPriorityType, record: OpportunityItem) => {
            if (newPriority === OpportunityPriority.LOST) {
                setPendingLostRecord(record)
                setLostModalOpen(true)
                return
            }
            updateOpportunity({
                opportunity_id: id,
                payload: {
                    name: record.name,
                    stage: record.stage,
                    priority: newPriority,
                },
            })
                .unwrap()
                .then(() => {
                    message.success('Cập nhật mức độ ưu tiên thành công')
                    refetch()
                })
                .catch(() => {
                    message.error('Cập nhật mức độ ưu tiên thất bại')
                })
        },
        [updateOpportunity, refetch],
    )

    const handleLostConfirm = useCallback(
        (reason: string) => {
            if (!pendingLostRecord) return
            updateOpportunity({
                opportunity_id: pendingLostRecord.id,
                payload: {
                    name: pendingLostRecord.name,
                    stage: pendingLostRecord.stage,
                    priority: OpportunityPriority.LOST,
                    lost_reason: reason,
                },
            })
                .unwrap()
                .then(() => {
                    message.success('Cập nhật mức độ ưu tiên thành công')
                    setLostModalOpen(false)
                    setPendingLostRecord(null)
                    refetch()
                })
                .catch(() => {
                    message.error('Cập nhật mức độ ưu tiên thất bại')
                })
        },
        [pendingLostRecord, updateOpportunity, refetch],
    )

    const handleLostCancel = useCallback(() => {
        setLostModalOpen(false)
        setPendingLostRecord(null)
    }, [])

    const prioritySelectOptions = useMemo(
        () =>
            OPPORTUNITY_PRIORITY_OPTIONS.map(item => {
                const priority = Number(item.value) as OpportunityPriorityType
                const color = OpportunityPriorityColors[priority] || 'default'
                return {
                    value: priority,
                    label: <Badge color={color} text={item.label} />,
                    tagLabel: <Tag color={color}>{item.label}</Tag>,
                }
            }),
        [],
    )

    const columns: ColumnsType<OpportunityItem> = useMemo(
        () => [
            {
                title: 'ID Deal',
                dataIndex: 'id',
                render: (id: number, record) => (
                    <Button
                        size="small"
                        type="default"
                        className="!bg-gray-100 !border !border-gray-300"
                        onClick={() => navigate(`/deals/${record.id}/hub`)}>
                        {record.code || id}
                    </Button>
                ),
                fixed: 'left',
                width: 90,
            },
            {
                title: 'Tên KH',
                key: 'name',
                width: 250,
                render: (_, record) => (
                    <Typography.Link
                        className="font-medium line-clamp-2 !leading-snug"
                        onClick={() => navigate(`/deals/${record.id}/hub`)}
                        title={record.name}>
                        {record.name || app.EMPTY_DISPLAY}
                    </Typography.Link>
                ),
            },
            {
                title: 'Số ĐT',
                key: 'phone',
                width: 120,
                render: (_, record) => (
                    <Space size={4}>
                        <PhoneOutlined className="text-red-500!" />
                        <Typography.Text type="secondary">{record.phone || app.EMPTY_DISPLAY}</Typography.Text>
                    </Space>
                ),
            },
            {
                title: 'Nhu Cầu',
                dataIndex: 'need',
                width: 115,
                render: (need: string) =>
                    need ? (
                        <Tag color={NeedTypeTagColors[need as keyof typeof NeedTypeTagColors] || app.TAG_COLOR_DEFAULT}>
                            {NeedTypeLabels[need as keyof typeof NeedTypeLabels] || need}
                        </Tag>
                    ) : (
                        app.EMPTY_DISPLAY
                    ),
            },
            {
                title: 'Loại hình',
                dataIndex: 'product_type_id',
                key: 'product_type_id',
                width: 150,
                render: (typeId: number, record) => {
                    const typeLabel = enumData?.data?.product_types?.find(type => type.value == typeId)?.label
                    return <Tag color="blue">{typeLabel || record.product_rel?.name || app.EMPTY_DISPLAY}</Tag>
                },
            },
            {
                title: 'Khu Vực',
                key: 'zone',
                width: 180,
                render: (_, record) => (
                    <Typography.Text type="secondary">
                        {record.zone_province_name}
                        {record.zone_ward_name ? ` - ${record.zone_ward_name}` : ''}
                    </Typography.Text>
                ),
            },
            {
                title: 'Ngân Sách',
                key: 'budget',
                width: 100,
                render: (_, record) => (
                    <Typography.Text>
                        {record.budget_max ? `${record.budget_max} tỷ` : app.EMPTY_DISPLAY}
                    </Typography.Text>
                ),
            },
            {
                title: 'Nguồn',
                dataIndex: 'lead_source',
                width: 120,
                render: (source: number) => (
                    <Typography.Text type="secondary">
                        {enumData?.data?.lead_source?.find(item => item.value == source)?.label ||
                            LeadSourceLabels[source as keyof typeof LeadSourceLabels] ||
                            app.EMPTY_DISPLAY}
                    </Typography.Text>
                ),
            },
            {
                title: 'Phụ Trách',
                key: 'assigned_to',
                width: 150,
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
                width: 150,
                render: (stage: OpportunityStageType, record) => (
                    <Select
                        value={stage}
                        className="w-full"
                        variant="borderless"
                        popupMatchSelectWidth={false}
                        optionLabelProp="tagLabel"
                        onChange={val => handleStageChange(record.id, val, record.name, record.assigned_to)}
                        options={stageSelectOptions}
                        disabled={!hasPermission(RESOURCE_TYPE.DEAL, ACTION.UPDATE)}
                    />
                ),
            },
            {
                title: 'Mức độ ưu tiên',
                dataIndex: 'priority',
                width: 150,
                render: (priority: OpportunityPriorityType, record) => (
                    <Select
                        value={priority}
                        className="w-full"
                        variant="borderless"
                        popupMatchSelectWidth={false}
                        optionLabelProp="tagLabel"
                        onChange={val => handlePriorityChange(record.id, val, record)}
                        options={prioritySelectOptions}
                        disabled={!hasPermission(RESOURCE_TYPE.DEAL, ACTION.UPDATE)}
                    />
                ),
            },
            {
                title: 'Thao tác',
                key: 'actions',
                align: 'center',
                fixed: 'right',
                width: 140,
                render: (_, record) => {
                    const isCanConvert = CONVERTIBLE_STAGES.includes(record.stage)

                    return (
                        <Space>
                            {hasPermission(RESOURCE_TYPE.DEAL, ACTION.UPDATE) && (
                                <Tooltip title="Chỉnh sửa">
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => navigate(`/deals/${record.id}/update`)}
                                        size="small"
                                        color="cyan"
                                        variant="outlined"
                                    />
                                </Tooltip>
                            )}
                            <Tooltip title="Lịch Sử">
                                <Button
                                    icon={<HistoryOutlined />}
                                    onClick={() => {
                                        setSelectedHistoryId(record.id)
                                        setHistoryModalOpen(true)
                                    }}
                                    size="small"
                                />
                            </Tooltip>
                            {isCanConvert && hasPermission(RESOURCE_TYPE.DEAL, ACTION.UPDATE) && (
                                <Tooltip title="Chuyển Giao Dịch">
                                    <Button
                                        type="primary"
                                        icon={<SwapOutlined />}
                                        onClick={() => navigate(`/deals/${record.id}/convert-to-transaction`)}
                                        size="small"
                                        className="!bg-green-600"
                                    />
                                </Tooltip>
                            )}
                        </Space>
                    )
                },
            },
        ],
        [
            enumData,
            navigate,
            stageSelectOptions,
            handleStageChange,
            handlePriorityChange,
            prioritySelectOptions,
            hasPermission,
        ],
    )

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle" wrap="wrap">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Danh sách Deals',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    {hasPermission(RESOURCE_TYPE.DEAL, ACTION.CREATE) && (
                        <Button type="primary" onClick={() => navigate('/deals/create')}>
                            <PlusOutlined /> Tạo Deals
                        </Button>
                    )}
                </Flex>
            </Card>

            <Row gutter={16}>
                <Col xs={12} sm={6}>
                    <Card size="small" className="shadow-sm">
                        <Statistic title="Tổng Deals" value={stats?.total_deals ?? 0} />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="shadow-sm">
                        <Statistic title="Deals Mới Tuần Này" value={stats?.new_deals_week ?? 0} />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="shadow-sm">
                        <Statistic title="Deals → Hoàn Tất" value={stats?.won_deals ?? 0} />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="shadow-sm">
                        <Statistic
                            title="Tỷ Lệ Hoàn Tất"
                            value={stats?.deal_to_won_rate || 0}
                            suffix="%"
                            precision={1}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Flex gap="small" align="start" className="!mb-4" wrap="wrap">
                    <div className="flex-1">
                        <Flex wrap gap="middle" align="center" justify="start" className="!mb-0">
                            <Tooltip title="Tìm kiếm theo mã, tên, sđt">
                                <Input
                                    className="!w-50"
                                    placeholder="Tìm kiếm..."
                                    allowClear
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value)
                                        setPage(app.DEFAULT_PAGE)
                                    }}
                                />
                            </Tooltip>

                            <Tooltip title="Lọc theo nguồn">
                                <Select
                                    className="!w-40"
                                    placeholder="Nguồn Deals"
                                    mode="multiple"
                                    allowClear
                                    maxTagCount="responsive"
                                    value={leadSource}
                                    onChange={setLeadSource}
                                    options={enumData?.data?.lead_source}
                                />
                            </Tooltip>

                            <Tooltip title="Lọc theo trạng thái">
                                <Select
                                    className="!w-40"
                                    value={stageFilter}
                                    options={stageOptions}
                                    onChange={setStageFilter}
                                    placeholder="Trạng Thái Deal"
                                    allowClear
                                />
                            </Tooltip>

                            <Tooltip title="Lọc theo sale phụ trách">
                                <Select
                                    className="!w-40"
                                    placeholder="Sale Phụ Trách"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    loading={loadingAccounts}
                                    value={assignedTo}
                                    onChange={setAssignedTo}
                                    options={accountData?.data?.list?.map(account => ({
                                        value: account.id,
                                        label: account.full_name,
                                    }))}
                                />
                            </Tooltip>

                            <Tooltip title="Lọc theo loại hình">
                                <Select
                                    className="!w-40"
                                    placeholder="Loại Hình BĐS"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    value={productType}
                                    onChange={setProductType}
                                    loading={!enumData}
                                    options={enumData?.data?.product_types}
                                />
                            </Tooltip>

                            <Tooltip title="Lọc theo tỉnh/thành">
                                <Select
                                    className="!w-40"
                                    placeholder="Tỉnh / Thành"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    loading={loadingProvince}
                                    value={province}
                                    onChange={setProvince}
                                    options={provinceOptions}
                                />
                            </Tooltip>

                            <Tooltip title="Lọc theo phường/xã">
                                <Select
                                    className="!w-40"
                                    placeholder="Phường / Xã"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    loading={loadingWard}
                                    value={ward}
                                    onChange={setWard}
                                    disabled={!province}
                                    options={wardOptions}
                                />
                            </Tooltip>
                            <Button type="primary" onClick={handleResetFilter} className="shrink-0">
                                Reset
                            </Button>
                        </Flex>
                    </div>
                </Flex>

                <Table<OpportunityItem>
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={items}
                    scroll={{ x: 1500 }}
                    bordered
                    size="small"
                    pagination={{
                        current: page,
                        pageSize,
                        total: dealsData?.data?.total ?? 0,
                        showTotal: () => `Tổng số ${dealsData?.data?.total ?? 0} bản ghi`,
                        showSizeChanger: false,
                        onChange: setPage,
                    }}
                />
            </Card>

            {selectedHistoryId && (
                <HistoryModal
                    open={historyModalOpen}
                    onCancel={() => {
                        setHistoryModalOpen(false)
                        setSelectedHistoryId(undefined)
                    }}
                    opportunityId={selectedHistoryId}
                />
            )}

            <LostReasonModal open={lostModalOpen} onConfirm={handleLostConfirm} onCancel={handleLostCancel} />
        </Space>
    )
}

export default DealList
