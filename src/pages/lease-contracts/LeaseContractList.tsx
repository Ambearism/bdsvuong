import { app } from '@/config/app'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePermission } from '@/hooks/usePermission'
import { useGetLeaseContractListQuery } from '@/api/lease-contract'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
    DEBT_AGE_OPTIONS_TEMPLATE,
    LEASE_CONTRACT_STATUS,
    LEASE_STATUS_COLOR_MAP,
    LEASE_STATUS_LABEL_MAP,
    LEASE_STATUS_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
} from '@/config/constant'
import CashflowEntryModal from '@/pages/lease-contracts/CashflowEntryModal'
import TransferLeaseModal from '@/pages/lease-contracts/TransferLeaseModal'
import DebtNoteModal from '@/pages/lease-contracts/DebtNoteModal'
import {
    ExceptionOutlined,
    DollarOutlined,
    FileTextOutlined,
    PlusOutlined,
    SwapOutlined,
    ClockCircleOutlined,
    ProductOutlined,
} from '@ant-design/icons'
import {
    Breadcrumb,
    Button,
    Card,
    Empty,
    Flex,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'
import type { DebtAgeValue, LeaseContractItem, LeaseContractStatus, PaymentStatusValue } from '@/types/lease-contract'
import { formatNumber } from '@/utils/number-utils'
import { getBillingUnitLabel, padId } from '@/lib/utils'
import { colors } from '@/config/colors'
import { useDebounce } from '@/hooks/useDebounce'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Text } = Typography

