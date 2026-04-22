import { useDeleteAlbumMutation, useGetAlbumListQuery } from '@/api/album'
import { PreviewTextEditor } from '@/components/tiptap/PreviewTextEditor'
import { app } from '@/config/app'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePermission } from '@/hooks/usePermission'
import type { AlbumItem } from '@/types/album'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, Input, Popconfirm, Space, Table, Tooltip, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCallback, useMemo, useState } from 'react'
import { GoHome } from 'react-icons/go'

const AlbumList = () => {
    const { hasPermission } = usePermission()
    const [search, setSearch] = useState<string>()
    const [page, setPage] = useState<number>(app.DEFAULT_PAGE)

    useDocumentTitle('Danh sách Album')

    const {
        data: albumData,
        isLoading,
        refetch,
    } = useGetAlbumListQuery({ keyword: search, page }, { refetchOnMountOrArgChange: true })

    const [deleteAlbum] = useDeleteAlbumMutation()

    const handleDelete = useCallback(
        async (id: number) => {
            try {
                await deleteAlbum({ album_id: id }).unwrap()
                message.success('Xóa Album thành công!')
                refetch()
            } catch {
                message.error('Xóa Album thất bại!')
            }
        },
        [deleteAlbum, refetch],
    )

    const columns: ColumnsType<AlbumItem> = useMemo(
        () => [
            {
                title: 'Tên Album',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description',
                render: text => {
                    if (!text) return app.EMPTY_DISPLAY
                    return <PreviewTextEditor value={text} />
                },
            },
            {
                title: 'Ngày tạo',
                dataIndex: 'created_at',
                key: 'created_at',
            },
            {
                title: 'Cập nhật',
                dataIndex: 'updated_at',
                key: 'updated_at',
            },
            {
                title: 'Hành động',
                key: 'actions',
                fixed: 'right',
                align: 'center',
                width: 120,
                render: (_, record) => (
                    <Space>
                        {hasPermission(RESOURCE_TYPE.ALBUM_360, ACTION.UPDATE) && (
                            <Tooltip title="Chỉnh sửa">
                                <Button icon={<EditOutlined />} href={`/albums/${record.id}/update`} size="small" />
                            </Tooltip>
                        )}

                        {hasPermission(RESOURCE_TYPE.ALBUM_360, ACTION.DELETE) && (
                            <Popconfirm
                                title="Xóa Album"
                                description="Bạn có chắc chắn muốn xóa Album này không?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                placement="topRight">
                                <Tooltip title="Xóa">
                                    <Button icon={<DeleteOutlined />} size="small" danger />
                                </Tooltip>
                            </Popconfirm>
                        )}
                    </Space>
                ),
            },
        ],
        [handleDelete, hasPermission],
    )

    const dataSource = useMemo(() => albumData?.data?.items || [], [albumData])

    const totalAlbums = albumData?.data?.total || 0

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Danh sách Album',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    {hasPermission(RESOURCE_TYPE.ALBUM_360, ACTION.CREATE) && (
                        <Button type="primary" icon={<PlusOutlined />} href="/albums/create" className="w-fit">
                            Tạo mới
                        </Button>
                    )}
                </Flex>
            </Card>

            <Card>
                <Flex wrap={false} gap="middle" align="center" justify="space-between" className="!mb-4">
                    <Input
                        placeholder="Tìm theo tên Album"
                        allowClear
                        onChange={e => setSearch(e.target.value)}
                        className="!w-1/6"
                    />
                </Flex>

                <Table<AlbumItem>
                    dataSource={dataSource}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    bordered
                    scroll={{ x: true }}
                    pagination={
                        totalAlbums > app.DEFAULT_PAGE_SIZE && {
                            current: page,
                            pageSize: app.DEFAULT_PAGE_SIZE,
                            total: totalAlbums,
                            onChange: setPage,
                            responsive: true,
                        }
                    }
                />
            </Card>
        </Space>
    )
}

export default AlbumList
