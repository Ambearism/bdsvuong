import { app } from '@/config/app'
import {
    BILLING_CYCLE_OPTIONS,
    BILLING_CYCLE_VALUE,
    DUE_DATE_RULE_TABS,
    LEASE_CONTRACT_DUE_DATE_RULE,
    MIN_POSITIVE_VALUE,
    REGEX_PHONE,
} from '@/config/constant'
import type { CustomerItem } from '@/types/customer'
import type { BillingCycleValue, DueDateRuleValue } from '@/types/lease-contract'
import { useGetCustomerListQuery, useLazyGetCustomerListQuery, useGetCustomerDetailQuery } from '@/api/customer'
import { useGetProductDetailQuery, useGetProductsLeaseOptionsQuery } from '@/api/product'
import { useDebounce } from '@/hooks/useDebounce'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import BaseFileUpload from '@/components/base/BaseFileUpload'
import LeasePaymentProjection from '@/pages/lease-contracts/LeasePaymentProjection'
import { Button, Card, Col, DatePicker, Flex, Form, Input, InputNumber, Row, Select, Tabs, Typography } from 'antd'
import type { Dayjs } from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormInstance } from 'antd/es/form'

export type LeaseContractFormValues = {
    product_id?: number
    unit_product?: string
    tenant_id?: number
    landlord_id?: number
    new_tenant_name?: string
    new_tenant_phone?: string
    new_landlord_name?: string
    new_landlord_phone?: string
    price?: number
    deposit?: number
    billing_cycle?: BillingCycleValue
    status?: string
    start_date?: Dayjs
    end_date?: Dayjs
    due_date_rule?: DueDateRuleValue
    close_day?: number
    grace_period_days?: number
    note?: string
    file_urls?: string | string[]
    product_value: number
}

type LeaseContractFormProps = {
    form: FormInstance<LeaseContractFormValues>
    onFinish: (values: LeaseContractFormValues) => Promise<void> | void
    initialValues?: Partial<LeaseContractFormValues>
    submitText: string
    submitLoading?: boolean
    onCancel: () => void
    title: string
    isEdit?: boolean
}