const LeaseContractList = () => {
    useDocumentTitle('Danh sách hợp đồng thuê')
    const navigate = useNavigate()

    const [keyword, setKeyword] = useState<string>()
    const [leaseStatus, setLeaseStatus] = useState<LeaseContractStatus>()
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>()
    const [debtAge, setDebtAge] = useState<DebtAgeValue>()
    const [isCashflowModalOpen, setIsCashflowModalOpen] = useState(false)
    const [selectedLeaseContract, setSelectedLeaseContract] = useState<LeaseContractItem>()
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [isDebtNoteModalOpen, setIsDebtNoteModalOpen] = useState(false)
    const { hasPermission } = usePermission()
    const debouncedKeyword = useDebounce(keyword, 500)

    const queryParams = useMemo(() => {
        const params: {
            page: number
            per_page: number
            keyword?: string
            status?: LeaseContractStatus
            payment_status?: PaymentStatusValue
            aging_from?: number
            aging_to?: number
        } = {
            page: app.DEFAULT_PAGE,
            per_page: app.BIG_PAGE_SIZE,
        }

        const normalizedKeyword = debouncedKeyword?.trim()
        if (normalizedKeyword) params.keyword = normalizedKeyword
        if (leaseStatus) params.status = leaseStatus

        if (paymentStatus) params.payment_status = paymentStatus

        switch (debtAge) {
            case 'DUE_0_30':
                params.aging_from = 0
                params.aging_to = 30
                break
            case 'DUE_31_60':
                params.aging_from = 31
                params.aging_to = 60
                break
            case 'DUE_61_90':
                params.aging_from = 61
                params.aging_to = 90
                break
            case 'DUE_90_PLUS':
                params.aging_from = 91
                break
            default:
                break
        }

        return params
    }, [debouncedKeyword, leaseStatus, paymentStatus, debtAge])

    const {
        data: leaseContractsData,
        isLoading,
        refetch,
    } = useGetLeaseContractListQuery(queryParams, {
        refetchOnMountOrArgChange: true,
    })

    const handleResetFilter = () => {
        setKeyword(undefined)
        setLeaseStatus(undefined)
        setPaymentStatus(undefined)
        setDebtAge(undefined)
    }

    const openCashflowModal = (record: LeaseContractItem) => {
        setSelectedLeaseContract(record)
        setIsCashflowModalOpen(true)
    }

    const handleCashflowModalCancel = () => {
        setIsCashflowModalOpen(false)
        setSelectedLeaseContract(undefined)
    }

    const openTransferModal = (record: LeaseContractItem) => {
        setSelectedLeaseContract(record)
        setIsTransferModalOpen(true)
    }

    const openDebtNoteModal = (record: LeaseContractItem) => {
        setSelectedLeaseContract(record)
        setIsDebtNoteModalOpen(true)
    }

    const handleTransferCancel = () => {
        setIsTransferModalOpen(false)
        setSelectedLeaseContract(undefined)
    }

    const handleDebtNoteCancel = () => {
        setIsDebtNoteModalOpen(false)
        setSelectedLeaseContract(undefined)
    }

    const handleTransferConfirm = async () => {
        message.success('Chuyển nhượng hợp đồng thành công')
        setIsTransferModalOpen(false)
        setSelectedLeaseContract(undefined)
    }

    const dataSource = leaseContractsData?.data?.items || []

    const columns: ColumnsType<LeaseContractItem> = [
        {
            title: 'Mã HĐ',
            dataIndex: 'contractCode',
            key: 'contractCode',
            width: 150,
            render: (_, record: LeaseContractItem) => padId(record.id, 'HDT'),
        },
        {
            title: 'Bất Động Sản / Căn',
            dataIndex: 'propertyUnit',
            key: 'propertyUnit',
            width: 220,
            render: (_, record: LeaseContractItem) => (
                <>
                    <Typography.Link onClick={() => navigate(`/products/${record.product_rel?.id}/hub`)}>
                        {record.product_rel?.name}
                    </Typography.Link>
                    <Text type="secondary" className="!text-sm  block">
                        {record.unit_product?.trim() || 'Nguyên căn'}
                    </Text>
                </>
            ),
        },
        {
            title: 'Khách thuê / Chủ nhà',
            dataIndex: 'tenantOwner',
            key: 'tenantOwner',
            width: 220,
            render: (_, record: LeaseContractItem) => (
                <>
                    <Typography.Link onClick={() => navigate(`/customers/${record.tenant_rel?.id}/hub`)}>
                        {record.tenant_rel.name}
                    </Typography.Link>
                    <Typography.Link
                        type="secondary"
                        className="!text-sm block"
                        onClick={() => navigate(`/customers/${record.landlord_rel?.id}/hub`)}>
                        Chủ nhà: {record.landlord_rel.name}
                    </Typography.Link>
                </>
            ),
        },
        {
            title: 'Tiền thuê / Kỳ',
            dataIndex: 'rentPerPeriod',
            key: 'rentPerPeriod',
            width: 170,
            render: (_, record: LeaseContractItem) => (
                <>
                    <Text>{formatNumber(record.price)} triệu</Text>
                    <Text type="secondary" className="!text-sm block">
                        {getBillingUnitLabel(record)}
                    </Text>
                </>
            ),
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'paymentDue',
            key: 'paymentDue',
            width: 140,
            render: (_, record: LeaseContractItem) => {
                const due = record.nearest_unpaid_invoice_rel?.due_date
                if (!due) return null

                const dueDay = dayjs(due)
                const daysDiff = dueDay.startOf('day').diff(dayjs().startOf('day'), 'day')

                let color: string | undefined
                if (daysDiff < 0) color = colors.red
                else if (daysDiff <= 3) color = colors.gold

                return <Text style={{ color }}>{dueDay.format('DD/MM/YYYY')}</Text>
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'leaseStatus',
            key: 'leaseStatus',
            width: 150,
            render: (_, record: LeaseContractItem) => (
                <Tag color={LEASE_STATUS_COLOR_MAP[record.status]}>{LEASE_STATUS_LABEL_MAP[record.status]}</Tag>
            ),
        },
        {
            title: 'Cảnh báo',
            key: 'warning',
            width: 100,
            render: (_, record: LeaseContractItem) => {
                const hasPendingApprovalPayments = Boolean(record.has_pending_approval_payments)
                const hasDebtNotes = Boolean(record.has_debt_notes)

                if (!hasPendingApprovalPayments && !hasDebtNotes) return null

                return hasPermission(RESOURCE_TYPE.LEASE_CONTRACT, ACTION.READ) ? (
                    <Space size={8} className="!w-full !justify-center">
                        {hasPendingApprovalPayments && (
                            <Tooltip title="Có dòng tiền cần duyệt">
                                <ClockCircleOutlined
                                    onClick={() => {
                                        if (hasPermission(RESOURCE_TYPE.CASH_FLOW, ACTION.READ)) {
                                            navigate('/lease-contracts-payments')
                                        }
                                    }}
                                    className={`!text-[#faad14] text-lg ${
                                        hasPermission(RESOURCE_TYPE.CASH_FLOW, ACTION.READ) ? 'cursor-pointer' : ''
                                    }`}
                                />
                            </Tooltip>
                        )}

                        {hasDebtNotes && (
                            <Tooltip title="Hợp đồng có ghi chú nợ">
                                <ExceptionOutlined
                                    onClick={() => {
                                        if (hasPermission(RESOURCE_TYPE.LEASE_CONTRACT, ACTION.READ)) {
                                            navigate(`/lease-contracts/${record.id}/hub/debt-notes`)
                                        }
                                    }}
                                    className="!text-[#faad14] text-lg"
                                />
                            </Tooltip>
                        )}
                    </Space>
                ) : null
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            width: 200,
            render: (_, record: LeaseContractItem) => {
                const isPaused = record.status === LEASE_CONTRACT_STATUS.PAUSED

                return (
                    <Space>
                        {hasPermission(RESOURCE_TYPE.CASH_FLOW, ACTION.CREATE) && (
                            <Tooltip title="Tạo dòng tiền">
                                <Button
                                    icon={<DollarOutlined />}
                                    size="small"
                                    color="green"
                                    variant="outlined"
                                    disabled={isPaused}
                                    onClick={() => openCashflowModal(record)}
                                />
                            </Tooltip>
                        )}
                        {hasPermission(RESOURCE_TYPE.LEASE_CONTRACT, ACTION.UPDATE) && (
                            <Tooltip title="Thêm ghi chú nợ">
                                <Button
                                    icon={<FileTextOutlined />}
                                    size="small"
                                    color="gold"
                                    variant="outlined"
                                    disabled={isPaused}
                                    onClick={() => openDebtNoteModal(record)}
                                />
                            </Tooltip>
                        )}
                        {hasPermission(RESOURCE_TYPE.LEASE_CONTRACT, ACTION.UPDATE) && (
                            <Tooltip title="Chuyển nhượng hợp đồng">
                                <Button
                                    icon={<SwapOutlined />}
                                    size="small"
                                    color="purple"
                                    variant="outlined"
                                    disabled={isPaused}
                                    onClick={() => openTransferModal(record)}
                                />
                            </Tooltip>
                        )}
                        {hasPermission(RESOURCE_TYPE.LEASE_CONTRACT, ACTION.READ) && (
                            <Tooltip title="Xem Hub">
                                <Button
                                    icon={<ProductOutlined />}
                                    onClick={() => navigate(`/lease-contracts/${record.id}/hub`)}
                                    size="small"
                                    color="cyan"
                                    variant="outlined"
                                />
                            </Tooltip>
                        )}
                    </Space>
                )
            },
        },
    ]

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Danh sách hợp đồng thuê',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    {hasPermission(RESOURCE_TYPE.LEASE_CONTRACT, ACTION.CREATE) && (
                        <Button type="primary" onClick={() => navigate('/lease-contracts/create')}>
                            <PlusOutlined /> Tạo mới
                        </Button>
                    )}
                </Flex>
            </Card>

            <Card>
                <Flex wrap={false} gap="middle" align="center" justify="space-start" className="!mb-4">
                    <Tooltip title="Tìm kiếm theo mã hợp đồng, BĐS/căn, khách thuê/chủ nhà">
                        <Input
                            className="!w-1/4"
                            placeholder="Tìm kiếm"
                            allowClear
                            value={keyword}
                            onChange={event => setKeyword(event.target.value)}
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo trạng thái hợp đồng">
                        <Select
                            className="!w-1/4"
                            allowClear
                            placeholder="Trạng thái hợp đồng"
                            value={leaseStatus}
                            onChange={setLeaseStatus}
                            options={LEASE_STATUS_OPTIONS}
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo trạng thái thanh toán">
                        <Select
                            className="!w-1/4"
                            allowClear
                            placeholder="Trạng thái thanh toán"
                            value={paymentStatus}
                            onChange={setPaymentStatus}
                            options={PAYMENT_STATUS_OPTIONS}
                        />
                    </Tooltip>

                    <Tooltip title="Lọc theo thời gian nợ">
                        <Select
                            className="!w-1/4"
                            allowClear
                            placeholder="Thời gian nợ"
                            value={debtAge}
                            onChange={setDebtAge}
                            options={DEBT_AGE_OPTIONS_TEMPLATE}
                        />
                    </Tooltip>

                    <Button type="primary" onClick={handleResetFilter} className="ml-auto">
                        Reset
                    </Button>
                </Flex>

                <Table<LeaseContractItem>
                    dataSource={dataSource}
                    loading={isLoading}
                    columns={columns}
                    rowKey="id"
                    bordered
                    scroll={{ x: true }}
                    locale={{ emptyText: <Empty description="Chưa có hợp đồng thuê nào" /> }}
                    pagination={false}
                />
            </Card>

            {isCashflowModalOpen && (
                <CashflowEntryModal
                    open={isCashflowModalOpen}
                    leaseContract={selectedLeaseContract}
                    onCancel={handleCashflowModalCancel}
                    onSuccess={refetch}
                />
            )}

            {isTransferModalOpen && (
                <TransferLeaseModal
                    open={isTransferModalOpen}
                    onCancel={handleTransferCancel}
                    onConfirm={handleTransferConfirm}
                    leaseContract={selectedLeaseContract}
                    onSuccess={refetch}
                />
            )}

            {isDebtNoteModalOpen && (
                <DebtNoteModal
                    open={isDebtNoteModalOpen}
                    leaseContract={selectedLeaseContract}
                    onCancel={handleDebtNoteCancel}
                    onSuccess={refetch}
                />
            )}
        </Space>
    )
}

export default LeaseContractList
