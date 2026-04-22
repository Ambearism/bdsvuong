import React, { useMemo, useState } from 'react'
import {
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Empty,
    Flex,
    Result,
    Space,
    Tabs,
    Tag,
    Typography,
    Form,
    message,
} from 'antd'
import { GoHome } from 'react-icons/go'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ClockCircleOutlined, FileTextOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetCareCaseDetailQuery, useUpdateCareCaseStatusMutation, useUpdateCareCaseMutation } from '@/api/care-case'
import { useGetCustomerDetailQuery } from '@/api/customer'
import { useGetProductListQuery } from '@/api/product'
import { useGetCareCaseContractsQuery } from '@/api/care-case-tax'
import { useGetCareCaseTasksQuery } from '@/api/care-case-task'
import { app } from '@/config/app'
import {
    STATUS,
    type StatusValue,
    DEFAULT_TAX_RATE,
    DEFAULT_TAX_THRESHOLD,
    TAX_METHOD,
    TASK_STATUS,
    LEASE_STATUS_LABEL_MAP,
    ONE_BILLION_THRESHOLD,
} from '@/config/constant'
import EditCareCaseModal from '@/components/modals/care/EditCareCaseModal'
import AddCustomerModal from '@/components/modals/care/AddCustomerModal'
import CareCaseDetailHeader from '@/components/care/CareCaseDetailHeader'
import CareCaseTaxTab from '@/components/care/CareCaseTaxTab'
import CareCaseRoiTab from '@/components/care/CareCaseRoiTab'
import CareCaseCashflowTab from '@/components/care/CareCaseCashflowTab'
import CareCaseTasksTab from '@/components/care/CareCaseTasksTab'
import CareCaseLogTab from '@/components/care/CareCaseLogTab'
import { CARE_DETAIL_TABS } from '@/config/constant'
import type { CareCaseItem } from '@/types/care-case'
import type { CustomerItem } from '@/types/customer'

