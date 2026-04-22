import React, { useEffect, useMemo, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import {
    Form,
    Input,
    Select,
    Row,
    Col,
    Button,
    InputNumber,
    DatePicker,
    Typography,
    Divider,
    message,
    Collapse,
    Flex,
    Avatar,
} from 'antd'
import type { FormProps } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import type {
    TransactionBase,
    TransactionFormValues,
    TransactionFormProps,
    TransactionItem,
    ProductSelectOption,
} from '@/types/opportunity'
import type { CustomerSelectOption } from '@/types/care-case'
import {
    TransactionStage,
    TRANSACTION_STAGE_OPTIONS,
    NEED_TYPE_OPTIONS,
    REGEX_PHONE,
    OPPORTUNITY_TYPE,
    TRANSACTION_FORM_SECTIONS,
    TRANSACTION_SECTION_FIELDS,
} from '@/config/constant'

import { useGetCustomerListQuery, useLazyGetCustomerListQuery, useUpdateCustomerMutation } from '@/api/customer'
import { useGetProductListQuery } from '@/api/product'
import { useGetProjectListQuery } from '@/api/project'
import { useGetAccountListQuery } from '@/api/account'
import { useGetOpportunityListQuery } from '@/api/opportunity'
import { formatter, parser } from '@/utils/number-utils'
import { app } from '@/config/app'
import dayjs from 'dayjs'
import BaseFileUpload from '@/components/base/BaseFileUpload'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import { useRef } from 'react'
import { renderSelectLoading } from '@/utils/render-utils'

const { TextArea } = Input

const TransactionForm: React.FC<TransactionFormProps> = ({
    form,
    onFinish,
    initialValues,
    loading,
    onCancel,
    isEdit = false,
}) => {
    const [activeKeys, setActiveKeys] = useState<string[]>([TRANSACTION_FORM_SECTIONS.MAIN_INFO])
    const [customerSearch, setCustomerSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [accountSearch, setAccountSearch] = useState('')
    const debouncedCustomerSearch = useDebounce(customerSearch, 500)
    const debouncedProductSearch = useDebounce(productSearch, 500)
    const debouncedAccountSearch = useDebounce(accountSearch, 500)

    const [updateCustomer] = useUpdateCustomerMutation()

    const [customerPage, setCustomerPage] = useState(app.DEFAULT_PAGE)
    const { data: customersData, isFetching: fetchingCustomers } = useGetCustomerListQuery(
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
            label?: string
        }>,
        isFetching: fetchingCustomers,
        debouncedKeyword: debouncedCustomerSearch,
        page: customerPage,
        setPage: setCustomerPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const [productPage, setProductPage] = useState(app.DEFAULT_PAGE)
    const { data: productsData, isFetching: fetchingProducts } = useGetProductListQuery(
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
        }>,
        isFetching: fetchingProducts,
        debouncedKeyword: debouncedProductSearch,
        page: productPage,
        setPage: setProductPage,
        pageSize: app.BIG_PAGE_SIZE,
    })
    const { data: projectsData, isLoading: isLoadingProjects } = useGetProjectListQuery(
        {
            page: app.DEFAULT_PAGE,
            per_page: app.FETCH_ALL,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )
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
        items: (accountsData?.data?.list ?? []) as Array<{ id: number; full_name?: string }>,
        isFetching: isLoadingAccounts,
        debouncedKeyword: debouncedAccountSearch,
        page: accountPage,
        setPage: setAccountPage,
        pageSize: app.BIG_PAGE_SIZE,
    })
    const { data: dealsData, isLoading: isLoadingOpportunities } = useGetOpportunityListQuery(
        {
            per_page: app.BIG_PAGE_SIZE,
            type: OPPORTUNITY_TYPE.DEAL,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )

    const customerId = Form.useWatch('customer_id', form)
    const phoneValue = Form.useWatch('new_customer_phone', form)
    const debouncedPhone = useDebounce(phoneValue, 500)

    const [checkCustomerByPhone] = useLazyGetCustomerListQuery()

    const accountOptions = useMemo(
        () =>
            accountOptionsData?.map(account => ({
                value: account.id,
                label: account.full_name,
            })),
        [accountOptionsData],
    )

    const opportunityOptions = useMemo(
        () =>
            dealsData?.data?.items
                ?.filter(opportunity => !customerId || opportunity.customer_id === customerId)
                ?.map(opportunity => ({
                    value: opportunity.id,
                    label: `${opportunity.code || `#${opportunity.id}`} - ${opportunity.name || opportunity.customer_rel?.name || app.EMPTY_DISPLAY}`,
                })),
        [dealsData, customerId],
    )

    const customerMapRef = useRef<Map<number, { name: string; phone: string }>>(new Map())
    const productMapRef = useRef<Map<number, { name: string; product_code: string; project_id?: number }>>(new Map())

    useEffect(() => {
        customerOptionsData.forEach(customer => {
            customerMapRef.current.set(customer.id, {
                name: customer.name ?? '',
                phone: customer.phone ?? '',
            })
        })
    }, [customerOptionsData])

    useEffect(() => {
        productOptionsData.forEach(product => {
            productMapRef.current.set(product.id, {
                name: product.name ?? '',
                product_code: String(product.product_code ?? product.id),
                project_id: product.project_id,
            })
        })
    }, [productOptionsData])

    useEffect(() => {
        if (isEdit && initialValues) {
            const initData = initialValues as TransactionItem
            if (initData.customer) {
                customerMapRef.current.set(initData.customer.id, {
                    name: initData.customer.name,
                    phone: initData.customer.phone,
                })
            }
            if (initData.product) {
                productMapRef.current.set(initData.product.id, {
                    name: initData.product.name,
                    product_code: initData.product.product_code ?? String(initData.product.id),
                    project_id: initData.product.project_id,
                })
            }
        }
    }, [isEdit, initialValues])

    const customerOptions = useMemo(() => {
        const options = customerOptionsData.map(customer => {
            const label = customer.label || `${customer.name} - ${customer.phone}`
            return {
                value: customer.id,
                label: label,
                data: {
                    name: customer.name,
                    phone: customer.phone,
                    label: label,
                },
            }
        })

        if (customerId && !options.some(opt => opt.value === customerId)) {
            const customer = customerMapRef.current.get(Number(customerId))
            if (customer) {
                const label = `${customer.name} - ${customer.phone}`
                options.push({
                    value: Number(customerId),
                    label: label,
                    data: {
                        name: customer.name,
                        phone: customer.phone,
                        label: label,
                    },
                })
            }
        }
        return options
    }, [customerOptionsData, customerId])

    const productOptions = useMemo(() => {
        const options = productOptionsData.map(product => ({
            value: product.id,
            label: `${product.product_code || product.id} - ${product.name}`,
            name: product.name,
            product_code: product.product_code,
            project_id: product.project_id,
        }))

        const productId = form.getFieldValue('product_id')
        if (productId && !options.some(opt => opt.value === productId)) {
            const product = productMapRef.current.get(Number(productId))
            if (product) {
                options.push({
                    value: Number(productId),
                    label: `${product.product_code || productId} - ${product.name}`,
                    name: product.name,
                    product_code: product.product_code,
                    project_id: product.project_id,
                })
            }
        }
        return options
    }, [productOptionsData, form])

    const projectOptions = useMemo(
        () =>
            projectsData?.data?.items?.map(project => ({
                value: project.id,
                label: project.name,
            })),
        [projectsData],
    )

    useEffect(() => {
        if (initialValues) {
            const initData = initialValues as TransactionItem

            const formValues: TransactionFormValues = {
                ...initialValues,
                new_customer_name: initData.customer?.name || initData.customer_name,
                new_customer_phone: initData.customer?.phone,
                contract_date: initialValues.contract_date ? dayjs(initialValues.contract_date) : undefined,
                deposit_date: initialValues.deposit_date ? dayjs(initialValues.deposit_date) : undefined,
                handover_date: initialValues.handover_date ? dayjs(initialValues.handover_date) : undefined,
            } as TransactionFormValues
            form.setFieldsValue(formValues)
        }
    }, [initialValues, form])

    useEffect(() => {
        if (debouncedCustomerSearch && !fetchingCustomers && customerOptionsData.length === 0 && !customerId) {
            const isPhoneNumber = /^[0-9+() -]{10,15}$/.test(debouncedCustomerSearch)
            if (isPhoneNumber) {
                const currentPhone = form.getFieldValue('new_customer_phone')
                if (currentPhone !== debouncedCustomerSearch) {
                    message.info('Vui lòng tạo khách hàng mới')
                    form.setFieldsValue({ new_customer_phone: debouncedCustomerSearch })
                }
            }
        }
    }, [debouncedCustomerSearch, fetchingCustomers, customerOptionsData, customerId, form])

    useEffect(() => {
        if (customerId) {
            const currentErrors = form.getFieldError('new_customer_phone')
            if (currentErrors && currentErrors.length > 0) {
                form.setFields([{ name: 'new_customer_phone', errors: [] }])
            }
            return
        }

        const checkPhone = async () => {
            const currentPhone = form.getFieldValue('new_customer_phone')
            if (!debouncedPhone || debouncedPhone !== currentPhone) {
                return
            }

            const res = await checkCustomerByPhone({ keyword: debouncedPhone }).unwrap()
            const existing = res.data?.items?.find(customer => customer.phone === debouncedPhone)

            if (existing) {
                form.setFields([
                    {
                        name: 'new_customer_phone',
                        warnings: [`SĐT này thuộc về KH: ${existing.name}`],
                    },
                ])
            } else {
                form.setFields([{ name: 'new_customer_phone', errors: [], warnings: [] }])
            }
        }

        checkPhone()
    }, [debouncedPhone, customerId, checkCustomerByPhone, form])

    const commissionTotal = Form.useWatch('commission_total', form)
    const commissionPaid = Form.useWatch('commission_paid', form)
    const commissionRemaining = useMemo(() => {
        const total = commissionTotal || 0
        const paid = commissionPaid || 0
        return total - paid
    }, [commissionTotal, commissionPaid])

    const handleCustomerSelect = (val?: number) => {
        if (!val) {
            form.setFieldsValue({
                new_customer_name: undefined,
                new_customer_phone: undefined,
            })
            setCustomerSearch('')

            const currentOppId = form.getFieldValue('opportunity_id')
            if (currentOppId) {
                const currentOpp = dealsData?.data?.items?.find(opportunityItem => opportunityItem.id === currentOppId)
                if (currentOpp && currentOpp.customer_id) {
                    form.setFieldsValue({ opportunity_id: undefined })
                }
            }
            return
        }

        const customer = customerMapRef.current.get(val)
        if (customer) {
            form.setFieldsValue({
                new_customer_name: customer.name,
                new_customer_phone: customer.phone,
            })
        }
        const currentOppId = form.getFieldValue('opportunity_id')
        if (currentOppId) {
            const currentOpp = dealsData?.data?.items?.find(opportunityItem => opportunityItem.id === currentOppId)
            if (currentOpp && currentOpp.customer_id !== val) {
                form.setFieldsValue({ opportunity_id: undefined })
            }
        }
    }

    const handleProductSelect = (_val: number, option?: ProductSelectOption | ProductSelectOption[]) => {
        if (!option) return
        const opt = Array.isArray(option) ? option[0] : option
        if (opt?.project_id) {
            form.setFieldsValue({ project_id: opt.project_id })
        }
    }

    const handleOpportunitySelect = (val: number) => {
        const opportunity = dealsData?.data?.items?.find(item => item.id === val)
        if (opportunity) {
            if (opportunity.customer_id) {
                const customerMap = customerMapRef.current.get(opportunity.customer_id)

                const customerName = opportunity.customer_rel?.name || customerMap?.name
                const customerPhone = opportunity.customer_rel?.phone || customerMap?.phone || opportunity.phone

                form.setFieldsValue({
                    customer_id: opportunity.customer_id,
                    new_customer_name: customerName,
                    new_customer_phone: customerPhone,
                })
            }

            if (opportunity.product_id) {
                form.setFieldsValue({
                    product_id: opportunity.product_id,
                    project_id: opportunity.project_id,
                })
            }
        }
    }

    const handleCustomerInputChange = () => {
        form.setFieldsValue({ customer_id: undefined })
    }

    const handleFinish = async (values: TransactionFormValues) => {
        const submitData: TransactionBase = {
            ...values,
            contract_date: values.contract_date ? values.contract_date.format('YYYY-MM-DD') : undefined,
            deposit_date: values.deposit_date ? values.deposit_date.format('YYYY-MM-DD') : undefined,
            handover_date: values.handover_date ? values.handover_date.format('YYYY-MM-DD') : undefined,
        }

        if (!submitData.customer_id && submitData.new_customer_name && submitData.new_customer_phone) {
            try {
                const resSearch = await checkCustomerByPhone({ keyword: submitData.new_customer_phone }).unwrap()
                const existing = resSearch.data?.items?.find(
                    customer => customer.phone === submitData.new_customer_phone,
                )

                if (existing) {
                    await updateCustomer({
                        customer_id: existing.id,
                        payload: {
                            name: submitData.new_customer_name,
                            phone: submitData.new_customer_phone,
                        },
                    }).unwrap()
                    submitData.customer_id = existing.id
                }
            } catch {
                message.error('Lỗi khi lưu thông tin khách hàng')
                return
            }
        }

        onFinish(submitData)
    }

    const handleFinishFailed: FormProps<TransactionFormValues>['onFinishFailed'] = errorInfo => {
        const sectionsToOpen = new Set(activeKeys)

        errorInfo?.errorFields.forEach(field => {
            const fieldName = field.name[0] as string

            Object.entries(TRANSACTION_SECTION_FIELDS).forEach(([sectionKey, fields]) => {
                if (fields.includes(fieldName)) {
                    sectionsToOpen.add(sectionKey)
                }
            })
        })

        setActiveKeys(Array.from(sectionsToOpen))

        if (errorInfo.errorFields.length > 0) {
            form.scrollToField(errorInfo.errorFields[0].name, { behavior: 'smooth', block: 'center' })
        }
    }

    const renderCustomerOption = (option: CustomerSelectOption) => (
        <Flex align="center" gap={8}>
            <Avatar size="small" className="!bg-blue-800 !font-bold shrink-0">
                {(option.data.name || option.data.label)?.charAt(0)?.toUpperCase() ?? app.EMPTY_DISPLAY}
            </Avatar>
            <span>
                {option.data.name && <span>{option.data.name}</span>}
                {option.data.phone && (
                    <span className="text-indigo-600 font-medium">
                        {option.data.name ? ' • ' : ''}
                        {option.data.phone}
                    </span>
                )}
                {!option.data.name && !option.data.phone && option.data.label}
            </span>
        </Flex>
    )

    const collapseItems = [
        {
            key: TRANSACTION_FORM_SECTIONS.MAIN_INFO,
            label: <Typography.Text strong>1. Thông tin chính</Typography.Text>,
            forceRender: true,
            children: (
                <Row gutter={16}>
                    <Col xs={24} md={24}>
                        <Form.Item
                            label="Tìm khách hàng"
                            name="customer_id"
                            rules={[{ required: false, message: 'Vui lòng chọn khách hàng' }]}>
                            <Select
                                showSearch
                                placeholder="Tìm theo Tên/SĐT/Mã KH"
                                loading={fetchingCustomers}
                                optionFilterProp="label"
                                onChange={handleCustomerSelect}
                                onSearch={setCustomerSearch}
                                onPopupScroll={handleCustomerScroll}
                                popupRender={menu => renderSelectLoading(menu, fetchingCustomers)}
                                optionRender={renderCustomerOption}
                                filterOption={false}
                                allowClear
                                options={customerOptions}
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
                            label="Họ tên khách hàng"
                            name="new_customer_name"
                            rules={[{ required: true, message: 'Nhập tên' }]}>
                            <Input
                                placeholder="Tên khách hàng"
                                prefix={<UserAddOutlined />}
                                onChange={handleCustomerInputChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Số điện thoại"
                            name="new_customer_phone"
                            rules={[
                                { required: true, message: 'Nhập sđt' },
                                { pattern: REGEX_PHONE, message: 'SĐT không hợp lệ' },
                            ]}>
                            <Input placeholder="0987654321" onChange={handleCustomerInputChange} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Sale/Chuyên Viên Phụ Trách"
                            name="assigned_to"
                            rules={[{ required: true, message: 'Vui lòng chọn chuyên viên' }]}>
                            <Select
                                placeholder="Chọn nhân viên"
                                loading={isLoadingAccounts}
                                showSearch
                                filterOption={false}
                                onSearch={setAccountSearch}
                                onPopupScroll={handleAccountScroll}
                                optionFilterProp="label"
                                options={accountOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Bất Động Sản"
                            name="product_id"
                            rules={[{ required: true, message: 'Vui lòng chọn BĐS' }]}>
                            <Select
                                showSearch
                                placeholder="Chọn BĐS"
                                loading={fetchingProducts}
                                optionFilterProp="label"
                                onSearch={setProductSearch}
                                onPopupScroll={handleProductScroll}
                                popupRender={menu => renderSelectLoading(menu, fetchingProducts)}
                                filterOption={false}
                                onChange={handleProductSelect}
                                options={productOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Nhóm Dự Án/Khu vực" name="project_id">
                            <Select
                                placeholder="Tự động theo BĐS"
                                loading={isLoadingProjects}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                disabled
                                options={projectOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Deal liên quan" name="opportunity_id">
                            <Select
                                placeholder="Chọn Deal (nếu giao dịch sinh ra từ Deal)"
                                loading={isLoadingOpportunities}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                onChange={handleOpportunitySelect}
                                options={opportunityOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Nhu cầu" name="transaction_type">
                            <Select
                                placeholder="Chọn nhu cầu"
                                options={NEED_TYPE_OPTIONS}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: TRANSACTION_FORM_SECTIONS.VALUE_PROCESS,
            label: <Typography.Text strong>2. Giá Trị & Tiến Trình</Typography.Text>,
            forceRender: true,
            children: (
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item label="Dự kiến ngày ký HĐ" name="contract_date">
                            <DatePicker className="w-full" placeholder="dd/mm/yyyy" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Dự kiến ngày bàn giao" name="handover_date">
                            <DatePicker className="w-full" placeholder="dd/mm/yyyy" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Giá trị giao dịch dự kiến"
                            name="final_price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
                            <InputNumber
                                className="!w-full"
                                placeholder="VD: 3.2"
                                min={0}
                                step={0.1}
                                addonAfter="Tỷ"
                                formatter={formatter}
                                parser={parser}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Trạng thái giao dịch"
                            name="stage"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                            <Select
                                placeholder="Chọn trạng thái"
                                showSearch
                                optionFilterProp="label"
                                options={TRANSACTION_STAGE_OPTIONS}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Phí môi giới" name="commission_total">
                            <InputNumber
                                className="!w-full"
                                placeholder="VD: 23"
                                min={0}
                                addonAfter="Tr"
                                formatter={formatter}
                                parser={parser}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Ghi chú thanh toán"
                            name="payment_note"
                            rules={[{ max: 255, message: 'Ghi chú không được quá 255 ký tự' }]}>
                            <Input placeholder="VD: cọc 2 tỷ..." />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Đã Thanh toán" name="commission_paid">
                            <InputNumber
                                className="!w-full"
                                placeholder="VD: 23"
                                min={0}
                                addonAfter="Tr"
                                formatter={formatter}
                                parser={parser}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Còn lại">
                            <InputNumber
                                className="!w-full"
                                value={commissionRemaining}
                                disabled
                                addonAfter="Tr"
                                formatter={formatter}
                                parser={parser}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: TRANSACTION_FORM_SECTIONS.CONTRACT_DOCS,
            label: <Typography.Text strong>3. Hợp đồng & Tài liệu liên quan</Typography.Text>,
            forceRender: true,
            children: (
                <Form.Item name="contract_file_url" noStyle>
                    <BaseFileUpload folder="transaction_documents" />
                </Form.Item>
            ),
        },
        {
            key: TRANSACTION_FORM_SECTIONS.INTERNAL_NOTES,
            label: <Typography.Text strong>4. Ghi chú nội bộ</Typography.Text>,
            forceRender: true,
            children: (
                <Form.Item
                    name="notes"
                    label="Ghi chú"
                    rules={[{ max: 255, message: 'Ghi chú không được quá 255 ký tự' }]}>
                    <TextArea
                        rows={4}
                        placeholder="Lưu ý về khách, điều khoản đặc biệt, số m, follow-up cần chú ý..."
                    />
                </Form.Item>
            ),
        },
    ]

    return (
        <Form<TransactionFormValues>
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
            initialValues={{
                stage: TransactionStage.DAT_COC,
            }}>
            <Collapse
                activeKey={activeKeys}
                onChange={keys => setActiveKeys(keys as string[])}
                expandIconPosition="end"
                bordered={false}
                ghost
                className="transaction-form-collapse"
                items={collapseItems.map(item => ({
                    ...item,
                    className: '!mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm',
                }))}
            />

            <Form.Item name="transaction_code" hidden>
                <Input />
            </Form.Item>

            <Divider />
            <Row justify="end" gutter={12}>
                <Col>
                    <Button onClick={onCancel} size="large">
                        Hủy
                    </Button>
                </Col>
                <Col>
                    <Button type="primary" htmlType="submit" loading={loading} size="large">
                        {isEdit ? 'Cập nhật' : 'Tạo Giao Dịch'}
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default TransactionForm
