import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import {
    Form,
    Input,
    Select,
    Row,
    Col,
    Button,
    Tabs,
    InputNumber,
    Space,
    Divider,
    Card,
    Table,
    Tag,
    message,
    Flex,
    Typography,
    Modal,
} from 'antd'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import type { OpportunityBase, OpportunityFormProps, OpportunityStageType } from '@/types/opportunity'

import {
    OpportunityStage,
    OPPORTUNITY_STAGE_OPTIONS,
    LEAD_SOURCE_OPTIONS,
    NEED_TYPE_OPTIONS,
    EXPECTED_DATE_OPTIONS,
    REGEX_EMAIL,
    REGEX_PHONE,
    TASK_STATUS,
    TASK_STATUS_OPTIONS,
    OPPORTUNITY_PRIORITY_OPTIONS,
    OpportunityPriority,
    LEAD_STAGES,
    DEAL_STAGES,
    OPPORTUNITY_TYPE,
} from '@/config/constant'

import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import { useGetProjectListQuery } from '@/api/project'
import { useGetProductListQuery } from '@/api/product'
import { useGetAccountListQuery } from '@/api/account'
import { useGetEnumOptionsQuery } from '@/api/types'
import {
    useGetTasksByOpportunityQuery,
    useCreateOpportunityTaskMutation,
    useUpdateOpportunityTaskMutation,
    useDeleteOpportunityTaskMutation,
} from '@/api/opportunity-task'
import { useGetCustomerListQuery, useLazyGetCustomerListQuery } from '@/api/customer'
import { PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { AddOpportunityTaskModal, type OpportunityTaskFormValues } from '@/components/modals/AddOpportunityTaskModal'
import type { OpportunityTaskItem } from '@/types/opportunity-task'

import { formatter, parser } from '@/utils/number-utils'
import { app } from '@/config/app'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import BaseFileUpload from '@/components/base/BaseFileUpload'
const { TextArea } = Input

const TAB_KEYS = {
    CONTACT_INFO: 'contact_info',
    LOCATION_BUDGET: 'location_budget',
    SOURCE_ASSIGNMENT: 'source_assignment',
    NOTES: 'notes',
} as const

type CustomerSelectCache = { name?: string; phone?: string; email?: string; gender?: boolean }
type ProductSelectCache = {
    project_id?: number
    zone_province_id?: number
    zone_ward_id?: number
    product_code?: string
    name?: string
}
type AccountSelectCache = { full_name?: string; account_name?: string }

const taskStatusColors: Record<number, string> = {
    [TASK_STATUS.PENDING]: 'default',
    [TASK_STATUS.IN_PROGRESS]: 'blue',
    [TASK_STATUS.COMPLETED]: 'success',
    [TASK_STATUS.CANCELLED]: 'error',
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({
    form,
    onFinish,
    initialValues,
    loading = false,
    onCancel,
    type: propType,
}) => {
    const type = useMemo(() => {
        if (propType) return propType
        if (initialValues?.stage) {
            if (LEAD_STAGES.includes(initialValues.stage as OpportunityStageType)) return OPPORTUNITY_TYPE.LEAD
            if (DEAL_STAGES.includes(initialValues.stage as OpportunityStageType)) return OPPORTUNITY_TYPE.DEAL
        }
        return OPPORTUNITY_TYPE.LEAD // default
    }, [propType, initialValues?.stage])

    const isLead = type === OPPORTUNITY_TYPE.LEAD
    const labelType = isLead ? 'Lead' : 'Deal'

    const [activeTabKey, setActiveTabKey] = useState<string>(TAB_KEYS.CONTACT_INFO)
    const [provinceId, setProvinceId] = useState<number | undefined>(initialValues?.zone_province_id)
    const [productSearch, setProductSearch] = useState('')
    const [customerSearch, setCustomerSearch] = useState('')
    const [accountSearch, setAccountSearch] = useState('')
    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<OpportunityTaskItem | undefined>(undefined)

    const taskInitialValues = useMemo<OpportunityTaskFormValues | undefined>(() => {
        if (!editingTask) return undefined
        return {
            task: editingTask.title,
            startDate: editingTask.start_date ? dayjs(editingTask.start_date) : null,
            endDate: dayjs(editingTask.end_date),
            assignee: editingTask.assigned_to,
            status: editingTask.status,
        }
    }, [editingTask])

    const [createTask, { isLoading: isCreatingTask }] = useCreateOpportunityTaskMutation()
    const [updateTask, { isLoading: isUpdatingTask }] = useUpdateOpportunityTaskMutation()
    const [deleteTask] = useDeleteOpportunityTaskMutation()
    const opportunityId = initialValues?.id

    const debouncedCustomerSearch = useDebounce(customerSearch, 500)
    const debouncedProductSearch = useDebounce(productSearch, 500)
    const debouncedAccountSearch = useDebounce(accountSearch, 500)

    const [customerPage, setCustomerPage] = useState(app.DEFAULT_PAGE)
    const { data: customersData, isFetching: isLoadingCustomers } = useGetCustomerListQuery(
        {
            keyword: debouncedCustomerSearch || undefined,
            page: customerPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )
    const { accumulatedItems: customerOptionsData, handleScroll: handleCustomerScroll } = useSelectInfiniteScroll({
        items: (customersData?.data?.items ?? []) as Array<{
            id: number
            name?: string
            phone?: string
            email?: string
            gender?: boolean
        }>,
        isFetching: isLoadingCustomers,
        debouncedKeyword: debouncedCustomerSearch,
        page: customerPage,
        setPage: setCustomerPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const {
        data: tasksData,
        refetch: refetchTasks,
        isLoading: isLoadingTasksList,
    } = useGetTasksByOpportunityQuery(opportunityId!, { skip: !opportunityId })

    const [checkCustomerByPhone] = useLazyGetCustomerListQuery()

    const { data: provincesData, isLoading: isLoadingProvinces } = useGetProvinceListQuery()
    const { data: wardsData, isLoading: isLoadingWards } = useGetWardsByProvinceIdQuery(
        { province_id: provinceId! },
        {
            skip: !provinceId,
        },
    )
    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjectListQuery(
        {
            page: app.DEFAULT_PAGE,
            per_page: app.FETCH_ALL,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )
    const [productPage, setProductPage] = useState(app.DEFAULT_PAGE)
    const { data: productsData, isFetching: isLoadingProducts } = useGetProductListQuery(
        {
            keyword: debouncedProductSearch || undefined,
            page: productPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )
    const { accumulatedItems: productOptionsData, handleScroll: handleProductScroll } = useSelectInfiniteScroll({
        items: (productsData?.data?.items ?? []) as Array<{
            id: number
            name?: string
            product_code?: string
            project_id?: number
            zone_province_id?: number
            zone_ward_id?: number
        }>,
        isFetching: isLoadingProducts,
        debouncedKeyword: debouncedProductSearch,
        page: productPage,
        setPage: setProductPage,
        pageSize: app.BIG_PAGE_SIZE,
    })
    const [accountPage, setAccountPage] = useState(app.DEFAULT_PAGE)
    const { data: accountsData, isFetching: isLoadingAccounts } = useGetAccountListQuery(
        {
            keyword: debouncedAccountSearch || undefined,
            page: accountPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )
    const { accumulatedItems: accountOptionsData, handleScroll: handleAccountScroll } = useSelectInfiniteScroll({
        items: (accountsData?.data?.list ?? []) as Array<{ id: number; full_name?: string; account_name?: string }>,
        isFetching: isLoadingAccounts,
        debouncedKeyword: debouncedAccountSearch,
        page: accountPage,
        setPage: setAccountPage,
        pageSize: app.BIG_PAGE_SIZE,
    })
    const { data: enumData, isLoading: isLoadingEnums } = useGetEnumOptionsQuery(['product_types'])

    const phoneValue = Form.useWatch('phone', form)
    const customerId = Form.useWatch('customer_id', form)
    const productId = Form.useWatch('product_id', form)
    const debouncedPhone = useDebounce(phoneValue, 500)

    const customerMapRef = useRef<Map<number, CustomerSelectCache>>(new Map())
    const productMapRef = useRef<Map<number, ProductSelectCache>>(new Map())
    const accountMapRef = useRef<Map<number, AccountSelectCache>>(new Map())

    useEffect(() => {
        customerOptionsData.forEach(customer => {
            customerMapRef.current.set(customer.id, {
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                gender: customer.gender,
            })
        })
    }, [customerOptionsData])

    useEffect(() => {
        productOptionsData.forEach(product => {
            productMapRef.current.set(product.id, {
                project_id: product.project_id,
                zone_province_id: product.zone_province_id,
                zone_ward_id: product.zone_ward_id,
                product_code: product.product_code,
                name: product.name,
            })
        })
    }, [productOptionsData])

    useEffect(() => {
        accountOptionsData.forEach(account => {
            accountMapRef.current.set(account.id, {
                full_name: account.full_name,
                account_name: account.account_name,
            })
        })
    }, [accountOptionsData])

    const customerOptions = useMemo(() => {
        const options = customerOptionsData.map(customer => ({
            value: customer.id,
            label: `${customer.name} - ${customer.phone}`,
        }))

        if (customerId && !options.some(option => option.value === customerId)) {
            const customer = customerMapRef.current.get(Number(customerId))
            options.push({
                value: Number(customerId),
                label: customer ? `${customer.name} - ${customer.phone}` : `#${customerId}`,
            })
        }

        return options
    }, [customerOptionsData, customerId])

    const productOptions = useMemo(() => {
        const options = productOptionsData.map(product => ({
            value: product.id,
            label: `${product.product_code || product.id} - ${product.name}`,
        }))

        if (productId && !options.some(option => option.value === productId)) {
            const product = productMapRef.current.get(Number(productId))
            options.push({
                value: Number(productId),
                label: product ? `${product.product_code || productId} - ${product.name}` : `#${productId}`,
            })
        }

        return options
    }, [productOptionsData, productId])

    const accountOptions = useMemo(
        () =>
            accountOptionsData.map(account => ({
                value: account.id,
                label: account.full_name || account.account_name || `#${account.id}`,
            })),
        [accountOptionsData],
    )

    useEffect(() => {
        if (debouncedCustomerSearch && !isLoadingCustomers && customerOptionsData.length === 0 && !customerId) {
            const isPhoneNumber = /^[0-9+() -]{10,15}$/.test(debouncedCustomerSearch)
            if (isPhoneNumber) {
                const currentPhone = form.getFieldValue('phone')
                if (currentPhone !== debouncedCustomerSearch) {
                    message.info('Vui lòng tạo khách hàng mới')
                    form.setFieldsValue({ phone: debouncedCustomerSearch })
                }
            }
        }
    }, [debouncedCustomerSearch, isLoadingCustomers, customerOptionsData, customerId, form])

    React.useEffect(() => {
        if (customerId) {
            form.setFields([{ name: 'phone', errors: [] }])
            return
        }

        const checkPhone = async () => {
            if (!debouncedPhone) return

            const res = await checkCustomerByPhone({ keyword: debouncedPhone }).unwrap()
            const existing = res.data?.items?.find(customer => customer.phone === debouncedPhone)

            if (existing) {
                form.setFields([
                    {
                        name: 'phone',
                        errors: [`SĐT này thuộc về KH: ${existing.name} (Sử dụng tìm kiếm để chọn)`],
                    },
                ])
            } else {
                const currentErrors = form.getFieldError('phone')
                if (currentErrors.length > 0) {
                    form.setFields([{ name: 'phone', errors: [] }])
                }
            }
        }

        checkPhone()
    }, [debouncedPhone, customerId, checkCustomerByPhone, form])

    const handleAddNewTask = useCallback(() => {
        setEditingTask(undefined)
        setTaskModalOpen(true)
    }, [])

    const handleCustomerSelect = useCallback(
        (val: number) => {
            const customer = customerMapRef.current.get(val)
            if (customer) {
                form.setFieldsValue({
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    gender: customer.gender,
                })
            }
        },
        [form],
    )

    const handleProductSelect = useCallback(
        (val: number) => {
            const product = productMapRef.current.get(val)
            if (product) {
                form.setFieldsValue({
                    project_id: product.project_id,
                    zone_province_id: product.zone_province_id,
                    zone_ward_id: product.zone_ward_id,
                })
                if (product.zone_province_id) {
                    setProvinceId(product.zone_province_id)
                }
            }
        },
        [form],
    )

    const handleCustomerInputChange = () => {
        form.setFieldsValue({ customer_id: undefined })
    }

    const handlePriorityChange = useCallback(
        (val?: number) => {
            if (val !== OpportunityPriority.LOST) {
                form.setFieldValue('lost_reason', undefined)
            }
        },
        [form],
    )

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues)
            if (initialValues.zone_province_id) {
                setProvinceId(initialValues.zone_province_id)
            }
        }
    }, [initialValues, form])

    useEffect(() => {
        if (initialValues && provinceId === initialValues.zone_province_id) return
        form.setFieldsValue({ zone_ward_id: undefined })
    }, [provinceId, form, initialValues])

    const handleFinish = useCallback(
        async (values: OpportunityBase) => {
            try {
                const normalizedValues = {
                    ...values,
                    priority: values.priority ?? null,
                }
                onFinish(normalizedValues as OpportunityBase)
            } catch {
                message.error('Có lỗi xảy ra, vui lòng thử lại.')
            }
        },
        [onFinish],
    )

    const handleTaskSubmit = async (values: OpportunityTaskFormValues) => {
        if (!opportunityId) return
        try {
            const payload = {
                title: values.task,
                notes: values.task,
                assigned_to: values.assignee,
                start_date: values.startDate?.toISOString() || undefined,
                end_date: values.endDate.toISOString(),
                status: values.status || 1,
            }

            if (editingTask) {
                await updateTask({
                    task_id: editingTask.id,
                    payload,
                }).unwrap()
                message.success('Cập nhật tác vụ thành công')
            } else {
                await createTask({
                    opportunity_id: opportunityId,
                    payload,
                }).unwrap()
                message.success('Thêm tác vụ thành công')
            }
            refetchTasks()
            setTaskModalOpen(false)
        } catch {
            message.error('Thao tác thất bại')
        }
    }

    const handleEditTask = useCallback((record: OpportunityTaskItem) => {
        setEditingTask(record)
        setTaskModalOpen(true)
    }, [])

    const handleDeleteTask = useCallback(
        (id: number) => {
            Modal.confirm({
                title: 'Xác nhận xóa tác vụ',
                icon: <ExclamationCircleOutlined />,
                content: 'Bạn có chắc chắn muốn xóa tác vụ này không? Hành động này không thể hoàn tác.',
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                    try {
                        await deleteTask(id).unwrap()
                        message.success('Xóa tác vụ thành công')
                        refetchTasks()
                    } catch {
                        message.error('Xóa tác vụ thất bại')
                    }
                },
            })
        },
        [deleteTask, refetchTasks],
    )

    const taskColumns: ColumnsType<OpportunityTaskItem> = useMemo(
        () => [
            {
                title: 'ID',
                dataIndex: 'id',
                width: 80,
                align: 'center',
            },
            {
                title: 'Nội dung',
                dataIndex: 'title',
                align: 'left',
            },
            {
                title: 'Ngày bắt đầu',
                dataIndex: 'start_date',
                width: 160,
                align: 'center',
                render: (date: string) => (
                    <span className="text-gray-500">{date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'}</span>
                ),
            },
            {
                title: 'Ngày kết thúc',
                dataIndex: 'end_date',
                width: 160,
                align: 'center',
                render: (date: string) => (
                    <span className="text-gray-500">{date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'}</span>
                ),
            },
            {
                title: 'Người chịu trách nhiệm',
                width: 200,
                align: 'center',
                render: (_: unknown, record: OpportunityTaskItem) => {
                    const displayName =
                        record.assigned_to_info?.full_name || record.assigned_to_info?.account_name || 'Hệ thống'
                    return (
                        <Flex align="center" gap={8} justify="center">
                            <UserOutlined className="text-gray-400" />
                            <span>{displayName}</span>
                        </Flex>
                    )
                },
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                width: 140,
                align: 'center',
                render: (status: number) => {
                    const option = TASK_STATUS_OPTIONS.find(opt => opt.value === status)
                    const color = taskStatusColors[status] || 'default'
                    return <Tag color={color}>{option?.label || 'Chưa xác định'}</Tag>
                },
            },
            {
                title: 'Thao tác',
                width: 100,
                align: 'center',
                render: (_: unknown, record: OpportunityTaskItem) => (
                    <Space size="small">
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditTask(record)}
                        />
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteTask(record.id)}
                        />
                    </Space>
                ),
            },
        ],
        [handleEditTask, handleDeleteTask],
    )

    const tabItems = [
        {
            key: TAB_KEYS.CONTACT_INFO,
            label: `Thông tin ${labelType} & Liên hệ`,
            forceRender: true,
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Flex justify="space-between" align="center" className="!mb-2">
                                <span className="text-sm font-medium text-gray-700">Thông tin Khách hàng</span>
                            </Flex>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tìm khách hàng"
                                name="customer_id"
                                rules={[{ required: false, message: 'Vui lòng chọn khách hàng' }]}>
                                <Select
                                    showSearch
                                    placeholder="Tìm theo Tên/SĐT"
                                    loading={isLoadingCustomers}
                                    filterOption={false}
                                    onSearch={setCustomerSearch}
                                    onPopupScroll={handleCustomerScroll}
                                    onChange={handleCustomerSelect}
                                    options={customerOptions}
                                    allowClear
                                    notFoundContent={
                                        debouncedCustomerSearch ? (
                                            <span className="text-gray-500">Vui lòng tạo khách hàng mới</span>
                                        ) : undefined
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tên khách hàng"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                                <Input placeholder="Tên khách hàng..." onChange={handleCustomerInputChange} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    { required: true, message: 'Nhập sđt' },
                                    { pattern: REGEX_PHONE, message: 'SĐT không hợp lệ' },
                                ]}>
                                <Input placeholder="Nhập SĐT..." onChange={handleCustomerInputChange} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        pattern: REGEX_EMAIL,
                                        message: 'Vui lòng nhập đúng định dạng email!',
                                    },
                                ]}>
                                <Input placeholder="Nhập Email..." />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Nhu cầu chính"
                                name="need"
                                rules={[{ required: false, message: 'Vui lòng chọn nhu cầu' }]}>
                                <Select placeholder="Chọn nhu cầu" options={NEED_TYPE_OPTIONS} allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Giới tính" name="gender">
                                <Select placeholder="Chọn giới tính" allowClear>
                                    <Select.Option value={true}>Nam</Select.Option>
                                    <Select.Option value={false}>Nữ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Loại BĐS quan tâm" name="product_type_id">
                                <Select
                                    placeholder="Chọn loại BĐS"
                                    loading={isLoadingEnums}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={enumData?.data?.product_types}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            ),
        },
        {
            key: TAB_KEYS.LOCATION_BUDGET,
            label: 'Khu vực & Ngân sách',
            forceRender: true,
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Bất Động Sản" name="product_id">
                                <Select
                                    showSearch
                                    placeholder="Chọn BĐS trong list Hàng Hoá"
                                    loading={isLoadingProducts}
                                    filterOption={false}
                                    onSearch={setProductSearch}
                                    onPopupScroll={handleProductScroll}
                                    allowClear
                                    onChange={handleProductSelect}
                                    options={productOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Nhóm Dự Án/Khu vực" name="project_id">
                                <Select
                                    placeholder="Chọn dự án"
                                    loading={isLoadingProjects}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={projectsData?.data?.items?.map(project => ({
                                        value: project.id,
                                        label: project.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Tỉnh / Thành phố" name="zone_province_id">
                                <Select
                                    showSearch
                                    placeholder="Chọn tỉnh/thành phố"
                                    loading={isLoadingProvinces}
                                    onChange={setProvinceId}
                                    allowClear
                                    optionFilterProp="label"
                                    options={provincesData?.data?.items?.map(province => ({
                                        value: province.id,
                                        label: province.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Xã/Phường" name="zone_ward_id">
                                <Select
                                    showSearch
                                    placeholder="Chọn xã/phường"
                                    loading={isLoadingWards}
                                    disabled={!provinceId}
                                    allowClear
                                    optionFilterProp="label"
                                    options={wardsData?.data?.items?.map(ward => ({
                                        value: ward.id,
                                        label: ward.name,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Diện Tích Tối Thiểu" name="min_acreage">
                                <InputNumber
                                    className="!w-full"
                                    placeholder="0"
                                    min={0}
                                    addonAfter="m²"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Diện Tích Tối Đa"
                                name="max_acreage"
                                dependencies={['min_acreage']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || !getFieldValue('min_acreage')) {
                                                return Promise.resolve()
                                            }
                                            if (value < getFieldValue('min_acreage')) {
                                                return Promise.reject(
                                                    new Error('Diện tích tối đa phải lớn hơn tối thiểu'),
                                                )
                                            }
                                            return Promise.resolve()
                                        },
                                    }),
                                ]}>
                                <InputNumber
                                    className="!w-full"
                                    placeholder="120"
                                    min={0}
                                    addonAfter="m²"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Ngân sách tối thiểu (Tỷ)" name="budget_min">
                                <InputNumber
                                    className="!w-full"
                                    placeholder="10.5"
                                    min={0}
                                    addonAfter="Tỷ"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Ngân sách tối đa (Tỷ)"
                                name="budget_max"
                                dependencies={['budget_min']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || !getFieldValue('budget_min')) {
                                                return Promise.resolve()
                                            }
                                            if (value < getFieldValue('budget_min')) {
                                                return Promise.reject(
                                                    new Error('Ngân sách tối đa phải lớn hơn tối thiểu'),
                                                )
                                            }
                                            return Promise.resolve()
                                        },
                                    }),
                                ]}>
                                <InputNumber
                                    className="!w-full"
                                    placeholder="12"
                                    min={0}
                                    addonAfter="Tỷ"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Hình thức thanh toán" name="payment_method">
                                <Input placeholder="VD: Vay bank/ Tiền mặt/Hỗn Hợp" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Thời gian Giao Dịch mong muốn" name="expected_date">
                                <Select placeholder="Không xác định" allowClear options={[...EXPECTED_DATE_OPTIONS]} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            ),
        },
        {
            key: TAB_KEYS.SOURCE_ASSIGNMENT,
            label: `Nguồn ${labelType} & Phân bổ`,
            forceRender: true,
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label={`Nguồn ${labelType}`} name="lead_source">
                                <Select
                                    placeholder={`Chọn nguồn ${labelType}`}
                                    options={LEAD_SOURCE_OPTIONS}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Chi tiết nguồn" name="source_notes">
                                <Input placeholder="Điền Form ký gửi" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Chuyên Viên phụ trách"
                                name="assigned_to"
                                rules={[{ required: true, message: 'Vui lòng chọn chuyên viên phụ trách' }]}>
                                <Select
                                    placeholder="Chọn chuyên viên"
                                    loading={isLoadingAccounts}
                                    showSearch
                                    optionFilterProp="label"
                                    filterOption={false}
                                    onSearch={setAccountSearch}
                                    onPopupScroll={handleAccountScroll}
                                    options={accountOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={`Trạng thái ${labelType}`}
                                name="stage"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                                <Select placeholder="Chọn trạng thái" options={OPPORTUNITY_STAGE_OPTIONS} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Độ ưu tiên" name="priority">
                                <Select
                                    placeholder="Chọn độ ưu tiên"
                                    options={OPPORTUNITY_PRIORITY_OPTIONS}
                                    allowClear
                                    onChange={handlePriorityChange}
                                />
                            </Form.Item>
                        </Col>
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.priority !== currentValues.priority
                            }>
                            {({ getFieldValue }) =>
                                getFieldValue('priority') === OpportunityPriority.LOST ? (
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Lý do từ chối"
                                            name="lost_reason"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng nhập lý do chứng minh bị từ chối',
                                                },
                                            ]}>
                                            <TextArea rows={2} placeholder="Nhập lý do chuyển sang từ chối..." />
                                        </Form.Item>
                                    </Col>
                                ) : null
                            }
                        </Form.Item>
                    </Row>
                </Card>
            ),
        },
        {
            key: TAB_KEYS.NOTES,
            label: 'Ghi chú & Tác vụ',
            forceRender: true,
            children: (
                <Row gutter={16}>
                    <Col xs={24} md={8} xxl={6} className="md:order-last mt-4 sm:mt-0">
                        <Card
                            title={<Typography.Text strong>Tài liệu liên quan</Typography.Text>}
                            size="small"
                            className="!mb-4">
                            <Form.Item name="file_urls" noStyle>
                                <BaseFileUpload existingFiles={initialValues?.files} folder="opportunities/" />
                            </Form.Item>
                        </Card>
                    </Col>
                    <Col xs={24} md={16} xxl={18}>
                        <Card size="small" className="!rounded-tl-none">
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item label="Ghi chú" name="notes">
                                        <TextArea rows={4} placeholder={`Ghi chú chung về ${labelType}...`} />
                                    </Form.Item>
                                </Col>
                                {opportunityId && (
                                    <Col span={24}>
                                        <Divider orientation="left">Tác vụ</Divider>
                                        <Table
                                            dataSource={tasksData?.data || []}
                                            rowKey="id"
                                            pagination={{
                                                size: 'small',
                                                hideOnSinglePage: true,
                                                pageSize: 10,
                                            }}
                                            size="small"
                                            bordered
                                            loading={isLoadingTasksList || isCreatingTask || isUpdatingTask}
                                            locale={{ emptyText: 'Chưa có tác vụ nào' }}
                                            columns={taskColumns}
                                            scroll={{ x: 'max-content' }}
                                            footer={() => (
                                                <div className="text-center">
                                                    <Button
                                                        type="dashed"
                                                        block
                                                        icon={<PlusOutlined />}
                                                        onClick={handleAddNewTask}>
                                                        Thêm mới
                                                    </Button>
                                                </div>
                                            )}
                                        />
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    </Col>
                </Row>
            ),
        },
    ]

    const handleFinishFailed = useCallback(({ errorFields }: { errorFields: { name: (string | number)[] }[] }) => {
        const FIELD_TO_TAB: Record<string, string> = {
            customer_id: TAB_KEYS.CONTACT_INFO,
            name: TAB_KEYS.CONTACT_INFO,
            phone: TAB_KEYS.CONTACT_INFO,
            email: TAB_KEYS.CONTACT_INFO,
            need: TAB_KEYS.CONTACT_INFO,
            gender: TAB_KEYS.CONTACT_INFO,
            product_type_id: TAB_KEYS.CONTACT_INFO,

            product_id: TAB_KEYS.LOCATION_BUDGET,
            project_id: TAB_KEYS.LOCATION_BUDGET,
            zone_province_id: TAB_KEYS.LOCATION_BUDGET,
            zone_ward_id: TAB_KEYS.LOCATION_BUDGET,
            min_acreage: TAB_KEYS.LOCATION_BUDGET,
            max_acreage: TAB_KEYS.LOCATION_BUDGET,
            budget_min: TAB_KEYS.LOCATION_BUDGET,
            budget_max: TAB_KEYS.LOCATION_BUDGET,
            payment_method: TAB_KEYS.LOCATION_BUDGET,
            expected_date: TAB_KEYS.LOCATION_BUDGET,

            lead_source: TAB_KEYS.SOURCE_ASSIGNMENT,
            source_notes: TAB_KEYS.SOURCE_ASSIGNMENT,
            assigned_to: TAB_KEYS.SOURCE_ASSIGNMENT,

            stage: TAB_KEYS.SOURCE_ASSIGNMENT,
            priority: TAB_KEYS.SOURCE_ASSIGNMENT,

            notes: TAB_KEYS.NOTES,
        }

        for (const field of errorFields) {
            const fieldName = field.name[0] as string
            const targetTab = FIELD_TO_TAB[fieldName]
            if (targetTab) {
                setActiveTabKey(targetTab)
                break
            }
        }
    }, [])

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
            initialValues={{
                stage: isLead ? OpportunityStage.LEAD_MOI : OpportunityStage.HEN_XEM_NHA,
            }}>
            <Tabs activeKey={activeTabKey} onChange={key => setActiveTabKey(key)} items={tabItems} />

            <Row justify="center" gutter={12} className="mt-6">
                <Col>
                    <Button onClick={onCancel}>Hủy</Button>
                </Col>
                <Col>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu
                    </Button>
                </Col>
            </Row>

            <AddOpportunityTaskModal
                open={taskModalOpen}
                onCancel={() => setTaskModalOpen(false)}
                onOk={handleTaskSubmit}
                accountOptions={accountOptions}
                loading={isCreatingTask || isUpdatingTask}
                initialValues={taskInitialValues}
            />
        </Form>
    )
}

export default OpportunityForm
