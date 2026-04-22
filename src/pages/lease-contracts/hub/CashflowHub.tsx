import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Flex,
    InputNumber,
    List,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd'
import { DollarOutlined, PlusOutlined } from '@ant-design/icons'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useParams } from 'react-router'
import {
    useGetLeaseContractPaymentListQuery,
    useUpdateLeaseContractPaymentMutation,
    useUpdateLeaseContractPaymentAllocationsMutation,
} from '@/api/lease-contract'
import CashflowEntryModal from '@/pages/lease-contracts/CashflowEntryModal'
import LeaseContractPaymentApproveModal from '@/pages/lease-contracts/LeaseContractPaymentApproveModal'
import {
    LEASE_CONTRACT_PAYMENT_STATUS,
    PAYMENT_METHOD_LABELS,
    PAYMENT_STATUS_COLOR,
    PAYMENT_STATUS_LABELS,
} from '@/config/constant'
import { app } from '@/config/app'
import { padId, withPrice } from '@/lib/utils'
import type { AllocationRow, AllocationTableRow, LeaseContractPaymentUpdateInput } from '@/types/lease-contract'
import { colors } from '@/config/colors'
import type { LeaseContractHubOutletContext } from '@/pages/lease-contracts/hub'

const { Text, Title } = Typography

export default function CashflowHubProduct() {
    const { lease_contract_id } = useParams<{ lease_contract_id: string }>()
    const leaseContractId = Number(lease_contract_id)

    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null)
    const [openCashflowModal, setOpenCashflowModal] = useState(false)
    const [openApproveModal, setOpenApproveModal] = useState(false)
    const [matchedByInvoiceId, setMatchedByInvoiceId] = useState<Record<number, number>>({})

    const { isPausedLeaseContract, leaseContract, invoices, refetchLeaseContractInvoices } =
        useOutletContext<LeaseContractHubOutletContext>()

    const { data: paymentsResp, refetch: refetchPayments } = useGetLeaseContractPaymentListQuery(
        leaseContractId
            ? {
                  lease_contract_id: leaseContractId,
                  per_page: app.BIG_PAGE_SIZE,
              }
            : skipToken,
    )

    const [updateLeaseContractPayment, { isLoading: isUpdatingPaymentStatus }] = useUpdateLeaseContractPaymentMutation()
    const [updateLeaseContractPaymentAllocations, { isLoading: isUpdatingAllocations }] =
        useUpdateLeaseContractPaymentAllocationsMutation()

    const paymentItems = useMemo(() => {
        const items = paymentsResp?.data?.items || []
        return [...items].sort((first, second) => second.id - first.id)
    }, [paymentsResp?.data?.items])

    const selectedPayment = useMemo(() => {
        if (!paymentItems.length) return undefined
        return paymentItems.find(item => item.id === selectedPaymentId) || paymentItems[0]
    }, [paymentItems, selectedPaymentId])

    const allocationRows = useMemo<AllocationRow[]>(() => {
        if (!selectedPayment) return []

        const invoiceItems = invoices || []
        const invoiceIds = selectedPayment?.lease_contract_invoice_ids || []

        if (!invoiceIds.length) {
            return []
        }

        const invoiceMap = new Map(invoiceItems.map(invoice => [invoice.id, invoice]))
        return invoiceIds
            .map((invoiceId, index) => {
                const invoice = invoiceMap.get(invoiceId)
                if (!invoice) return null

                const amount = Number(invoice.amount) || 0
                return {
                    id: invoice.id,
                    title: invoice.title || `Kỳ thanh toán ${index + 1}`,
                    dueDate: invoice.due_date,
                    amount,
                    receivedAmount: invoice.received_amount ?? null,
                }
            })
            .filter((row): row is AllocationRow => row !== null)
    }, [invoices, selectedPayment])

    const areAllPaymentInvoicesUnreceived = useMemo(() => {
        if (!selectedPayment) return false

        const invoiceIds = selectedPayment.lease_contract_invoice_ids || []
        if (!invoiceIds.length) return false

        if (allocationRows.length !== invoiceIds.length) return false

        return allocationRows.every(row => row.receivedAmount == null)
    }, [selectedPayment, allocationRows])

    useEffect(() => {
        if (!selectedPayment || !allocationRows.length) {
            setMatchedByInvoiceId({})
            return
        }

        let remaining = Number(selectedPayment.amount) || 0
        const nextMatchedByInvoiceId: Record<number, number> = {}

        allocationRows.forEach(row => {
            const matched = Math.min(row.amount, Math.max(remaining, 0))
            nextMatchedByInvoiceId[row.id] = matched
            remaining -= matched
        })

        setMatchedByInvoiceId(nextMatchedByInvoiceId)
    }, [selectedPayment, allocationRows])

    const totalMatched = useMemo(() => {
        return allocationRows.reduce((sum, row) => sum + (matchedByInvoiceId[row.id] || 0), 0)
    }, [allocationRows, matchedByInvoiceId])

    const availableBalance = useMemo(() => {
        if (!selectedPayment) return 0
        return Math.max((Number(selectedPayment.amount) || 0) - totalMatched, 0)
    }, [selectedPayment, totalMatched])

    const allocationDataSource = useMemo<AllocationTableRow[]>(() => {
        return allocationRows.map(row => {
            const matched = matchedByInvoiceId[row.id] || 0
            return {
                ...row,
                key: row.id,
                matched,
                remaining: Math.max(row.amount - matched, 0),
            }
        })
    }, [allocationRows, matchedByInvoiceId])

    const handleMatchedChange = (invoiceId: number, value: number | null) => {
        if (!selectedPayment) return

        const row = allocationRows.find(item => item.id === invoiceId)
        if (!row) return

        const nextRaw = Math.max(Number(value) || 0, 0)
        const paymentAmount = Number(selectedPayment.amount) || 0
        const otherMatchedTotal = allocationRows.reduce((sum, item) => {
            if (item.id === invoiceId) return sum
            return sum + (matchedByInvoiceId[item.id] || 0)
        }, 0)
        const maxByPayment = Math.max(paymentAmount - otherMatchedTotal, 0)
        const normalizedValue = Math.min(nextRaw, row.amount, maxByPayment)

        setMatchedByInvoiceId(prev => ({
            ...prev,
            [invoiceId]: normalizedValue,
        }))
    }

    const handleResetMatched = () => {
        if (!selectedPayment || !allocationRows.length) {
            setMatchedByInvoiceId({})
            return
        }

        let remaining = Number(selectedPayment.amount) || 0
        const nextMatchedByInvoiceId: Record<number, number> = {}

        allocationRows.forEach(row => {
            const matched = Math.min(row.amount, Math.max(remaining, 0))
            nextMatchedByInvoiceId[row.id] = matched
            remaining -= matched
        })

        setMatchedByInvoiceId(nextMatchedByInvoiceId)
    }

    const onCreateCashflowSuccess = async () => {
        setOpenCashflowModal(false)
        await refetchPayments()
        await refetchLeaseContractInvoices()
    }

    const onApprovePayment = async (payload: LeaseContractPaymentUpdateInput) => {
        if (!selectedPayment) return

        try {
            await updateLeaseContractPayment({
                payment_id: selectedPayment.id,
                payload,
            }).unwrap()

            setOpenApproveModal(false)
            await refetchPayments()
            await refetchLeaseContractInvoices()
            message.success('Đã duyệt dòng tiền')
        } catch {
            message.error('Cập nhật trạng thái thất bại, vui lòng thử lại')
        }
    }

    const onSaveAllocations = async () => {
        if (!selectedPayment) return
        if (selectedPayment.status !== LEASE_CONTRACT_PAYMENT_STATUS.APPROVED) {
            message.warning('Chỉ dòng tiền đã duyệt mới có thể lưu phân bổ')
            return
        }
        if (!areAllPaymentInvoicesUnreceived) {
            message.warning('Dòng tiền này đã được phân bổ, không thể lưu khớp tiền nữa')
            return
        }

        try {
            await updateLeaseContractPaymentAllocations({
                payment_id: selectedPayment.id,
                payload: {
                    allocations: allocationRows.map(row => ({
                        lease_contract_invoice_id: row.id,
                        matched_amount: matchedByInvoiceId[row.id] || 0,
                    })),
                },
            }).unwrap()

            await refetchPayments()
            await refetchLeaseContractInvoices()
            message.success('Cập nhật phân bổ dòng tiền thành công')
        } catch {
            message.error('Cập nhật phân bổ dòng tiền thất bại, vui lòng thử lại')
        }
    }

    const isApprovedPayment = selectedPayment?.status === LEASE_CONTRACT_PAYMENT_STATUS.APPROVED
    let saveDisabledReason: string | undefined
    if (!isApprovedPayment) {
        saveDisabledReason = 'Chỉ dòng tiền đã duyệt mới có thể lưu phân bổ'
    } else if (!allocationRows.length) {
        saveDisabledReason = 'Không có kỳ hạn thu để phân bổ'
    } else if (!areAllPaymentInvoicesUnreceived) {
        saveDisabledReason = 'Dòng tiền này đã được phân bổ, không thể lưu khớp tiền nữa'
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!rounded-xl">
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Flex align="center" gap={12}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                            <DollarOutlined className="!text-slate-500" />
                        </div>
                        <div>
                            <Title level={4} className="!mb-0">
                                PHIẾU THU DÒNG TIỀN
                            </Title>
                            <Text type="secondary">Theo dõi phiếu thu và phân bổ dòng tiền theo hợp đồng</Text>
                        </div>
                    </Flex>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="w-fit"
                        disabled={isPausedLeaseContract}
                        onClick={() => setOpenCashflowModal(true)}>
                        Tạo dòng tiền
                    </Button>
                </Flex>
            </Card>

            <Row gutter={16}>
                <Col xs={24} xl={8}>
                    <Card className="!rounded-xl" bodyStyle={{ padding: 12 }}>
                        {paymentItems.length ? (
                            <List
                                dataSource={paymentItems}
                                renderItem={item => {
                                    const isSelected = item.id === selectedPayment?.id

                                    return (
                                        <List.Item
                                            className={`!mb-2 !cursor-pointer !rounded-lg !border !p-3 ${
                                                isSelected ? '!border-indigo-300 !bg-indigo-50' : '!border-slate-200'
                                            }`}
                                            onClick={() => setSelectedPaymentId(item.id)}>
                                            <Flex vertical className="!w-full" gap={6}>
                                                <Flex justify="space-between" align="center">
                                                    <Text strong>{padId(item.id, 'DT')}</Text>
                                                    <Tag color={PAYMENT_STATUS_COLOR[item.status] || 'default'}>
                                                        {PAYMENT_STATUS_LABELS[item.status] || item.status}
                                                    </Tag>
                                                </Flex>
                                                <Text type="secondary" className="!text-xs">
                                                    {item.payment_date} | {PAYMENT_METHOD_LABELS[item.payment_method]}
                                                </Text>
                                                <Divider className="!my-1" />
                                                <Flex justify="space-between" align="end">
                                                    <div>
                                                        <Text type="secondary" className="!text-sm">
                                                            Số tiền nhận
                                                        </Text>
                                                        <div>
                                                            <Text strong>{withPrice(item.amount)}</Text>
                                                        </div>
                                                    </div>
                                                </Flex>
                                            </Flex>
                                        </List.Item>
                                    )
                                }}
                            />
                        ) : (
                            <Empty description="Chưa có phiếu thu dòng tiền" />
                        )}
                    </Card>
                </Col>

                <Col xs={24} xl={16}>
                    <Card className="!rounded-xl !border-indigo-200">
                        <Flex justify="space-between" align="center" className="!mb-4" wrap="wrap" gap="small">
                            <div>
                                <Text className="!text-lg !uppercase !font-bold !tracking-wide">
                                    Bảng xử lý phân bổ
                                </Text>
                                <div>
                                    <Text strong>
                                        {selectedPayment ? padId(selectedPayment.id, 'DT') : app.EMPTY_DISPLAY}
                                    </Text>
                                    <Text type="secondary">
                                        {' '}
                                        / {selectedPayment ? withPrice(selectedPayment.amount) : app.EMPTY_DISPLAY}
                                    </Text>
                                </div>
                            </div>
                            <Space size="large" wrap>
                                <Statistic
                                    title="Khớp tổng"
                                    value={totalMatched}
                                    valueStyle={{ color: 'var(--ant-color-primary)' }}
                                    formatter={value =>
                                        selectedPayment ? withPrice(Number(value) || 0) : app.EMPTY_DISPLAY
                                    }
                                />
                                <Divider type="vertical" className="!h-10" />
                                <Statistic
                                    title="Dư khả dụng"
                                    value={availableBalance}
                                    valueStyle={{ color: colors.green }}
                                    formatter={value =>
                                        selectedPayment ? withPrice(Number(value) || 0) : app.EMPTY_DISPLAY
                                    }
                                />
                            </Space>
                        </Flex>

                        <Table<AllocationTableRow>
                            className="!mt-3"
                            rowKey="id"
                            pagination={false}
                            dataSource={allocationDataSource}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description={
                                            selectedPayment
                                                ? 'Dòng tiền chưa có kỳ hạn thu để phân bổ'
                                                : 'Chọn dòng tiền để bắt đầu phân bổ'
                                        }
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ),
                            }}
                            columns={[
                                {
                                    title: 'Kỳ hạn thu',
                                    dataIndex: 'title',
                                    key: 'title',
                                    render: (_, row) => (
                                        <div>
                                            <Text strong>{row.title}</Text>
                                            <div>
                                                <Text type="secondary" className="!text-xs">
                                                    Hạn: {row.dueDate}
                                                </Text>
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    title: 'Phải thu',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    align: 'right',
                                    render: value => (
                                        <Text>{value ? withPrice(Number(value) || 0) : app.EMPTY_DISPLAY}</Text>
                                    ),
                                },
                                {
                                    title: 'Còn nợ',
                                    dataIndex: 'remaining',
                                    key: 'remaining',
                                    align: 'right',
                                    render: value => (
                                        <Text className="!text-rose-500" strong>
                                            {value ? withPrice(Number(value) || 0) : app.EMPTY_DISPLAY}
                                        </Text>
                                    ),
                                },
                                {
                                    title: 'Số tiền khớp',
                                    dataIndex: 'matched',
                                    key: 'matched',
                                    align: 'right',
                                    render: (_, row) => (
                                        <Flex justify="flex-end">
                                            <Tooltip
                                                title={
                                                    !isApprovedPayment
                                                        ? 'Chỉ dòng tiền đã duyệt mới có thể chỉnh phân bổ'
                                                        : undefined
                                                }>
                                                <span>
                                                    <InputNumber
                                                        value={row.matched}
                                                        onChange={value => handleMatchedChange(row.id, value)}
                                                        min={0}
                                                        disabled={!isApprovedPayment}
                                                        className="!w-full max-w-[160px]"
                                                        addonAfter="triệu"
                                                    />
                                                </span>
                                            </Tooltip>
                                        </Flex>
                                    ),
                                },
                            ]}
                        />

                        <Flex justify="space-between" className="!mt-6">
                            <Tooltip
                                title={
                                    !isApprovedPayment ? 'Chỉ dòng tiền đã duyệt mới có thể reset phân bổ' : undefined
                                }>
                                <span>
                                    <Button
                                        onClick={handleResetMatched}
                                        disabled={!isApprovedPayment || isPausedLeaseContract}>
                                        Reset nhập liệu
                                    </Button>
                                </span>
                            </Tooltip>

                            {(!isApprovedPayment || !allocationRows.length) &&
                                !!selectedPayment &&
                                selectedPayment?.status !== LEASE_CONTRACT_PAYMENT_STATUS.REJECTED && (
                                    <div className="ml-auto mr-2">
                                        <Button
                                            type="primary"
                                            htmlType="button"
                                            disabled={isPausedLeaseContract}
                                            onClick={() => setOpenApproveModal(true)}>
                                            Duyệt dòng tiền
                                        </Button>
                                    </div>
                                )}

                            <Tooltip title={saveDisabledReason}>
                                <span>
                                    <Button
                                        type="primary"
                                        loading={isUpdatingAllocations}
                                        disabled={
                                            isPausedLeaseContract ||
                                            !isApprovedPayment ||
                                            !allocationRows.length ||
                                            !areAllPaymentInvoicesUnreceived
                                        }
                                        onClick={onSaveAllocations}
                                        htmlType="button">
                                        Xác nhận & Lưu khớp tiền
                                    </Button>
                                </span>
                            </Tooltip>
                        </Flex>
                    </Card>
                </Col>
            </Row>

            <CashflowEntryModal
                open={openCashflowModal}
                leaseContract={leaseContract}
                onCancel={() => setOpenCashflowModal(false)}
                onSuccess={onCreateCashflowSuccess}
            />
            <LeaseContractPaymentApproveModal
                visible={openApproveModal}
                payment={selectedPayment}
                onCancel={() => setOpenApproveModal(false)}
                onConfirm={onApprovePayment}
                saving={isUpdatingPaymentStatus}
            />
        </Space>
    )
}
