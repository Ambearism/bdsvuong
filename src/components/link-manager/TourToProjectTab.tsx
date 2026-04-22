import React, { useState, useEffect } from 'react'
import { Select, Button, Table, Popconfirm, Input, Flex, Typography, message, Empty } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons'
import { useGetProjectsByTourQuery, useLinkTourToProjectsMutation } from '@/api/tour-link'
import { app } from '@/config/app'
import type { ProjectSimple, Tour360Simple } from '@/types/tour-link'

const { Option } = Select

const TourToProjectTab: React.FC<{ allTours: Tour360Simple[]; allProjects: ProjectSimple[] }> = ({
    allTours,
    allProjects,
}) => {
    const [selectedTour, setSelectedTour] = useState<number | undefined>()
    const [searchAvailable, setSearchAvailable] = useState('')
    const [searchLinked, setSearchLinked] = useState('')
    const [pendingLinkedIds, setPendingLinkedIds] = useState<number[]>([])
    const [hasChanges, setHasChanges] = useState(false)

    const { data, isLoading, refetch } = useGetProjectsByTourQuery({ tour_id: selectedTour! }, { skip: !selectedTour })

    const [linkFn, { isLoading: isLinking }] = useLinkTourToProjectsMutation()

    useEffect(() => {
        if (data?.data?.projects) {
            setPendingLinkedIds(data.data.projects.map(p => p.id))
            setHasChanges(false)
        }
    }, [data])

    const handleAddProject = (projectId: number) => {
        if (!selectedTour) return

        if (pendingLinkedIds.includes(projectId)) {
            message.info('Project này đã được thêm vào danh sách')
            return
        }

        setPendingLinkedIds([...pendingLinkedIds, projectId])
        setHasChanges(true)
        message.success('Đã thêm project vào danh sách chờ')
    }

    const handleRemoveProject = (projectId: number) => {
        if (!selectedTour) return

        setPendingLinkedIds(pendingLinkedIds.filter(id => id !== projectId))
        setHasChanges(true)
        message.success('Đã xóa project khỏi danh sách chờ')
    }

    const handleSave = async () => {
        if (!selectedTour) return

        try {
            await linkFn({
                tour_id: selectedTour,
                project_ids: pendingLinkedIds,
            }).unwrap()

            message.success('Đã lưu thay đổi thành công')
            setHasChanges(false)
            refetch()
        } catch {
            message.error('Có lỗi xảy ra khi lưu thay đổi')
        }
    }

    const handleTourChange = (value: number) => {
        if (hasChanges) {
            message.warning('Bạn có thay đổi chưa lưu. Vui lòng lưu hoặc chọn tour khác.')
            return
        }
        setSelectedTour(value)
    }

    const pendingLinkedProjects = allProjects.filter(p => pendingLinkedIds.includes(p.id))
    const availableProjects = allProjects.filter(project => !pendingLinkedIds.includes(project.id))

    const searchLower = searchAvailable.toLowerCase()
    const filteredAvailable = availableProjects.filter(
        p => p.name?.toLowerCase().includes(searchLower) || p.id.toString().includes(searchAvailable),
    )
    const searchLinkedLower = searchLinked.toLowerCase()
    const filteredLinked = pendingLinkedProjects.filter(
        p => p.name?.toLowerCase().includes(searchLinkedLower) || p.id.toString().includes(searchLinked),
    )

    const availableColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Tên Dự Án',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <div className="line-clamp-1">{text || app.EMPTY_DISPLAY}</div>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            align: 'center' as const,
            render: (_: unknown, record: ProjectSimple) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddProject(record.id)}
                    disabled={isLinking}
                />
            ),
        },
    ]

    const linkedColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Tên Dự Án',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <div className="line-clamp-1">{text || app.EMPTY_DISPLAY}</div>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            align: 'center' as const,
            render: (_: unknown, record: ProjectSimple) => (
                <Popconfirm
                    title="Xóa khỏi danh sách"
                    description="Bạn có chắc muốn xóa project này?"
                    onConfirm={() => handleRemoveProject(record.id)}
                    okText="Xóa"
                    cancelText="Hủy">
                    <Button danger size="small" icon={<DeleteOutlined />} disabled={isLinking} />
                </Popconfirm>
            ),
        },
    ]

    const totalAvailable = filteredAvailable.length
    const totalLinked = filteredLinked.length

    return (
        <Flex className="flex-col gap-4">
            <Flex className="flex-col gap-2 max-w-xs">
                <Typography.Text strong>Danh sách Tour 360</Typography.Text>
                <Select
                    showSearch
                    placeholder="Chọn tour360..."
                    value={selectedTour}
                    onChange={handleTourChange}
                    optionFilterProp="children"
                    className="w-full">
                    {allTours.map(t => (
                        <Option key={t.id} value={t.id}>
                            {t.display_name ?? `Tour #${t.id}`}
                        </Option>
                    ))}
                </Select>
            </Flex>

            {selectedTour && (
                <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                        <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                            <Typography.Text strong>Dự án ({totalAvailable})</Typography.Text>
                        </Flex>
                        <Input
                            placeholder="Tìm theo ID hoặc tên..."
                            prefix={<SearchOutlined />}
                            value={searchAvailable}
                            onChange={e => setSearchAvailable(e.target.value)}
                            className="mb-2"
                            allowClear
                        />
                        <Table
                            columns={availableColumns}
                            dataSource={filteredAvailable}
                            rowKey="id"
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
                                emptyText: searchAvailable
                                    ? 'Không tìm thấy dự án nào'
                                    : 'Tất cả dự án đã được liên kết',
                            }}
                        />
                    </div>

                    <div>
                        <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                            <Typography.Text strong>
                                Dự án đã liên kết ({totalLinked})
                                {hasChanges && <span className="text-orange-500 ml-2">Chưa lưu</span>}
                            </Typography.Text>
                        </Flex>
                        <Input
                            placeholder="Tìm theo ID hoặc tên..."
                            prefix={<SearchOutlined />}
                            value={searchLinked}
                            onChange={e => setSearchLinked(e.target.value)}
                            className="mb-2"
                            allowClear
                        />
                        <Table
                            columns={linkedColumns}
                            dataSource={filteredLinked}
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
                                emptyText: searchLinked
                                    ? 'Không tìm thấy project nào'
                                    : 'Chưa có project nào được liên kết',
                            }}
                        />
                    </div>
                </div>
            )}

            {selectedTour && (
                <Flex justify="center" className="mt-4">
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={isLinking}
                        disabled={!hasChanges}>
                        Lưu liên kết
                    </Button>
                </Flex>
            )}

            {!selectedTour && (
                <Empty
                    description="Vui lòng chọn tour ở trên để quản lý liên kết"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-8"
                />
            )}
        </Flex>
    )
}

export default TourToProjectTab
