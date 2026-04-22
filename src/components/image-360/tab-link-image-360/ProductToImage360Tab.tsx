import React, { useEffect, useState } from 'react'
import { Table, Input, Button, Card, message, Flex, Typography } from 'antd'
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'

import {
    useGetImage360ListQuery,
    useGetImage360LinkedByProductQuery,
    useLinkProdcutToImage360sMutation,
} from '@/api/image-360'

import { app } from '@/config/app'
import { useDebounce } from '@/hooks/useDebounce'

interface ImageItem {
    id: number
    title: string
}

interface Props {
    product_id: number
}

const ProductToImage360Tab: React.FC<Props> = ({ product_id }) => {
    const [image360Keyword, setImage360Keyword] = useState('')
    const debouncedImage360Keyword = useDebounce(image360Keyword)

    const [linkedImages, setLinkedImages] = useState<ImageItem[]>([])
    const [hasChange, setHasChange] = useState(false)

    const { data: allImagesData } = useGetImage360ListQuery(
        {
            page: app.DEFAULT_PAGE,
            per_page: app.FETCH_ALL,
            keyword: debouncedImage360Keyword,
        },
        { refetchOnMountOrArgChange: true },
    )

    const { data: linkedImagesData, refetch: refetchLinked } = useGetImage360LinkedByProductQuery(
        { product_id },
        { skip: !product_id },
    )

    const [linkProductToImages, { isLoading: isSaving }] = useLinkProdcutToImage360sMutation()

    useEffect(() => {
        if (linkedImagesData?.data?.panoramas) {
            setLinkedImages(linkedImagesData.data.panoramas)
        } else {
            setLinkedImages([])
        }
        setHasChange(false)
    }, [linkedImagesData])

    const availableImages =
        allImagesData?.data?.items?.filter(item => !linkedImages.some(li => li.id === item.id)) || []

    const handleAdd = (image: ImageItem) => {
        if (!linkedImages.some(item => item.id === image.id)) {
            setLinkedImages(prev => [...prev, image])
            setHasChange(true)
        }
    }

    const handleRemove = (image: ImageItem) => {
        setLinkedImages(prev => prev.filter(item => item.id !== image.id))
        setHasChange(true)
    }

    const handleSave = async () => {
        try {
            await linkProductToImages({
                product_id,
                panorama_ids: linkedImages.map(image => image.id),
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
        { title: 'Tên ảnh', dataIndex: 'title' },
        {
            title: 'Thao tác',
            width: 100,
            align: 'center' as const,
            render: (_: ImageItem, record: ImageItem) => (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(record)} />
            ),
        },
    ]

    const columnLinked = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Tên ảnh', dataIndex: 'title' },
        {
            title: 'Thao tác',
            width: 100,
            align: 'center' as const,
            render: (_: ImageItem, record: ImageItem) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleRemove(record)} />
            ),
        },
    ]

    return (
        <Flex className="flex-col gap-4">
            <Flex className="gap-4 relative">
                <Card className="flex-1">
                    <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                        <Typography.Text strong>Ảnh 360 khả dụng ({availableImages.length})</Typography.Text>

                        <Input
                            placeholder="Tìm kiếm ảnh 360"
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={event => setImage360Keyword(event.target.value)}
                            className="max-w-xs"
                        />
                    </Flex>

                    <Table bordered rowKey="id" dataSource={availableImages} columns={columnAvailable} />
                </Card>

                <Card className="flex-1">
                    <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                        <Typography.Text strong>
                            Ảnh 360 đã liên kết ({linkedImages.length})
                            {hasChange && <span className="text-orange-500 ml-2">Chưa lưu</span>}
                        </Typography.Text>
                    </Flex>

                    <Table bordered rowKey="id" dataSource={linkedImages} columns={columnLinked} pagination={false} />
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

export default ProductToImage360Tab
