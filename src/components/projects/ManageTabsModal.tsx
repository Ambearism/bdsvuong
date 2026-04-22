import { DeleteOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, Modal, Space, Table, message } from 'antd'
import React, { useEffect } from 'react'
import { TABS_TYPE } from '@/config/constant'
import { app } from '@/config/app'
import type { CustomTab, ProjectBase } from '@/types/project'
import { slugify } from '@/utils/slugify'

interface ManageTabsModalProps {
    visible: boolean
    onCancel: () => void
    initialTabs: CustomTab[]
    onSave: (tabs: CustomTab[]) => void
    project?: Partial<ProjectBase>
}

const ManageTabsModal: React.FC<ManageTabsModalProps> = ({ visible, onCancel, initialTabs, onSave, project }) => {
    const [form] = Form.useForm()
    const [tabs, setTabs] = React.useState<CustomTab[]>(initialTabs)

    useEffect(() => {
        if (visible) {
            setTabs(initialTabs)
            form.resetFields()
        }
    }, [visible, initialTabs, form])

    const fixedTabs = React.useMemo(() => {
        if (!project) return []

        const url = project.url_project || ''
        const items: CustomTab[] = [
            {
                id: 'fixed_overview',
                key: `thong-tin-du-an-${url}`,
                title: 'Tổng quan',
                type: TABS_TYPE.CONTENT,
                content: '',
                url: '',
                order: -10,
            },
        ]

        if (project.ground) {
            items.push({
                id: 'fixed_ground',
                key: `mat-bang-du-an-${url}`,
                title: 'Mặt bằng dự án',
                type: TABS_TYPE.CONTENT,
                content: '',
                url: '',
                order: -9,
            })
        }

        items.push({
            id: 'fixed_location',
            key: `vi-tri-du-an-${url}`,
            title: 'Vị trí dự án',
            type: TABS_TYPE.CONTENT,
            content: '',
            url: '',
            order: -8,
        })

        items.push({
            id: 'fixed_related',
            key: `cung-khu-vuc-du-an-${url}`,
            title: 'Dự án cùng khu vực',
            type: TABS_TYPE.CONTENT,
            content: '',
            url: '',
            order: -7,
        })

        if (project.product_count) {
            items.push({
                id: 'fixed_inventory',
                key: `can-dang-ban-du-an-${url}`,
                title: 'Căn đang bán',
                type: TABS_TYPE.CONTENT,
                content: '',
                url: '',
                order: -6,
            })
        }

        if (project.news_count) {
            items.push({
                id: 'fixed_news',
                key: `tin-tuc-du-an-${url}`,
                title: 'Tin tức dự án',
                type: TABS_TYPE.CONTENT,
                content: '',
                url: '',
                order: -5,
            })
        }

        if (project.enable_explore) {
            items.push({
                id: 'fixed_explore_lookup',
                key: `tra-cuu-du-an-${url}`,
                title: 'Tra cứu dự án',
                type: TABS_TYPE.CONTENT,
                content: '',
                url: '',
                order: -4,
            })
        }

        return items
    }, [project])

    const projectSuffix = React.useMemo(() => {
        return project?.url_project ? `-du-an-${project.url_project}` : ''
    }, [project?.url_project])

    const generateSlug = React.useCallback(
        (title: string, customKey?: string) => {
            return customKey || slugify(title) + projectSuffix
        },
        [projectSuffix],
    )

    const allTabs = [...fixedTabs, ...tabs]

    const handleAddTab = (values: { title: string; key?: string }) => {
        const timestamp = Date.now()
        const newSlug = generateSlug(values.title, values.key)

        const duplicateTitle = allTabs.find(tab => tab.title.toLowerCase().trim() === values.title.toLowerCase().trim())
        if (duplicateTitle) {
            message.error(`Tab với tiêu đề "${values.title}" đã tồn tại`)
            return
        }

        const duplicateSlug = allTabs.find(tab => tab.key === newSlug)
        if (duplicateSlug) {
            message.error(`Tab với slug "${newSlug}" đã tồn tại`)
            return
        }

        const newTab: CustomTab = {
            id: `ct_${timestamp}`,
            key: newSlug,
            title: values.title,
            type: TABS_TYPE.CONTENT,
            content: '',
            url: '',
            order: tabs.length,
            is_active: true,
        }
        setTabs([...tabs, newTab])
        form.resetFields()
    }

    const handleDeleteTab = (id: string) => {
        setTabs(tabs.filter(t => t.id !== id))
    }

    const isFixed = (tab: CustomTab) => tab.id.startsWith('fixed_')

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: CustomTab) => {
                if (isFixed(record)) {
                    return <span className="text-gray-500 italic">{text} (Mặc định)</span>
                }
                return (
                    <Input
                        className="w-full"
                        value={text}
                        onChange={e => {
                            const newTabs = tabs.map(t =>
                                t.id === record.id
                                    ? {
                                          ...t,
                                          title: e.target.value,
                                          key: generateSlug(e.target.value),
                                      }
                                    : t,
                            )
                            setTabs(newTabs)
                        }}
                    />
                )
            },
        },
        {
            title: 'Key (Slug)',
            dataIndex: 'key',
            key: 'key',
            render: (text: string, record: CustomTab) => {
                const link = `${app.CLIENT_URL}/${text}`
                if (isFixed(record)) {
                    return (
                        <Space>
                            <span className="text-gray-500">{text}</span>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                <LinkOutlined />
                            </a>
                        </Space>
                    )
                }
                return (
                    <Flex align="center" gap={8} className="w-full">
                        <Input
                            className="flex-1"
                            value={text}
                            onChange={e => {
                                const newTabs = tabs.map(t => (t.id === record.id ? { ...t, key: e.target.value } : t))
                                setTabs(newTabs)
                            }}
                        />
                        {text && (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                <LinkOutlined />
                            </a>
                        )}
                    </Flex>
                )
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            render: (_: unknown, record: CustomTab) => (
                <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    disabled={isFixed(record)}
                    onClick={() => handleDeleteTab(record.id)}
                />
            ),
        },
    ]

    return (
        <Modal
            title="Quản lý Tab"
            open={visible}
            onCancel={onCancel}
            onOk={() => {
                const title = form.getFieldValue('title')
                if (!title) {
                    onSave(tabs)
                    return
                }
                form.validateFields()
                    .then(values => {
                        const timestamp = Date.now()
                        const newSlug = generateSlug(values.title, values.key)

                        const duplicateTitle = allTabs.find(
                            tab => tab.title.toLowerCase().trim() === values.title.toLowerCase().trim(),
                        )
                        if (duplicateTitle) {
                            message.error(`Tab với tiêu đề "${values.title}" đã tồn tại`)
                            return
                        }

                        const duplicateSlug = allTabs.find(tab => tab.key === newSlug)
                        if (duplicateSlug) {
                            message.error(`Tab với slug "${newSlug}" đã tồn tại`)
                            return
                        }

                        const newTab: CustomTab = {
                            id: `ct_${timestamp}`,
                            key: newSlug,
                            title: values.title,
                            type: TABS_TYPE.CONTENT,
                            content: '',
                            url: '',
                            order: tabs.length,
                            is_active: true,
                        }
                        onSave([...tabs, newTab])
                        form.resetFields()
                    })
                    .catch(() => {
                        onSave(tabs)
                    })
            }}
            width={800}
            okText="Lưu thay đổi"
            cancelText="Hủy">
            <Space direction="vertical" className="w-full" size="middle">
                <Form form={form} layout="inline" onFinish={handleAddTab}>
                    <Form.Item
                        name="title"
                        rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                        className="!flex-1 !mr-2">
                        <Input placeholder="Tiêu đề tab mới" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                            Thêm
                        </Button>
                    </Form.Item>
                </Form>

                <Table
                    dataSource={allTabs}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    bordered
                    scroll={{ x: true }}
                />
            </Space>
        </Modal>
    )
}

export default ManageTabsModal
