import { app } from '@/config/app'
import { useDebounce } from '@/hooks/useDebounce'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import { useCreateLeaseContractPaymentMutation, useGetLeaseContractInvoicesQuery } from '@/api/lease-contract'
import { useGetCustomerListQuery } from '@/api/customer'
import { useGetCostCategoryGroupsQuery } from '@/api/cost-category'
import { useGetCareCaseContractsQuery } from '@/api/care-case-tax'
import type { LeaseContractInvoiceBase, LeaseContractItem, LeaseContractPaymentMethod } from '@/types/lease-contract'
import { formatter, parser } from '@/utils/number-utils'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Typography,
    message,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import { useEffect, useMemo, useState } from 'react'
import BaseFileUpload from '@/components/base/BaseFileUpload'
import {
    LEASE_CONTRACT_INVOICE_STATUS,
    LEASE_CONTRACT_PAYMENT_METHOD,
    LEASE_CONTRACT_PAYMENT_STATUS,
    PAYMENT_METHOD_LABELS,
} from '@/config/constant'

dayjs.extend(relativeTime)
dayjs.locale('vi')

type CashflowFormValues = {
    payment_date: Dayjs
    paid_by: number
    amount: number
    payment_method: LeaseContractPaymentMethod
    invoice_ids?: number[]
    cost_category_group_id: number
    cost_category_item_id: number
    lease_contract_id?: number
    taxable: boolean
    note?: string
    file_urls?: string
}

const PAYMENT_METHOD_OPTIONS: Array<{ label: string; value: LeaseContractPaymentMethod }> = [
    {
        label: PAYMENT_METHOD_LABELS.BANK_TRANSFER,
        value: LEASE_CONTRACT_PAYMENT_METHOD.BANK_TRANSFER,
    },
    { label: PAYMENT_METHOD_LABELS.CASH, value: LEASE_CONTRACT_PAYMENT_METHOD.CASH },
    {
        label: PAYMENT_METHOD_LABELS.CREDIT_CARD,
        value: LEASE_CONTRACT_PAYMENT_METHOD.CREDIT_CARD,
    },
]

type CashflowEntryModalProps = {
    open: boolean
    leaseContract?: LeaseContractItem
    careId?: number
    onCancel: () => void
    onSuccess?: () => void
    initialInvoiceIds?: number[]
}

