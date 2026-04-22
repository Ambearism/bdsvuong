import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons'
import {
    Button,
    Card,
    Flex,
    Form,
    Table,
    Tag,
    Modal,
    Select,
    Space,
    Typography,
    Input,
    message,
    Popconfirm,
    Empty,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router'
import { app } from '@/config/app'
import {
    useAddCustomerRelativeMutation,
    useDeleteCustomerRelativeMutation,
    useGetCustomerListQuery,
} from '@/api/customer'
import type { CustomerHubOutletContext } from './CustomerHub'
import type { CustomerRelativeCreateInput, CustomerRelativeItem } from '@/types/customer'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import { renderSelectLoading } from '@/utils/render-utils'
import { useDebounce } from '@/hooks/useDebounce'

const { Text } = Typography

const CustomerRelationsHubCustomer = () => {
    const { customerData, refetchCustomer } = useOutletContext<CustomerHubOutletContext>()
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRelative, setEditingRelative] = useState<CustomerRelativeItem | null>(null)
    const [form] = Form.useForm()

    const [addRelative, { isLoading: isAdding }] = useAddCustomerRelativeMutation()
    const [deleteRelative, { isLoading: isDeleting }] = useDeleteCustomerRelativeMutation()

    const relationships = useMemo(() => {
        const from = customerData?.relatives_from || []
        const to = customerData?.relatives_to || []

        let combined = [
            ...from.map(item => ({
                ...item,
                displayRelative: item.relative_customer_rel,
                isFrom: true,
                key: item.id,
            })),
            ...to.map(item => ({
                ...item,
                displayRelative: item.customer_rel,
                isFrom: false,
                key: item.id,
            })),
        ]

        if (combined.length === 0 && customerData?.relatives) {
            combined = customerData.relatives.map(item => ({
                ...item,
                displayRelative: item.relative_customer || item.relative_customer_rel,
                isFrom: true,
                key: item.id,
            }))
        }

        return combined
    }, [customerData])

    const handleAddRelative = async (values: CustomerRelativeCreateInput) => {
        if (!customerData?.id) return

        try {
            if (editingRelative) {
                let oldParamCustomerId = customerData.id
                let oldParamRelativeId = editingRelative.relative_customer_id

                if (!editingRelative.isFrom) {
                    oldParamCustomerId = editingRelative.displayRelative?.id as number
                    oldParamRelativeId = customerData.id
                }

                const isSameRelation =
                    oldParamCustomerId === customerData.id && oldParamRelativeId === values.relative_customer_id

                if (isSameRelation) {
                    await addRelative({
                        customer_id: customerData.id,
                        payload: values,
                    }).unwrap()
                } else {
                    await addRelative({
                        customer_id: customerData.id,
                        payload: values,
                    }).unwrap()

                    await deleteRelative({
                        customer_id: oldParamCustomerId,
                        relative_customer_id: oldParamRelativeId,
                    }).unwrap()
                }

                message.success('Cập nhật quan hệ thành công')
            } else {
                await addRelative({
                    customer_id: customerData.id,
                    payload: values,
                }).unwrap()

                message.success('Thêm quan hệ thành công')
            }

            setIsModalOpen(false)
            setEditingRelative(null)
            form.resetFields()
            refetchCustomer()
        } catch {
            message.error(editingRelative ? 'Có lỗi xảy ra khi cập nhật quan hệ' : 'Có lỗi xảy ra khi thêm quan hệ')
        }
    }

    const handleDeleteRelative = async (item: CustomerRelativeItem) => {
        let paramCustomerId: number | undefined = customerData?.id
        let paramRelativeId: number | undefined = item.relative_customer_id

        if (!item.isFrom) {
            paramCustomerId = item.displayRelative?.id
            paramRelativeId = customerData?.id
        }

        if (!paramCustomerId || !paramRelativeId) return

        try {
            await deleteRelative({
                customer_id: paramCustomerId,
                relative_customer_id: paramRelativeId,
            }).unwrap()
            message.success('Xóa quan hệ thành công')
            refetchCustomer()
        } catch {
            message.error('Có lỗi xảy ra khi xóa quan hệ')
        }
    }

    const openEditModal = (record: CustomerRelativeItem) => {
        setEditingRelative(record)
        form.setFieldsValue({
            relative_customer_id: record.displayRelative?.id,
            relation_type: record.relation_type,
        })
        setIsModalOpen(true)
    }

    const columns: TableColumnsType<CustomerRelativeItem> = [
        {
            title: 'Khách Hàng Liên Quan',
            dataIndex: 'relative',
            key: 'relative',
            width: 250,
            render: (_: unknown, record: CustomerRelativeItem) => (
                <Flex vertical>
                    <Text
                        strong
                        className="text-blue-600 cursor-pointer"
                        onClick={() => {
                            if (!record.displayRelative?.id) {
                                message.error('Không tìm thấy thông tin khách hàng liên quan')
                                return
                            }
                            navigate(`/customers/${record.displayRelative.id}/hub`)
                        }}>
                        {record.displayRelative?.name || `Khách hàng #${record.displayRelative?.id || 'N/A'}`}
                    </Text>
                    <Text type="secondary" className="text-xs">
                        {record.displayRelative?.phone}
                    </Text>
                </Flex>
            ),
        },
        {
            title: 'Mối Quan Hệ',
            dataIndex: 'relation_type',
            key: 'relation_type',
            width: 150,
            render: (text: string) => <Tag>{text}</Tag>,
        },
        {
            title: 'Ghi Chú',
            dataIndex: 'note',
            key: 'note',
            width: 200,
            render: (text: string) => (
                <Text type="secondary" italic>
                    {text || app.EMPTY_DISPLAY}
                </Text>
            ),
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : app.EMPTY_DISPLAY),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_: unknown, record: CustomerRelativeItem) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title="Xóa quan hệ"
                        description="Bạn có chắc chắn muốn xóa quan hệ này?"
                        onConfirm={() => handleDeleteRelative(record)}
                        okText="Đồng ý"
                        cancelText="Hủy">
                        <Button type="text" danger icon={<DeleteOutlined />} loading={isDeleting} title="Xóa" />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <>
            <Card
                title={
                    <Flex justify="space-between" align="center">
                        <Space align="center" size={4}>
                            <UserOutlined />
                            <span>Quan Hệ Khách Hàng</span>
                        </Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingRelative(null)
                                form.resetFields()
                                setIsModalOpen(true)
                            }}>
                            Thêm quan hệ
                        </Button>
                    </Flex>
                }
                className="w-full">
                <Table
                    dataSource={relationships}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: <Empty description="Chưa có quan hệ khách hàng" /> }}
                />
            </Card>

            <Modal
                title={editingRelative ? 'Cập nhật quan hệ khách hàng' : 'Thêm quan hệ khách hàng'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false)
                    setEditingRelative(null)
                    form.resetFields()
                }}
                footer={null}>
                <Form layout="vertical" form={form} onFinish={handleAddRelative}>
                    <Form.Item
                        name="relative_customer_id"
                        label="Khách hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
                        <CustomerSelect excludeId={customerData?.id} />
                    </Form.Item>
                    <Form.Item
                        name="relation_type"
                        label="Mối quan hệ"
                        rules={[{ required: true, message: 'Vui lòng nhập mối quan hệ' }]}>
                        <Input placeholder="Ví dụ: Vợ, Chồng, Anh, Em,..." />
                    </Form.Item>
                    <Flex justify="end" gap="small" className="mt-4">
                        <Button
                            onClick={() => {
                                setIsModalOpen(false)
                                setEditingRelative(null)
                                form.resetFields()
                            }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={isAdding || isDeleting}>
                            {editingRelative ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </>
    )
}

