import { useMemo, useState, type ReactNode } from 'react'
import { Button, Card, Empty, Flex, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    PlusOutlined,
} from '@ant-design/icons'
import { useOutletContext, useParams } from 'react-router'
import { colors } from '@/config/colors'
import dayjs from 'dayjs'
import CashflowEntryModal from '@/pages/lease-contracts/CashflowEntryModal'
import { LEASE_CONTRACT_INVOICE_STATUS } from '@/config/constant'
import { withPrice } from '@/lib/utils'
import type { LeaseContractInvoiceBase } from '@/types/lease-contract'
import AddInvoiceTermModal from './AddInvoiceTermModal'
import FilePreviewModal from '@/components/FilePreviewModal'
import { app } from '@/config/app'
import type { LeaseContractHubOutletContext } from '@/pages/lease-contracts/hub'

const { Text, Title } = Typography

const INVOICE_STATUS_LABEL_MAP: Record<string, string> = {
    [LEASE_CONTRACT_INVOICE_STATUS.PAID]: 'ĐÃ THU ĐỦ',
    [LEASE_CONTRACT_INVOICE_STATUS.UNPAID]: 'CHƯA ĐẾN HẠN',
}

const INVOICE_STATUS_COLOR_MAP: Record<string, string> = {
    [LEASE_CONTRACT_INVOICE_STATUS.PAID]: 'green',
    [LEASE_CONTRACT_INVOICE_STATUS.UNPAID]: 'blue',
}
type PaymentRow = {
    id: number
    termLabel: string
    dueDateText: string
    receivableText: string
    receivedText: string
    debtText: string
    statusLabel: string
    statusColor: string
    statusIcon: ReactNode
    fileUrls: string[]
    isPaid?: boolean
}

