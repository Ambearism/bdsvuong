import {
    useGetLeaseContractListQuery,
    useGetLeaseContractPaymentListQuery,
    useUpdateLeaseContractPaymentMutation,
} from '@/api/lease-contract'
import { app } from '@/config/app'
import { LEASE_CONTRACT_PAYMENT_STATUS } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { padId } from '@/lib/utils'
import FilePreviewModal from '@/components/FilePreviewModal'
import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import LeaseContractPaymentApproveModal from '@/pages/lease-contracts/LeaseContractPaymentApproveModal'
import LeaseContractPaymentRejectModal from '@/pages/lease-contracts/LeaseContractPaymentRejectModal'
import type {
    LeaseContractItem,
    LeaseContractPaymentBase,
    LeaseContractPaymentMethod,
    LeaseContractPaymentStatus,
    LeaseContractPaymentUpdateInput,
} from '@/types/lease-contract'
import { useGetCostCategoryGroupsQuery } from '@/api/cost-category'
import { CheckCircleOutlined, CloseCircleOutlined, FilterOutlined, LinkOutlined } from '@ant-design/icons'
import {
    Badge,
    Breadcrumb,
    Button,
    Card,
    Dropdown,
    Empty,
    Flex,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd'
import { GoHome } from 'react-icons/go'
import type { MenuProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

const { Text, Title } = Typography

type PaymentStatusFilter = LeaseContractPaymentStatus | 'ALL'

const PAYMENT_STATUS_FILTER_OPTIONS: Array<{ label: string; value: PaymentStatusFilter }> = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Từ chối', value: 'REJECTED' },
]

const PAYMENT_STATUS_LABEL_MAP: Record<LeaseContractPaymentStatus, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
}

const PAYMENT_STATUS_COLOR_MAP: Record<LeaseContractPaymentStatus, string> = {
    PENDING: 'processing',
    APPROVED: 'success',
    REJECTED: 'error',
}

const PAYMENT_METHOD_LABEL_MAP: Record<LeaseContractPaymentMethod, string> = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',
    CREDIT_CARD: 'Thẻ tín dụng / POS',
}

