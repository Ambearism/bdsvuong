import { TextEditor } from '@/components/tiptap'
import type { AlbumBase } from '@/types/album'
import type { FormInstance } from 'antd'
import { Button, Card, Divider, Form, Input, Row, Space, Typography } from 'antd'
import React, { useEffect } from 'react'

const { Title } = Typography

type AlbumFormProps = {
    form: FormInstance
    initialValues?: AlbumBase
    onFinish: (values: AlbumBase) => void
    onCancel?: () => void
    loading?: boolean
    isEdit?: boolean
}

const AlbumForm: React.FC<AlbumFormProps> = ({ form, initialValues, onFinish, onCancel }) => {
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues)
        }
    }, [initialValues, form])

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={initialValues}
            size="middle"
            scrollToFirstError={{ behavior: 'instant', block: 'end' }}>
            <Card className="h-full shadow-lg">
                <Title level={5}>Thông tin cơ bản</Title>
                <Divider />
                <Form.Item
                    name="name"
                    label="Tên Album"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên Album' },
                        { max: 255, message: 'Tên Album không được vượt quá 255 ký tự' },
                        { whitespace: true, message: 'Tên Album không được chỉ chứa khoảng trắng' },
                    ]}>
                    <Input placeholder="Nhập tên Album" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextEditor />
                </Form.Item>

                <Row justify="center">
                    <Space size="middle">
                        <Button onClick={onCancel} block>
                            Quay lại
                        </Button>
                        <Button type="primary" htmlType="submit" block>
                            Lưu
                        </Button>
                    </Space>
                </Row>
            </Card>
        </Form>
    )
}

export default AlbumForm
