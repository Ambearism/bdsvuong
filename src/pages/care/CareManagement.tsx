import React, { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import {
    Card,
    Space,
    Typography,
    Button,
    Table,
    Input,
    Row,
    Col,
    Flex,
    Tag,
    Badge,
    Breadcrumb,
    Select,
    Form,
    message,
    Tooltip,
    Avatar,
} from 'antd'
import { PlusOutlined, ClockCircleOutlined, ProductOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons'
import { GoHome } from 'react-icons/go'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { app } from '@/config/app'
import type { ColumnsType } from 'antd/es/table'
import CreateCareCaseModal from '@/components/modals/care/CreateCareCaseModal'
import AddCustomerModal from '@/components/modals/care/AddCustomerModal'
import EditCareCaseModal from '@/components/modals/care/EditCareCaseModal'
import CashflowEntryModal from '@/pages/lease-contracts/CashflowEntryModal'
import {
    useGetCareCaseListQuery,
    useCreateCareCaseMutation,
    useUpdateCareCaseStatusMutation,
    useUpdateCareCaseMutation,
    useGetCareCaseStatisticsQuery,
} from '@/api/care-case'
import { STATUS, STATUS_LABEL_MAP, type StatusValue } from '@/config/constant'

import type { CareCaseItem } from '@/types/care-case'
import type { CustomerItem } from '@/types/customer'

const CareManagement: React.FC = () => {
    useDocumentTitle('Quản Lý Chăm Sóc (Care)')
    const navigate = useNavigate()
    const { hasPermission } = usePermission()
    const [search, setSearch] = useState<string>('')
    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)
    const [statusFilter, setStatusFilter] = useState<StatusValue | undefined>(undefined)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [addCustomerModalOpen, setAddCustomerModalOpen] = useState<boolean>(false)
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [selectedCareCase, setSelectedCareCase] = useState<CareCaseItem | null>(null)
    const [form] = Form.useForm()
    const [editForm] = Form.useForm()
    const [customerForm] = Form.useForm()
    const [cashflowModalOpen, setCashflowModalOpen] = useState<boolean>(false)
    const [cashflowCareId, setCashflowCareId] = useState<number | undefined>(undefined)
    const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<CustomerItem | null>(null)

    const handleOpenModal = useCallback(() => {
        setModalOpen(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        setModalOpen(false)
        setNewlyCreatedCustomer(null)
        form.resetFields()
    }, [form])

    const handleOpenAddCustomerModal = useCallback(() => {
        setAddCustomerModalOpen(true)
    }, [])

    const handleCloseEditModal = useCallback(() => {
        setEditModalOpen(false)
        setSelectedCareCase(null)
        setNewlyCreatedCustomer(null)
        editForm.resetFields()
    }, [editForm])

    const handleAddCustomerSubmit = useCallback(
        (customer: CustomerItem) => {
            const targetForm = selectedCareCase ? editForm : form
            targetForm.setFieldsValue({
                customer_id: customer.id,
            })
            setNewlyCreatedCustomer(customer)
            setAddCustomerModalOpen(false)
        },
        [selectedCareCase, editForm, form],
    )

    const debouncedSearch = useDebounce(search, 500)

    const { data, isLoading, refetch } = useGetCareCaseListQuery(
        {
            page,
            per_page: app.DEFAULT_PAGE_SIZE,
            status: statusFilter,
            keyword: debouncedSearch || undefined,
        },
        { refetchOnMountOrArgChange: true },
    )

    const [createCareCase, { isLoading: isCreatingCase }] = useCreateCareCaseMutation()
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateCareCaseStatusMutation()
    const [updateCareCase, { isLoading: isUpdatingCareCase }] = useUpdateCareCaseMutation()

    const dataSource = useMemo(() => data?.data?.items ?? [], [data])
    const total = data?.data?.total ?? 0

    const handleResetFilter = () => {
        setSearch('')
        setStatusFilter(undefined)
        setPage(app.DEFAULT_PAGE)
    }

    const handleStatusChange = useCallback(
        async (caseCode: string, status: StatusValue) => {
            try {
                await updateStatus({
                    case_code: caseCode,
                    status,
                }).unwrap()
                message.success('Cập nhật trạng thái thành công')
                refetch()
            } catch {
                message.error('Cập nhật trạng thái thất bại')
            }
        },
        [updateStatus, refetch],
    )

    const statusSelectOptions = useMemo(
        () =>
            [STATUS.ACTIVE, STATUS.INACTIVE].map(status => {
                const color = status === STATUS.ACTIVE ? 'success' : 'default'
                return {
                    value: status,
                    label: <Badge status={color} text={STATUS_LABEL_MAP[status]} />,
                    tagLabel: (
                        <Tag color={color} className="m-0">
                            {STATUS_LABEL_MAP[status]}
                        </Tag>
                    ),
                }
            }),
        [],
    )

    const handleEditCareCaseSubmit = useCallback(
        async (values: Record<string, unknown>) => {
            if (!selectedCareCase) return
            const realEstate = (values.related_bds ?? []) as number[]
            const payload = {
                customer_id:
                    values.customer_id != null && values.customer_id !== '' ? Number(values.customer_id) : undefined,
                related_bds: (Array.isArray(realEstate) ? realEstate : []).map(Number),
                care_fee: values.care_fee != null && values.care_fee !== '' ? Number(values.care_fee) : undefined,
                assigned_to:
                    values.assigned_to != null && values.assigned_to !== '' ? Number(values.assigned_to) : undefined,
                note: values.note ? String(values.note) : undefined,
                contract_files: values.contract_files ? String(values.contract_files) : undefined,
            }
            const fileList = values.images as Array<{ originFileObj?: File }> | undefined
            const imageFiles = (fileList ?? []).map(f => f?.originFileObj).filter((f): f is File => f != null)
            try {
                await updateCareCase({ care_case_id: selectedCareCase.id, payload, images: imageFiles }).unwrap()
                message.success('Đã cập nhật Care thành công')
                handleCloseEditModal()
                refetch()
            } catch (err: unknown) {
                const e = err as { data?: { errors?: Array<{ msg?: string }> } }
                message.error(e?.data?.errors?.[0]?.msg || 'Cập nhật thất bại')
            }
        },
        [selectedCareCase, updateCareCase, handleCloseEditModal, refetch],
    )

    const handleCreateCaseSubmit = useCallback(
        async (values: Record<string, unknown>) => {
            const realEstate = (values.related_bds ?? []) as number[]
            const careFee = values.care_fee
            const payload = {
                customer_id: Number(values.customer_id),
                related_bds: (Array.isArray(realEstate) ? realEstate : []).map(Number),
                care_fee: careFee != null && careFee !== '' ? Number(careFee) : undefined,
                assigned_to:
                    values.assigned_to != null && values.assigned_to !== '' ? Number(values.assigned_to) : undefined,
                note: values.note ? String(values.note) : undefined,
                status: STATUS.ACTIVE,
                contract_files: values.contract_files ? String(values.contract_files) : undefined,
            }
            const fileList = values.images as Array<{ originFileObj?: File }> | undefined
            const imageFiles = (fileList ?? []).map(f => f?.originFileObj).filter((f): f is File => f != null)
            try {
                await createCareCase({ payload, images: imageFiles }).unwrap()
                message.success('Đã mở Care thành công')
                handleCloseModal()
                refetch()
            } catch (err: unknown) {
                const e = err as { data?: { errors?: Array<{ msg?: string }> } }
                message.error(e?.data?.errors?.[0]?.msg || 'Mở Care thất bại')
            }
        },
        [createCareCase, handleCloseModal, refetch],
    )

    const columns: ColumnsType<CareCaseItem> = useMemo(
        () => [
            {
                title: 'Mã Care',
                dataIndex: 'case_code',
                key: 'case_code',
                width: 120,
                fixed: 'left',
                render: (caseCode: string, record) =>
                    hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.READ) ? (
                        <Button
                            size="small"
                            type="default"
                            className="!bg-gray-100 !border !border-gray-300 font-medium"
                            onClick={() => navigate(`/care/${record.id}`)}>
                            {caseCode}
                        </Button>
                    ) : (
                        <Typography.Text className="font-medium">{caseCode}</Typography.Text>
                    ),
            },
            {
                title: 'Chủ nhà',
                key: 'customer',
                width: 250,
                render: (_, record) => {
                    const name = record.customer?.name || record.customer?.full_name || '—'
                    return (
                        <Flex vertical gap={2}>
                            <Typography.Text strong className="line-clamp-1 !text-slate-700">
                                {name}
                            </Typography.Text>
                            <Typography.Text type="secondary" className="text-xs">
                                ID: #{record.customer_id}
                            </Typography.Text>
                        </Flex>
                    )
                },
            },
            {
                title: 'Tài sản & HĐ',
                key: 'management',
                width: 220,
                render: (_, record) => {
                    const assetCount = Array.isArray(record.related_bds)
                        ? record.related_bds.length
                        : record.related_bds != null
                          ? 1
                          : 0
                    return (
                        <Flex vertical gap={4}>
                            <Tag color="cyan" className="m-0 w-fit">
                                {assetCount} Bất động sản
                            </Tag>
                            <Tag color="purple" className="m-0 w-fit">
                                {record.link_contracts_count ?? 0} Hợp đồng thuê
                            </Tag>
                        </Flex>
                    )
                },
            },
            {
                title: 'Phí Care',
                dataIndex: 'care_fee_display',
                key: 'care_fee_display',
                width: 160,
                render: (fee: string, record) => (
                    <Typography.Text className="font-semibold text-emerald-600 whitespace-nowrap">
                        {fee || (record.care_fee ? `${record.care_fee} Tr/tháng` : '—')}
                    </Typography.Text>
                ),
            },
            {
                title: 'Tương tác cuối',
                dataIndex: 'last_interaction_display',
                key: 'last_interaction_display',
                width: 200,
                render: (date: string, record) => (
                    <Flex align="center" gap={6} className="whitespace-nowrap">
                        <ClockCircleOutlined className="text-slate-400" />
                        <Typography.Text className="text-xs text-slate-500">
                            {date || record.updated_at || '—'}
                        </Typography.Text>
                    </Flex>
                ),
            },
            {
                title: 'Phụ trách',
                dataIndex: 'assigned_to_name',
                key: 'assigned_to_name',
                width: 200,
                render: (name: string, record) => (
                    <Flex align="center" gap={8} className="whitespace-nowrap">
                        <Avatar size="small" className="!bg-indigo-600 !font-bold">
                            {record.assigned_to_initial || (name ? name.charAt(0).toUpperCase() : '?')}
                        </Avatar>
                        <Typography.Link
                            className="font-medium"
                            type={record.assigned_to_initial ? undefined : 'secondary'}
                            onClick={() =>
                                record.assigned_to_initial ? navigate(`/accounts/${record.assigned_to}/update`) : null
                            }>
                            {name || 'Chưa phân công'}
                        </Typography.Link>
                    </Flex>
                ),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: 160,
                render: (status: StatusValue, record) => (
                    <div className="w-full" onClick={e => e.stopPropagation()}>
                        <Select
                            value={status}
                            className="w-full"
                            variant="borderless"
                            popupMatchSelectWidth={false}
                            optionLabelProp="tagLabel"
                            loading={isUpdatingStatus}
                            onChange={value => handleStatusChange(record.case_code, value)}
                            options={statusSelectOptions}
                            disabled={!hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE)}
                        />
                    </div>
                ),
            },
            {
                title: 'Thao tác',
                key: 'actions',
                align: 'center',
                fixed: 'right',
                width: 160,
                render: (_, record) => (
                    <Space>
                        {hasPermission(RESOURCE_TYPE.CASH_FLOW, ACTION.CREATE) && (
                            <Tooltip title="Tạo dòng tiền">
                                <Button
                                    icon={<DollarOutlined />}
                                    size="small"
                                    color="green"
                                    variant="outlined"
                                    onClick={() => {
                                        setCashflowCareId(record.id)
                                        setCashflowModalOpen(true)
                                    }}
                                />
                            </Tooltip>
                        )}
                        {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE) && (
                            <Tooltip title="Tạo hợp đồng">
                                <Button
                                    icon={<FileTextOutlined />}
                                    size="small"
                                    color="purple"
                                    variant="outlined"
                                    onClick={() => {
                                        const productId = Array.isArray(record.related_bds)
                                            ? record.related_bds[0]
                                            : record.related_bds
                                        navigate(
                                            `/lease-contracts/create?care_id=${record.id}&landlord_id=${record.customer_id || ''}&product_id=${productId || ''}`,
                                        )
                                    }}
                                />
                            </Tooltip>
                        )}
                        {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.READ) && (
                            <Tooltip title="Xem Hub">
                                <Button
                                    icon={<ProductOutlined />}
                                    size="small"
                                    color="cyan"
                                    variant="outlined"
                                    onClick={() => navigate(`/care/${record.id}`)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                ),
            },
        ],
        [isUpdatingStatus, handleStatusChange, statusSelectOptions, navigate, hasPermission],
    )

    const { data: statsData } = useGetCareCaseStatisticsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })
    const stats = statsData?.data

    return (
        <Space direction="vertical" size="large" className="w-full">
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
                                title: 'Danh sách Care',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.CREATE) && (
                        <Button type="primary" icon={<PlusOutlined />} className="w-fit" onClick={handleOpenModal}>
                            Tạo mới
                        </Button>
                    )}
                </Flex>
            </Card>

            <Row gutter={[16, 16]} align="stretch">
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm !h-full !rounded-lg !border !border-gray-200 [&_.ant-card-body]:!p-4">
                        <div className="text-sm mb-1 !text-slate-400">TỔNG SỐ CARE (ACTIVE)</div>
                        <div className="text-[20px] font-bold !text-slate-800">{stats?.total_cases ?? 0}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm !h-full !rounded-lg !border !border-gray-200 [&_.ant-card-body]:!p-4">
                        <div className="text-sm mb-1 !text-slate-400">TÀI SẢN LIÊN KẾT</div>
                        <div className="text-[20px] font-bold !text-slate-800">{stats?.linked_assets ?? 0}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm !h-full !rounded-lg !border !border-gray-200 [&_.ant-card-body]:!p-4">
                        <div className="text-sm mb-1 !text-slate-400">TỔNG HỢP ĐỒNG THUÊ</div>
                        <div className="text-[20px] font-bold !text-slate-800">{stats?.total_contracts ?? 0}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm !h-full !rounded-lg !border !border-gray-200 [&_.ant-card-body]:!p-4">
                        <div className="text-sm mb-1 !text-slate-400">TỔNG CHI PHÍ CARE THU</div>
                        <div className="text-[20px] font-bold !text-slate-800">
                            {stats?.total_care_costs ?? '0 Tr/tháng'}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm !rounded-xl !border-slate-100 [&_.ant-card-body]:!p-0">
                <div className="p-4 border-b border-slate-50">
                    <Row gutter={16} align="middle">
                        <Col flex="auto">
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Tooltip title="Tìm kiếm theo chủ nhà, mã Care">
                                        <Input
                                            className="w-full"
                                            placeholder="Tìm kiếm theo chủ nhà, mã Care..."
                                            allowClear
                                            value={search}
                                            onChange={e => {
                                                setSearch(e.target.value)
                                                setPage(1)
                                            }}
                                        />
                                    </Tooltip>
                                </Col>
                                <Col span={12}>
                                    <Tooltip title="Lọc theo trạng thái">
                                        <Select
                                            placeholder="Trạng thái"
                                            className="w-full"
                                            allowClear
                                            value={statusFilter}
                                            optionLabelProp="tagLabel"
                                            onChange={v => {
                                                setStatusFilter(v)
                                                setPage(1)
                                            }}
                                            options={statusSelectOptions}
                                        />
                                    </Tooltip>
                                </Col>
                            </Row>
                        </Col>
                        <Col flex="none">
                            <Button type="primary" onClick={handleResetFilter}>
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </div>

                <Table<CareCaseItem>
                    dataSource={dataSource}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    bordered
                    scroll={{ x: 1500 }}
                    pagination={
                        total > app.DEFAULT_PAGE_SIZE
                            ? {
                                  current: page,
                                  pageSize: app.DEFAULT_PAGE_SIZE,
                                  total: total,
                                  onChange: setPage,
                                  responsive: true,
                                  showSizeChanger: false,
                              }
                            : false
                    }
                />
            </Card>

            <CreateCareCaseModal
                open={modalOpen}
                onCancel={handleCloseModal}
                onOk={handleCreateCaseSubmit}
                form={form}
                loading={isCreatingCase}
                onOpenAddCustomerModal={handleOpenAddCustomerModal}
                newlyCreatedCustomer={newlyCreatedCustomer}
            />

            <AddCustomerModal
                open={addCustomerModalOpen}
                onCancel={() => setAddCustomerModalOpen(false)}
                onSubmit={handleAddCustomerSubmit}
                form={customerForm}
            />

            <EditCareCaseModal
                open={editModalOpen}
                onCancel={handleCloseEditModal}
                record={selectedCareCase}
                form={editForm}
                loading={isUpdatingCareCase}
                onOpenAddCustomerModal={handleOpenAddCustomerModal}
                newlyCreatedCustomer={newlyCreatedCustomer}
                onOk={handleEditCareCaseSubmit}
            />

            <CashflowEntryModal
                open={cashflowModalOpen}
                careId={cashflowCareId}
                onCancel={() => {
                    setCashflowModalOpen(false)
                    setCashflowCareId(undefined)
                }}
                onSuccess={refetch}
            />
        </Space>
    )
}

export default CareManagement
