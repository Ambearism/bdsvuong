import React, { useMemo, useCallback } from 'react'
import { Timeline, Typography, Tag, Space, Collapse, Flex } from 'antd'
import {
    ActivityType,
    OPPORTUNITY_FIELD_LABELS,
    TRANSACTION_FIELD_LABELS,
    CUSTOMER_FIELD_LABELS,
    CUSTOMER_HUB_TIMELINE_ENTITY_TYPE,
    CUSTOMER_HUB_TIMELINE_LEAD_STAGE_SET,
    OpportunityStageColors,
    OpportunityStageLabels,
    TransactionStageColors,
    TransactionStageLabels,
    type OpportunityStageType,
    type TransactionStageType,
    NEED_TYPE_OPTIONS,
    EXPECTED_DATE_OPTIONS,
    LEAD_SOURCE_OPTIONS,
    REGEX_HISTORY_LOG,
    REGEX_DATE_YMD,
    OPPORTUNITY_PRIORITY_OPTIONS,
} from '@/config/constant'
import { app } from '@/config/app'
import type { StageHistoryItem, ParsedChange, LookupMap } from '@/types/opportunity'
import dayjs from 'dayjs'
import { CaretRightOutlined } from '@ant-design/icons'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery, useGetZoneDetailQuery } from '@/api/zone'
import { useGetAccountListQuery } from '@/api/account'
import { useGetProjectDetailQuery } from '@/api/project'
import { useGetProductDetailQuery } from '@/api/product'

const { Text } = Typography

function safeJsonParse<T>(value: unknown, fallback: T): T {
    if (typeof value === 'object' && value !== null) {
        return value as T
    }
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as T
        } catch {
            return fallback
        }
    }
    return fallback
}

const ProjectName = React.memo(({ id }: { id: number | string }) => {
    const { data } = useGetProjectDetailQuery({ project_id: Number(id) }, { skip: !id })
    return <>{data?.data?.name || id}</>
})

const ProductName = React.memo(({ id }: { id: number | string }) => {
    const { data } = useGetProductDetailQuery({ product_id: Number(id) }, { skip: !id })
    return <>{data?.data?.name || data?.data?.product_code || id}</>
})

const ZoneName = React.memo(({ id }: { id: number | string }) => {
    const { data } = useGetZoneDetailQuery({ zone_id: Number(id) }, { skip: !id })
    return <>{data?.data?.name || id}</>
})