const CustomerSelect = ({
    value,
    onChange,
    excludeId,
}: {
    value?: number
    onChange?: (value: number) => void
    excludeId?: number
}) => {
    const [keyword, setKeyword] = useState('')
    const debouncedKeyword = useDebounce(keyword, 500)
    const [page, setPage] = useState(app.DEFAULT_PAGE)

    const { data: apiData, isFetching } = useGetCustomerListQuery(
        {
            keyword: debouncedKeyword || undefined,
            page: page,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )

    const { accumulatedItems: customerOptionsData, handleScroll } = useSelectInfiniteScroll({
        items: (apiData?.data?.items ?? []) as Array<{ id: number; name?: string; phone?: string; label?: string }>,
        isFetching,
        debouncedKeyword,
        page,
        setPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const options = useMemo(() => {
        return customerOptionsData
            .filter(customer => customer.id !== excludeId)
            .map(customer => ({
                label: customer.label || `${customer.name} - ${customer.phone}`,
                value: customer.id,
            }))
    }, [customerOptionsData, excludeId])

    return (
        <Select
            showSearch
            value={value}
            placeholder="Tìm kiếm theo tên hoặc SĐT"
            defaultActiveFirstOption={false}
            filterOption={false}
            onSearch={setKeyword}
            onChange={onChange}
            onPopupScroll={handleScroll}
            popupRender={menu => renderSelectLoading(menu, isFetching)}
            options={options}
            loading={isFetching}
            allowClear
            onClear={() => setKeyword('')}
            onOpenChange={open => {
                if (!open) setKeyword('')
            }}
        />
    )
}

export default CustomerRelationsHubCustomer
