import {
    CaretRightOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    EditOutlined,
    FileDoneOutlined,
    HomeOutlined,
    PauseOutlined,
    SwapOutlined,
    SyncOutlined,
    UserOutlined,
} from '@ant-design/icons'
import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Tabs,
    Typography,
    Breadcrumb,
    Flex,
    Tooltip,
    Modal,
    message,
    Spin,
    Empty,
    Tag,
} from 'antd'
import { useNavigate, useParams, useLocation, Outlet, Link } from 'react-router'
import { GoHome } from 'react-icons/go'
import { useMemo, useState, useEffect } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import {
    useGetLeaseContractDetailQuery,
    useGetLeaseContractInvoicesQuery,
    useUpdateLeaseContractStatusMutation,
} from '@/api/lease-contract'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import { colors } from '@/config/colors'
import { getBillingUnitLabel, padId, withPrice } from '@/lib/utils'
import { app } from '@/config/app'
import TransferLeaseModal from '@/pages/lease-contracts/TransferLeaseModal'
import RenewLeaseModal from '@/pages/lease-contracts/RenewLeaseModal'
import { LEASE_CONTRACT_INVOICE_STATUS, LEASE_CONTRACT_STATUS } from '@/config/constant'
import type { LeaseContractInvoiceBase, LeaseContractItem, SimpleLeaseContractItem } from '@/types/lease-contract'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Text, Title } = Typography

const TAB_ITEMS = [
    {
        key: 'payments',
        label: 'Thanh Toán',
    },
    {
        key: 'cashflow',
        label: 'Dòng Tiền',
    },
    {
        key: 'debt-notes',
        label: 'Ghi Chú Nợ',
    },
    {
        key: 'history',
        label: 'Lịch Sử',
    },
]

export type LeaseContractHubOutletContext = {
    isPausedLeaseContract: boolean
    leaseContract?: LeaseContractItem
    invoices: LeaseContractInvoiceBase[]
    refetchLeaseContractDetail: () => Promise<unknown>
    refetchLeaseContractInvoices: () => Promise<unknown>
}

