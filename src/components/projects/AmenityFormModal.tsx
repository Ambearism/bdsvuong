import React, { useEffect, useState } from 'react'
import { Button, Form, Select, Modal, Table, Input, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { AmenityCategory, AmenityItem } from '@/types/project'
import { PREDEFINED_AMENITIES } from '@/config/constant'

const { TextArea } = Input

interface AmenityFormModalProps {
    open: boolean
    editingCategory: AmenityCategory | null
    onSubmit: (values: Omit<AmenityCategory, 'id'>) => void
    onCancel: () => void
}

const AmenityFormModal: React.FC<AmenityFormModalProps> = ({ open, editingCategory, onSubmit, onCancel }) => {
    const [form] = Form.useForm()
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [availableItems, setAvailableItems] = useState<Array<{ name: string; description: string }>>([])

    useEffect(() => {
        if (open) {
            if (editingCategory) {
                const cleanItems =
                    editingCategory.items?.map(item => ({
                        name: item.name,
                        description: item.description || '',
                    })) || []

                form.setFieldsValue({
                    title: editingCategory.title,
                    items: cleanItems,
                })
                setSelectedCategory(editingCategory.title)
                const category = PREDEFINED_AMENITIES.find(a => a.title === editingCategory.title)
                setAvailableItems(category?.items || [])
            } else {
                form.resetFields()
                setSelectedCategory('')
                setAvailableItems([])
            }
        }
    }, [open, editingCategory, form])

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value)
        const category = PREDEFINED_AMENITIES.find(a => a.title === value)
        setAvailableItems(category?.items || [])
        form.setFieldValue('title', value)
        form.setFieldValue('items', [{ name: '', description: '' }])
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            onSubmit({
                ...values,
                items: values.items || [],
            })
        } catch {
            message.error('Vui lòng kiểm tra lại thông tin!')
        }
    }

    return (
        <Modal
            title={editingCategory ? 'Chỉnh sửa nhóm tiện ích' : 'Thêm nhóm tiện ích'}
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            width={800}
            okText={editingCategory ? 'Cập nhật' : 'Thêm'}
            cancelText="Hủy">
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Chọn nhóm tiện ích"
                    rules={[{ required: true, message: 'Vui lòng chọn nhóm tiện ích' }]}>
                    <Select
                        placeholder="Chọn nhóm tiện ích"
                        onChange={handleCategoryChange}
                        showSearch
                        optionFilterProp="children">
                        {PREDEFINED_AMENITIES.map(amenity => (
                            <Select.Option key={amenity.title} value={amenity.title}>
                                {amenity.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            <Table
                                dataSource={fields}
                                pagination={false}
                                rowKey="key"
                                size="small"
                                bordered
                                columns={[
                                    {
                                        title: (
                                            <span>
                                                <span className="text-red-500 mr-1">*</span>Tên tiện ích
                                            </span>
                                        ),
                                        dataIndex: 'name',
                                        key: 'name',
                                        width: '40%',
                                        className: '!align-top',
                                        render: (_, __, index) => (
                                            <Form.Item
                                                name={[index, 'name']}
                                                className="!mb-0"
                                                rules={[{ required: true, message: 'Vui lòng chọn tiện ích' }]}>
                                                <Select
                                                    placeholder="Chọn tiện ích"
                                                    showSearch
                                                    optionFilterProp="label"
                                                    disabled={!selectedCategory}
                                                    options={availableItems.map(item => ({
                                                        label: item.name,
                                                        value: item.name,
                                                    }))}
                                                />
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: 'Mô tả',
                                        dataIndex: 'description',
                                        key: 'description',
                                        className: '!align-top',
                                        render: (_, __, index) => (
                                            <Form.Item
                                                name={[index, 'description']}
                                                className="!mb-0"
                                                rules={[{ max: 255, message: 'Tối đa 255 ký tự' }]}>
                                                <TextArea
                                                    rows={1}
                                                    placeholder="Mô tả..."
                                                    autoSize={{ minRows: 1, maxRows: 4 }}
                                                />
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: 'Hành động',
                                        key: 'actions',
                                        align: 'center',
                                        width: 100,
                                        render: (_, __, index) => (
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(index)}>
                                                Xóa
                                            </Button>
                                        ),
                                    },
                                ]}
                            />
                            <Button
                                type="dashed"
                                block
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    const items = form.getFieldValue('items') || []
                                    const hasEmptyName = items.some((item: AmenityItem) => !item || !item.name)

                                    if (hasEmptyName) {
                                        message.warning(
                                            'Vui lòng chọn tiện ích cho các dòng hiện tại trước khi thêm mới!',
                                        )
                                        return
                                    }

                                    add()
                                }}
                                className="mt-2"
                                disabled={!selectedCategory}>
                                Thêm tiện ích
                            </Button>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    )
}

export default AmenityFormModal
