import { useRenewLeaseContractMutation } from '@/api/lease-contract'
import { app } from '@/config/app'
import { BILLING_CYCLE_OPTIONS, BILLING_CYCLE_VALUE, BILLING_CYCLE_VALUE_MAP } from '@/config/constant'
import { padId, withPrice } from '@/lib/utils'
import type { BillingCycleValue, LeaseContractBillingUnit, LeaseContractItem } from '@/types/lease-contract'
import { ArrowRightOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Typography, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo } from 'react'

const { Text } = Typography

interface RenewLeaseModalProps {
    open: boolean
    onCancel: () => void
    leaseContract?: LeaseContractItem
    onSuccess?: (leaseContractId: number) => void
}

type BillingCycleMapValue = { billing_period?: number; billing_unit?: LeaseContractBillingUnit }

type RenewLeaseFormValues = {
    start_date?: Dayjs
    end_date?: Dayjs
    price?: number
    billing_cycle?: BillingCycleValue
    note?: string
}

const resolveBillingCycle = (billingPeriod?: number, billingUnit?: LeaseContractBillingUnit): BillingCycleValue => {
    const entries = Object.entries(BILLING_CYCLE_VALUE_MAP) as [BillingCycleValue, BillingCycleMapValue][]
    const match = entries.find(
        ([, config]) => config.billing_period === billingPeriod && config.billing_unit === billingUnit,
    )
    return match?.[0] ?? BILLING_CYCLE_VALUE.ONE_TIME
}

export default function RenewLeaseModal({ open, onCancel, leaseContract, onSuccess }: RenewLeaseModalProps) {
    const [form] = Form.useForm<RenewLeaseFormValues>()
    const [renewLeaseContract, { isLoading }] = useRenewLeaseContractMutation()

    const continuationStartDate = useMemo(() => {
        if (!leaseContract) return undefined

        const children = ((leaseContract as LeaseContractItem).child_lease_contracts_rel ?? []) as LeaseContractItem[]
        if (Array.isArray(children) && children.length) {
            const latest = children.reduce((acc, cur) => {
                if (!acc) return cur
                return dayjs(cur.end_date).isAfter(dayjs(acc.end_date)) ? cur : acc
            }, children[0])
            return latest?.end_date ? dayjs(latest.end_date).add(1, 'day') : undefined
        }

        return leaseContract.end_date ? dayjs(leaseContract.end_date).add(1, 'day') : undefined
    }, [leaseContract])

    useEffect(() => {
        if (!open || !leaseContract) {
            form.resetFields()
            return
        }

        const startDate =
            continuationStartDate ?? (leaseContract.end_date ? dayjs(leaseContract.end_date).add(1, 'day') : undefined)

        form.setFieldsValue({
            start_date: startDate,
            end_date: startDate ? startDate.add(1, 'year') : undefined,
            price: leaseContract.price,
            billing_cycle: resolveBillingCycle(leaseContract.billing_period, leaseContract.billing_unit),
            note: undefined,
        })
    }, [open, leaseContract, form, continuationStartDate])

    const handleSubmit = async (values: RenewLeaseFormValues) => {
        if (!leaseContract || !values.start_date || !values.end_date || !values.price || !values.billing_cycle) return

        const billingCycleConfig = BILLING_CYCLE_VALUE_MAP[values.billing_cycle]

        try {
            const response = await renewLeaseContract({
                lease_contract_id: leaseContract.id,
                price: values.price,
                billing_period: billingCycleConfig?.billing_period,
                billing_unit: billingCycleConfig?.billing_unit,
                start_date: values.start_date.format('YYYY-MM-DD'),
                end_date: values.end_date.format('YYYY-MM-DD'),
                note: values.note?.trim() || undefined,
            }).unwrap()

            message.success('Gia hạn hợp đồng thành công')
            onCancel()
            onSuccess?.(response.data.id)
        } catch {
            message.error('Gia hạn hợp đồng thất bại, vui lòng thử lại')
        }
    }

    return (
        <Modal
            open={open}
            title="Gia Hạn Hợp Đồng Thuê"
            onCancel={onCancel}
            footer={null}
            width={720}
            centered
            destroyOnHidden>
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Row gutter={12} align="middle">
                        <Col span={11}>
                            <Text className="!text-xs !font-semibold !uppercase !text-indigo-500">Hợp đồng gốc</Text>
                            <div className="!mt-1 !font-semibold">{padId(leaseContract?.id || 0, 'HDT')}</div>
                            <Text className="!text-slate-500">
                                {leaseContract?.start_date
                                    ? dayjs(leaseContract.start_date).format('DD/MM/YYYY')
                                    : app.EMPTY_DISPLAY}{' '}
                                {' - '}
                                {leaseContract?.end_date
                                    ? dayjs(leaseContract.end_date).format('DD/MM/YYYY')
                                    : app.EMPTY_DISPLAY}
                            </Text>
                        </Col>
                        <Col span={2} className="text-center">
                            <ArrowRightOutlined className="!text-xl !text-indigo-400" />
                        </Col>
                        <Col span={11}>
                            <Text className="!text-xs !font-semibold !uppercase !text-indigo-500">Khách thuê</Text>
                            <div className="!mt-1 !font-semibold">
                                {leaseContract?.tenant_rel?.name || app.EMPTY_DISPLAY}
                            </div>
                            <Text className="!text-slate-500">Giá cũ: {withPrice(leaseContract?.price || 0)}</Text>
                        </Col>
                    </Row>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Text className="!mb-3 !block !font-semibold !text-slate-700">
                            <CalendarOutlined className="!mr-2" />
                            Thời hạn mới
                        </Text>
                        <Form.Item label="Ngày bắt đầu" name="start_date">
                            <DatePicker format="DD/MM/YYYY" className="!w-full" disabled />
                        </Form.Item>
                        <Form.Item
                            label="Ngày kết thúc"
                            name="end_date"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                                {
                                    validator: (_, value: Dayjs | undefined) => {
                                        if (!value || !continuationStartDate) return Promise.resolve()
                                        if (value.startOf('day').isBefore(continuationStartDate.startOf('day'))) {
                                            return Promise.reject(
                                                new Error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu tiếp nối'),
                                            )
                                        }
                                        return Promise.resolve()
                                    },
                                },
                            ]}>
                            <DatePicker format="DD/MM/YYYY" className="!w-full" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Text className="!mb-3 !block !font-semibold !text-slate-700">
                            <DollarOutlined className="!mr-2" />
                            Giá trị & Thanh toán
                        </Text>
                        <Form.Item
                            label="Giá thuê mới"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá thuê mới' }]}>
                            <InputNumber
                                addonAfter="triệu/kỳ"
                                min={0}
                                className="!w-full"
                                placeholder="Nhập giá thuê mới"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Kỳ thanh toán"
                            name="billing_cycle"
                            rules={[{ required: true, message: 'Vui lòng chọn kỳ thanh toán' }]}>
                            <Select options={[...BILLING_CYCLE_OPTIONS]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Ghi chú gia hạn / phụ lục" name="note">
                    <Input.TextArea rows={4} placeholder="Ghi chú về các thay đổi điều khoản khác..." />
                </Form.Item>

                <div className="mt-4 flex justify-end gap-2 pt-4">
                    <Button onClick={onCancel}>Hủy bỏ</Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        Xác nhận Gia Hạn
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}
