import { useGetProjectListQuery } from '@/api/project'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import { app } from '@/config/app'
import { Card, Flex, Space, Typography } from 'antd'
import React, { useCallback, useMemo } from 'react'

const { Text } = Typography

const CONDITION_MAPPING: Record<string, string> = {
    type_transaction_id: 'Nhu cầu',
    type_product_ids_list: 'Loại hình',
    legal: 'Pháp lý',
    zone_province_id: 'Tỉnh/Thành phố',
    zone_ward_ids_list: 'Phường/Xã',
    price_range: 'Mức giá (tỷ)',
    price_rent_range: 'Mức giá thuê (tỷ)',
    street_frontage_range: 'Mặt tiền (m)',
    gateway_range: 'Mặt đường (m)',
    area_range: 'Diện tích (m2)',
    direction: 'Hướng',
    direction_house_ids_list: 'Hướng nhà',
    direction_balcony_ids_list: 'Hướng ban công',
    keyword: 'Từ khóa',
    project_id: 'Dự án',
    fit_ids_list: 'Nội thất',
    status_product_ids_list: 'Trạng thái hàng hoá',
    number_bedroom_range: 'Số phòng ngủ',
    number_toilets: 'Số toilet',
}

interface FilterConditionsCardProps {
    conditions: Record<string, unknown>
}

export const FilterConditionsCard: React.FC<FilterConditionsCardProps> = ({ conditions }) => {
    const provinceId = useMemo(() => {
        return Number(conditions?.['zone_province_id']) || undefined
    }, [conditions])

    const { data: enumData } = useGetEnumOptionsQuery([
        'product_types',
        'direction_types',
        'legal_status',
        'product_status',
        'fit_types',
        'publish_status',
    ])
    const { data: provinceData } = useGetProvinceListQuery()
    const { data: wardData } = useGetWardsByProvinceIdQuery({ province_id: provinceId! }, { skip: !provinceId })
    const { data: projectData } = useGetProjectListQuery({ page: app.DEFAULT_PAGE, per_page: app.FETCH_ALL })

    const getLabelForValue = useCallback(
        (key: string, value: string | number | boolean | (string | number)[]): string => {
            if (value == null) return ''
            const valueString = String(value)
            const valueNumber = Number(value)

            const resolveEnum = (listName: string) => {
                const list =
                    (enumData?.data as Record<string, { value: number | string; label: string }[]>)?.[listName] || []
                const getLabel = (paramValue: string | number) =>
                    list.find(enumItem => String(enumItem.value) === String(paramValue))?.label || String(paramValue)

                if (Array.isArray(value)) {
                    return value.map(getLabel).join(', ')
                }
                return getLabel(value as string | number)
            }

            const resolvers: Record<string, () => string> = {
                zone_province_id: () => {
                    const items = provinceData?.data?.items || []
                    return (
                        items.find((province: { id: number; name: string }) => province.id === valueNumber)?.name ||
                        valueString
                    )
                },
                project_id: () => {
                    const items = projectData?.data?.items || []
                    return (
                        items.find((project: { id: number; name: string }) => project.id === valueNumber)?.name ||
                        valueString
                    )
                },
                zone_ward_ids_list: () => {
                    const items = wardData?.data?.items || []
                    const getWardName = (id: string | number) =>
                        items.find((ward: { id: number; name: string }) => ward.id === Number(id))?.name || String(id)

                    if (Array.isArray(value)) {
                        return value.map(getWardName).join(', ')
                    }
                    return getWardName(valueNumber)
                },
            }

            if (resolvers[key]) return resolvers[key]()

            if (key.includes('type_product')) return resolveEnum('product_types')
            if (key.includes('direction')) return resolveEnum('direction_types')
            if (key.includes('legal')) return resolveEnum('legal_status')
            if (key.includes('status_product')) return resolveEnum('product_status')
            if (key.includes('fit')) return resolveEnum('fit_types')

            if (typeof value === 'boolean') return value ? 'True' : 'False'

            return valueString
        },
        [enumData, provinceData, projectData, wardData],
    )

    const displayedEntries = useMemo(() => {
        if (!conditions) return []

        return Object.entries(conditions)
            .filter(([key]) => {
                return !!CONDITION_MAPPING[key]
            })
            .map(([key, value]) => ({
                key,
                label: CONDITION_MAPPING[key],
                value: getLabelForValue(key, value as string | number | boolean | (string | number)[]),
            }))
    }, [conditions, getLabelForValue])

    return (
        <Card title="Điều kiện lọc" className="shadow-sm mb-4">
            <Space direction="vertical" className="w-full">
                {displayedEntries.map(entry => (
                    <Flex
                        key={entry.key}
                        justify="space-between"
                        className="border-b last:border-0 py-2 border-gray-100">
                        <Text type="secondary" className="text-sm">
                            {entry.label}
                        </Text>
                        <Text strong className="text-sm text-right">
                            {entry.value}
                        </Text>
                    </Flex>
                ))}
                {displayedEntries.length === 0 && (
                    <Text type="secondary" italic>
                        Không có điều kiện
                    </Text>
                )}
            </Space>
        </Card>
    )
}
