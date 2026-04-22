import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button, Table, Popconfirm, Input, Flex } from 'antd'
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useGetToursByProjectQuery, useLinkProjectsToTourMutation } from '@/api/tour-link'
import { message } from 'antd'
import { app } from '@/config/app'
import type { ProjectToTourTabRef, Tour360Simple } from '@/types/tour-link'

interface ProjectToTourTabProps {
    allTours: Tour360Simple[]
    projectId?: number
}

const ProjectToTourTab = forwardRef<ProjectToTourTabRef, ProjectToTourTabProps>(({ allTours, projectId }, ref) => {
    const [searchAvailable, setSearchAvailable] = useState('')
    const [pendingLinkedIds, setPendingLinkedIds] = useState<number[]>([])
    const [hasChanges, setHasChanges] = useState(false)

    const { data, isLoading, refetch } = useGetToursByProjectQuery({ project_id: projectId! }, { skip: !projectId })

    const [linkFn, { isLoading: isLinking }] = useLinkProjectsToTourMutation()

    useEffect(() => {
        if (data?.data?.tours) {
            setPendingLinkedIds(data.data.tours.map(t => t.id))
            setHasChanges(false)
        }
    }, [data])

    const handleAddTour = (tourId: number) => {
        if (!projectId) return

        if (pendingLinkedIds.includes(tourId)) {
            message.info('Tour này đã được thêm vào danh sách')
            return
        }

        setPendingLinkedIds([...pendingLinkedIds, tourId])
        setHasChanges(true)
        message.success('Đã thêm tour vào danh sách chờ')
    }

    const handleRemoveTour = (tourId: number) => {
        if (!projectId) return

        setPendingLinkedIds(pendingLinkedIds.filter(id => id !== tourId))
        setHasChanges(true)
        message.success('Đã xóa tour khỏi danh sách chờ')
    }

    const handleSave = async () => {
        if (!projectId) return

        try {
            await linkFn({
                project_id: projectId,
                tour_ids: pendingLinkedIds,
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

    const pendingLinkedTours = allTours.filter(t => pendingLinkedIds.includes(t.id))
    const availableTours = allTours.filter(t => !pendingLinkedIds.includes(t.id))

    const searchLower = searchAvailable.toLowerCase()
    const filteredAvailable = availableTours.filter(
        t => t.display_name?.toLowerCase().includes(searchLower) || t.id.toString().includes(searchAvailable),
    )

    const availableColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên Tour',
            dataIndex: 'display_name',
            key: 'display_name',
            render: (text: string, record: Tour360Simple) => text || `Tour #${record.id}`,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_: unknown, record: Tour360Simple) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddTour(record.id)}
                    disabled={isLinking}>
                    Thêm
                </Button>
            ),
        },
    ]

    const linkedColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên Tour',
            dataIndex: 'display_name',
            key: 'display_name',
            render: (text: string, record: Tour360Simple) => text || `Tour #${record.id}`,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_: unknown, record: Tour360Simple) => (
                <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc muốn xóa liên kết với tour này?"
                    onConfirm={() => handleRemoveTour(record.id)}
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
    const totalLinked = pendingLinkedTours.length

    return (
        <div className="grid lg:grid-cols-2 gap-4">
            <div>
                <Flex justify="space-between" align="center" className="!mb-2 h-8" gap={8}>
                    <label className="text-sm font-medium whitespace-nowrap">Tours có sẵn ({totalAvailable})</label>

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
                        emptyText: searchAvailable ? 'Không tìm thấy tour nào' : 'Tất cả tours đã được liên kết',
                    }}
                />
            </div>

            <div>
                <Flex justify="space-between" align="center" className="!mb-2 h-8">
                    <label className="flex items-center text-sm font-medium">
                        Tours đã liên kết ({totalLinked})
                        {hasChanges && <span className="text-orange-500 ml-2">Chưa lưu</span>}
                    </label>
                </Flex>

                <Table
                    columns={linkedColumns}
                    dataSource={pendingLinkedTours}
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
                        emptyText: 'Chưa có tour nào được liên kết',
                    }}
                />
            </div>
        </div>
    )
})

ProjectToTourTab.displayName = 'ProjectToTourTab'

export default ProjectToTourTab
