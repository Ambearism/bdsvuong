import React, { useEffect, useState } from 'react'
import { Table, Input, Button, message, Flex, Typography, Select, Empty } from 'antd'
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

import {
    useGetImage360ListQuery,
    useGetProjectLinkedByImage360Query,
    useLinkImage360ToProjectsMutation,
} from '@/api/image-360'

import { useGetProjectListQuery } from '@/api/project'
import { app } from '@/config/app'
import { useDebounce } from '@/hooks/useDebounce'
import type { Image360Item } from '@/types/image-360'

interface ProjectItem {
    id: number
    name: string
}

const Image360ToProjectTab: React.FC = () => {
    const [keywordImage360, setKeywordImage360] = useState('')
    const [projectKeyword, setProjectKeyword] = useState('')
    const debouncedImage360Keyword = useDebounce(keywordImage360)
    const debouncedProjectKeyword = useDebounce(projectKeyword)

    const [selectedImage360, setSelectedImage360] = useState<number | null>(null)
    const [selectedProjects, setSelectedProjects] = useState<ProjectItem[]>([])
    const [image360Options, setImage360Options] = useState<Image360Item[]>([])
    const [hasMoreImage, setHasMoreImage] = useState(true)
    const [hasChange, setHasChange] = useState(false)

    const [image360Page, setImage360Page] = useState(app.DEFAULT_PAGE)

    const { data: allProjectsData, isLoading: loadingProjects } = useGetProjectListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
        is_option: true,
    })

    const { data: image360Data, isFetching: fetchingImage360 } = useGetImage360ListQuery({
        page: image360Page,
        per_page: app.DEFAULT_PAGE_SIZE,
        keyword: debouncedImage360Keyword,
    })

    const { data: linkedData, refetch: refetchLinked } = useGetProjectLinkedByImage360Query(
        { panorama_id: selectedImage360! },
        { skip: !selectedImage360 },
    )

    const [linkMutation, { isLoading: saving }] = useLinkImage360ToProjectsMutation()

    useEffect(() => {
        const items = image360Data?.data?.items
        if (!items) return

        setImage360Options(prev => {
            if (image360Page === app.DEFAULT_PAGE) return items
            const merged = [...prev, ...items]
            return Array.from(new Map(merged.map(item => [item.id, item])).values())
        })
        setHasMoreImage(items.length === app.DEFAULT_PAGE_SIZE)
    }, [image360Data, image360Page])

    useEffect(() => {
        setImage360Page(app.DEFAULT_PAGE)
    }, [debouncedImage360Keyword])

    const handleImageScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLDivElement
        const { scrollTop, scrollHeight, clientHeight } = target
        if (scrollTop + clientHeight >= scrollHeight - 5 && hasMoreImage && !fetchingImage360) {
            setImage360Page(prev => prev + 1)
        }
    }

    useEffect(() => {
        if (linkedData?.data?.projects) setSelectedProjects(linkedData.data.projects)
        else setSelectedProjects([])
        setHasChange(false)
    }, [linkedData])

    const handleAddToLinked = (item: ProjectItem) => {
        if (!selectedProjects.some(project => project.id === item.id)) {
            setSelectedProjects(prev => [...prev, item])
            setHasChange(true)
        }
    }

    const handleRemoveFromLinked = (item: ProjectItem) => {
        setSelectedProjects(prev => prev.filter(project => project.id !== item.id))
        setHasChange(true)
    }

    const handleSave = async () => {
        if (!selectedImage360) return
        try {
            await linkMutation({
                panorama_id: selectedImage360,
                project_ids: selectedProjects.map(project => project.id),
            }).unwrap()
            message.success('Lưu liên kết thành công!')
            refetchLinked()
            setHasChange(false)
        } catch {
            message.error('Lưu liên kết thất bại!')
        }
    }

    const filteredProjectLeft = (allProjectsData?.data?.items || []).filter(
        project =>
            !selectedProjects.some(item => item.id === project.id) &&
            (project.name.toLowerCase().includes(debouncedProjectKeyword.toLowerCase()) ||
                project.id.toString().includes(debouncedProjectKeyword)),
    )

    const columnProjects = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Tên dự án', dataIndex: 'name' },
        {
            title: 'Thao tác',
            align: 'center' as const,
            width: 100,
            render: (_: ProjectItem, record: ProjectItem) => (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddToLinked(record)}></Button>
            ),
        },
    ]

    const columnProjectsLinked = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Tên dự án', dataIndex: 'name' },
        {
            title: 'Thao tác',
            width: 100,
            align: 'center' as const,
            render: (_: ProjectItem, record: ProjectItem) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveFromLinked(record)}></Button>
            ),
        },
    ]

    return (
        <Flex className="flex-col gap-4">
            <Flex className="flex-col gap-2 max-w-xs">
                <Typography.Text strong>Danh sách Ảnh 360</Typography.Text>

                <Select
                    showSearch
                    value={selectedImage360 || undefined}
                    placeholder="Chọn ảnh 360"
                    filterOption={false}
                    loading={fetchingImage360}
                    onSearch={value => {
                        setKeywordImage360(value)
                        setImage360Page(app.DEFAULT_PAGE)
                    }}
                    onChange={value => setSelectedImage360(value)}
                    onPopupScroll={handleImageScroll}
                    options={image360Options.map(item => ({
                        label: item.title,
                        value: item.id,
                    }))}
                />
            </Flex>

            {!selectedImage360 && (
                <Empty
                    description="Vui lòng chọn ảnh 360 ở trên để liên kết dự án"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-8"
                />
            )}

            {selectedImage360 && (
                <>
                    <Flex className="gap-4 relative">
                        <Flex className="flex-1 flex-col">
                            <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                                <Typography.Text strong>Dự án ({filteredProjectLeft.length})</Typography.Text>

                                <Input
                                    placeholder="Tìm kiếm dự án"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    value={projectKeyword}
                                    onChange={e => setProjectKeyword(e.target.value)}
                                    className="max-w-xs"
                                />
                            </Flex>

                            <Table
                                bordered
                                rowKey="id"
                                loading={loadingProjects}
                                dataSource={filteredProjectLeft}
                                columns={columnProjects}
                                pagination={{
                                    pageSize: app.DEFAULT_PAGE_SIZE,
                                    responsive: true,
                                    showSizeChanger: false,
                                }}
                            />
                        </Flex>

                        <Flex className="flex-1 flex-col">
                            <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                                <Typography.Text strong>
                                    Dự án đã liên kết ({selectedProjects.length})
                                    {hasChange && <span className="text-orange-500 ml-2">Chưa lưu</span>}
                                </Typography.Text>
                            </Flex>

                            <Table
                                bordered
                                rowKey="id"
                                dataSource={selectedProjects}
                                columns={columnProjectsLinked}
                                pagination={
                                    selectedProjects.length > app.DEFAULT_PAGE_SIZE
                                        ? {
                                              pageSize: app.DEFAULT_PAGE_SIZE,
                                              responsive: true,
                                              showSizeChanger: false,
                                          }
                                        : false
                                }
                            />
                        </Flex>
                    </Flex>

                    <Flex justify="center" className="mt-4">
                        <Button type="primary" onClick={handleSave} loading={saving}>
                            Lưu liên kết
                        </Button>
                    </Flex>
                </>
            )}
        </Flex>
    )
}

export default Image360ToProjectTab