const CashflowEntryModal = ({
    open,
    leaseContract,
    careId,
    onCancel,
    onSuccess,
    initialInvoiceIds,
}: CashflowEntryModalProps) => {
    const [cashflowForm] = Form.useForm<CashflowFormValues>()
    const watchLeaseContractId = Form.useWatch('lease_contract_id', cashflowForm)

    const { data: careContractsData, isFetching: isLoadingCareContracts } = useGetCareCaseContractsQuery(careId || 0, {
        skip: !open || !careId,
    })

    const internalLeaseContract = useMemo(() => {
        if (leaseContract) return leaseContract
        if (careContractsData?.data) {
            return careContractsData.data.find(c => c.id === watchLeaseContractId)
        }
        return undefined
    }, [leaseContract, careContractsData?.data, watchLeaseContractId])

    const [payerSearch, setPayerSearch] = useState('')
    const debouncedPayerSearch = useDebounce(payerSearch, 500)
    const [payerPage, setPayerPage] = useState(app.DEFAULT_PAGE)

    const { data: invoicesData, isFetching: isLoadingInvoices } = useGetLeaseContractInvoicesQuery(
        {
            lease_contract_id: internalLeaseContract?.id || 0,
        },
        {
            skip: !open || !internalLeaseContract?.id,
            refetchOnMountOrArgChange: true,
        },
    )

    const { data: payerCustomers, isFetching: isLoadingPayers } = useGetCustomerListQuery(
        {
            keyword: debouncedPayerSearch || undefined,
            page: payerPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        {
            skip: !open,
        },
    )
    const { accumulatedItems: payerOptionsData, handleScroll: handlePayerScroll } = useSelectInfiniteScroll({
        items: (payerCustomers?.data?.items ?? []) as Array<{ id: number; name?: string; phone?: string }>,
        isFetching: isLoadingPayers,
        debouncedKeyword: debouncedPayerSearch,
        page: payerPage,
        setPage: setPayerPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const { data: costCategoryGroupsData, isFetching: isLoadingCostCategoryGroups } = useGetCostCategoryGroupsQuery(
        undefined,
        {
            skip: !open,
            refetchOnMountOrArgChange: true,
        },
    )

    const [createLeaseContractPayment, { isLoading: isCreatingCashflow }] = useCreateLeaseContractPaymentMutation()

    const invoiceItems = useMemo(() => invoicesData?.data || [], [invoicesData?.data])

    const defaultInvoiceId = useMemo(() => {
        if (!invoiceItems.length) return undefined
        const today = dayjs().startOf('day')

        const nearestUnpaid = invoiceItems
            .filter(invoice => invoice.status === LEASE_CONTRACT_INVOICE_STATUS.UNPAID)
            .sort((first, second) => {
                const firstDiff = Math.abs(dayjs(first.due_date).startOf('day').diff(today, 'day'))
                const secondDiff = Math.abs(dayjs(second.due_date).startOf('day').diff(today, 'day'))
                if (firstDiff !== secondDiff) return firstDiff - secondDiff
                const dueDateDiff = dayjs(first.due_date).valueOf() - dayjs(second.due_date).valueOf()
                if (dueDateDiff !== 0) return dueDateDiff
                return second.id - first.id
            })[0]

        if (nearestUnpaid) return nearestUnpaid.id

        const nearestAvailable = invoiceItems
            .filter(invoice => invoice.status !== LEASE_CONTRACT_INVOICE_STATUS.PAID)
            .sort((first, second) => {
                const firstDiff = Math.abs(dayjs(first.due_date).startOf('day').diff(today, 'day'))
                const secondDiff = Math.abs(dayjs(second.due_date).startOf('day').diff(today, 'day'))
                if (firstDiff !== secondDiff) return firstDiff - secondDiff
                const dueDateDiff = dayjs(first.due_date).valueOf() - dayjs(second.due_date).valueOf()
                if (dueDateDiff !== 0) return dueDateDiff
                return second.id - first.id
            })[0]

        return nearestAvailable?.id
    }, [invoiceItems])

    useEffect(() => {
        if (!open) return

        if (leaseContract) {
            cashflowForm.setFieldsValue({
                payment_date: dayjs(),
                paid_by: leaseContract.tenant_id,
                amount: 0,
                payment_method: LEASE_CONTRACT_PAYMENT_METHOD.BANK_TRANSFER,
                cost_category_group_id: undefined as unknown as number,
                cost_category_item_id: undefined as unknown as number,
                taxable: true,
            })
        } else if (careId) {
            cashflowForm.setFieldsValue({
                payment_date: dayjs(),
                amount: 0,
                payment_method: LEASE_CONTRACT_PAYMENT_METHOD.BANK_TRANSFER,
                cost_category_group_id: undefined as unknown as number,
                cost_category_item_id: undefined as unknown as number,
                taxable: true,
            })
        }
    }, [cashflowForm, leaseContract, careId, open])

    useEffect(() => {
        if (!open || !internalLeaseContract) return
        cashflowForm.setFieldValue('paid_by', internalLeaseContract.tenant_id)
    }, [internalLeaseContract, cashflowForm, open])

    useEffect(() => {
        if (!open || !defaultInvoiceId) return
        if (initialInvoiceIds && initialInvoiceIds.length) {
            cashflowForm.setFieldValue('invoice_ids', initialInvoiceIds)
        } else {
            cashflowForm.setFieldValue('invoice_ids', [defaultInvoiceId])
        }
    }, [cashflowForm, defaultInvoiceId, open, initialInvoiceIds])

    useEffect(() => {
        if (!open) {
            setPayerSearch('')
            cashflowForm.resetFields()
        }
    }, [cashflowForm, open])

    const customerSelectOptions = useMemo(() => {
        const optionsMap = new Map<number, string>()

        payerOptionsData.forEach(customer => {
            optionsMap.set(customer.id, `${customer.name} - ${customer.phone || app.EMPTY_DISPLAY}`)
        })

        if (internalLeaseContract?.tenant_rel) {
            optionsMap.set(
                internalLeaseContract.tenant_id,
                `${internalLeaseContract.tenant_rel.name} - ${internalLeaseContract.tenant_rel.phone || app.EMPTY_DISPLAY}`,
            )
        }

        if (internalLeaseContract?.landlord_rel) {
            optionsMap.set(
                internalLeaseContract.landlord_id,
                `${internalLeaseContract.landlord_rel.name} - ${internalLeaseContract.landlord_rel.phone || app.EMPTY_DISPLAY}`,
            )
        }

        return Array.from(optionsMap.entries()).map(([value, label]) => ({ value, label }))
    }, [internalLeaseContract, payerOptionsData])

    const invoiceSelectOptions = useMemo(() => {
        return invoiceItems.map((invoice: LeaseContractInvoiceBase, index: number) => {
            const title = invoice.title ?? `Kỳ ${index + 1}`
            const baseLabel = `${title} | Hạn ${dayjs(invoice.due_date).format('DD/MM/YYYY')}`

            const isPending = Boolean(invoice.has_pending_payment)
            const isApproved = Boolean(invoice.has_approved_payment)

            const label = (
                <span title={baseLabel}>
                    {baseLabel}
                    {isPending && <ClockCircleOutlined className="!text-[#faad14] ml-2" />}
                    {isApproved && <CheckCircleOutlined className="!text-[#52c41a] ml-2" />}
                </span>
            )

            return {
                value: invoice.id,
                label,
            }
        })
    }, [invoiceItems])

    const costCategoryGroupOptions = useMemo(() => {
        return (costCategoryGroupsData?.data || []).map(group => ({
            value: group.id,
            label: group.name,
            items: group.items || [],
        }))
    }, [costCategoryGroupsData?.data])

    const watchCostCategoryGroupId = Form.useWatch('cost_category_group_id', cashflowForm)

    const costCategoryItemOptions = useMemo(() => {
        const selectedGroup = costCategoryGroupOptions.find(g => g.value === watchCostCategoryGroupId)
        return (selectedGroup?.items || []).map(item => ({
            value: item.id,
            label: item.name,
        }))
    }, [costCategoryGroupOptions, watchCostCategoryGroupId])

    useEffect(() => {
        if (!open) return
        cashflowForm.setFieldValue('cost_category_item_id', undefined)
    }, [watchCostCategoryGroupId, cashflowForm, open])

    const handleCashflowSubmit = async (values: CashflowFormValues) => {
        if (!internalLeaseContract) return

        try {
            const invoiceIds = values.invoice_ids?.filter(Boolean) || []
            await createLeaseContractPayment({
                lease_contract_id: internalLeaseContract.id,
                ...(invoiceIds.length ? { lease_contract_invoice_ids: invoiceIds } : {}),
                amount: values.amount,
                paid_by: values.paid_by,
                payment_date: values.payment_date.toISOString(),
                payment_method: values.payment_method,
                cost_category_group_id: values.cost_category_group_id,
                cost_category_item_id: values.cost_category_item_id,
                taxable: values.taxable,
                status: LEASE_CONTRACT_PAYMENT_STATUS.PENDING,
                note: values.note?.trim() || undefined,
                file_urls: values.file_urls,
            }).unwrap()

            message.success('Tạo dòng tiền thành công')
            onSuccess?.()
            onCancel()
        } catch {
            message.error('Tạo dòng tiền thất bại, vui lòng thử lại')
        }
    }

    return (
        <Modal open={open} title="Tạo Dòng Tiền" onCancel={onCancel} footer={null} width={760} centered destroyOnHidden>
            <Alert
                type="info"
                showIcon
                message="Dòng tiền sẽ được tạo với trạng thái CHỜ DUYỆT. Cần duyệt để tính vào báo cáo."
                className="!mb-4"
            />

            <Form<CashflowFormValues>
                form={cashflowForm}
                layout="vertical"
                onFinish={handleCashflowSubmit}
                initialValues={{
                    payment_date: dayjs(),
                    amount: 0,
                    payment_method: LEASE_CONTRACT_PAYMENT_METHOD.BANK_TRANSFER,
                    cost_category_group_id: undefined as unknown as number,
                    cost_category_item_id: undefined as unknown as number,
                    taxable: true,
                }}>
                {careId && !leaseContract && (
                    <Form.Item
                        label="Chọn hợp đồng thuê"
                        name="lease_contract_id"
                        rules={[{ required: true, message: 'Vui lòng chọn hợp đồng thuê' }]}>
                        <Select
                            placeholder="Chọn hợp đồng của Care này"
                            loading={isLoadingCareContracts}
                            options={careContractsData?.data?.map(c => ({
                                value: c.id,
                                label: `HĐ #${c.id} - ${c.tenant_rel?.name} | ${c.product_rel?.name || ''}`,
                            }))}
                        />
                    </Form.Item>
                )}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Ngày nhận tiền"
                            name="payment_date"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày nhận tiền' }]}>
                            <DatePicker
                                className="!w-full"
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn ngày giờ nhận tiền"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Người nộp / chuyển khoản"
                            name="paid_by"
                            rules={[{ required: true, message: 'Vui lòng chọn người nộp / chuyển khoản' }]}>
                            <Select
                                showSearch
                                allowClear
                                filterOption={false}
                                optionFilterProp="label"
                                placeholder="Chọn người nộp / chuyển khoản"
                                loading={isLoadingPayers}
                                onSearch={setPayerSearch}
                                onPopupScroll={handlePayerScroll}
                                options={customerSelectOptions}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Card size="small" className="!mb-4 !bg-emerald-50 !border-emerald-200">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Số tiền thực nhận"
                                name="amount"
                                rules={[
                                    {
                                        validator: (_, value: number | undefined) =>
                                            value && value >= 0.01
                                                ? Promise.resolve()
                                                : Promise.reject(
                                                      new Error('Vui lòng nhập số tiền thực nhận lớn hơn 0'),
                                                  ),
                                    },
                                ]}>
                                <InputNumber
                                    className="!w-full"
                                    addonAfter="triệu"
                                    min={0.01}
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Phương thức"
                                name="payment_method"
                                rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}>
                                <Select placeholder="Chọn phương thức" options={PAYMENT_METHOD_OPTIONS} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item label="Kỳ thu tiền" name="invoice_ids">
                            <Select
                                mode="multiple"
                                showSearch
                                optionFilterProp="label"
                                placeholder="Chọn invoice (có thể chọn nhiều)"
                                loading={isLoadingInvoices}
                                options={invoiceSelectOptions}
                                allowClear
                                maxTagCount="responsive"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Nhóm danh mục chi phí"
                            name="cost_category_group_id"
                            rules={[{ required: true, message: 'Vui lòng chọn nhóm danh mục chi phí' }]}>
                            <Select
                                placeholder="Chọn nhóm danh mục"
                                options={costCategoryGroupOptions}
                                loading={isLoadingCostCategoryGroups}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Mục chi phí"
                            name="cost_category_item_id"
                            rules={[{ required: true, message: 'Vui lòng chọn mục chi phí' }]}>
                            <Select
                                placeholder="Chọn mục chi phí"
                                options={costCategoryItemOptions}
                                showSearch
                                optionFilterProp="label"
                                disabled={!watchCostCategoryGroupId}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Ghi chú / Diễn giải" name="note">
                    <Input.TextArea rows={3} placeholder="VD: Thanh toán tiền nhà T12/2023..." />
                </Form.Item>

                <Card
                    title={<Typography.Text strong>Tài liệu liên quan</Typography.Text>}
                    size="small"
                    className="!mb-4">
                    <Form.Item name="file_urls" noStyle>
                        <BaseFileUpload folder="lease_contracts_payments/" />
                    </Form.Item>
                </Card>

                <Flex justify="flex-end" gap={12}>
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={isCreatingCashflow}>
                        Lưu Dòng Tiền
                    </Button>
                </Flex>
            </Form>
        </Modal>
    )
}

export default CashflowEntryModal
