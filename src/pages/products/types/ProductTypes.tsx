import { useGetProductTypeListQuery, useDeleteProductTypeMutation } from '@/api/product-type'
import { app } from '@/config/app'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { ProductTypeItem } from '@/types/product-type'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { ProductTypeFormModal } from '@/components/tiptap'

import { Breadcrumb, Button, Card, Popconfirm, Space, Table, Tooltip, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState, useMemo, useCallback } from 'react'
import { GoHome } from 'react-icons/go'

const ProductTypes = () => {
    useDocumentTitle('Danh sách loại hàng hoá')

    const [openModal, setOpenModal] = useState(false)
    const [initialValues, setInitialValues] = useState<ProductTypeItem | null>(null)

    const [page, setPage] = useState(app.DEFAULT_PAGE)

    const { data, isLoading, refetch } = useGetProductTypeListQuery({ page }, { refetchOnMountOrArgChange: true })

    const items = data?.data?.items || []
    const total = data?.data?.total || 0

    const [deleteProductType, { isLoading: isDeleting }] = useDeleteProductTypeMutation()

    const handleDelete = useCallback(
        async (id: number) => {
            try {
                await deleteProductType({ id }).unwrap()
                message.success('Xóa loại hàng hoá thành công!')
                refetch()
            } catch {
                message.error('Xóa loại hàng hoá thất bại!')
            }
        },
        [deleteProductType, refetch],
    )

    const handleOpenCreate = useCallback(() => {
        setInitialValues(null)
        setOpenModal(true)
    }, [])

    const handleOpenEdit = useCallback((record: ProductTypeItem) => {
        setInitialValues(record)
        setOpenModal(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        setOpenModal(false)
        setInitialValues(null)
    }, [])

    const handleSuccess = useCallback(() => {
        refetch()
        handleCloseModal()
    }, [refetch, handleCloseModal])

    const columns: ColumnsType<ProductTypeItem> = useMemo(
        () => [
            {
                title: 'Tên loại hình',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Đường dẫn',
                dataIndex: 'slug',
                key: 'slug',
            },
            {
                title: 'Màu',
                dataIndex: 'color',
                key: 'color',
            },
            {
                title: 'Hành động',
                key: 'actions',
                width: 180,
                align: 'center',
                render: (_, record) => (
                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} size="small" />
                        </Tooltip>

                        <Popconfirm
                            title="Xóa loại hàng hoá"
                            description="Bạn có chắc chắn muốn xóa loại hàng hoá này không?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            placement="topRight">
                            <Tooltip title="Xóa">
                                <Button icon={<DeleteOutlined />} loading={isDeleting} size="small" danger />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        [handleOpenEdit, handleDelete, isDeleting],
    )

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card styles={{ body: { padding: 16 } }}>
                <Space direction="vertical" className="w-full">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            { href: '/', title: <GoHome size={24} /> },
                            { title: 'Danh sách loại hàng hoá', className: 'text-md font-medium' },
                        ]}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                        Tạo mới
                    </Button>
                </Space>
            </Card>

            <Table<ProductTypeItem>
                dataSource={items}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                bordered
                scroll={{ x: true }}
                pagination={
                    total > app.DEFAULT_PAGE_SIZE && {
                        current: page,
                        pageSize: app.DEFAULT_PAGE_SIZE,
                        total,
                        showSizeChanger: false,
                        onChange: setPage,
                    }
                }
            />

            <ProductTypeFormModal
                visible={openModal}
                onCancel={handleCloseModal}
                onSuccess={handleSuccess}
                initialValues={initialValues}
            />
        </Space>
    )
}

export default ProductTypes
