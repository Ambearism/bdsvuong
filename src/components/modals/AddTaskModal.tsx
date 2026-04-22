import React from 'react'
import { Modal, Form, Input, DatePicker, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { TASK_STATUS_OPTIONS, TASK_STATUS } from '@/config/constant'

export interface TaskFormValues {
    task: string
    deadline: Dayjs
    assignee?: number
    status?: number
}

interface AddTaskModalProps {
    open: boolean
    onCancel: () => void
    onOk: (values: TaskFormValues) => void
    accountOptions: Array<{ label: string; value: number }>
    loading?: boolean
    initialValues?: TaskFormValues
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
    open,
    onCancel,
    onOk,
    accountOptions,
    loading,
    initialValues,
}) => {
    const [form] = Form.useForm<TaskFormValues>()

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
            width={500}>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="task"
                    label="Tác vụ"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung tác vụ' }]}>
                    <Input placeholder="Nhập nội dung tác vụ" />
                </Form.Item>
                <Form.Item
                    name="deadline"
                    label="Ngày kết thúc"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}>
                    <DatePicker
                        className="w-full"
                        format="DD.MM.YYYY"
                        placeholder="Chọn ngày kết thúc"
                        disabledDate={current => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>
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
