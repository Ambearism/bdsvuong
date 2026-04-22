import React from 'react'
import { Modal, Form, Input, DatePicker, Select, Row, Col } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { TASK_STATUS_OPTIONS, TASK_STATUS } from '@/config/constant'

export interface OpportunityTaskFormValues {
    task: string
    startDate: Dayjs | null
    endDate: Dayjs
    assignee?: number
    status?: number
}

interface AddOpportunityTaskModalProps {
    open: boolean
    onCancel: () => void
    onOk: (values: OpportunityTaskFormValues) => void
    accountOptions: Array<{ label: string; value: number }>
    loading?: boolean
    initialValues?: OpportunityTaskFormValues
}

export const AddOpportunityTaskModal: React.FC<AddOpportunityTaskModalProps> = ({
    open,
    onCancel,
    onOk,
    accountOptions,
    loading,
    initialValues,
}) => {
    const [form] = Form.useForm<OpportunityTaskFormValues>()

    React.useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues)
            } else {
                form.resetFields()
                form.setFieldsValue({ status: TASK_STATUS.PENDING })
            }
        }
    }, [open, initialValues, form])

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            onOk(values)
        } catch {
            // Validation failed
        }
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    return (
        <Modal
            title={initialValues ? 'Chỉnh sửa tác vụ' : 'Thêm tác vụ'}
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            okText="Lưu"
            confirmLoading={loading}
            cancelText="Hủy"
            width={550}>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="task"
                    label="Tác vụ"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung tác vụ' }]}>
                    <Input placeholder="Nhập nội dung tác vụ" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startDate"
                            label="Ngày bắt đầu"
                            validateTrigger="onChange"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}>
                            <DatePicker
                                className="w-full"
                                format="DD.MM.YYYY HH:mm"
                                showTime={{ format: 'HH:mm' }}
                                placeholder="Chọn ngày & giờ bắt đầu"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endDate"
                            label="Ngày kết thúc"
                            dependencies={['startDate']}
                            validateTrigger="onChange"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !value ||
                                            !getFieldValue('startDate') ||
                                            value.isAfter(getFieldValue('startDate'))
                                        ) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu'))
                                    },
                                }),
                            ]}>
                            <DatePicker
                                className="w-full"
                                format="DD.MM.YYYY HH:mm"
                                showTime={{ format: 'HH:mm' }}
                                placeholder="Chọn ngày & giờ kết thúc"
                                disabledDate={current => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="assignee"
                    label="Người chịu trách nhiệm"
                    rules={[{ required: true, message: 'Vui lòng chọn người chịu trách nhiệm' }]}>
                    <Select
                        placeholder="Chọn người chịu trách nhiệm"
                        showSearch
                        optionFilterProp="label"
                        options={accountOptions}
                    />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái">
                    <Select placeholder="Chọn trạng thái" options={TASK_STATUS_OPTIONS} />
                </Form.Item>
            </Form>
        </Modal>
    )
}
