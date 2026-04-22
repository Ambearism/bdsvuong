import React, { useState, useEffect } from 'react'
import { Button, Space, Table, message, Popconfirm, Tooltip, Modal, Form, Input } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { HotLink } from '@/types/project'

interface HotLinkManagerProps {
    value?: HotLink[]
    onChange?: (value: HotLink[]) => void
}

interface EditingState {
    open: boolean
    linkData: Partial<HotLink>
    editingIndex: number | null
}

const HotLinkManager: React.FC<HotLinkManagerProps> = ({ value = [], onChange }) => {
    const [form] = Form.useForm<HotLink>()
    const [editingState, setEditingState] = useState<EditingState>({
        open: false,
        linkData: {},
        editingIndex: null,
    })

    const hotLinks = Array.isArray(value) ? value.map((link, idx) => ({ ...link, _id: `link_${idx}_${link.url}` })) : []

    useEffect(() => {
        if (editingState.open) {
            form.setFieldsValue(editingState.linkData)
        }
    }, [editingState.open, editingState.linkData, form])

    const handleTriggerChange = (newValue: HotLink[]) => {
        onChange?.(newValue)
    }

    const handleDelete = (indexToDelete: number) => {
        const newHotLinks = hotLinks
            .filter((_, index) => index !== indexToDelete)
            .map(link => ({ title: link.title, url: link.url }))
        handleTriggerChange(newHotLinks)
        message.success('Xóa liên kết thành công!')
    }

    const handleOpenModal = (indexToEdit: number | null) => {
        const isEditing = indexToEdit !== null
        setEditingState({
            open: true,
            linkData: isEditing ? hotLinks[indexToEdit] : { title: '', url: '' },
            editingIndex: indexToEdit,
        })
    }

    const handleCloseModal = () => {
        form.resetFields()
        setEditingState({ open: false, linkData: {}, editingIndex: null })
    }

    const handleSubmit = () => {
        form.validateFields()
            .then(validatedValues => {
                const isEditing = editingState.editingIndex !== null
                let newHotLinks: HotLink[]

                if (isEditing) {
                    newHotLinks = hotLinks
                        .map((link, index) => (index === editingState.editingIndex ? validatedValues : link))
                        .map(link => ({ title: link.title, url: link.url }))
                    message.success('Cập nhật liên kết thành công!')
                } else {
                    newHotLinks = [...hotLinks.map(link => ({ title: link.title, url: link.url })), validatedValues]
                    message.success('Thêm liên kết thành công!')
                }

                handleTriggerChange(newHotLinks)
                handleCloseModal()
            })
            .catch(() => {
                message.error('Vui lòng kiểm tra lại các thông tin đã nhập!')
            })
    }

    const columns: ColumnsType<HotLink & { _id: string }> = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: '30%',
        },
        {
            title: 'Đường dẫn',
            dataIndex: 'url',
            key: 'url',
            render: (url: string) => (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline hover:text-blue-400">
                    {url}
                </a>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            width: 120,
            render: (_, __, index) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} onClick={() => handleOpenModal(index)} size="small" />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa liên kết?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(index)}
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

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                Thêm liên kết
            </Button>
            <Table
                dataSource={hotLinks}
                columns={columns}
                rowKey="_id"
                bordered
                scroll={{ x: true }}
                pagination={false}
                locale={{ emptyText: 'Chưa có liên kết nào' }}
            />
            <Modal
                title={editingState.editingIndex !== null ? 'Chỉnh sửa liên kết' : 'Thêm liên kết mới'}
                open={editingState.open}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                okText={editingState.editingIndex !== null ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={600}>
                <Form form={form} layout="vertical" name="hotlink_form" className="mt-6">
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề!' },
                            { max: 200, message: 'Tiêu đề không được quá 200 ký tự!' },
                            { whitespace: true, message: 'Tiêu đề không thể chỉ là khoảng trắng!' },
                        ]}>
                        <Input placeholder="Nhập tiêu đề liên kết" showCount maxLength={200} />
                    </Form.Item>
                    <Form.Item
                        name="url"
                        label="Đường dẫn (URL)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập đường dẫn!' },
                            { type: 'url', message: 'Đường dẫn không hợp lệ!' },
                        ]}>
                        <Input placeholder="https://example.com" />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    )
}

export default HotLinkManager