const LeaseContractPaymentApproval = () => {
    useDocumentTitle('Duyệt Dòng Tiền')

    const navigate = useNavigate()
    const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('PENDING')
    const { hasPermission } = usePermission()
    const [updatingPaymentId, setUpdatingPaymentId] = useState<number>()
    const [modalVisible, setModalVisible] = useState(false)
    const [rejectModalVisible, setRejectModalVisible] = useState(false)
    const [filePreviewVisible, setFilePreviewVisible] = useState(false)
    const [previewFileUrls, setPreviewFileUrls] = useState<string[]>([])
    const [selectedPayment, setSelectedPayment] = useState<LeaseContractPaymentBase | undefined>(undefined)
    const [updateLeaseContractPayment] = useUpdateLeaseContractPaymentMutation()

    const paymentQueryParams = useMemo(
        () => ({
            page: app.DEFAULT_PAGE,
            per_page: app.BIG_PAGE_SIZE,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
        [statusFilter],
    )

    const {
        data: paymentData,
        isLoading,
        refetch: refetchPayments,
    } = useGetLeaseContractPaymentListQuery(paymentQueryParams, {
        refetchOnMountOrArgChange: true,
    })
    const { data: leaseContractData, refetch: refetchLeaseContracts } = useGetLeaseContractListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.BIG_PAGE_SIZE,
    })

    const leaseContractMap = useMemo(() => {
        const map = new Map<number, LeaseContractItem>()
        leaseContractData?.data?.items?.forEach(item => {
            map.set(item.id, item)
        })
        return map
    }, [leaseContractData?.data?.items])

    const { data: costCategoryGroupsData } = useGetCostCategoryGroupsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })

    const costCategoryMap = useMemo(() => {
        const groups = costCategoryGroupsData?.data || []
        const map = new Map<number, string>()
        groups.forEach(group => {
            map.set(group.id, group.name)
        })
        return map
    }, [costCategoryGroupsData?.data])

    const rows = paymentData?.data?.items || []
    const paymentCount = paymentData?.data?.total || 0

    const openApproveModal = (payment: LeaseContractPaymentBase) => {
        setSelectedPayment(payment)
        setRejectModalVisible(false)
        setModalVisible(true)
    }

    const openRejectModal = (payment: LeaseContractPaymentBase) => {
        setSelectedPayment(payment)
        setModalVisible(false)
        setRejectModalVisible(true)
    }

    const openFilePreviewModal = (files: string[]) => {
        setPreviewFileUrls(files)
        setFilePreviewVisible(true)
    }

    const handleModalConfirm = async (payload: LeaseContractPaymentUpdateInput) => {
        if (!selectedPayment) return
        try {
            setUpdatingPaymentId(selectedPayment.id)
            await updateLeaseContractPayment({
                payment_id: selectedPayment.id,
                payload,
            }).unwrap()
            message.success('Đã duyệt dòng tiền')
            setModalVisible(false)
            setSelectedPayment(undefined)
            refetchPayments()
            refetchLeaseContracts()
        } catch {
            message.error('Cập nhật trạng thái thất bại, vui lòng thử lại')
        } finally {
            setUpdatingPaymentId(undefined)
        }
    }

    const handleRejectConfirm = async (payload: LeaseContractPaymentUpdateInput) => {
        if (!selectedPayment) return
        try {
            setUpdatingPaymentId(selectedPayment.id)
            await updateLeaseContractPayment({
                payment_id: selectedPayment.id,
                payload,
            }).unwrap()
            message.success('Đã từ chối dòng tiền')
            setRejectModalVisible(false)
            setSelectedPayment(undefined)
            refetchPayments()
        } catch {
            message.error('Cập nhật trạng thái thất bại, vui lòng thử lại')
        } finally {
            setUpdatingPaymentId(undefined)
        }
    }

    const filterMenuItems: MenuProps['items'] = PAYMENT_STATUS_FILTER_OPTIONS.map(option => ({
        key: option.value,
        label: option.label,
    }))

    const columns: ColumnsType<LeaseContractPaymentBase> = [
        {
            title: 'Mã dòng tiền',
            key: 'id',
            width: 120,
            render: (_, record) => <Text>{padId(record.id, 'P')}</Text>,
        },
        {
            title: 'Ngày Nhận',
            key: 'receivedAt',
            width: 170,
            render: (_, record) => <Text>{record.payment_date}</Text>,
        },
        {
            title: 'Số Tiền',
            dataIndex: 'amount',
            width: 130,
            render: (amount: number) => <Text className="font-semibold !text-emerald-600">{amount} triệu</Text>,
        },
        {
            title: 'Người Nộp',
            key: 'payer',
            width: 190,
            render: (_, record) => {
                const leaseContract = leaseContractMap.get(record.lease_contract_id)
                return (
                    <>
                        <Typography.Link onClick={() => navigate(`/customers/${leaseContract?.tenant_rel?.id}/hub`)}>
                            {leaseContract?.tenant_rel?.name || app.EMPTY_DISPLAY}
                        </Typography.Link>
                        <Text type="secondary" className="block text-xs">
                            {PAYMENT_METHOD_LABEL_MAP[record.payment_method]}
                        </Text>
                    </>
                )
            },
        },
        {
            title: 'Phân Loại Sơ Bộ',
            dataIndex: 'cost_category_group_id',
            width: 170,
            render: (groupId: number) => (
                <Tag className="!font-semibold">{costCategoryMap.get(groupId) || `Nhóm ${groupId}`}</Tag>
            ),
        },
        {
            title: 'Người Nhập Liệu',
            key: 'createdBy',
            width: 170,
            render: (_, record) => (
                <>
                    <Typography.Link
                        className="font-medium"
                        onClick={() => navigate(`/accounts/${record.created_by_rel?.id}/update`)}>
                        {record.created_by_rel?.full_name || app.EMPTY_DISPLAY}
                    </Typography.Link>
                    {record.created_by_rel?.id !== record.landlord_rel?.id && (
                        <Text type="secondary" className="block !text-xs">
                            Nhập hộ
                        </Text>
                    )}
                </>
            ),
        },
        {
            title: 'Chứng Từ & Ghi Chú',
            key: 'attachmentsAndNote',
            width: 230,
            render: (_, record) => (
                <>
                    {!!record.files?.length && hasPermission(RESOURCE_TYPE.CASH_FLOW, ACTION.READ) && (
                        <Space direction="vertical" size={4} className="!text-xs">
                            <Button
                                type="link"
                                className="!h-auto !p-0 !text-blue-500 !font-semibold"
                                onClick={() => openFilePreviewModal(record.files || [])}>
                                <LinkOutlined className="!mr-1" />
                                {record.files.length} đính kèm
                            </Button>
                        </Space>
                    )}
                    {record.note && (
                        <Text type="secondary" className="block italic text-xs">
                            {record.note}
                        </Text>
                    )}
                </>
            ),
        },
        {
            title: 'Thao Tác',
            key: 'actions',
            align: 'center',
            width: 160,
            render: (_, record) => {
                const isRowUpdating = updatingPaymentId === record.id

                if (record.status !== LEASE_CONTRACT_PAYMENT_STATUS.PENDING) {
                    return (
                        <Tag color={PAYMENT_STATUS_COLOR_MAP[record.status]}>
                            {PAYMENT_STATUS_LABEL_MAP[record.status]}
                        </Tag>
                    )
                }

                return (
                    <Space>
                        {hasPermission(RESOURCE_TYPE.CASH_FLOW, ACTION.UPDATE) && (
                            <Tooltip title="Chuẩn hóa & Duyệt">
                                <Button
                                    size="small"
                                    type="default"
                                    className="!text-blue-500 !border-blue-500 hover:!text-blue-400 hover:!border-blue-400"
                                    icon={<CheckCircleOutlined />}
                                    loading={isRowUpdating}
                                    onClick={() => openApproveModal(record)}
                                />
                            </Tooltip>
                        )}
                        {hasPermission(RESOURCE_TYPE.CASH_FLOW, ACTION.UPDATE) && (
                            <Tooltip title="Từ chối">
                                <Button
                                    size="small"
                                    danger
                                    type="default"
                                    icon={<CloseCircleOutlined />}
                                    loading={isRowUpdating}
                                    onClick={() => openRejectModal(record)}
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
                                title: 'Duyệt dòng tiền',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <Card>
                <Flex align="flex-start" justify="space-between" gap="middle">
                    <div>
                        <Flex align="center" gap={10} className="!mb-1">
                            <Title level={3} className="!mb-0">
                                Duyệt Dòng Tiền
                            </Title>
                            <Badge count={paymentCount} className="[&_.ant-scroll-number]:!bg-amber-500" />
                        </Flex>
                        <Text type="secondary">
                            Hàng đợi các giao dịch cần kiểm tra và chuẩn hóa trước khi ghi nhận chính thức.
                        </Text>
                    </div>
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: filterMenuItems,
                            selectedKeys: [statusFilter],
                            onClick: ({ key }) => setStatusFilter(key as PaymentStatusFilter),
                        }}>
                        <Button icon={<FilterOutlined />}>Bộ lọc</Button>
                    </Dropdown>
                </Flex>
            </Card>

            <Card className="overflow-hidden">
                <Table<LeaseContractPaymentBase>
                    dataSource={rows}
                    loading={isLoading}
                    columns={columns}
                    rowKey="id"
                    bordered
                    pagination={false}
                    scroll={{ x: 1200 }}
                    locale={{ emptyText: <Empty description="Chưa có dòng tiền nào" /> }}
                />
            </Card>
            <LeaseContractPaymentApproveModal
                visible={modalVisible}
                payment={selectedPayment}
                onCancel={() => setModalVisible(false)}
                onConfirm={handleModalConfirm}
                saving={!!updatingPaymentId}
            />
            <LeaseContractPaymentRejectModal
                visible={rejectModalVisible}
                payment={selectedPayment}
                onCancel={() => setRejectModalVisible(false)}
                onConfirm={handleRejectConfirm}
                saving={!!updatingPaymentId}
            />
            <FilePreviewModal
                open={filePreviewVisible}
                onCancel={() => setFilePreviewVisible(false)}
                file_urls={previewFileUrls}
                title="Tài liệu thanh toán"
            />
        </Space>
    )
}

export default LeaseContractPaymentApproval
