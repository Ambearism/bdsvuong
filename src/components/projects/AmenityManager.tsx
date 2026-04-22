import React, { useState, useEffect } from 'react'
import { Button, Space, Table, message, Popconfirm, Tooltip } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import AmenityFormModal from './AmenityFormModal'
import type { AmenityCategory, AmenityItem } from '@/types/project'
import { useRef } from 'react'

interface AmenityManagerProps {
    projectId?: number
    value?: AmenityCategory[]
    onChange?: (value: AmenityCategory[]) => void
}

const AmenityManager: React.FC<AmenityManagerProps> = ({ value = [], onChange }) => {
    const [categories, setCategories] = useState<AmenityCategory[]>(Array.isArray(value) ? value : [])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const prevValueRef = useRef<string>('')

    useEffect(() => {
        const newValue = Array.isArray(value) ? value : []
        const newValueStr = JSON.stringify(newValue)

        if (newValueStr !== prevValueRef.current) {
            setCategories(newValue)
            prevValueRef.current = newValueStr
        }
    }, [value])

    const categoryColumns: ColumnsType<AmenityCategory> = [
        {
            title: 'Tên nhóm tiện ích',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Số lượng tiện ích',
            dataIndex: 'items',
            key: 'itemCount',
            align: 'center',
            width: 150,
            render: (items: AmenityItem[]) => items?.length || 0,
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            width: 150,
            render: (_, __, index) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(index)} size="small" />
                    </Tooltip>

                    <Popconfirm
                        title="Xóa nhóm tiện ích"
                        description="Bạn có chắc chắn muốn xóa nhóm này không?"
                        onConfirm={() => handleDeleteCategory(index)}
                        okText="Xóa"
                        cancelText="Hủy"
                        placement="topRight">
                        <Tooltip title="Xóa">
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const expandedRowRender = (record: AmenityCategory) => {
        const itemColumns: ColumnsType<AmenityItem> = [
            {
                title: 'Tên tiện ích',
                dataIndex: 'name',
                key: 'name',
                width: '30%',
            },
            {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description',
            },
        ]

        return (
            <Table<AmenityItem>
                dataSource={record.items || []}
                columns={itemColumns}
                pagination={false}
                rowKey={item => item.id?.toString() || item.name}
                size="small"
                bordered
            />
        )
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setIsModalOpen(true)
    }

    const handleDeleteCategory = (index: number) => {
        const newCategories = categories.filter((_, i) => i !== index)
        setCategories(newCategories)
        onChange?.(newCategories)
        message.success('Xóa nhóm tiện ích thành công!')
    }

    const handleSubmit = (values: Omit<AmenityCategory, 'id'>) => {
        let newCategories: AmenityCategory[]

        if (editingIndex !== null) {
            const existingCategory = categories[editingIndex]

            const updatedItems = values.items.map(newItem => {
                const existingItem = existingCategory.items.find(oldItem => oldItem.name === newItem.name)

                if (existingItem) {
                    return {
                        id: existingItem.id,
                        name: newItem.name,
                        description: newItem.description,
                    }
                }

                return {
                    name: newItem.name,
                    description: newItem.description,
                }
            })

            newCategories = categories.map((cat, i) =>
                i === editingIndex
                    ? {
                          ...cat,
                          title: values.title,
                          items: updatedItems,
                      }
                    : cat,
            )

            message.success('Cập nhật nhóm tiện ích thành công!')
        } else {
            const newCategory: AmenityCategory = {
                title: values.title,
                items: values.items.map(item => ({
                    name: item.name,
                    description: item.description,
                })),
            }

            newCategories = [...categories, newCategory]
            message.success('Thêm nhóm tiện ích thành công!')
        }

        setCategories(newCategories)
        onChange?.(newCategories)
        handleCloseModal()
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingIndex(null)
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Thêm nhóm tiện ích
            </Button>

            <Table<AmenityCategory>
                dataSource={categories}
                columns={categoryColumns}
                rowKey={record => record.id?.toString() || record.title}
                bordered
                scroll={{ x: true }}
                expandable={{
                    expandedRowRender,
                    rowExpandable: record => record.items?.length > 0,
                }}
                pagination={false}
            />

            <AmenityFormModal
                open={isModalOpen}
                editingCategory={editingIndex !== null ? categories[editingIndex] : null}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
            />
        </Space>
    )
}

export default AmenityManager
