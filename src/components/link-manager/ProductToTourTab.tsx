import React, { useEffect, useState } from 'react'
import { Table, Input, Button, Card, message, Flex, Typography } from 'antd'
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { app } from '@/config/app'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTour360ListQuery } from '@/api/tour360'
import { useGetToursByProductQuery, useLinkProductsToTourMutation } from '@/api/tour-link'

interface TourItem {
    id: number
    display_name: string
}

interface Props {
    product_id: number
}

const ProductToTourTab: React.FC<Props> = ({ product_id }) => {
    const [tour360Keyword, setTour360Keyword] = useState('')
    const debouncedTour360Keyword = useDebounce(tour360Keyword)

    const [linkedTours, setLinkedTours] = useState<TourItem[]>([])
    const [hasChange, setHasChange] = useState(false)

    const { data: allToursData } = useGetTour360ListQuery(
        {
            page: app.DEFAULT_PAGE,
            per_page: app.FETCH_ALL,
            keyword: debouncedTour360Keyword,
        },
        { refetchOnMountOrArgChange: true },
    )

    const { data: linkedToursData, refetch: refetchLinked } = useGetToursByProductQuery(
        { product_id },
        { skip: !product_id },
    )

    const [linkProductToTours, { isLoading: isSaving }] = useLinkProductsToTourMutation()

    useEffect(() => {
        if (linkedToursData?.data?.tours) {
            setLinkedTours(linkedToursData.data.tours)
        } else {
            setLinkedTours([])
        }
        setHasChange(false)
    }, [linkedToursData])

    const availableTours = allToursData?.data?.items?.filter(item => !linkedTours.some(li => li.id === item.id)) || []

    const handleAdd = (tour: TourItem) => {
        if (!linkedTours.some(item => item.id === tour.id)) {
            setLinkedTours(prev => [...prev, tour])
            setHasChange(true)
        }
    }

    const handleRemove = (tour: TourItem) => {
        setLinkedTours(prev => prev.filter(item => item.id !== tour.id))
        setHasChange(true)
    }

    const handleSave = async () => {
        try {
            await linkProductToTours({
                product_id,
                tour_ids: linkedTours.map(tour => tour.id),
            }).unwrap()

            message.success('Lưu liên kết thành công')
            setHasChange(false)
            refetchLinked()
        } catch {
            message.error('Lưu liên kết thất bại')
        }
    }

    const columnAvailable = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Tên tour', dataIndex: 'display_name' },
        {
            title: 'Thao tác',
            width: 100,
            align: 'center' as const,
            render: (_: TourItem, record: TourItem) => (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(record)} />
            ),
        },
    ]

    const columnLinked = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Tên tour', dataIndex: 'display_name' },
        {
            title: 'Thao tác',
            width: 100,
            align: 'center' as const,
            render: (_: TourItem, record: TourItem) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleRemove(record)} />
            ),
        },
    ]

    return (
        <Flex className="flex-col gap-4">
            <Flex className="gap-4 relative">
                <Card className="flex-1">
                    <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                        <Typography.Text strong>Tour 360 khả dụng ({availableTours.length})</Typography.Text>

                        <Input
                            placeholder="Tìm kiếm tour 360"
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={event => setTour360Keyword(event.target.value)}
                            className="max-w-xs"
                        />
                    </Flex>

                    <Table bordered rowKey="id" dataSource={availableTours} columns={columnAvailable} />
                </Card>

                <Card className="flex-1">
                    <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                        <Typography.Text strong>
                            Tour 360 đã liên kết ({linkedTours.length})
                            {hasChange && <span className="text-orange-500 ml-2">Chưa lưu</span>}
                        </Typography.Text>
                    </Flex>

                    <Table bordered rowKey="id" dataSource={linkedTours} columns={columnLinked} pagination={false} />
                </Card>
            </Flex>
            <Flex justify="center" className="mt-4">
                <Button type="primary" loading={isSaving} onClick={handleSave}>
                    Lưu liên kết
                </Button>
            </Flex>
        </Flex>
    )
}

export default ProductToTourTab