export default function PaymentsHubProduct() {
    const { lease_contract_id } = useParams<{ lease_contract_id: string }>()
    const leaseContractId = Number(lease_contract_id)
    const [openAddTermModal, setOpenAddTermModal] = useState(false)
    const [openFilePreviewModal, setOpenFilePreviewModal] = useState(false)
    const [previewFileUrls, setPreviewFileUrls] = useState<string[]>([])

    const { isPausedLeaseContract, leaseContract, invoices, refetchLeaseContractDetail, refetchLeaseContractInvoices } =
        useOutletContext<LeaseContractHubOutletContext>()

    const [openCashflowModal, setOpenCashflowModal] = useState(false)
    const [initialInvoiceIds, setInitialInvoiceIds] = useState<number[] | undefined>(undefined)

    const rows = useMemo<PaymentRow[]>(() => {
        const mapped = invoices.map((invoice: LeaseContractInvoiceBase, index) => {
            const amountText = withPrice(invoice.amount)
            const isPaid = invoice.status === LEASE_CONTRACT_INVOICE_STATUS.PAID
            const isOverdue = dayjs(invoice.due_date).startOf('day').isBefore(dayjs().startOf('day'))

            const baseLabel = INVOICE_STATUS_LABEL_MAP[invoice.status] ?? invoice.status
            const baseColor = INVOICE_STATUS_COLOR_MAP[invoice.status] ?? colors.gold
            let statusLabel = baseLabel
            let statusColor = baseColor
            if (invoice.status === LEASE_CONTRACT_INVOICE_STATUS.UNPAID && isOverdue) {
                statusLabel = 'QUÁ HẠN'
                statusColor = 'red'
            }

            return {
                id: invoice.id,
                termLabel: invoice.title ?? `Kỳ thanh toán ${index + 1}`,
                dueDateText: dayjs(invoice.due_date).format('DD/MM/YYYY'),
                receivableText: amountText,
                receivedText: isPaid ? amountText : app.EMPTY_DISPLAY,
                debtText: isPaid ? app.EMPTY_DISPLAY : amountText,
                statusLabel,
                statusColor,
                statusIcon: isPaid ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                fileUrls: invoice.files || [],
                isPaid,
            }
        })

        mapped.sort((a, b) => {
            const da = dayjs(a.dueDateText, 'DD/MM/YYYY')
            const db = dayjs(b.dueDateText, 'DD/MM/YYYY')
            if (da.isBefore(db)) return -1
            if (da.isAfter(db)) return 1
            return 0
        })

        return mapped
    }, [invoices])

    const columns: ColumnsType<PaymentRow> = [
        {
            title: 'Kỳ Hạn',
            dataIndex: 'termLabel',
            width: 220,
            render: (value: string) => <Text className="!font-semibold">{value}</Text>,
        },
        {
            title: 'Hạn Thanh Toán',
            dataIndex: 'dueDateText',
            width: 180,
        },
        {
            title: 'Phải Thu',
            dataIndex: 'receivableText',
            width: 150,
            align: 'right',
            render: (value: string) => <Text className="!font-semibold">{value}</Text>,
        },
        {
            title: 'Đã Thu',
            dataIndex: 'receivedText',
            width: 150,
            align: 'right',
            render: (value: string) => (
                <Text className={value === app.EMPTY_DISPLAY ? '!text-slate-400' : '!font-semibold !text-emerald-600'}>
                    {value}
                </Text>
            ),
        },
        {
            title: 'Còn Nợ',
            dataIndex: 'debtText',
            width: 150,
            align: 'right',
            render: (value: string) => (
                <Text className={value === app.EMPTY_DISPLAY ? '!text-slate-400' : '!font-semibold !text-rose-500'}>
                    {value}
                </Text>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'statusLabel',
            width: 180,
            render: (_, row) => (
                <Tag color={row.statusColor} icon={row.statusIcon} className="!font-semibold">
                    {row.statusLabel}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 110,
            align: 'center',
            render: (_, row) => {
                return (
                    <Space>
                        <Tooltip title="Tạo dòng tiền">
                            <Button
                                icon={<DollarOutlined />}
                                size="small"
                                className="!px-2"
                                color="green"
                                variant="outlined"
                                disabled={row.isPaid || isPausedLeaseContract}
                                onClick={() => {
                                    setInitialInvoiceIds([row.id])
                                    setOpenCashflowModal(true)
                                }}
                            />
                        </Tooltip>
                        <Tooltip title="Xem tài liệu">
                            <Button
                                icon={<FileTextOutlined />}
                                size="small"
                                className="!px-2"
                                color="blue"
                                variant="outlined"
                                disabled={!row.fileUrls.length}
                                onClick={() => {
                                    setPreviewFileUrls(row.fileUrls)
                                    setOpenFilePreviewModal(true)
                                }}
                            />
                        </Tooltip>
                    </Space>
                )
            },
        },
    ]

    const onAddInvoiceSuccess = async () => {
        setOpenAddTermModal(false)
        await refetchLeaseContractInvoices()
        await refetchLeaseContractDetail()
    }

    const onAddCashEntrySuccess = async () => {
        setOpenCashflowModal(false)
        setInitialInvoiceIds(undefined)
        await refetchLeaseContractInvoices()
    }

    const onAddCashEntryCancel = () => {
        setOpenCashflowModal(false)
        setInitialInvoiceIds(undefined)
    }

    const onPreviewFileCancel = () => {
        setOpenFilePreviewModal(false)
        setPreviewFileUrls([])
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card>
                <Flex justify="space-between" align="center" gap="middle" wrap="wrap">
                    <Flex align="center" gap={12}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                            <ClockCircleOutlined className="!text-slate-500" />
                        </div>
                        <div>
                            <Title level={4} className="!mb-0">
                                Lịch thanh toán chi tiết
                            </Title>
                            <Text type="secondary">Theo dõi các kỳ hạn thu tiền theo hợp đồng</Text>
                        </div>
                    </Flex>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="w-fit"
                        disabled={isPausedLeaseContract}
                        onClick={() => setOpenAddTermModal(true)}>
                        Thêm kỳ hạn
                    </Button>
                </Flex>
            </Card>

            <Card className="overflow-hidden">
                <Table<PaymentRow>
                    rowKey="id"
                    columns={columns}
                    dataSource={rows}
                    loading={false}
                    bordered
                    pagination={false}
                    scroll={{ x: 1100 }}
                    locale={{ emptyText: <Empty description="Chưa có kỳ hạn thanh toán" /> }}
                    summary={() => {
                        const totalReceivable = invoices.reduce((s, inv) => s + (Number(inv.amount) || 0), 0)
                        const totalReceived = invoices
                            .filter(inv => inv.status === LEASE_CONTRACT_INVOICE_STATUS.PAID)
                            .reduce((s, inv) => s + (Number(inv.amount) || 0), 0)
                        const totalDebt = totalReceivable - totalReceived

                        return (
                            <Table.Summary.Row className="!bg-slate-50">
                                <Table.Summary.Cell index={0} className="!p-3">
                                    <Text className="!font-semibold">Tổng cộng</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} className="!p-3"></Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right" className="!p-3">
                                    <Text className="!font-semibold">{withPrice(totalReceivable)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3} align="right" className="!p-3">
                                    <Text className="!font-semibold !text-emerald-600">{withPrice(totalReceived)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="right" className="!p-3">
                                    <Text className="!font-semibold !text-rose-500">{withPrice(totalDebt)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5} className="!p-3"></Table.Summary.Cell>
                                <Table.Summary.Cell index={6} className="!p-3"></Table.Summary.Cell>
                            </Table.Summary.Row>
                        )
                    }}
                />
            </Card>

            <AddInvoiceTermModal
                open={openAddTermModal}
                leaseContractId={leaseContractId || undefined}
                onCancel={() => setOpenAddTermModal(false)}
                onSuccess={onAddInvoiceSuccess}
            />

            <CashflowEntryModal
                open={openCashflowModal}
                leaseContract={leaseContract}
                initialInvoiceIds={initialInvoiceIds}
                onCancel={onAddCashEntryCancel}
                onSuccess={onAddCashEntrySuccess}
            />

            <FilePreviewModal
                open={openFilePreviewModal}
                file_urls={previewFileUrls}
                title="Xem Tài Liệu"
                onCancel={onPreviewFileCancel}
            />
        </Space>
    )
}
