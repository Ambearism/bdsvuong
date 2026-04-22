import { Modal, Row, Col, Typography, Card, Button, Form, Input, Select, Switch } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useGetLeaseContractInvoicesQuery } from '@/api/lease-contract'
import type {
    LeaseContractPaymentBase,
    LeaseContractPaymentSubtype,
    LeaseContractPaymentUpdateInput,
} from '@/types/lease-contract'
import { LEASE_CONTRACT_PAYMENT_STATUS } from '@/config/constant'
import { useGetCostCategoryGroupsQuery } from '@/api/cost-category'
import { app } from '@/config/app'

const { Title, Text } = Typography

type PaymentWithSubtype = LeaseContractPaymentBase & { sub_type?: LeaseContractPaymentSubtype }

type Props = {
    visible: boolean
    payment?: PaymentWithSubtype
    onCancel: () => void
    onConfirm: (payload: LeaseContractPaymentUpdateInput) => Promise<void>
    saving?: boolean
}

type RejectFormValues = {
    cost_category_group_id?: number
    cost_category_item_id?: number
    lease_contract_invoice_ids?: number[]
    taxable?: boolean
    note?: string
}

const LeaseContractPaymentRejectModal = ({ visible, payment, onCancel, onConfirm, saving }: Props) => {
    const [form] = Form.useForm<RejectFormValues>()

    useEffect(() => {
        if (visible && payment) {
            form.setFieldsValue({
                cost_category_group_id: payment.cost_category_group_id,
                cost_category_item_id: payment.cost_category_item_id,
                lease_contract_invoice_ids: payment.lease_contract_invoice_ids,
                taxable: payment.taxable,
                note: payment.note,
            })
        } else {
            form.resetFields()
        }
    }, [visible, payment, form])

    const { data: invoicesData, isFetching: isLoadingInvoices } = useGetLeaseContractInvoicesQuery(
        { lease_contract_id: payment?.lease_contract_id || 0 },
        { skip: !visible || !payment?.lease_contract_id, refetchOnMountOrArgChange: true },
    )

    const { data: costCategoryGroupsData } = useGetCostCategoryGroupsQuery(undefined, {
        skip: !visible,
        refetchOnMountOrArgChange: true,
    })

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
        return items.map((invoice, index) => ({
            label: `Kỳ ${index + 1} | ${dayjs(invoice.period_start).format('DD/MM/YYYY')} - ${dayjs(invoice.period_end).format('DD/MM/YYYY')}`,
            value: invoice.id,
        }))
    }, [invoicesData?.data])

    const handleReject = async () => {
        if (!payment) return

        const payload: LeaseContractPaymentUpdateInput = {
            lease_contract_id: payment.lease_contract_id,
            lease_contract_invoice_ids: payment.lease_contract_invoice_ids,
            amount: payment.amount,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            cost_category_group_id: payment.cost_category_group_id,
            cost_category_item_id: payment.cost_category_item_id,
            taxable: payment.taxable,
            status: LEASE_CONTRACT_PAYMENT_STATUS.REJECTED,
            paid_by: payment.paid_by,
        }
        await onConfirm(payload)
    }

    return (
        <Modal open={visible} onCancel={onCancel} footer={null} width={520} destroyOnClose>
            <div className="flex items-start justify-between">
                <Title level={4} className="!mb-0">
                    Từ Chối Dòng Tiền
                </Title>
            </div>

            <Card size="small" className="!mt-2 !mb-2 !bg-red-50 !border-red-200">
                <Row gutter={16}>
                    <Col span={14}>
                        <Text type="secondary">Giao dịch gốc</Text>
                        <div>
                            <Text strong className="!text-xl">
                                {payment ? `${payment.amount} triệu` : app.EMPTY_DISPLAY}
                            </Text>
                            <Text type="secondary" className="ml-2">
                                {payment?.payment_date || app.EMPTY_DISPLAY}
                            </Text>
                        </div>
                        <div>
                            {payment?.paid_by_rel.name || app.EMPTY_DISPLAY} -{' '}
                            {payment?.paid_by_rel?.phone || app.EMPTY_DISPLAY}
                        </div>
                    </Col>
                    <Col span={10} className="text-right">
                        <Text type="secondary">Người Nhập Liệu</Text>
                        <div>
                            <Text strong className="!text-xl">
                                {payment?.created_by_rel?.full_name || app.EMPTY_DISPLAY}
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            <div className="mb-3 flex items-center gap-2 mt-3">
                <Text strong>Phân loại kế toán</Text>
                <Text type="secondary">(Chỉ xem, không thể chỉnh sửa)</Text>
            </div>

            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="1. Nhóm danh mục chi phí" name="cost_category_group_id">
                            <Select disabled placeholder="Chọn nhóm danh mục" options={costCategoryGroupOptions} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="2. Mục chi phí" name="cost_category_item_id">
                            <Select disabled placeholder="Chọn mục chi phí" options={costCategoryItemOptions} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="3. Kỳ thanh toán" name="lease_contract_invoice_ids">
                            <Select
                                mode="multiple"
                                disabled
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
                                    <Switch disabled />
                                </Form.Item>
                                <Text type="secondary" className="block text-xs !flex-1">
                                    Số tiền này sẽ được cộng vào doanh thu tính thuế của chủ nhà trong năm nay.
                                </Text>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Ghi chú" readOnly disabled />
                </Form.Item>

                <div className="flex justify-between mt-2">
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button danger type="primary" onClick={handleReject} loading={saving}>
                        Xác nhận Từ chối
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}

export default LeaseContractPaymentRejectModal
