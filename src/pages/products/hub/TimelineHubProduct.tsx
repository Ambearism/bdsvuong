import { Card, Space, Row, Col, Timeline, type TimelineItemProps, Typography, Flex, List, Empty, Tag } from 'antd'
import { InfoCircleOutlined, PlusCircleOutlined, UserOutlined } from '@ant-design/icons'
import { useGetTimelineQuery } from '@/api/product'
import { useParams } from 'react-router'
import {
    PRODUCT_FIELD_LABELS,
    PRODUCT_UPDATE_LOGS,
    PRODUCT_UPDATE_LOGS_HAS_CHANGES,
    PRODUCT_UPDATE_LOGS_LABEL_MAPPED,
} from '@/config/constant'
import { useGetEnumOptionsQuery, type ApiEnumType, type EnumData } from '@/api/types'
import type { ProductBase } from '@/types/product'
import { renderTemplate } from '@/lib/utils'

const { Text } = Typography

const EXCLUDES_GET_DETAIL_FIELDS: (keyof ProductBase)[] = [
    'note',
    'note_publish_system',
    'price_note',
    'description',
    'seo_description',
]
const NEED_MAP_ENUM_VALUE: Partial<Record<keyof ProductBase, ApiEnumType>> = {
    status_product_id: 'product_status',
    type_product_id: 'product_types',
    supplier_type_id: 'supplier_types',
    direction_house_id: 'direction_types',
    direction_balcony_id: 'direction_types',
    fit_ids: 'fit_types',
    furniture_ids: 'furniture_types',
    convenient_ids: 'convenient_types',
    type_transaction_id: 'transaction_types',
    status_transaction_sell_id: 'sell_status',
    status_transaction_rent_id: 'rent_status',
} as const

const mappedValueWithEnumLabel = (valueObject: Record<string, string>, key: keyof ProductBase, enumData: EnumData) => {
    return String(valueObject[key])
        .split('#')
        .filter(Boolean)
        .map(value => {
            const keyEnum = NEED_MAP_ENUM_VALUE[key]
            if (!keyEnum) return ''
            const matchEnum = enumData[keyEnum].find(item => String(item.value) === String(value))

            return matchEnum?.label
        })
        .join(', ')
}

const getDetailChanges = ({
    oldValue,
    newValue,
    enumData,
}: {
    oldValue: Record<string, string>
    newValue: Record<string, string>
    enumData: EnumData | undefined
}) => {
    return Object.keys(newValue)
        .map(key => {
            const _key = key as keyof ProductBase
            const fieldLabel = PRODUCT_FIELD_LABELS[_key]

            if (!fieldLabel) return null

            if (EXCLUDES_GET_DETAIL_FIELDS.includes(_key)) {
                return `Cập nhật ${fieldLabel}`
            }

            const valueNeedToMapped = !!NEED_MAP_ENUM_VALUE[_key]

            if (!newValue[_key]) {
                return null
            }

            if (!oldValue[_key]) {
                return `Thêm mới ${fieldLabel}`
            }

            if (valueNeedToMapped && enumData) {
                const mappedOldValue = mappedValueWithEnumLabel(oldValue, _key, enumData)
                const mappedNewValue = mappedValueWithEnumLabel(newValue, _key, enumData)

                if (!mappedOldValue) {
                    return `Thêm mới ${fieldLabel}: ${mappedNewValue}`
                }

                return `${fieldLabel}: ${mappedOldValue} → ${mappedNewValue}`
            }

            return `${fieldLabel}: ${oldValue[_key]} → ${newValue[_key]}`
        })
        .filter(Boolean)
}

const TimelineHubProduct = () => {
    const { product_id } = useParams<{ product_id: string }>()
    const productId = Number(product_id)

    const { data: timelineData } = useGetTimelineQuery({ product_id: productId })
    const { data: enumData } = useGetEnumOptionsQuery([
        'product_status',
        'product_types',
        'supplier_types',
        'direction_types',
        'fit_types',
        'furniture_types',
        'convenient_types',
        'transaction_types',
        'sell_status',
        'rent_status',
    ])

    const timelineItems = (timelineData?.data.items || []).map<TimelineItemProps>((item, index) => {
        const title = item.target_id
            ? renderTemplate(PRODUCT_UPDATE_LOGS_LABEL_MAPPED[item.type], { target_id: item.target_id })
            : PRODUCT_UPDATE_LOGS_LABEL_MAPPED[item.type]

        const detailChanges = PRODUCT_UPDATE_LOGS_HAS_CHANGES.includes(item.type)
            ? getDetailChanges({
                  oldValue: item.old,
                  newValue: item.new,
                  enumData: enumData?.data,
              })
            : undefined

        return {
            dot:
                item.type === PRODUCT_UPDATE_LOGS.CREATE ? (
                    <PlusCircleOutlined className="text-lg !text-green-500" />
                ) : (
                    <InfoCircleOutlined className="text-lg" />
                ),
            children: (
                <Row justify={index % 2 === 0 ? 'start' : 'end'}>
                    <Col span={18}>
                        <Card size="small">
                            <Space className="!w-full" direction="vertical" size={4}>
                                <Space className="!justify-between !w-full">
                                    <Text strong>{title}</Text>
                                    <Text type="secondary" className="!text-xs">
                                        {item.created_at}
                                    </Text>
                                </Space>

                                {detailChanges && detailChanges.length ? (
                                    <Flex className="flex-col">
                                        <List
                                            dataSource={detailChanges}
                                            renderItem={listItem => (
                                                <List.Item className="!last:pb-0">
                                                    <Text className="!text-left">{listItem}</Text>
                                                </List.Item>
                                            )}
                                        />
                                    </Flex>
                                ) : (
                                    <Text type="secondary" className="!text-xs !block !text-left">
                                        {item.reason}
                                    </Text>
                                )}

                                <Flex gap={4} className="!mt-2">
                                    <Tag>
                                        <UserOutlined />
                                        <Text type="secondary" className="!text-xs !text-left">
                                            {item.created_by_name}
                                        </Text>
                                    </Tag>
                                </Flex>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            ),
        }
    })

    return (
        <Card>
            {timelineItems.length ? (
                <Timeline mode="alternate" items={timelineItems} />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" className="!my-10" />
            )}
        </Card>
    )
}

export default TimelineHubProduct
