import { app } from '@/config/app'
import { useDebounce } from '@/hooks/useDebounce'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import { useGetCustomerListQuery, useCreateCustomerMutation, useLazyGetCustomerListQuery } from '@/api/customer'
import { useGetProductListQuery } from '@/api/product'
import type { CustomerItem, CustomerCreateInput } from '@/types/customer'
import type { ProductItem } from '@/types/product'
import { useCreateLeaseContractTransferMutation } from '@/api/lease-contract'
import { Button, DatePicker, Form, Input, message, Modal, Select, Space } from 'antd'
import { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import type { LeaseContractItem, LeaseContractTransferInput, TransferType } from '@/types/lease-contract'
import { REGEX_PHONE, TRANSFER_TYPE } from '@/config/constant'

interface TransferLeaseModalProps {
    open: boolean
    onCancel: () => void
    onConfirm: (payload: unknown) => Promise<void>
    onSuccess?: () => void
    confirmLoading?: boolean
    leaseContract?: LeaseContractItem
}

type LeaseContractTransferCreateFormValues = {
    id: number
    lease_contract_id: number
    target_type: TransferType
    target_id: number
    new_tenant_name?: string
    new_tenant_phone?: string
    target_unit?: string
    effective_date: Dayjs
    note?: string
    file_urls?: string
}

const TRANSFER_OPTIONS: { value: TransferType; label: string }[] = [
    { value: TRANSFER_TYPE.TENANT, label: 'Đổi Khách Thuê' },
    { value: TRANSFER_TYPE.LANDLORD, label: 'Đổi Chủ Nhà' },
    { value: TRANSFER_TYPE.PRODUCT, label: 'Đổi Căn / Số Phòng' },
]

export default function TransferLeaseModal({
    open,
    onCancel,
    confirmLoading = false,
    leaseContract,
    onSuccess,
}: TransferLeaseModalProps) {
    const [form] = Form.useForm<LeaseContractTransferCreateFormValues>()
    const [search, setSearch] = useState('')
    const [landlordSearch, setLandlordSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const debouncedLandlordSearch = useDebounce(landlordSearch, 500)
    const debouncedProductSearch = useDebounce(productSearch, 500)

    const transferType = Form.useWatch('target_type', form) || TRANSFER_TYPE.TENANT
    const activeCustomerKeyword = transferType === TRANSFER_TYPE.LANDLORD ? debouncedLandlordSearch : debouncedSearch

    const [customerPage, setCustomerPage] = useState(app.DEFAULT_PAGE)
    const { data: customerListData, isFetching: isLoadingCustomers } = useGetCustomerListQuery(
        {
            keyword: activeCustomerKeyword || undefined,
            page: customerPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        {
            skip: !open || transferType === TRANSFER_TYPE.PRODUCT,
        },
    )
    const { accumulatedItems: customerOptionsData, handleScroll: handleCustomerScroll } = useSelectInfiniteScroll({
        items: (customerListData?.data?.items ?? []) as Array<{ id: number; name?: string; phone?: string }>,
        isFetching: isLoadingCustomers,
        debouncedKeyword: activeCustomerKeyword,
        page: customerPage,
        setPage: setCustomerPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const [productPage, setProductPage] = useState(app.DEFAULT_PAGE)
    const { data: productsData, isFetching: isLoadingProducts } = useGetProductListQuery(
        {
            keyword: debouncedProductSearch || undefined,
            page: productPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        {
            skip: !open || transferType !== TRANSFER_TYPE.PRODUCT,
        },
    )
    const { accumulatedItems: productOptionsData, handleScroll: handleProductScroll } = useSelectInfiniteScroll({
        items: (productsData?.data?.items ?? []) as Array<ProductItem>,
        isFetching: isLoadingProducts,
        debouncedKeyword: debouncedProductSearch,
        page: productPage,
        setPage: setProductPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const [createCustomer] = useCreateCustomerMutation()
    const [createTransfer] = useCreateLeaseContractTransferMutation()
    const [checkCustomerByPhone] = useLazyGetCustomerListQuery()

    const newTenantPhone = Form.useWatch('new_tenant_phone', form)
    const debouncedNewTenantPhone = useDebounce(newTenantPhone, 500)

    useEffect(() => {
        if (!open) {
            form.resetFields()
            setSearch('')
            setLandlordSearch('')
            setProductSearch('')
        } else {
            form.setFieldsValue({ target_type: TRANSFER_TYPE.TENANT })
        }
    }, [open, form])

    useEffect(() => {
        form.setFieldsValue({
            target_id: undefined,
            target_unit: undefined,
        })
    }, [transferType, form])

    const handleFinish = async (values: LeaseContractTransferCreateFormValues) => {
        if (!leaseContract) return

        try {
            let tenantId: number | undefined = undefined
            if (values.target_type === TRANSFER_TYPE.TENANT) {
                const createCustomerIfNeeded = async (
                    customerId: number | undefined,
                    name: string | undefined,
                    phone: string | undefined,
                ) => {
                    if (customerId) return customerId

                    if (!name || !phone) return undefined

                    const payload: CustomerCreateInput = {
                        name,
                        phone,
                    }
                    const customerRes = await createCustomer(payload).unwrap()
                    return customerRes.data?.id
                }

                tenantId = await createCustomerIfNeeded(
                    values.target_id,
                    values.new_tenant_name,
                    values.new_tenant_phone,
                )
                if (!tenantId) {
                    throw new Error('Vui lòng chọn hoặc tạo khách thuê chuyển nhượng')
                }
            }

            const payload: LeaseContractTransferInput = {
                lease_contract_id: leaseContract?.id,
                target_type: values.target_type,
                target_id: tenantId || values.target_id,
                effective_date: values.effective_date.format('YYYY-MM-DD'),
                note: values.note?.trim() || undefined,
            }

            if (values.target_type === TRANSFER_TYPE.PRODUCT) {
                payload.target_unit = values.target_unit?.trim() || undefined
            }

            await createTransfer(payload).unwrap()
            onSuccess?.()

            message.success('Chuyển nhượng thành công')
            onCancel()
        } catch {
            message.error('Tạo hợp đồng thuê thất bại, vui lòng thử lại')
        }
    }

    const getCustomerFromList = (items: CustomerItem[] | undefined, customerId: number) => {
        return items?.find(item => item.id === customerId)
    }

    const handleTenantSelect = (value: number) => {
        const customer = getCustomerFromList(customerOptionsData as CustomerItem[], value)
        if (customer) {
            form.setFieldsValue({
                new_tenant_name: customer.name,
                new_tenant_phone: customer.phone,
            })
        }
    }

    const handleTenantInputChange = () => {
        form.setFieldsValue({ target_id: undefined })
    }

    useEffect(() => {
        if (!debouncedNewTenantPhone) return

        const targetId = form.getFieldValue('target_id')
        if (targetId) {
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
    }, [debouncedNewTenantPhone, checkCustomerByPhone, form])

    const customerOptions = (customerOptionsData || []).map(customer => ({
        label: `${customer.name} - ${customer.phone || ''}`,
        value: customer.id,
    }))

    const landlordOptions = (customerOptionsData || []).map(customer => ({
        label: `${customer.name} - ${customer.phone || ''}`,
        value: customer.id,
    }))

    const productOptions = (productOptionsData || []).map((product: ProductItem) => ({
        label: product.name,
        value: product.id,
    }))

    return (
        <Modal
            open={open}
            title="Chuyển Nhượng Hợp Đồng"
            onCancel={onCancel}
            footer={null}
            width={500}
            centered
            destroyOnHidden>
            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Form.Item label="Loại Hình Chuyển Nhượng" name="target_type">
                    <Select options={TRANSFER_OPTIONS} />
                </Form.Item>

                {transferType === TRANSFER_TYPE.TENANT && (
                    <>
                        <Form.Item
                            label="Khách thuê được chuyển nhượng"
                            name="target_id"
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator() {
                                        const value = getFieldValue('target_id')
                                        const currentTenantId = leaseContract?.tenant_id
                                        if (!value) return Promise.resolve()
                                        if (currentTenantId && value === currentTenantId) {
                                            return Promise.reject(new Error('Khách thuê mới phải khác khách hiện tại'))
                                        }
                                        return Promise.resolve()
                                    },
                                }),
                            ]}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Tìm kiếm khách hàng..."
                                filterOption={false}
                                options={customerOptions}
                                loading={isLoadingCustomers}
                                onSearch={setSearch}
                                onPopupScroll={handleCustomerScroll}
                                onChange={handleTenantSelect}
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Tên khách thuê"
                            name="new_tenant_name"
                            required
                            dependencies={['target_id']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (getFieldValue('target_id') || value) return Promise.resolve()
                                        return Promise.reject(new Error('Vui lòng nhập tên khách thuê'))
                                    },
                                }),
                            ]}>
                            <Input placeholder="Nhập tên khách thuê" onChange={handleTenantInputChange} />
                        </Form.Item>

                        <Form.Item
                            label="SĐT khách thuê"
                            name="new_tenant_phone"
                            required
                            dependencies={['target_id']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (getFieldValue('target_id') || value) return Promise.resolve()
                                        return Promise.reject(new Error('Vui lòng nhập SĐT khách thuê'))
                                    },
                                }),
                                { pattern: REGEX_PHONE, message: 'SĐT khách thuê không hợp lệ' },
                            ]}>
                            <Input placeholder="Nhập SĐT khách thuê" onChange={handleTenantInputChange} />
                        </Form.Item>
                    </>
                )}

                {transferType === TRANSFER_TYPE.LANDLORD && (
                    <Form.Item
                        label="Chủ nhà được chuyển nhượng"
                        name="target_id"
                        rules={[
                            { required: true, message: 'Vui lòng chọn chủ nhà nhận' },
                            () => ({
                                validator(_, value) {
                                    if (!value) return Promise.resolve()
                                    if (leaseContract?.landlord_id && value === leaseContract.landlord_id) {
                                        return Promise.reject(new Error('Chủ nhà mới phải khác chủ nhà hiện tại'))
                                    }
                                    return Promise.resolve()
                                },
                            }),
                        ]}>
                        <Select
                            showSearch
                            allowClear
                            placeholder="Tìm kiếm chủ nhà..."
                            filterOption={false}
                            optionFilterProp="label"
                            loading={isLoadingCustomers}
                            onSearch={setLandlordSearch}
                            onPopupScroll={handleCustomerScroll}
                            options={landlordOptions}
                        />
                    </Form.Item>
                )}

                {transferType === TRANSFER_TYPE.PRODUCT && (
                    <>
                        <Form.Item
                            label="Hàng hoá / Căn"
                            name="target_id"
                            rules={[
                                { required: true, message: 'Vui lòng chọn hàng hoá' },
                                ({ getFieldValue }) => ({
                                    validator() {
                                        const value = getFieldValue('target_id')
                                        const targetUnit = (getFieldValue('target_unit') || '').toString().trim()
                                        const currentProdId = leaseContract?.product_id
                                        const currentUnit = (leaseContract?.unit_product || '').toString().trim()
                                        if (!value) return Promise.resolve()
                                        if (currentProdId && value === currentProdId && targetUnit === currentUnit) {
                                            return Promise.reject(new Error('Hàng hoá/đơn vị mới phải khác hiện tại'))
                                        }
                                        return Promise.resolve()
                                    },
                                }),
                            ]}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Tìm kiếm hàng hoá..."
                                filterOption={false}
                                optionFilterProp="label"
                                loading={isLoadingProducts}
                                onSearch={setProductSearch}
                                onPopupScroll={handleProductScroll}
                                options={productOptions}
                            />
                        </Form.Item>

                        <Form.Item label="Đơn vị" name="target_unit">
                            <Input placeholder="Ví dụ: Phòng 101, Căn A" />
                        </Form.Item>
                    </>
                )}

                <Form.Item
                    label="Ngày Hiệu Lực"
                    name="effective_date"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày hiệu lực' }]}>
                    <DatePicker className="!w-full" format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item label="Ghi Chú / Lý Do" name="note">
                    <Input.TextArea placeholder="Nhập lý do chuyển nhượng..." rows={3} />
                </Form.Item>

                <Form.Item>
                    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={confirmLoading}>
                            Xác nhận
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
