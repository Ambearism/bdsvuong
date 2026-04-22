import React from 'react'
import { Button, Card, Flex, Select, Space, Typography } from 'antd'
import { LeftOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { CARE_COLOR_CLASSES } from '@/config/colors'
import { STATUS, STATUS_LABEL_MAP, type StatusValue } from '@/config/constant'

import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'

interface CareCaseDetailHeaderProps {
    caseCode: string
    customerName: string
    status: StatusValue
    onBack: () => void
    onStatusChange: (status: StatusValue) => void
    onEdit: () => void
    isUpdatingStatus?: boolean
}

const statusSelectOptions = [STATUS.ACTIVE, STATUS.INACTIVE].map(statusValue => {
    return {
        value: statusValue,
        label: STATUS_LABEL_MAP[statusValue],
    }
})

const CareCaseDetailHeader: React.FC<CareCaseDetailHeaderProps> = ({
    caseCode,
    customerName,
    status,
    onBack,
    onStatusChange,
    onEdit,
    isUpdatingStatus = false,
}) => {
    const { hasPermission } = usePermission()

    return (
        <Card className="!shadow-sm !rounded-lg">
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
                <Space align="center" size={12}>
                    <Button type="text" icon={<LeftOutlined />} className="!p-2 !h-10 !w-10" onClick={onBack} />
                    <Space direction="vertical" size={4}>
                        <Typography.Title level={2} className="!mb-0 !font-bold !text-slate-800">
                            {caseCode}
                        </Typography.Title>
                        <Typography.Text className="text-base !text-slate-600">{customerName}</Typography.Text>
                    </Space>
                </Space>
                <Flex align="center" gap={12}>
                    <Select
                        value={status}
                        className="min-w-40"
                        variant="outlined"
                        popupMatchSelectWidth={false}
                        loading={isUpdatingStatus}
                        onChange={onStatusChange}
                        options={statusSelectOptions}
                        disabled={!hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE)}
                    />

                    {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE) && (
                        <Button
                            type="primary"
                            icon={<ThunderboltOutlined />}
                            className={`${CARE_COLOR_CLASSES.primary.bg} ${CARE_COLOR_CLASSES.primary.border}`}
                            onClick={onEdit}>
                            Chỉnh sửa Care
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Card>
    )
}

export default CareCaseDetailHeader