export default function LeaseContractForm({
    form,
    onFinish,
    initialValues,
    submitText,
    submitLoading = false,
    onCancel,
    title,
    isEdit = false,
}: LeaseContractFormProps) {
    const { Title } = Typography

    const [landlordSearch, setLandlordSearch] = useState('')
    const [tenantSearch, setTenantSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const debouncedLandlordSearch = useDebounce(landlordSearch, 500)
    const debouncedTenantSearch = useDebounce(tenantSearch, 500)
    const debouncedProductSearch = useDebounce(productSearch, 500)

    const [landlordPage, setLandlordPage] = useState(app.DEFAULT_PAGE)
    const { data: landlordCustomers, isFetching: isLoadingLandlords } = useGetCustomerListQuery(
        {
            keyword: debouncedLandlordSearch || undefined,
            page: landlordPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )
    const { accumulatedItems: landlordOptionsData, handleScroll: handleLandlordScroll } = useSelectInfiniteScroll({
        items: (landlordCustomers?.data?.items ?? []) as Array<{ id: number; name?: string; phone?: string }>,
        isFetching: isLoadingLandlords,
        debouncedKeyword: debouncedLandlordSearch,
        page: landlordPage,
        setPage: setLandlordPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const [tenantPage, setTenantPage] = useState(app.DEFAULT_PAGE)
    const { data: tenantCustomers, isFetching: isLoadingTenants } = useGetCustomerListQuery(
        {
            keyword: debouncedTenantSearch || undefined,
            page: tenantPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )
    const { accumulatedItems: tenantOptionsData, handleScroll: handleTenantScroll } = useSelectInfiniteScroll({
        items: (tenantCustomers?.data?.items ?? []) as Array<{ id: number; name?: string; phone?: string }>,
        isFetching: isLoadingTenants,
        debouncedKeyword: debouncedTenantSearch,
        page: tenantPage,
        setPage: setTenantPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const [productPage, setProductPage] = useState(app.DEFAULT_PAGE)
    const { data: productsData, isFetching: isLoadingProducts } = useGetProductsLeaseOptionsQuery(
        {
            keyword: debouncedProductSearch || undefined,
            page: productPage,
            per_page: app.BIG_PAGE_SIZE,
        },
        { refetchOnMountOrArgChange: true },
    )
    const { accumulatedItems: productOptionsData, handleScroll: handleProductScroll } = useSelectInfiniteScroll({
        items: (productsData?.data?.items ?? []) as Array<{ id: number; name?: string; product_code?: string }>,
        isFetching: isLoadingProducts,
        debouncedKeyword: debouncedProductSearch,
        page: productPage,
        setPage: setProductPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const { data: landlordDetail } = useGetCustomerDetailQuery(
        { customer_id: initialValues?.landlord_id ?? 0 },
        { skip: !initialValues?.landlord_id },
    )
    const { data: tenantDetail } = useGetCustomerDetailQuery(
        { customer_id: initialValues?.tenant_id ?? 0 },
        { skip: !initialValues?.tenant_id },
    )

    const landlordMapRef = useRef<Map<number, { name: string; phone: string }>>(new Map())
    const tenantMapRef = useRef<Map<number, { name: string; phone: string }>>(new Map())
    const productMapRef = useRef<Map<number, { name: string; product_code: string }>>(new Map())

    const [checkCustomerByPhone] = useLazyGetCustomerListQuery()

    const newTenantPhone = Form.useWatch('new_tenant_phone', form)
    const debouncedNewTenantPhone = useDebounce(newTenantPhone, 500)

    const dueDateRule = Form.useWatch('due_date_rule', form) || LEASE_CONTRACT_DUE_DATE_RULE.FIXED
    const startDate = Form.useWatch('start_date', form)
    const endDate = Form.useWatch('end_date', form)
    const billingCycle = Form.useWatch('billing_cycle', form)
    const rentPrice = Form.useWatch('price', form)
    const closeDay = Form.useWatch('close_day', form)
    const gracePeriodDays = Form.useWatch('grace_period_days', form)
    const productId = Form.useWatch('product_id', form)

    const { data: productDetail } = useGetProductDetailQuery(
        { product_id: productId ?? 0 },
        { skip: !productId || initialValues?.product_value !== undefined },
    )

    const selectedProductValue = productDetail?.data?.product_value

    useEffect(() => {
        form.setFieldValue('product_value', initialValues?.product_value ?? selectedProductValue)
    }, [form, selectedProductValue, initialValues])

    useEffect(() => {
        const currentDueDateRule = form.getFieldValue('due_date_rule')
        const currentBillingCycle = form.getFieldValue('billing_cycle')
        if (!currentDueDateRule) {
            form.setFieldValue('due_date_rule', LEASE_CONTRACT_DUE_DATE_RULE.FIXED)
        }
        if (!currentBillingCycle) {
            form.setFieldValue('billing_cycle', BILLING_CYCLE_VALUE.MONTHLY)
        }
    }, [form])

    useEffect(() => {
        if (!initialValues) return

        form.setFieldsValue({ ...initialValues })
    }, [form, initialValues])

    useEffect(() => {
        if (landlordDetail?.data) {
            landlordMapRef.current.set(landlordDetail.data.id, {
                name: landlordDetail.data.name,
                phone: landlordDetail.data.phone,
            })
            form.setFieldsValue({
                new_landlord_name: landlordDetail.data.name,
                new_landlord_phone: landlordDetail.data.phone,
            })
        }
    }, [form, landlordDetail])

    useEffect(() => {
        if (tenantDetail?.data) {
            tenantMapRef.current.set(tenantDetail.data.id, {
                name: tenantDetail.data.name,
                phone: tenantDetail.data.phone,
            })
            form.setFieldsValue({
                new_tenant_name: tenantDetail.data.name,
                new_tenant_phone: tenantDetail.data.phone,
            })
        }
    }, [form, tenantDetail])

    useEffect(() => {
        landlordOptionsData.forEach(customer => {
            landlordMapRef.current.set(customer.id, {
                name: customer.name ?? '',
                phone: customer.phone ?? '',
            })
        })
    }, [landlordOptionsData])

    useEffect(() => {
        tenantOptionsData.forEach(customer => {
            tenantMapRef.current.set(customer.id, {
                name: customer.name ?? '',
                phone: customer.phone ?? '',
            })
        })
    }, [tenantOptionsData])

    useEffect(() => {
        productOptionsData.forEach(product => {
            productMapRef.current.set(product.id, {
                name: product.name ?? '',
                product_code: String(product.product_code ?? product.id),
            })
        })
    }, [productOptionsData])

    const watchedLandlordId = Form.useWatch('landlord_id', form)
    const watchedTenantId = Form.useWatch('tenant_id', form)
    const watchedProductId = Form.useWatch('product_id', form)

    const landlordOptions = useMemo(() => {
        const options = landlordOptionsData.map(customer => ({
            value: customer.id,
            label: `${customer.name} - ${customer.phone}`,
        }))

        if (watchedLandlordId && !options.some(option => option.value === watchedLandlordId)) {
            const customer = landlordMapRef.current.get(Number(watchedLandlordId))
            options.push({
                value: Number(watchedLandlordId),
                label: customer ? `${customer.name} - ${customer.phone}` : `#${watchedLandlordId}`,
            })
        }

        return options
    }, [landlordOptionsData, watchedLandlordId])

    const tenantOptions = useMemo(() => {
        const options = tenantOptionsData.map(customer => ({
            value: customer.id,
            label: `${customer.name} - ${customer.phone}`,
        }))

        if (watchedTenantId && !options.some(option => option.value === watchedTenantId)) {
            const customer = tenantMapRef.current.get(Number(watchedTenantId))
            options.push({
                value: Number(watchedTenantId),
                label: customer ? `${customer.name} - ${customer.phone}` : `#${watchedTenantId}`,
            })
        }

        return options
    }, [tenantOptionsData, watchedTenantId])

    const productOptions = useMemo(() => {
        const options = productOptionsData.map(product => ({
            value: product.id,
            label: `${product.product_code || product.id} - ${product.name}`,
        }))

        if (watchedProductId && !options.some(option => option.value === watchedProductId)) {
            const product = productMapRef.current.get(Number(watchedProductId))
            options.push({
                value: Number(watchedProductId),
                label: product ? `${product.product_code} - ${product.name}` : `#${watchedProductId}`,
            })
        }

        return options
    }, [productOptionsData, watchedProductId])

    const handleLandlordSelect = (value?: number) => {
        if (!value) {
            form.setFieldsValue({ new_landlord_name: '', new_landlord_phone: '' })
            return
        }
        const customer = landlordMapRef.current.get(value)
        if (customer) {
            form.setFieldsValue({
                new_landlord_name: customer.name,
                new_landlord_phone: customer.phone,
            })
        }
    }

    const handleTenantSelect = (value?: number) => {
        if (!value) {
            form.setFieldsValue({ new_tenant_name: '', new_tenant_phone: '' })
            return
        }
        const customer = tenantMapRef.current.get(value)
        if (customer) {
            form.setFieldsValue({
                new_tenant_name: customer.name,
                new_tenant_phone: customer.phone,
            })
        }
    }

    const handleTenantInputChange = () => {
        form.setFieldsValue({ tenant_id: undefined })
    }

    useEffect(() => {
        if (isEdit || !debouncedNewTenantPhone) return

        const tenantId = form.getFieldValue('tenant_id')
        if (tenantId) {
            form.setFields([{ name: 'new_tenant_phone', errors: [] }])
            return
        }

        const checkPhone = async () => {
            const res = await checkCustomerByPhone({ keyword: debouncedNewTenantPhone }).unwrap()
            const existing = res.data?.items?.find((c: CustomerItem) => c.phone === debouncedNewTenantPhone)
            if (existing) {
                form.setFields([
                    {
                        name: 'new_tenant_phone',
                        errors: [`SĐT này thuộc về KH: ${existing.name} (Sử dụng tìm kiếm để chọn)`],
                    },
                ])
            } else {
                const currentErrors = form.getFieldError('new_tenant_phone')
                if (currentErrors.length > 0) {
                    form.setFields([{ name: 'new_tenant_phone', errors: [] }])
                }
            }
        }

        checkPhone()
    }, [debouncedNewTenantPhone, checkCustomerByPhone, form, isEdit])

    return (
        <>
            <Title level={4}>{title}</Title>
            <Form<LeaseContractFormValues>
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    due_date_rule: LEASE_CONTRACT_DUE_DATE_RULE.FIXED,
                    billing_cycle: BILLING_CYCLE_VALUE.MONTHLY,
                    ...initialValues,
                }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Card
                            size="small"
                            className="!mb-4"
                            title={<Typography.Text strong>Bên cho thuê & bên thuê</Typography.Text>}>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Chủ nhà (Bên A)"
                                        name="landlord_id"
                                        dependencies={['tenant_id']}
                                        rules={
                                            isEdit
                                                ? []
                                                : [
                                                      { required: true, message: 'Vui lòng chọn chủ nhà' },
                                                      ({ getFieldValue }) => ({
                                                          validator(_, value: number | undefined) {
                                                              const tenantId = getFieldValue('tenant_id') as
                                                                  | number
                                                                  | undefined
                                                              if (!value || !tenantId || value !== tenantId) {
                                                                  return Promise.resolve()
                                                              }
                                                              return Promise.reject(
                                                                  new Error('Chủ nhà không được trùng với khách thuê'),
                                                              )
                                                          },
                                                      }),
                                                  ]
                                        }>
                                        <Select
                                            showSearch
                                            allowClear
                                            filterOption={false}
                                            optionFilterProp="label"
                                            placeholder="Tìm kiếm chủ nhà..."
                                            loading={isLoadingLandlords}
                                            onSearch={setLandlordSearch}
                                            onPopupScroll={handleLandlordScroll}
                                            onChange={handleLandlordSelect}
                                            options={landlordOptions}
                                            disabled={isEdit}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Khách thuê (Bên B)"
                                        name="tenant_id"
                                        dependencies={['landlord_id']}
                                        rules={
                                            isEdit
                                                ? []
                                                : [
                                                      { required: true, message: 'Vui lòng chọn khách thuê' },
                                                      ({ getFieldValue }) => ({
                                                          validator(_, value: number | undefined) {
                                                              const landlordId = getFieldValue('landlord_id') as
                                                                  | number
                                                                  | undefined
                                                              if (!value || !landlordId || value !== landlordId) {
                                                                  return Promise.resolve()
                                                              }
                                                              return Promise.reject(
                                                                  new Error('Khách thuê không được trùng với chủ nhà'),
                                                              )
                                                          },
                                                      }),
                                                  ]
                                        }>
                                        <Select
                                            showSearch
                                            allowClear
                                            filterOption={false}
                                            optionFilterProp="label"
                                            placeholder="Tìm kiếm khách thuê..."
                                            loading={isLoadingTenants}
                                            onSearch={setTenantSearch}
                                            onPopupScroll={handleTenantScroll}
                                            onChange={handleTenantSelect}
                                            options={tenantOptions}
                                            disabled={isEdit}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Tên chủ nhà"
                                        name="new_landlord_name"
                                        dependencies={['landlord_id']}>
                                        <Input placeholder="Tự động theo khách hàng đã chọn" disabled />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="SĐT chủ nhà"
                                        name="new_landlord_phone"
                                        dependencies={['landlord_id']}>
                                        <Input placeholder="Tự động theo khách hàng đã chọn" disabled />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Tên khách thuê"
                                        name="new_tenant_name"
                                        dependencies={['tenant_id']}
                                        rules={
                                            isEdit
                                                ? []
                                                : [
                                                      ({ getFieldValue }) => ({
                                                          validator(_, value) {
                                                              if (getFieldValue('tenant_id') || value)
                                                                  return Promise.resolve()
                                                              return Promise.reject(
                                                                  new Error('Vui lòng nhập tên khách thuê'),
                                                              )
                                                          },
                                                      }),
                                                  ]
                                        }>
                                        <Input
                                            placeholder="Nhập tên khách thuê"
                                            onChange={handleTenantInputChange}
                                            disabled={isEdit}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="SĐT khách thuê"
                                        name="new_tenant_phone"
                                        dependencies={['tenant_id']}
                                        rules={
                                            isEdit
                                                ? []
                                                : [
                                                      ({ getFieldValue }) => ({
                                                          validator(_, value) {
                                                              if (getFieldValue('tenant_id') || value)
                                                                  return Promise.resolve()
                                                              return Promise.reject(
                                                                  new Error('Vui lòng nhập SĐT khách thuê'),
                                                              )
                                                          },
                                                      }),
                                                      { pattern: REGEX_PHONE, message: 'SĐT khách thuê không hợp lệ' },
                                                  ]
                                        }>
                                        <Input
                                            placeholder="Nhập SĐT khách thuê"
                                            onChange={handleTenantInputChange}
                                            disabled={isEdit}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card
                            size="small"
                            className="!mb-4"
                            title={<Typography.Text strong>Tài sản & Giá trị</Typography.Text>}>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Bất động sản"
                                        name="product_id"
                                        rules={isEdit ? [] : [{ required: true, message: 'Vui lòng chọn BĐS' }]}>
                                        <Select
                                            showSearch
                                            allowClear
                                            filterOption={false}
                                            optionFilterProp="label"
                                            placeholder="Chọn mã BĐS..."
                                            loading={isLoadingProducts}
                                            onSearch={setProductSearch}
                                            onPopupScroll={handleProductScroll}
                                            options={productOptions}
                                            disabled={isEdit}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item label="Mã căn / phòng (nếu cho thuê lẻ)" name="unit_product">
                                        <Input placeholder="VD: Phòng 201, Tầng 2" disabled={isEdit} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Giá trị BĐS"
                                        name="product_value"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập giá trị BĐS' },
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Giá trị BĐS phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber<number>
                                            className="!w-full"
                                            addonAfter="tỷ"
                                            placeholder="Nhập giá trị BĐS"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Tiền thuê / kỳ (triệu VND)"
                                        name="price"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tiền thuê / kỳ' },
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Tiền thuê phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber<number>
                                            className="!w-full"
                                            min={0}
                                            addonAfter="triệu"
                                            placeholder="Nhập số tiền thuê"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Tiền cọc (triệu VND)"
                                        name="deposit"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tiền cọc' },
                                            { type: 'number', min: 0.000001, message: 'Tiền cọc phải lớn hơn 0' },
                                        ]}>
                                        <InputNumber<number>
                                            className="!w-full"
                                            min={0}
                                            addonAfter="triệu"
                                            placeholder="Nhập tiền cọc"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={6}>
                                    <Form.Item
                                        label="Chu kỳ thanh toán"
                                        name="billing_cycle"
                                        rules={[{ required: true, message: 'Vui lòng chọn chu kỳ thanh toán' }]}>
                                        <Select placeholder="Chọn chu kỳ" options={BILLING_CYCLE_OPTIONS} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card
                            size="small"
                            className="!mb-4"
                            title={
                                <Typography.Text strong>
                                    {isEdit ? 'Thời hạn hợp đồng' : 'Thời hạn & Quy tắc đóng tiền'}
                                </Typography.Text>
                            }>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Ngày bắt đầu HĐ"
                                        name="start_date"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn ngày bắt đầu' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value: Dayjs | undefined) {
                                                    const selectedEndDate = getFieldValue('end_date') as
                                                        | Dayjs
                                                        | undefined
                                                    if (
                                                        !value ||
                                                        !selectedEndDate ||
                                                        value.isBefore(selectedEndDate, 'day')
                                                    ) {
                                                        return Promise.resolve()
                                                    }
                                                    return Promise.reject(
                                                        new Error('Ngày bắt đầu phải bé hơn ngày kết thúc'),
                                                    )
                                                },
                                            }),
                                        ]}>
                                        <DatePicker className="!w-full" format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Ngày kết thúc HĐ"
                                        name="end_date"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value: Dayjs | undefined) {
                                                    const selectedStartDate = getFieldValue('start_date') as
                                                        | Dayjs
                                                        | undefined
                                                    if (
                                                        !value ||
                                                        !selectedStartDate ||
                                                        value.isAfter(selectedStartDate, 'day')
                                                    ) {
                                                        return Promise.resolve()
                                                    }
                                                    return Promise.reject(
                                                        new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu'),
                                                    )
                                                },
                                            }),
                                        ]}>
                                        <DatePicker className="!w-full" format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="due_date_rule" className="!mb-3">
                                <Tabs
                                    activeKey={dueDateRule}
                                    items={DUE_DATE_RULE_TABS.map(tab => ({
                                        key: tab.key,
                                        label: tab.label,
                                        disabled: isEdit,
                                    }))}
                                    onChange={key => {
                                        if (isEdit) return
                                        form.setFieldValue('due_date_rule', key as DueDateRuleValue)
                                    }}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Cho phép trễ (ngày)" name="grace_period_days">
                                        <InputNumber<number>
                                            className="!w-full"
                                            min={0}
                                            placeholder="VD: 3"
                                            disabled={isEdit}
                                        />
                                    </Form.Item>
                                </Col>

                                {dueDateRule === LEASE_CONTRACT_DUE_DATE_RULE.FIXED && (
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Ngày chốt"
                                            name="close_day"
                                            rules={
                                                isEdit ? [] : [{ required: true, message: 'Vui lòng nhập ngày chốt' }]
                                            }>
                                            <InputNumber<number>
                                                className="!w-full"
                                                min={1}
                                                max={31}
                                                placeholder="Ngày thu tiền thuê trong tháng"
                                                disabled={isEdit}
                                            />
                                        </Form.Item>
                                    </Col>
                                )}
                            </Row>
                        </Card>

                        <Card size="small" className="!mb-4" title={<Typography.Text strong>Ghi chú</Typography.Text>}>
                            <Form.Item name="note" className="!mb-0">
                                <Input.TextArea rows={3} placeholder="Nhập ghi chú hợp đồng..." disabled={isEdit} />
                            </Form.Item>
                        </Card>

                        <Card
                            title={<Typography.Text strong>Tài liệu liên quan</Typography.Text>}
                            size="small"
                            className="!mb-4">
                            <Form.Item name="file_urls" noStyle>
                                <BaseFileUpload folder="lease-contracts/" disabled={isEdit} />
                            </Form.Item>
                        </Card>

                        <Flex justify="center" gap={12}>
                            <Button onClick={onCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                {submitText}
                            </Button>
                        </Flex>
                    </Col>

                    <Col span={8}>
                        <LeasePaymentProjection
                            startDate={startDate}
                            endDate={endDate}
                            price={rentPrice}
                            billingCycle={billingCycle}
                            dueDateRule={dueDateRule}
                            closeDay={closeDay}
                            gracePeriodDays={gracePeriodDays}
                        />
                    </Col>
                </Row>
            </Form>
        </>
    )
}
