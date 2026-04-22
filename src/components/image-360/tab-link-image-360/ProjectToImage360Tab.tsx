import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button, Table, Popconfirm, Input, Flex } from 'antd'
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useGetImage360LinkedByProjectQuery, useLinkProjectToImage360sMutation } from '@/api/image-360'
import { message } from 'antd'
import { app } from '@/config/app'
import type { ImageSimpleItem, ProjectToImage360TabRef } from '@/types/image-360'

interface ProjectToImage360TabProps {
    allImages: ImageSimpleItem[]
    projectId?: number
}

const ProjectToImage360Tab = forwardRef<ProjectToImage360TabRef, ProjectToImage360TabProps>(
    ({ allImages, projectId }, ref) => {
        const [searchAvailable, setSearchAvailable] = useState('')
        const [pendingLinkedIds, setPendingLinkedIds] = useState<number[]>([])
        const [hasChanges, setHasChanges] = useState(false)

        const { data, isLoading, refetch } = useGetImage360LinkedByProjectQuery(
            { project_id: projectId! },
            { skip: !projectId },
        )

        const [linkFn, { isLoading: isLinking }] = useLinkProjectToImage360sMutation()

        useEffect(() => {
            if (data?.data?.panoramas) {
                setPendingLinkedIds(data.data.panoramas.map(img => img.id))
                setHasChanges(false)
            }
        }, [data])

        const handleAddImage = (imageId: number) => {
            if (!projectId) return

            if (pendingLinkedIds.includes(imageId)) {
                message.info('Ảnh này đã được thêm vào danh sách')
                return
            }

            setPendingLinkedIds([...pendingLinkedIds, imageId])
            setHasChanges(true)
            message.success('Đã thêm ảnh vào danh sách chờ')
        }

        const handleRemoveImage = (imageId: number) => {
            if (!projectId) return

            setPendingLinkedIds(pendingLinkedIds.filter(id => id !== imageId))
            setHasChanges(true)
            message.success('Đã xóa ảnh khỏi danh sách chờ')
        }

        const handleSave = async () => {
            if (!projectId) return

            try {
                await linkFn({
                    project_id: projectId,
                    panorama_ids: pendingLinkedIds,
                }).unwrap()

                message.success('Đã lưu thay đổi thành công')
                setHasChanges(false)
                refetch()
            } catch {
                message.error('Có lỗi xảy ra khi lưu thay đổi')
            }
        }

        useImperativeHandle(ref, () => ({
            save: handleSave,
            hasChanges: () => hasChanges,
        }))

        const pendingLinkedImages = allImages.filter(img => pendingLinkedIds.includes(img.id))
        const availableImages = allImages.filter(img => !pendingLinkedIds.includes(img.id))

        const searchLower = searchAvailable.toLowerCase()
        const filteredAvailable = availableImages.filter(
            img => img.title?.toLowerCase().includes(searchLower) || img.id.toString().includes(searchAvailable),
        )

        const availableColumns = [
            { title: 'ID', dataIndex: 'id', key: 'id' },
            {
                title: 'Tên ảnh',
                dataIndex: 'title',
                key: 'title',
                render: (text: string, record: ImageSimpleItem) => text || `Ảnh #${record.id}`,
            },
            {
                title: 'Thao tác',
                key: 'action',
                align: 'center' as const,
                render: (_: unknown, record: ImageSimpleItem) => (
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddImage(record.id)}
                        disabled={isLinking}>
                        Thêm
                    </Button>
                ),
            },
        ]

        const linkedColumns = [
            { title: 'ID', dataIndex: 'id', key: 'id' },
            {
                title: 'Tên ảnh',
                dataIndex: 'title',
                key: 'title',
                render: (text: string, record: ImageSimpleItem) => text || `Ảnh #${record.id}`,
            },
            {
                title: 'Thao tác',
                key: 'action',
                align: 'center' as const,
                render: (_: unknown, record: ImageSimpleItem) => (
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa liên kết với ảnh này?"
                        onConfirm={() => handleRemoveImage(record.id)}
                        okText="Xóa"
                        cancelText="Hủy">
                        <Button type="primary" danger size="small" icon={<DeleteOutlined />} disabled={isLinking}>
                            Xóa
                        </Button>
                    </Popconfirm>
                ),
            },
        ]

        const totalAvailable = filteredAvailable.length
        const totalLinked = pendingLinkedImages.length

        return (
            <div className="grid lg:grid-cols-2 gap-4">
                <div>
                    <Flex justify="space-between" align="center" className="!mb-2 h-8" gap={8}>
                        <label className="text-sm font-medium whitespace-nowrap">
                            Ảnh 360 có sẵn ({totalAvailable})
                        </label>

                        <Input
                            placeholder="Tìm theo ID hoặc tên..."
                            prefix={<SearchOutlined />}
                            value={searchAvailable}
                            onChange={e => setSearchAvailable(e.target.value)}
                            allowClear
                            className="max-w-xs"
                        />
                    </Flex>

                    <Table
                        columns={availableColumns}
                        dataSource={filteredAvailable}
                        rowKey="id"
                        loading={isLoading}
                        bordered
                        scroll={{ x: true }}
                        pagination={
                            totalAvailable > app.DEFAULT_PAGE_SIZE && {
                                pageSize: app.DEFAULT_PAGE_SIZE,
                                total: totalAvailable,
                                responsive: true,
                                showSizeChanger: false,
                            }
                        }
                        locale={{
                            emptyText: searchAvailable ? 'Không tìm thấy ảnh nào' : 'Tất cả ảnh đã được liên kết',
                        }}
                    />
                </div>

                <div>
                    <Flex justify="space-between" align="center" className="!mb-2 h-8">
                        <label className="flex items-center text-sm font-medium">
                            Ảnh 360 đã liên kết ({totalLinked})
                            {hasChanges && <span className="text-orange-500 ml-2">Chưa lưu</span>}
                        </label>
                    </Flex>

                    <Table
                        columns={linkedColumns}
                        dataSource={pendingLinkedImages}
                        loading={isLoading}
                        rowKey="id"
                        bordered
                        scroll={{ x: true }}
                        pagination={
                            totalLinked > app.DEFAULT_PAGE_SIZE && {
                                pageSize: app.DEFAULT_PAGE_SIZE,
                                total: totalLinked,
                                responsive: true,
                                showSizeChanger: false,
                            }
                        }
                        locale={{
                            emptyText: 'Chưa có ảnh nào được liên kết',
                        }}
                    />
                </div>
            </div>
        )
    },
)

ProjectToImage360Tab.displayName = 'ProjectToImage360Tab'

export default ProjectToImage360Tab
