import {
    Form,
    message,
    Modal,
    Card,
    Row,
    Col,
    Select,
    InputNumber,
    Input,
    Button,
    Typography,
    Spin,
    Space,
    Divider,
} from 'antd'
import { useGetOpportunityDetailQuery, useConvertToTransactionMutation } from '@/api/opportunity'
import { useGetAccountListQuery } from '@/api/account'
import { useGetProductDetailQuery } from '@/api/product'
import { useNavigate, useParams } from 'react-router'
import type { ConvertToTransactionInput } from '@/types/opportunity'
import { TransactionStage, TransactionStageLabels } from '@/types/opportunity'
import { useEffect, useMemo } from 'react'
import { formatter, parser } from '@/utils/number-utils'
import { app } from '@/config/app'
import { NEED_TYPE_OPTIONS, OpportunityStage } from '@/config/constant'

const { TextArea } = Input

const TRANSACTION_STAGE_OPTIONS = Object.entries(TransactionStageLabels).map(([value, label]) => ({
    value: Number(value),
    label,
}))

const ConvertToTransaction = () => {
    const { opportunityId } = useParams<{ opportunityId: string }>()
    const id = Number(opportunityId)
    const navigate = useNavigate()
    const [form] = Form.useForm<ConvertToTransactionInput>()
    const [convertToTransaction, { isLoading }] = useConvertToTransactionMutation()

    const { data, isLoading: isLoadingDetail } = useGetOpportunityDetailQuery(
        { opportunity_id: id },
        {
            skip: Number.isNaN(id),
            refetchOnMountOrArgChange: true,
        },
    )

    const opportunity = useMemo(() => data?.data, [data])

    const { data: productData } = useGetProductDetailQuery(
        { product_id: opportunity?.product_id as number },
        { skip: !opportunity?.product_id },
    )

    useEffect(() => {
        if (opportunity?.need) {
            form.setFieldValue('transaction_type', opportunity.need)
        }
        if (opportunity?.stage === OpportunityStage.GD_HOAN_TAT) {
            form.setFieldValue('stage', TransactionStage.GD_HOAN_TAT)
        }
    }, [opportunity, form])

    const productName = opportunity?.product_rel?.name || productData?.data?.name || app.EMPTY_DISPLAY

    const { data: accountsData } = useGetAccountListQuery({ per_page: app.FETCH_ALL, is_option: true })

    const handleSubmit = async (values: ConvertToTransactionInput) => {
        try {
            await convertToTransaction({
                opportunity_id: id,
                payload: {
                    stage: values.stage,
                    final_price: values.final_price,
                    deposit_amount: values.deposit_amount,
                    commission_total: values.commission_total,
                    payment_method: values.payment_method,
                    notes: values.notes,
                    transaction_type: values.transaction_type,
                },
            }).unwrap()

            message.success('Chuyển đổi thành giao dịch thành công!')
            navigate('/transactions', { replace: true })
        } catch {
            message.error('Chuyển đổi thất bại, vui lòng thử lại!')
        }
    }

    const handleCancel = () => {
        navigate('/deals')
    }

    const assignedToName = accountsData?.data?.list?.find(a => a.id === opportunity?.assigned_to)?.full_name || '-'

    return (
        <Modal
            open={true}
            title="Chuyển đổi Deal thành Giao dịch"
            footer={null}
            width={700}
            onCancel={handleCancel}
            centered>
            <Spin spinning={isLoadingDetail}>
                {opportunity && (
                    <Card size="small" className="!mb-4 bg-blue-50">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Space size={4}>
                                    <Typography.Text type="secondary">Mã Deal:</Typography.Text>
                                    <Typography.Text strong>{`#${opportunity.id}`}</Typography.Text>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size={2}>
                                    <Typography.Text type="secondary">Khách hàng:</Typography.Text>
                                    <Typography.Text strong>{opportunity.name || app.EMPTY_DISPLAY}</Typography.Text>
                                </Space>
                            </Col>
                        </Row>
                        <Divider className="!my-2" />
                        <Row gutter={16}>
                            <Col span={12}>
                                <Typography.Text type="secondary">BĐS: {productName}</Typography.Text>
                            </Col>
                            <Col span={12}>
                                <Typography.Text type="secondary">Chuyên viên: {assignedToName}</Typography.Text>
                            </Col>
                        </Row>
                    </Card>
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        stage: TransactionStage.DAT_COC,
                    }}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Trạng thái giao dịch"
                                name="stage"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                                <Select placeholder="Chọn trạng thái" options={TRANSACTION_STAGE_OPTIONS} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Nhu cầu" name="transaction_type">
                                <Select placeholder="Chọn nhu cầu" options={NEED_TYPE_OPTIONS} allowClear />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Giá trị giao dịch dự kiến (Tỷ)"
                                name="final_price"
                                rules={[{ required: true, message: 'Vui lòng nhập giá trị giao dịch dự kiến' }]}>
                                <InputNumber
                                    className="!w-full"
                                    placeholder="10.5"
                                    min={0}
                                    step={0.1}
                                    addonAfter="Tỷ"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Tiền đặt cọc (Triệu)" name="deposit_amount">
                                <InputNumber
                                    className="!w-full"
                                    placeholder="100"
                                    min={0}
                                    addonAfter="Triệu"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Tổng hoa hồng (Triệu)" name="commission_total">
                                <InputNumber
                                    className="!w-full"
                                    placeholder="50"
                                    min={0}
                                    addonAfter="Triệu"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Hình thức thanh toán" name="payment_method">
                                <Input placeholder="VD: Tiền mặt / Chuyển khoản" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Ghi chú giao dịch" name="notes">
                                <TextArea rows={3} placeholder="Ghi chú thêm về giao dịch..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Row justify="end" gutter={12}>
                        <Col>
                            <Button onClick={handleCancel}>Hủy</Button>
                        </Col>
                        <Col>
                            <Button type="primary" htmlType="submit" loading={isLoading}>
                                Chuyển đổi thành Giao dịch
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    )
}

export default ConvertToTransaction
