import React from 'react'
import { Button, DatePicker, Form, Space } from 'antd'
import type { FormInstance } from 'antd'
import type { ProjectProcessCreateInput, ProjectProcessItem } from '@/types/project-process'
import dayjs from 'dayjs'
import { TextEditor } from '@/components/tiptap'

type ProjectProcessFormProps = {
    form: FormInstance
    onFinish: (values: ProjectProcessCreateInput) => void
    onCancel?: () => void
    loading?: boolean
    isEdit?: boolean
    initialValues?: ProjectProcessItem
}

const ProjectProcessForm: React.FC<ProjectProcessFormProps> = ({
    form,
    onFinish,
    onCancel,
    loading = false,
    isEdit = false,
    initialValues,
}) => {
    const adaptedInitialValues = initialValues
        ? {
              ...initialValues,
              date_progress: initialValues.date_progress ? dayjs(initialValues.date_progress) : null,
          }
        : {}

    const handleFinish = (values: ProjectProcessItem) => {
        const formattedValues = {
            ...values,
            date_progress: values.date_progress ? dayjs(values.date_progress).format('YYYY-MM-DD') : '',
        }
        onFinish(formattedValues)
    }

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            initialValues={adaptedInitialValues}
            size="middle"
            scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
            className="max-w-3xl mx-auto">
            <Form.Item
                name="date_progress"
                label="Ngày tiến độ"
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
                <TextEditor />
            </Form.Item>

            <Form.Item className="mt-6">
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {isEdit ? 'Lưu' : 'Tạo mới'}
                    </Button>
                    <Button onClick={onCancel}>Hủy</Button>
                </Space>
            </Form.Item>
        </Form>
    )
}

export default ProjectProcessForm
