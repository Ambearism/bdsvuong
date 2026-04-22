import { useState } from 'react'
import { Typography, Table, Button, Flex, Card, Space, message, Popconfirm, Tooltip } from 'antd'
import { HistoryOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import type { TaxPaymentHistoryItem } from '@/types/tax-payment-history'
import { useGetTaxPaymentHistoriesQuery, useDeleteTaxPaymentHistoryMutation } from '@/api/tax-payment-history'
import TaxHistoryModal from '@/components/care/TaxHistoryModal'

import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { MULTIPLIER } from '@/config/constant'
import { useApiError } from '@/utils/error'
import { app } from '@/config/app'

const { Text, Title } = Typography

interface Props {
    caseId: number
    totalTax: number
    onSuccess?: () => void
}

const CareCaseTaxHistory = ({ caseId, totalTax, onSuccess }: Props) => {
    const { hasPermission } = usePermission()
    const { data: historiesData, isLoading, isFetching, refetch } = useGetTaxPaymentHistoriesQuery(caseId)
    const [deleteTaxHistory] = useDeleteTaxPaymentHistoryMutation()
    const { handleError } = useApiError()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<TaxPaymentHistoryItem | undefined>(undefined)

    const taxHistories = historiesData?.data?.items || []

    const totalPaid = taxHistories.reduce((sum, item) => sum + item.amount, 0) * MULTIPLIER
    const remainingTax = Math.max(0, totalTax - totalPaid)

    const handleDelete = async (id: number) => {
        try {
            await deleteTaxHistory({ id, care_case_id: caseId }).unwrap()
            message.success('Xóa lịch sử nộp thuế thành công')
            refetch()
            onSuccess?.()
        } catch (error: unknown) {
            handleError(error, 'Có lỗi xảy ra khi xóa, vui lòng thử lại sau')
        }
    }

    const columns = [
        {
            title: 'Kỳ nộp',
            dataIndex: 'period',
            key: 'period',
            render: (text: string) => (
                <Text strong className="text-base">
                    {text}
                </Text>
            ),
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'payment_date',
            key: 'payment_date',
            render: (text: string) => <Text className="text-slate-500">{dayjs(text).format('DD/MM/YYYY')}</Text>,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => (
                <Text strong className="text-base text-emerald-600">
                    {(val * MULTIPLIER).toLocaleString()} đ
                </Text>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (text: string) => (
                <Tooltip title={text}>
                    <Text className="text-slate-500 italic max-w-50 truncate block">{text || app.EMPTY_DISPLAY}</Text>
                </Tooltip>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            align: 'center' as const,
            render: (_: unknown, record: TaxPaymentHistoryItem) => (
                <Space size="middle">
                    {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE) && (
                        <Tooltip title="Sửa">
                            <Button
                                className="!flex !items-center !justify-center !px-0 !h-8 !w-8 !rounded-lg !border !border-solid !border-teal-400 !text-teal-400 hover:!text-teal-500 hover:!border-teal-500"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingItem(record)
                                    setIsModalOpen(true)
                                }}
                            />
                        </Tooltip>
                    )}
                    {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.DELETE) && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa lịch sử nộp thuế này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}>
                            <Tooltip title="Xóa">
                                <Button
                                    className="!flex !items-center !justify-center !px-0 !h-8 !w-8 !rounded-lg !border !border-solid !border-rose-400 !text-rose-400 hover:!text-rose-500 hover:!border-rose-500"
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <div className="p-6 bg-slate-50/30 min-h-full">
            <Card className="shadow-none border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <Flex justify="space-between" align="center">
                        <Space direction="vertical" size={4}>
                            <Flex align="center" gap={8} className="text-indigo-600">
                                <HistoryOutlined className="text-lg" />
                                <Title
                                    level={5}
                                    className="!m-0 uppercase tracking-tighter !text-slate-700 font-extrabold">
                                    Lịch sử nộp thuế
                                </Title>
                            </Flex>
                            <Text className="text-slate-400 text-sm">
                                Ghi nhận và quản lý các khoản thuế đã nộp độc lập với dòng tiền thuê.
                            </Text>
                        </Space>
                        <Flex gap={12} align="center">
                            <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                                <Text className="text-rose-600 font-bold whitespace-nowrap">
                                    Còn phải nộp: {remainingTax.toLocaleString()} đ
                                </Text>
                            </div>
                            {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.CREATE) && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    className="bg-indigo-600 hover:!bg-indigo-700 !h-10 px-6 rounded-lg font-bold"
                                    onClick={() => {
                                        setEditingItem(undefined)
                                        setIsModalOpen(true)
                                    }}>
                                    Ghi nhận nộp thuế
                                </Button>
                            )}
                        </Flex>
                    </Flex>
                </div>

                <Table
                    columns={columns}
                    dataSource={taxHistories}
                    rowKey="id"
                    pagination={false}
                    loading={isLoading || isFetching}
                    className="tax-history-table"
                    locale={{ emptyText: <Text type="secondary">Chưa có dữ liệu nộp thuế</Text> }}
                />
            </Card>

            <TaxHistoryModal
                open={isModalOpen}
                caseId={caseId}
                editingItem={editingItem}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => {
                    refetch()
                    onSuccess?.()
                }}
            />
        </div>
    )
}

export default CareCaseTaxHistory
