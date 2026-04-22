import { Button, Modal, Form, Input, Radio, ColorPicker, message } from 'antd'
import { useEffect } from 'react'
import { useCreateProductTypeMutation, useUpdateProductTypeMutation } from '@/api/product-type'

type ColorValue = string | { toHexString: () => string }

type FormValues = {
    id?: number
    name: string
    slug: string
    color: ColorValue
    status: boolean
    description?: string
    meta_title?: string
    meta_description?: string
    meta_robots?: string
}

type Props = {
    visible: boolean
    onSuccess: () => void
    onCancel: () => void
    initialValues?: FormValues | null
}

export const ProductTypeFormModal = ({ visible, onCancel, onSuccess, initialValues }: Props) => {
    const [form] = Form.useForm<FormValues>()

    const [createProductType, { isLoading: isCreating }] = useCreateProductTypeMutation()
    const [updateProductType, { isLoading: isUpdating }] = useUpdateProductTypeMutation()

    const isEdit = Boolean(initialValues?.id)

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                name: initialValues?.name ?? '',
                slug: initialValues?.slug ?? '',
                status: initialValues?.status ?? true,
                description: initialValues?.description ?? '',
                meta_title: initialValues?.meta_title ?? '',
                meta_description: initialValues?.meta_description ?? '',
                meta_robots: initialValues?.meta_robots ?? 'ALL',
                color: initialValues?.color ?? '#000000',
            })
        }
    }, [visible, form, initialValues])

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    const handleSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            color: typeof values.color === 'string' ? values.color : values.color.toHexString(),
        }

        try {
            if (isEdit && initialValues?.id) {
                await updateProductType({ id: initialValues.id, payload }).unwrap()
                message.success('Cập nhật thành công')
            } else {
                await createProductType(payload).unwrap()
                message.success('Tạo mới thành công')
            }

            onSuccess()
            handleCancel()
        } catch {
            message.error(isEdit ? 'Cập nhật thất bại' : 'Tạo mới thất bại')
        }
    }

    return (
        <Modal
            centered
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            title={<div className="text-center w-full">{isEdit ? 'Cập nhật loại hình' : 'Thêm loại hình mới'}</div>}>
            <Form form={form} layout="vertical" onFinish={handleSubmit} className="!space-y-3 mt-2">
                <Form.Item
                    label="Tên loại hình"
                    name="name"
                    rules={[{ required: true, message: 'Nhập tên loại hình' }]}>
                    <Input maxLength={100} />
                </Form.Item>

                <Form.Item label="Slug / ID" name="slug" rules={[{ required: true, message: 'Nhập slug / ID' }]}>
                    <Input maxLength={120} />
                </Form.Item>

                <Form.Item label="Màu hiển thị" name="color" rules={[{ required: true, message: 'Chọn màu hiển thị' }]}>
                    <ColorPicker
                        format="hex"
                        showText={c => c.toHexString()}
                        onChange={c => form.setFieldsValue({ color: c.toHexString() })}
                    />
                </Form.Item>

                <Form.Item
                    label="Trạng thái hiển thị"
                    name="status"
                    rules={[{ required: true, message: 'Chọn trạng thái hiển thị' }]}>
                    <Radio.Group>
                        <Radio value={true}>Hiện</Radio>
                        <Radio value={false}>Ẩn</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={3} maxLength={200} />
                </Form.Item>

                <Form.Item label="Meta Title" name="meta_title">
                    <Input maxLength={60} />
                </Form.Item>

                <Form.Item label="Meta Description" name="meta_description">
                    <Input.TextArea rows={3} maxLength={160} />
                </Form.Item>

                <Form.Item label="Meta Robots" name="meta_robots">
                    <Radio.Group>
                        <Radio value="ALL">ALL (index, follow)</Radio>
                        <Radio value="NONE">NONE (noindex, nofollow)</Radio>
                        <Radio value="NOINDEX">NOINDEX</Radio>
                        <Radio value="NOFOLLOW">NOFOLLOW</Radio>
                        <Radio value="INDEX, NOFOLLOW">INDEX, NOFOLLOW</Radio>
                        <Radio value="NOINDEX, FOLLOW">NOINDEX, FOLLOW</Radio>
                    </Radio.Group>
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={handleCancel}>Huỷ</Button>
                    <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                        {isEdit ? 'Cập nhật' : 'Lưu'}
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}