const CareCaseDetail: React.FC = () => {
    useDocumentTitle('Chi tiết Care')
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')

    const caseId = Number(id)
    const [activeTab, setActiveTab] = useState(tabParam || 'tax')
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false)
    const [editForm] = Form.useForm()
    const [customerForm] = Form.useForm()
    const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<CustomerItem | null>(null)

    const [taxMethod, setTaxMethod] = useState<string>(TAX_METHOD.REVENUE)
    const [taxRate, setTaxRate] = useState<number>(DEFAULT_TAX_RATE)
    const [taxThreshold, setTaxThreshold] = useState<number>(DEFAULT_TAX_THRESHOLD)
    const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear())

    const { data, isLoading, isError, refetch } = useGetCareCaseDetailQuery(caseId, {
        skip: Number.isNaN(caseId) || caseId <= 0,
        refetchOnMountOrArgChange: true,
    })
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateCareCaseStatusMutation()
    const [updateCareCase, { isLoading: isUpdatingCareCase }] = useUpdateCareCaseMutation()
    const { data: customerData } = useGetCustomerDetailQuery(
        { customer_id: data?.data?.customer_id ?? 0 },
        { skip: !data?.data?.customer_id },
    )

    const apiDetail = data?.data
    const detail = (apiDetail as CareCaseItem) ?? null

    React.useEffect(() => {
        if (detail) {
            setTaxMethod(detail.tax_method ?? TAX_METHOD.REVENUE)
            setTaxRate(detail.tax_rate ?? DEFAULT_TAX_RATE)
            setTaxThreshold(detail.tax_threshold ?? DEFAULT_TAX_THRESHOLD)
        }
    }, [detail])

    React.useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    const productIds = useMemo(() => {
        const related = detail?.related_bds
        if (Array.isArray(related)) return related.map(Number)
        if (related != null) return [Number(related)]
        return []
    }, [detail])

    const { data: productsData } = useGetProductListQuery({ per_page: app.BIG_PAGE_SIZE }, { skip: !detail })
    const { data: leaseContractsData } = useGetCareCaseContractsQuery(caseId, { skip: !detail || !caseId })
    const { data: tasksData } = useGetCareCaseTasksQuery(caseId, { skip: !detail || !caseId })

    const customer = customerData?.data ?? null
    const openTasksCount = useMemo(() => {
        const tasks = tasksData?.data ?? []
        return tasks.filter(t => t.status === TASK_STATUS.PENDING || t.status === TASK_STATUS.IN_PROGRESS).length
    }, [tasksData])
    const careFeeDisplay = detail?.care_fee_display || (detail?.care_fee ? `${detail.care_fee} Tr/tháng` : '—')

    const relatedContracts = leaseContractsData?.data ?? []

    if (Number.isNaN(caseId) || caseId <= 0) {
        return (
            <Result
                status="404"
                title="ID không hợp lệ"
                subTitle="Vui lòng quay lại danh sách Care."
                extra={
                    <Button type="primary" onClick={() => window.history.back()}>
                        Quay lại
                    </Button>
                }
            />
        )
    }

    if (isLoading) return null

    if (isError || !detail) {
        return (
            <Result
                status="error"
                title="Không tải được chi tiết"
                subTitle={isError ? 'Có lỗi khi gọi API. Vui lòng thử lại.' : 'Không tìm thấy Care.'}
                extra={
                    <Button type="primary" onClick={() => refetch()}>
                        Thử lại
                    </Button>
                }
            />
        )
    }

    const handleStatusChange = async (status: StatusValue) => {
        try {
            await updateStatus({
                case_code: detail.case_code,
                status,
            }).unwrap()
            message.success('Cập nhật trạng thái thành công')
            refetch()
        } catch {
            message.error('Cập nhật trạng thái thất bại')
        }
    }

    const handleAddCustomerSubmit = (newCustomer: CustomerItem) => {
        editForm.setFieldsValue({
            customer_id: newCustomer.id,
        })
        setNewlyCreatedCustomer(newCustomer)
        setAddCustomerModalOpen(false)
    }

    const handleEditCareCaseSubmit = async (values: Record<string, unknown>) => {
        const realEstate = (values.related_bds ?? []) as number[]
        const careFee = values.care_fee
        const payload = {
            customer_id:
                values.customer_id != null && values.customer_id !== '' ? Number(values.customer_id) : undefined,
            related_bds: (Array.isArray(realEstate) ? realEstate : []).map(Number),
            links: values.linkAssetsLeases ? String(values.linkAssetsLeases) : undefined,
            care_fee: careFee != null && careFee !== '' ? Number(careFee) : undefined,
            assigned_to:
                values.assigned_to != null && values.assigned_to !== '' ? Number(values.assigned_to) : undefined,
            note: values.note ? String(values.note) : undefined,
            contract_files: values.contract_files ? String(values.contract_files) : undefined,
        }
        const fileList = values.images as Array<{ originFileObj?: File }> | undefined
        const imageFiles = (fileList ?? []).map(f => f?.originFileObj).filter((f): f is File => f != null)

        try {
            await updateCareCase({ care_case_id: detail.id, payload, images: imageFiles }).unwrap()
            message.success('Đã cập nhật Care thành công')
            setEditModalOpen(false)
            refetch()
        } catch (err: unknown) {
            const e = err as { data?: { errors?: Array<{ msg?: string }> } }
            message.error(e?.data?.errors?.[0]?.msg || 'Cập nhật thất bại')
        }
    }

    const displayStatus = detail.status ?? STATUS.ACTIVE

    const recordForEdit = detail

    const products = productsData?.data?.items ?? []
    const managedProductDisplay = productIds.map((pid: number) => {
        const product = products.find(
            (item: { id: number; name?: string; product_code?: string; project_name?: string }) =>
                item.id === pid || item.id === Number(pid),
        )
        return product
            ? {
                  id: product.id,
                  name: product.name,
                  code: product.product_code ?? product.id,
                  projectName: product.project_name,
              }
            : { id: pid, name: `#${pid}`, code: String(pid), projectName: '' }
    })

    const summaryCards = [
        {
            key: 'tasks',
            label: 'Công việc đang mở',
            value: String(openTasksCount),
            accent: 'text-blue-600',
        },
        {
            key: 'contracts',
            label: 'Hợp đồng liên quan',
            value: String(relatedContracts.length || detail.link_contracts_count || 0),
            accent: 'text-violet-600',
        },
        {
            key: 'products',
            label: 'Bất động sản cho thuê',
            value: String(productIds.length),
            accent: 'text-emerald-600',
        },
        {
            key: 'care-fee',
            label: 'Phí care hàng tháng',
            value: careFeeDisplay || '—',
            accent: 'text-amber-600',
        },
    ]

    const assetValue =
        (leaseContractsData?.data.reduce((sum, contract) => sum + (contract.product_value ?? 0), 0) ?? 0) *
        ONE_BILLION_THRESHOLD

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Breadcrumb
                    className="*:items-center"
                    items={[
                        {
                            title: (
                                <Link to="/">
                                    <GoHome size={24} />
                                </Link>
                            ),
                        },
                        { title: <Link to="/care">Danh sách Care</Link>, className: 'text-md font-medium' },
                        { title: detail.case_code, className: 'text-md font-medium' },
                    ]}
                />
            </Card>

            <CareCaseDetailHeader
                caseCode={detail.case_code}
                customerName={detail.customer?.name || detail.customer?.full_name || '—'}
                status={displayStatus}
                onBack={() => navigate('/care')}
                onStatusChange={handleStatusChange}
                onEdit={() => setEditModalOpen(true)}
                isUpdatingStatus={isUpdatingStatus}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(card => (
                    <Card
                        key={card.key}
                        className="!rounded-xl !border !border-slate-200 shadow-sm [&_.ant-card-body]:!p-4">
                        <div className="min-w-0">
                            <Typography.Text className="block text-xs font-semibold uppercase tracking-wide !text-slate-400">
                                {card.label}
                            </Typography.Text>
                            <Typography.Text
                                className={`mt-2 block text-2xl font-bold ${card.accent} whitespace-nowrap`}>
                                {card.value}
                            </Typography.Text>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="!rounded-xl !border !border-slate-200 shadow-sm [&_.ant-card-body]:!p-3">
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={[...CARE_DETAIL_TABS]} />
            </Card>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0">
                    {activeTab === 'assets-contracts' && (
                        <Space direction="vertical" size={16} className="w-full">
                            <Card
                                className="!rounded-xl !border !border-slate-200 shadow-sm"
                                title={
                                    <Flex justify="space-between" align="center" className="!text-slate-800">
                                        <span>Tài sản đang quản lý</span>
                                        <Tag color="blue">{managedProductDisplay.length}</Tag>
                                    </Flex>
                                }>
                                {managedProductDisplay.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                        {managedProductDisplay.map(
                                            (product: {
                                                id: number
                                                name?: string
                                                code: string | number
                                                projectName?: string
                                            }) => (
                                                <div
                                                    key={product.id}
                                                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-white">
                                                    <Flex align="start" gap={12}>
                                                        <div className="min-w-0 flex-1">
                                                            <Typography.Link
                                                                href={`/products/${product.id}/hub`}
                                                                className="block truncate font-semibold">
                                                                {product.name}
                                                            </Typography.Link>
                                                            <Typography.Text className="block text-xs !text-slate-500">
                                                                Mã: {product.code}
                                                            </Typography.Text>
                                                            <Typography.Text className="block text-xs !text-slate-500">
                                                                {product.projectName || 'Chưa có dự án'}
                                                            </Typography.Text>
                                                        </div>
                                                    </Flex>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Chưa có bất động sản liên kết"
                                    />
                                )}
                            </Card>

                            <Card
                                className="!rounded-xl !border !border-slate-200 shadow-sm"
                                title={
                                    <Flex justify="space-between" align="center" className="!text-slate-800">
                                        <span>Hợp đồng liên quan</span>
                                        <Tag color="purple">{relatedContracts.length}</Tag>
                                    </Flex>
                                }>
                                {relatedContracts.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                        {relatedContracts.map(contract => (
                                            <div
                                                key={contract.id}
                                                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-white">
                                                <Flex align="start" gap={12}>
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                                                        <FileTextOutlined className="!text-violet-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <Flex justify="space-between" align="center" gap={8}>
                                                            <Typography.Link
                                                                href={`/lease-contracts/${contract.id}/hub`}
                                                                className="block truncate font-semibold">
                                                                {contract.product_rel?.name ??
                                                                    `Hợp đồng #${contract.id}`}
                                                            </Typography.Link>
                                                            <Tag
                                                                color={
                                                                    contract.status === 'ACTIVE'
                                                                        ? 'green'
                                                                        : contract.status === 'EXPIRED'
                                                                          ? 'default'
                                                                          : 'orange'
                                                                }
                                                                className="shrink-0">
                                                                {LEASE_STATUS_LABEL_MAP[contract.status]}
                                                            </Tag>
                                                        </Flex>
                                                        <Typography.Text className="block text-xs !text-slate-500">
                                                            Phía thuê: {contract.tenant_rel?.name ?? '—'}
                                                        </Typography.Text>
                                                        {contract.landlord_rel?.name !== detail.customer_name && (
                                                            <Typography.Text className="block text-xs !text-slate-500">
                                                                Chủ nhà: {contract.landlord_rel?.name ?? '—'}
                                                            </Typography.Text>
                                                        )}
                                                        <Typography.Text className="block text-xs !text-slate-500">
                                                            {contract.start_date} → {contract.end_date}
                                                        </Typography.Text>
                                                        <Typography.Text className="block text-xs font-medium !text-violet-600">
                                                            {contract.price?.toLocaleString('vi-VN')} Tr/
                                                            {contract.billing_unit === 'MONTH' ? 'tháng' : 'năm'}
                                                        </Typography.Text>
                                                    </div>
                                                </Flex>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Chưa có hợp đồng liên quan"
                                    />
                                )}
                            </Card>
                        </Space>
                    )}
                    {activeTab === 'tax' && (
                        <CareCaseTaxTab
                            caseId={caseId}
                            taxConfig={{
                                taxMethod,
                                setTaxMethod,
                                taxRate,
                                setTaxRate,
                                taxThreshold,
                                setTaxThreshold,
                                taxYear,
                                setTaxYear,
                            }}
                        />
                    )}
                    {activeTab === 'roi' && (
                        <CareCaseRoiTab
                            caseId={caseId}
                            customerName={detail.customer?.name || detail.customer?.full_name || '—'}
                            assetValue={assetValue}
                            taxConfig={{
                                taxMethod,
                                taxRate,
                                taxThreshold,
                                taxYear,
                                setTaxYear,
                            }}
                        />
                    )}
                    {activeTab === 'cashflow' && (
                        <CareCaseCashflowTab
                            caseId={caseId}
                            assetValue={assetValue}
                            taxConfig={{
                                taxMethod,
                                taxRate,
                                taxThreshold,
                                taxYear,
                                setTaxYear,
                            }}
                        />
                    )}
                    {activeTab === 'tasks' && <CareCaseTasksTab caseId={caseId} />}
                    {activeTab === 'log' && <CareCaseLogTab caseId={caseId} />}
                </div>

                <Space direction="vertical" size={16} className="w-full">
                    <Card className="!rounded-xl !border !border-slate-200 shadow-sm">
                        <Flex align="center" gap={12} className="mb-4">
                            <Avatar size={52} icon={<UserOutlined />} className="!bg-blue-100 !text-blue-700" />
                            <div className="min-w-0">
                                <Typography.Text className="block text-xs font-semibold uppercase tracking-wide !text-slate-400">
                                    Khách hàng
                                </Typography.Text>
                                <Typography.Text className="block truncate text-lg font-semibold !text-slate-800">
                                    {detail.customer?.name || detail.customer?.full_name || 'Chưa có tên khách hàng'}
                                </Typography.Text>
                            </div>
                        </Flex>

                        <Space direction="vertical" size={14} className="w-full">
                            <div>
                                <Typography.Text strong className="mb-2 block !text-slate-500">
                                    Thông tin liên hệ
                                </Typography.Text>
                                <Space direction="vertical" size={10} className="w-full">
                                    <Flex align="center" gap={8}>
                                        <PhoneOutlined className="text-slate-400" />
                                        <Typography.Text>{customer?.phone || '—'}</Typography.Text>
                                    </Flex>
                                    <Flex align="center" gap={8}>
                                        <MailOutlined className="text-slate-400" />
                                        <Typography.Text>{customer?.email || 'Chưa có email'}</Typography.Text>
                                    </Flex>
                                </Space>
                            </div>

                            <div>
                                <Typography.Text strong className="mb-2 block !text-slate-500">
                                    Người phụ trách
                                </Typography.Text>
                                <Typography.Text>{detail.assigned_to_name || 'Chưa phân công'}</Typography.Text>
                            </div>

                            <div>
                                <Typography.Text strong className="mb-2 block !text-slate-500">
                                    Tương tác cuối
                                </Typography.Text>
                                <Flex align="center" gap={8}>
                                    <ClockCircleOutlined className="text-slate-400" />
                                    <Typography.Text>
                                        {detail.last_interaction_display || detail.updated_at || '—'}
                                    </Typography.Text>
                                </Flex>
                            </div>
                            <div>
                                <Typography.Text strong className="mb-2 block !text-slate-500">
                                    Ghi chú
                                </Typography.Text>
                                <Typography.Paragraph className="!mb-0 !text-slate-600">
                                    {detail.note || 'Chưa có ghi chú'}
                                </Typography.Paragraph>
                            </div>
                        </Space>
                    </Card>
                </Space>
            </div>

            <EditCareCaseModal
                open={editModalOpen}
                onCancel={() => setEditModalOpen(false)}
                record={recordForEdit}
                form={editForm}
                loading={isUpdatingCareCase}
                onOpenAddCustomerModal={() => setAddCustomerModalOpen(true)}
                newlyCreatedCustomer={newlyCreatedCustomer}
                onOk={handleEditCareCaseSubmit}
            />
            <AddCustomerModal
                open={addCustomerModalOpen}
                onCancel={() => setAddCustomerModalOpen(false)}
                onSubmit={handleAddCustomerSubmit}
                form={customerForm}
            />
        </Space>
    )
}

export default CareCaseDetail