interface HistoryTimelineProps {
    items: StageHistoryItem[]
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ items }) => {
    const { data: enumData } = useGetEnumOptionsQuery(['opportunity_stage', 'product_types', 'lead_source'])
    const { data: provinceData } = useGetProvinceListQuery()
    const { data: accountData } = useGetAccountListQuery({ per_page: app.FETCH_ALL, is_option: true })

    const provinceMap = useMemo<LookupMap>(() => {
        if (!provinceData?.data?.items) return {}
        return provinceData.data.items.reduce((lookup, item) => {
            lookup[item.id] = item.name
            return lookup
        }, {} as LookupMap)
    }, [provinceData])

    const accountMap = useMemo<LookupMap>(() => {
        if (!accountData?.data?.list) return {}
        return accountData.data.list.reduce((lookup, item) => {
            lookup[item.id] = item.full_name || ''
            return lookup
        }, {} as LookupMap)
    }, [accountData])

    const enumMaps = useMemo(() => {
        const leadSource = (enumData?.data?.lead_source || []).reduce((lookup, item) => {
            lookup[item.value] = item.label
            return lookup
        }, {} as LookupMap)

        const productTypes = (enumData?.data?.product_types || []).reduce((lookup, item) => {
            lookup[item.value] = item.label
            return lookup
        }, {} as LookupMap)

        const stages = (enumData?.data?.opportunity_stage || []).reduce((lookup, item) => {
            lookup[item.value] = item.label
            return lookup
        }, {} as LookupMap)

        return { leadSource, productTypes, stages }
    }, [enumData])

    const constantMaps = useMemo(() => {
        const needType = NEED_TYPE_OPTIONS.reduce((lookup, item) => {
            lookup[item.value] = item.label
            return lookup
        }, {} as LookupMap)

        const expectedDate = EXPECTED_DATE_OPTIONS.reduce((lookup, item) => {
            lookup[item.value] = item.label
            return lookup
        }, {} as LookupMap)

        const leadSourceConstant = LEAD_SOURCE_OPTIONS.reduce((lookup, item) => {
            lookup[item.value] = item.label
            return lookup
        }, {} as LookupMap)

        const priorityType = OPPORTUNITY_PRIORITY_OPTIONS.reduce((lookup, item) => {
            lookup[item.value] = item.label
            return lookup
        }, {} as LookupMap)

        return { needType, expectedDate, leadSourceConstant, priorityType }
    }, [])

    const parseChanges = useCallback((notes: string): ParsedChange[] => {
        const match = notes.match(REGEX_HISTORY_LOG)
        if (match) {
            const oldObject = safeJsonParse<Record<string, unknown>>(match[1], {})
            const newObject = safeJsonParse<Record<string, unknown>>(match[2], {})

            const changes: ParsedChange[] = []
            const allKeys = new Set([...Object.keys(oldObject), ...Object.keys(newObject)])

            allKeys.forEach(key => {
                const oldValue = oldObject[key]
                const newValue = newObject[key]
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    changes.push({ field: key, oldValue, newValue })
                }
            })
            return changes
        }
        return []
    }, [])

    const formatValue = useCallback(
        (field: string, value: unknown): React.ReactNode => {
            if (value === null || value === undefined || value === '') return <Text type="secondary">Trống</Text>

            switch (field) {
                case 'gender':
                    return value ? 'Nam' : 'Nữ'

                case 'need':
                    return constantMaps.needType[String(value)] || String(value)

                case 'lead_source':
                    return (
                        constantMaps.leadSourceConstant[String(value)] ||
                        enumMaps.leadSource[String(value)] ||
                        String(value)
                    )
                case 'birthday': {
                    const raw = String(value)
                    const dateMatch = raw.match(REGEX_DATE_YMD)
                    if (dateMatch) {
                        return `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`
                    }
                    return raw
                }
                case 'product_type_id':
                    return enumMaps.productTypes[String(value)] || String(value)

                case 'expected_date':
                    return constantMaps.expectedDate[String(value)] || String(value)

                case 'zone_province_id':
                    return provinceMap[String(value)] || String(value)

                case 'zone_ward_id':
                    return <ZoneName id={value as string | number} />

                case 'priority':
                    return constantMaps.priorityType[String(value)] || String(value)

                case 'assigned_to':
                    return accountMap[String(value)] || String(value)

                case 'project_id':
                    return <ProjectName id={value as string | number} />

                case 'product_id':
                    return <ProductName id={value as string | number} />

                case 'budget_min':
                case 'budget_max':
                    return `${value} tỷ`

                case 'min_acreage':
                case 'max_acreage':
                    return `${value} m²`

                default:
                    return field.endsWith('_id') ? `#${value}` : String(value)
            }
        },
        [constantMaps, enumMaps, provinceMap, accountMap],
    )

    const getLabelMap = useCallback((entityType?: string): Record<string, string> => {
        switch (entityType) {
            case CUSTOMER_HUB_TIMELINE_ENTITY_TYPE.OPPORTUNITY:
                return OPPORTUNITY_FIELD_LABELS
            case CUSTOMER_HUB_TIMELINE_ENTITY_TYPE.TRANSACTION:
                return TRANSACTION_FIELD_LABELS
            case CUSTOMER_HUB_TIMELINE_ENTITY_TYPE.CUSTOMER:
                return CUSTOMER_FIELD_LABELS
            default:
                return OPPORTUNITY_FIELD_LABELS
        }
    }, [])

    const getEntityLabel = useCallback((item: StageHistoryItem): string => {
        switch (item.entity_type) {
            case CUSTOMER_HUB_TIMELINE_ENTITY_TYPE.OPPORTUNITY:
                return item.to_stage && CUSTOMER_HUB_TIMELINE_LEAD_STAGE_SET.has(item.to_stage) ? 'Lead' : 'Deal'
            case CUSTOMER_HUB_TIMELINE_ENTITY_TYPE.TRANSACTION:
                return 'Giao dịch'
            default:
                return ''
        }
    }, [])

    const renderChangeItem = useCallback(
        (change: ParsedChange, entityType?: string) => {
            const labelMap = getLabelMap(entityType)
            const label = labelMap[change.field] || change.field

            return (
                <div key={change.field} className="mb-1">
                    <Text strong>{label}: </Text>
                    <Text delete type="secondary" className="mr-2">
                        {formatValue(change.field, change.oldValue)}
                    </Text>
                    <CaretRightOutlined className="mr-2 text-gray-400" />
                    <Text type="success">{formatValue(change.field, change.newValue)}</Text>
                </div>
            )
        },
        [formatValue, getLabelMap],
    )

    const renderContent = useCallback(
        (item: StageHistoryItem) => {
            if (item.action_type === ActivityType.STAGE_CHANGE) {
                const isTransaction = item.entity_type === CUSTOMER_HUB_TIMELINE_ENTITY_TYPE.TRANSACTION

                const fromStageLabel =
                    (isTransaction
                        ? TransactionStageLabels[item.from_stage as TransactionStageType]
                        : OpportunityStageLabels[item.from_stage as OpportunityStageType]) ||
                    enumMaps.stages[item.from_stage as number] ||
                    item.from_stage

                const toStageLabel =
                    (isTransaction
                        ? TransactionStageLabels[item.to_stage as TransactionStageType]
                        : OpportunityStageLabels[item.to_stage as OpportunityStageType]) ||
                    enumMaps.stages[item.to_stage as number] ||
                    item.to_stage

                const color = isTransaction
                    ? TransactionStageColors[item.to_stage as TransactionStageType]
                    : OpportunityStageColors[item.to_stage as OpportunityStageType] || 'blue'

                return (
                    <Space>
                        <Tag>{fromStageLabel || 'Khởi tạo'}</Tag>
                        <CaretRightOutlined />
                        <Tag color={color}>{toStageLabel}</Tag>
                    </Space>
                )
            }

            let changes: ParsedChange[] = []

            if (item.old || item.new) {
                const oldObject = safeJsonParse<Record<string, unknown>>(item.old, {})
                const newObject = safeJsonParse<Record<string, unknown>>(item.new, {})

                const allKeys = new Set([...Object.keys(oldObject), ...Object.keys(newObject)])

                allKeys.forEach(key => {
                    const oldValue = oldObject[key]
                    const newValue = newObject[key]
                    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                        changes.push({ field: key, oldValue, newValue })
                    }
                })
            } else if (item.notes) {
                changes = parseChanges(item.notes)
            }

            if (changes.length) {
                if (changes.length <= 3) {
                    return (
                        <div className="mt-1">{changes.map(change => renderChangeItem(change, item.entity_type))}</div>
                    )
                }

                return (
                    <Collapse
                        ghost
                        size="small"
                        items={[
                            {
                                key: 'details',
                                label: <Text type="secondary">Chi tiết thay đổi ({changes.length})</Text>,
                                children: changes.map(change => renderChangeItem(change, item.entity_type)),
                            },
                        ]}
                    />
                )
            }

            if (item.notes === 'Cập nhật') {
                return <Text type="secondary">Không có chi tiết thay đổi</Text>
            }
            return <Text>{item.notes || 'Cập nhật'}</Text>
        },
        [enumMaps, parseChanges, renderChangeItem],
    )

    const timelineItems = useMemo(() => {
        return items.map(item => ({
            color: item.action_type === ActivityType.STAGE_CHANGE ? 'green' : 'blue',
            children: (
                <div className="pb-2">
                    <Flex justify="space-between" align="start">
                        <div className="flex-1">
                            <div className="mb-0.5 font-semibold text-gray-700">
                                {item.action_type === ActivityType.STAGE_CHANGE ? (
                                    <>{getEntityLabel(item)} - Thay đổi trạng thái</>
                                ) : (
                                    item.title || 'Cập nhật thông tin'
                                )}
                            </div>
                            {renderContent(item)}
                            {item.action_type === ActivityType.STAGE_CHANGE && item.notes && (
                                <div className="text-gray-500 text-xs mt-0.5">{item.notes}</div>
                            )}
                        </div>
                        <div className="text-right ml-4">
                            <div className="text-gray-500 text-xs">{dayjs(item.changed_at).format('HH:mm:ss')}</div>
                            <div className="text-gray-400 text-xs">{dayjs(item.changed_at).format('DD/MM/YYYY')}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{item.changed_by_name || 'Hệ thống'}</div>
                        </div>
                    </Flex>
                </div>
            ),
        }))
    }, [items, renderContent, getEntityLabel])

    return <Timeline className="mt-4" items={timelineItems} />
}

export default React.memo(HistoryTimeline)
