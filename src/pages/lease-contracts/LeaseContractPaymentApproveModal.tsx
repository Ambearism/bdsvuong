import { Modal, Row, Col, Typography, Form, Select, Switch, Input, Button, Card, DatePicker, InputNumber } from 'antd'
import dayjs from 'dayjs'
import { useGetLeaseContractInvoicesQuery } from '@/api/lease-contract'
import { useMemo } from 'react'
import type { LeaseContractPaymentBase, LeaseContractPaymentUpdateInput } from '@/types/lease-contract'
import { useEffect } from 'react'
import { LEASE_CONTRACT_PAYMENT_STATUS } from '@/config/constant'
import { useGetCostCategoryGroupsQuery } from '@/api/cost-category'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/vi'
import { app } from '@/config/app'
import type { Dayjs } from 'dayjs'
import { formatter, parser } from '@/utils/number-utils'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.locale('vi')

const { Title, Text } = Typography

type Props = {
    visible: boolean
    payment?: LeaseContractPaymentBase | undefined
    onCancel: () => void
    onConfirm: (payload: LeaseContractPaymentUpdateInput) => Promise<void>
    saving?: boolean
}

type LeaseContractPaymentFormValues = {
    amount: number
    payment_date: Dayjs
    cost_category_group_id: number
    cost_category_item_id: number
    lease_contract_invoice_ids?: number[]
    taxable: boolean
    note?: string
}

const parsePaymentDate = (raw?: string): Dayjs | undefined => {
    if (!raw) return undefined

    const strictFormattedDate = dayjs(raw, 'HH:mm DD/MM/YYYY', true)
    if (strictFormattedDate.isValid()) return strictFormattedDate

    const fallbackDate = dayjs(raw)
    return fallbackDate.isValid() ? fallbackDate : undefined
}