export default function LeaseContractHub() {
    useDocumentTitle('Hub chi tiết hợp đồng thuê')
    const navigate = useNavigate()
    const location = useLocation()
    const { lease_contract_id } = useParams<{ lease_contract_id: string }>()

    const [activeTabKey, setActiveTabKey] = useState<string>('payments')

    const leaseContractId = Number(lease_contract_id)
    const {
        data: leaseContractDetail,
        refetch: refetchLeaseContractDetail,
        isLoading: isLoadingLeaseContractDetail,
    } = useGetLeaseContractDetailQuery(leaseContractId ? { lease_contract_id: leaseContractId } : skipToken, {
        refetchOnMountOrArgChange: true,
    })
    const {
        data: invoicesResp,
        refetch: refetchLeaseContractInvoices,
        isLoading: isLoadingLeaseContractInvoices,
    } = useGetLeaseContractInvoicesQuery(leaseContractId ? { lease_contract_id: leaseContractId } : skipToken, {
        refetchOnMountOrArgChange: true,
    })
    const invoices = useMemo(() => invoicesResp?.data ?? [], [invoicesResp])
    const leaseContract = leaseContractDetail?.data
    const isPausedLeaseContract = leaseContract?.status === LEASE_CONTRACT_STATUS.PAUSED
    const canResumeLeaseContract = useMemo(() => {
        if (!leaseContract || !isPausedLeaseContract) return false

        const today = dayjs().startOf('day')
        const startDate = dayjs(leaseContract.start_date).startOf('day')
        const endDate = dayjs(leaseContract.end_date).startOf('day')

        const isOnOrAfterStartDate = today.isSame(startDate) || today.isAfter(startDate)
        const isOnOrBeforeEndDate = today.isSame(endDate) || today.isBefore(endDate)

        return isOnOrAfterStartDate && isOnOrBeforeEndDate
    }, [leaseContract, isPausedLeaseContract])

    const contractTimeline = useMemo(() => {
        if (!leaseContract) return []

        const childContracts = leaseContract.child_lease_contracts_rel || []
        const allContracts: Array<LeaseContractItem | SimpleLeaseContractItem> = [leaseContract, ...childContracts]

        return allContracts.sort((a, b) => {
            const diff = dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf()
            if (diff !== 0) return diff
            return a.id - b.id
        })
    }, [leaseContract])

    const activeContract = useMemo(() => {
        return contractTimeline.find(contract => contract.status === 'ACTIVE') || contractTimeline[0]
    }, [contractTimeline])

    const consolidatedTerm = useMemo(() => {
        if (!contractTimeline.length) return app.EMPTY_DISPLAY

        const rootStartDate = contractTimeline[0]?.start_date
        const latestEndDate = contractTimeline.reduce((latest, contract) => {
            if (!latest) return contract.end_date
            return dayjs(contract.end_date).isAfter(dayjs(latest), 'day') ? contract.end_date : latest
        }, '')

        if (!rootStartDate || !latestEndDate) return app.EMPTY_DISPLAY
        return `${dayjs(rootStartDate).format('DD/MM/YYYY')} - ${dayjs(latestEndDate).format('DD/MM/YYYY')}`
    }, [contractTimeline])

    const sumPaid = useMemo(() => {
        const paidSum = invoices
            .filter(inv => inv.status === LEASE_CONTRACT_INVOICE_STATUS.PAID)
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)

        return withPrice(paidSum)
    }, [invoices])

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
    const [updateLeaseContractStatus, { isLoading: isUpdatingLeaseContractStatus }] =
        useUpdateLeaseContractStatusMutation()

    useEffect(() => {
        const currentTab = location.pathname.split('/').filter(Boolean).at(-1)

        if (currentTab && TAB_ITEMS.find(tabItem => tabItem.key === currentTab)) {
            setActiveTabKey(currentTab)
        } else {
            setActiveTabKey('payments')
        }
    }, [location.pathname])

    const openTransferModal = () => setIsTransferModalOpen(true)
    const openRenewModal = () => setIsRenewModalOpen(true)
    const openPauseModal = () => setIsPauseModalOpen(true)
    const openResumeModal = () => setIsResumeModalOpen(true)
    const handleTransferCancel = () => {
        setIsTransferModalOpen(false)
    }
    const handleTransferConfirm = async () => {
        setIsTransferModalOpen(false)
    }

    const handleRenewCancel = () => {
        setIsRenewModalOpen(false)
    }

    const handlePauseCancel = () => {
        setIsPauseModalOpen(false)
    }

    const handleResumeCancel = () => {
        setIsResumeModalOpen(false)
    }

    const handlePauseConfirm = async () => {
        if (!leaseContract) return

        try {
            await updateLeaseContractStatus({
                lease_contract_id: leaseContract.id,
                payload: {
                    status: LEASE_CONTRACT_STATUS.PAUSED,
                },
            }).unwrap()

            message.success('Tạm dừng hợp đồng thành công')
            setIsPauseModalOpen(false)
            await refetchLeaseContractDetail()
            await refetchLeaseContractInvoices()
        } catch {
            message.error('Tạm dừng hợp đồng thất bại, vui lòng thử lại')
        }
    }

    const handleResumeConfirm = async () => {
        if (!leaseContract) return

        try {
            await updateLeaseContractStatus({
                lease_contract_id: leaseContract.id,
                payload: {
                    status: LEASE_CONTRACT_STATUS.ACTIVE,
                },
            }).unwrap()

            message.success('Tiếp tục hợp đồng thành công')
            setIsResumeModalOpen(false)
            await refetchLeaseContractDetail()
            await refetchLeaseContractInvoices()
        } catch {
            message.error('Tiếp tục hợp đồng thất bại, vui lòng thử lại')
        }
    }

    const handleTabChange = (key: string) => {
        setActiveTabKey(key)
        navigate(key)
    }

    const due = leaseContract?.nearest_unpaid_invoice_rel?.due_date
    let dueDisplay
    let dueColor: string | undefined
    if (due) {
        const dueDay = dayjs(due)
        const daysDiff = dueDay.startOf('day').diff(dayjs().startOf('day'), 'day')
        if (daysDiff < 0) dueColor = colors.red
        else if (daysDiff <= 3) dueColor = colors.gold
        dueDisplay = dueDay.format('DD/MM/YYYY')
    }

    const onRenewSuccess = async () => {
        await refetchLeaseContractDetail()
        await refetchLeaseContractInvoices()
    }

    if (isLoadingLeaseContractDetail || isLoadingLeaseContractInvoices) {
        return (
            <div className="flex h-100 items-center justify-center">
                <Spin size="large" />
            </div>
        )
    }

    if (!leaseContract) {
        return (
            <div className="flex h-100 items-center justify-center">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy dữ liệu" className="!my-10" />
            </div>
        )
    }

    return (
        <>
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
                                title: 'Danh sách hợp đồng thuê',
                                className: 'text-md font-medium',
                                href: '/lease-contracts',
                            },
                            {
                                title: <span className="text-md font-medium">Hub hợp đồng</span>,
                            },
                        ]}
                    />
                    <Space wrap size={12}>
                        <Button
                            icon={<EditOutlined />}
                            className="!font-semibold"
                            onClick={() => navigate(`/lease-contracts/${leaseContract.id}/update`)}
                            disabled={isPausedLeaseContract}>
                            Chỉnh sửa
                        </Button>
                        {!isPausedLeaseContract ? (
                            <Button icon={<PauseOutlined />} className="!font-semibold" onClick={openPauseModal}>
                                Tạm dừng
                            </Button>
                        ) : (
                            <Tooltip
                                title={
                                    canResumeLeaseContract
                                        ? 'Tiếp tục hợp đồng'
                                        : 'Chỉ tiếp tục khi ngày hiện tại nằm trong thời hạn hợp đồng'
                                }>
                                <Button
                                    icon={<CaretRightOutlined />}
                                    className="!font-semibold"
                                    onClick={openResumeModal}
                                    disabled={!canResumeLeaseContract}>
                                    Tiếp tục hợp đồng
                                </Button>
                            </Tooltip>
                        )}
                        <Button
                            icon={<SwapOutlined />}
                            className="!font-semibold"
                            onClick={openTransferModal}
                            disabled={isPausedLeaseContract}>
                            Chuyển Nhượng
                        </Button>
                        <Button
                            icon={<CalendarOutlined className="!text-orange-500" />}
                            className="!font-semibold"
                            onClick={openRenewModal}
                            disabled={isPausedLeaseContract}>
                            Gia Hạn
                        </Button>
                    </Space>
                </Flex>
            </Card>

            <TransferLeaseModal
                open={isTransferModalOpen}
                onCancel={handleTransferCancel}
                leaseContract={leaseContract}
                onConfirm={handleTransferConfirm}
            />

            <RenewLeaseModal
                open={isRenewModalOpen}
                onCancel={handleRenewCancel}
                leaseContract={leaseContract}
                onSuccess={onRenewSuccess}
            />

            <Modal
                open={isPauseModalOpen}
                title="Xác nhận tạm dừng hợp đồng"
                onCancel={handlePauseCancel}
                onOk={handlePauseConfirm}
                okText="Xác nhận"
                cancelText="Hủy"
                centered
                confirmLoading={isUpdatingLeaseContractStatus}
                destroyOnHidden>
                {leaseContract.care_case_id ? (
                    <Text>
                        Hợp đồng <Tag className="!mr-0">{padId(leaseContract.id, 'HDT')}</Tag> hiện đang gắn với Hợp
                        Đồng{' '}
                        <Tag className="!mr-0">
                            CARE-
                            {leaseContract.care_case_id}
                        </Tag>
                        .
                        <br />
                        Xác nhận tạm dừng hợp đồng <Tag className="!mr-0">{padId(leaseContract.id, 'HDT')}</Tag>?
                    </Text>
                ) : (
                    <Text>
                        Bạn có chắc muốn tạm dừng hợp đồng <Tag className="!mr-0">{padId(leaseContract.id, 'HDT')}</Tag>
                        ?<br />
                        Trạng thái hợp đồng sẽ được đồng sẽ được cập nhật thành <Tag className="!mr-0">Đã tạm dừng</Tag>
                    </Text>
                )}
            </Modal>

            <Modal
                open={isResumeModalOpen}
                title="Xác nhận tiếp tục hợp đồng"
                onCancel={handleResumeCancel}
                onOk={handleResumeConfirm}
                okText="Xác nhận"
                cancelText="Hủy"
                centered
                confirmLoading={isUpdatingLeaseContractStatus}
                destroyOnHidden>
                <Text>
                    Bạn có chắc muốn tiếp tục hợp đồng <Tag className="!mr-0">{padId(leaseContract.id, 'HDT')}</Tag>?
                    <br />
                    Trạng thái hợp đồng sẽ được cập Trạng thái hợp đồng sẽ được cập nhật thành{' '}
                    <Tag className="!mr-0">Còn hiệu lực</Tag>.
                </Text>
            </Modal>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-1 xl:grid-cols-2">
                <Card className="!rounded-2xl !border-slate-200">
                    <Space direction="vertical" size={10} className="!w-full">
                        <Space size={10} className="!items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
                                <ClockCircleOutlined className="!text-indigo-500" />
                            </div>
                            <Text className="!text-xs !font-semibold !uppercase !tracking-[0.08em] !text-slate-400">
                                Hạn thanh toán
                            </Text>
                        </Space>

                        <Title
                            level={2}
                            className="!mb-0 !font-bold !leading-none"
                            style={{ color: dueColor ?? undefined }}>
                            {dueDisplay}
                        </Title>
                    </Space>
                </Card>
                <Card className="!rounded-2xl !border-slate-200">
                    <Space direction="vertical" size={10} className="!w-full">
                        <Space size={10} className="!items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50">
                                <DollarOutlined className="!text-emerald-500" />
                            </div>
                            <Text className="!text-xs !font-semibold !uppercase !tracking-[0.08em] !text-slate-400">
                                Doanh thu lũy kế
                            </Text>
                        </Space>
                        <Title level={2} className="!mb-0 !font-bold !leading-none !text-emerald-600">
                            {sumPaid}
                        </Title>
                    </Space>
                </Card>
            </div>

            <Row gutter={16} className="mt-6">
                <Col xs={24} xl={18}>
                    <Tabs items={TAB_ITEMS} activeKey={activeTabKey} onChange={handleTabChange} />
                    <Outlet
                        context={
                            {
                                isPausedLeaseContract,
                                leaseContract,
                                invoices,
                                refetchLeaseContractDetail,
                                refetchLeaseContractInvoices,
                            } satisfies LeaseContractHubOutletContext
                        }
                    />
                </Col>

                <Col xs={24} xl={6} className="!mt-4 lg:!mt-0">
                    <Space direction="vertical" size="middle" className="!w-full">
                        <Card className="overflow-hidden !rounded-2xl [&_.ant-card-body]:!p-0">
                            <div className="px-5 py-4 bg-blue-500">
                                <Text className="!text-xs !font-semibold !uppercase !tracking-[0.08em] !text-white/80">
                                    Hợp đồng thuê
                                </Text>
                                <Title level={3} className="!mb-0 !mt-1 !text-white">
                                    {padId(leaseContract.id, 'HDT')}
                                </Title>
                            </div>

                            <Space direction="vertical" className="!w-full !p-5" size={14}>
                                <div className="border-b border-gray-100 pb-3">
                                    <Text className="!text-xs !font-semibold !uppercase !text-slate-400">Chủ nhà</Text>
                                    <div className="mt-1 flex items-start gap-2">
                                        <UserOutlined className="mt-1 !text-slate-400" />
                                        <Text strong>
                                            <Link to={`/customers/${leaseContract.landlord_rel?.id}/update`}>
                                                {leaseContract.landlord_rel.name}
                                            </Link>
                                        </Text>
                                    </div>
                                </div>

                                <div className="border-b border-gray-100 pb-3">
                                    <Text className="!text-xs !font-semibold !uppercase !text-slate-400">
                                        Khách thuê
                                    </Text>
                                    <div className="mt-1 flex items-start gap-2">
                                        <UserOutlined className="mt-1 !text-slate-400" />
                                        <Text strong>
                                            <Link to={`/customers/${leaseContract.tenant_rel?.id}/update`}>
                                                {leaseContract.tenant_rel.name}
                                            </Link>
                                        </Text>
                                    </div>
                                </div>

                                <div>
                                    <Text className="!text-xs !font-semibold !uppercase !text-slate-400">
                                        Bất động sản
                                    </Text>
                                    <div className="mt-1 flex items-start gap-2">
                                        <HomeOutlined className="mt-1 !text-slate-400" />
                                        <Space direction="vertical" size={0}>
                                            <Text strong>
                                                <Link to={`/products/${leaseContract.product_rel?.id}/update`}>
                                                    {leaseContract.product_rel?.name}
                                                </Link>
                                            </Text>
                                            <Text className="!text-[13px] !text-blue-500">
                                                {leaseContract?.unit_product ?? 'Nguyên căn'}
                                            </Text>
                                        </Space>
                                    </div>
                                </div>
                            </Space>
                        </Card>

                        <Card className="!rounded-2xl">
                            <Space direction="vertical" size={14} className="!w-full">
                                <div className="border-b border-gray-100 pb-3">
                                    <Text className="!text-xs !font-semibold !uppercase !text-slate-400">
                                        Tiền thuê / kỳ
                                    </Text>
                                    <div className="mt-1 flex items-start gap-2">
                                        <DollarOutlined className="mt-1 !text-slate-400" />
                                        <Tooltip
                                            title={
                                                contractTimeline.length ? (
                                                    <div className="space-y-1">
                                                        {contractTimeline.map((contract, index) => (
                                                            <div key={contract.id}>
                                                                {!index
                                                                    ? padId(contract.id, 'HDT')
                                                                    : `GH HĐ lần ${index}`}
                                                                : {withPrice(contract.price)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null
                                            }>
                                            <Text strong className="!text-emerald-600">
                                                {activeContract ? withPrice(activeContract.price) : app.EMPTY_DISPLAY}
                                            </Text>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="border-b border-gray-100 pb-3">
                                    <Text className="!text-xs !font-semibold !uppercase !text-slate-400">Chu kỳ</Text>
                                    <div className="mt-1 flex items-start gap-2">
                                        <SyncOutlined className="mt-1 !text-slate-400" />
                                        <Tooltip
                                            title={
                                                contractTimeline.length ? (
                                                    <div className="space-y-1">
                                                        {contractTimeline.map((contract, index) => (
                                                            <div key={contract.id}>
                                                                {!index
                                                                    ? padId(contract.id, 'HDT')
                                                                    : `GH HĐ lần ${index}`}
                                                                : {getBillingUnitLabel(contract)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null
                                            }>
                                            <Text strong>
                                                {activeContract
                                                    ? getBillingUnitLabel(activeContract)
                                                    : app.EMPTY_DISPLAY}
                                            </Text>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="border-b border-gray-100 pb-3">
                                    <Text className="!text-xs !font-semibold !uppercase !text-slate-400">Thời hạn</Text>
                                    <div className="mt-1 flex items-start gap-2">
                                        <CalendarOutlined className="mt-1 !text-slate-400" />
                                        <Tooltip
                                            title={
                                                contractTimeline.length ? (
                                                    <div className="space-y-1">
                                                        {contractTimeline.map((contract, index) => (
                                                            <div key={contract.id}>
                                                                {!index
                                                                    ? padId(contract.id, 'HDT')
                                                                    : `GH HĐ lần ${index}`}
                                                                : {dayjs(contract.start_date).format('DD/MM/YYYY')} -{' '}
                                                                {dayjs(contract.end_date).format('DD/MM/YYYY')}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null
                                            }>
                                            <Text strong>{consolidatedTerm}</Text>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div>
                                    <Text className="!text-xs !font-semibold !uppercase !text-slate-400">Tiền cọc</Text>
                                    <div className="mt-1 flex items-start gap-2">
                                        <FileDoneOutlined className="mt-1 !text-slate-400" />
                                        <Text strong>
                                            {leaseContract.deposit
                                                ? withPrice(leaseContract.deposit)
                                                : app.EMPTY_DISPLAY}
                                        </Text>
                                    </div>
                                </div>
                            </Space>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </>
    )
}