const LeaseContractPaymentApproveModal = ({ visible, payment, onCancel, onConfirm, saving }: Props) => {
    const [form] = Form.useForm<LeaseContractPaymentFormValues>()

    useEffect(() => {
        if (visible && payment) {
            form.setFieldsValue({
                amount: payment.amount,
                payment_date: parsePaymentDate(payment.payment_date),
                taxable: payment.taxable || false,
                lease_contract_invoice_ids: payment.lease_contract_invoice_ids || [],
                cost_category_group_id: payment.cost_category_group_id || undefined,
                cost_category_item_id: payment.cost_category_item_id || undefined,
                note: payment.note || undefined,
            })
        } else {
            form.resetFields()
        }
    }, [visible, payment, form])

    const { data: invoicesData, isFetching: isLoadingInvoices } = useGetLeaseContractInvoicesQuery(
        { lease_contract_id: payment?.lease_contract_id || 0 },
        { skip: !visible || !payment?.lease_contract_id, refetchOnMountOrArgChange: true },
    )

    const { data: costCategoryGroupsData, isFetching: isLoadingCostCategoryGroups } = useGetCostCategoryGroupsQuery(
        undefined,
        {
            skip: !visible,
            refetchOnMountOrArgChange: true,
        },
    )

    const costCategoryGroupOptions = useMemo(() => {
        return (costCategoryGroupsData?.data || []).map(group => ({
            value: group.id,
            label: group.name,
            items: group.items || [],
        }))
    }, [costCategoryGroupsData?.data])

    const watchCostCategoryGroupId = Form.useWatch('cost_category_group_id', form)

    const costCategoryItemOptions = useMemo(() => {
        const selectedGroup = costCategoryGroupOptions.find(g => g.value === watchCostCategoryGroupId)
        return (selectedGroup?.items || []).map(item => ({
            value: item.id,
            label: item.name,
        }))
    }, [costCategoryGroupOptions, watchCostCategoryGroupId])

    const invoiceOptions = useMemo(() => {
        const items = invoicesData?.data || []
        return items.map((invoice, index) => {
            const title = invoice.title ?? `Kỳ ${index + 1}`
            const baseLabel = `${title} | Hạn ${dayjs(invoice.due_date).format('DD/MM/YYYY')}`
            return {
                label: baseLabel,
                value: invoice.id,
            }
        })
    }, [invoicesData?.data])

    const handleApprove = async () => {
        if (!payment) return

        await form.validateFields()
        const values = form.getFieldsValue()
        const payload: LeaseContractPaymentUpdateInput = {
            ...values,
            lease_contract_invoice_ids: values.lease_contract_invoice_ids?.length
                ? values.lease_contract_invoice_ids
                : payment.lease_contract_invoice_ids,
            lease_contract_id: payment.lease_contract_id,
            cost_category_group_id: values.cost_category_group_id,
            cost_category_item_id: values.cost_category_item_id,
            amount: values.amount,
            payment_date: values.payment_date.toISOString(),
            payment_method: payment.payment_method,
            status: LEASE_CONTRACT_PAYMENT_STATUS.APPROVED,
            paid_by: payment.paid_by,
        }
        await onConfirm(payload)
    }

    return (
        <Modal open={visible} onCancel={onCancel} footer={null} width={550} closable>
            <div className="flex items-start justify-between">
                <Title level={4} className="!mb-0">
                    Chuẩn Hóa & Duyệt Dòng Tiền
                </Title>
            </div>

            <Card size="small" className="!mt-2 !mb-2 !bg-emerald-50 !border-emerald-200">
                <Row gutter={16}>
                    <Col span={14}>
                        <Text type="secondary">Giao dịch gốc</Text>
                        <div>
                            <Text strong className="!text-xl">
                                {payment ? `${payment.amount} triệu` : app.EMPTY_DISPLAY}
                            </Text>
                            <Text type="secondary" className="ml-2">
                                {payment?.payment_date}
                            </Text>
                        </div>
                        <div>
                            {payment?.paid_by_rel.name} - {payment?.paid_by_rel?.phone}
                        </div>
                    </Col>
                    <Col span={10} className="text-right">
                        <Text type="secondary">Người Nhập Liệu</Text>
                        <div>
                            <Text strong className="!text-xl">
                                {payment?.created_by_rel?.full_name || '-'}
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            <div className="mb-3 flex items-center gap-2 mt-3">
                <Text strong>Phân loại kế toán</Text>
            </div>

            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Số tiền"
                            name="amount"
                            rules={[
                                {
                                    validator: (_, value: number | undefined) =>
                                        value && value >= 0.01
                                            ? Promise.resolve()
                                            : Promise.reject(new Error('Vui lòng nhập số tiền lớn hơn 0')),
                                },
                            ]}>
                            <InputNumber
                                className="!w-full"
                                addonAfter="triệu"
                                min={0.01}
                                formatter={formatter}
                                parser={parser}
                                placeholder="Nhập số tiền"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Ngày nhận tiền"
                            name="payment_date"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày nhận tiền' }]}>
                            <DatePicker
                                className="!w-full"
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn ngày nhận tiền"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="1. Nhóm danh mục chi phí"
                            name="cost_category_group_id"
                            rules={[{ required: true, message: 'Vui lòng chọn nhóm danh mục chi phí' }]}>
                            <Select
                                placeholder="Chọn nhóm danh mục"
                                options={costCategoryGroupOptions}
                                loading={isLoadingCostCategoryGroups}
                                showSearch
                                optionFilterProp="label"
                                onChange={() => form.setFieldValue('cost_category_item_id', undefined)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="2. Mục chi phí"
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

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="3. Kỳ thanh toán"
                            name="lease_contract_invoice_ids"
                            rules={[
                                {
                                    validator: (_, value: number[] | undefined) =>
                                        value && value.length > 0
                                            ? Promise.resolve()
                                            : Promise.reject(new Error('Vui lòng chọn ít nhất 1 kỳ thanh toán')),
                                },
                            ]}>
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Chọn kỳ thanh toán (có thể chọn nhiều)"
                                options={invoiceOptions}
                                loading={isLoadingInvoices}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Card size="small" className="!mt-2 !mb-2 !flex">
                            <div className="flex">
                                <Form.Item
                                    name="taxable"
                                    label="Tính thuế (Taxable)"
                                    valuePropName="checked"
                                    className="flex-1">
                                    <Switch />
                                </Form.Item>
                                <Text type="secondary" className="block text-xs !flex-1">
                                    Số tiền này sẽ được cộng vào doanh thu tính thuế của chủ nhà trong năm nay.
                                </Text>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Ghi chú (tuỳ chọn)" />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <Button onClick={onCancel}>Hủy bỏ</Button>
                    <Button type="primary" onClick={handleApprove} loading={saving}>
                        Xác nhận Duyệt
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}

export default LeaseContractPaymentApproveModal
