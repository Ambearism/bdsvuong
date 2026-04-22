import React, { useEffect, useState } from 'react'
import { Table, Input, Button, message, Flex, Typography, Select, Empty } from 'antd'
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

import { useGetImage360ListQuery } from '@/api/image-360'
import { useGetProductLinkedByImage360Query, useLinkImage360ToProductsMutation } from '@/api/image-360'
import { app } from '@/config/app'
import { useGetProductListQuery } from '@/api/product'
import { useDebounce } from '@/hooks/useDebounce'
import type { Image360Item } from '@/types/image-360'

import type { ProductItem } from '@/types/product'

const Image360ToProductTab: React.FC = () => {
    const [keywordImage360, setKeywordImage360] = useState('')
    const [productKeyword, setProductKeyword] = useState('')
    const debouncedImage360Keyword = useDebounce(keywordImage360)
    const debouncedProductKeyword = useDebounce(productKeyword)

    const [selectedImage360, setSelectedImage360] = useState<number | null>(null)
    const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([])
    const [image360Options, setImage360Options] = useState<Image360Item[]>([])
    const [hasMoreImage, setHasMoreImage] = useState(true)
    const [hasChange, setHasChange] = useState(false)

    const [productPage, setProductPage] = useState(app.DEFAULT_PAGE)
    const [image360Page, setImage360Page] = useState(1)

    const { data: image360Data, isFetching: fetchingImage360 } = useGetImage360ListQuery({
        page: image360Page,
        per_page: app.DEFAULT_PAGE_SIZE,
        keyword: debouncedImage360Keyword,
    })

    const { data: productData, isLoading: loadingProducts } = useGetProductListQuery({
        page: productPage,
        per_page: app.DEFAULT_PAGE_SIZE,
        keyword: debouncedProductKeyword,
        is_option: true,
    })

    const { data: linkedData, refetch: refetchLinked } = useGetProductLinkedByImage360Query(
        { panorama_id: selectedImage360! },
        { skip: !selectedImage360 },
    )

    const [linkMutation, { isLoading: saving }] = useLinkImage360ToProductsMutation()

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
        setImage360Page(1)
    }, [debouncedImage360Keyword])

    const handleImageScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const { scrollTop, scrollHeight, clientHeight } = target

        if (scrollTop + clientHeight >= scrollHeight - 5 && hasMoreImage && !fetchingImage360) {
            setImage360Page(prev => prev + 1)
        }
    }

    useEffect(() => {
        if (linkedData?.data?.products) {
            setSelectedProducts(linkedData.data.products as ProductItem[])
        } else {
            setSelectedProducts([])
        }
        setHasChange(false)
    }, [linkedData])

    const handleAddToLinked = (item: ProductItem) => {
        if (selectedProducts.some(product => product.id === item.id)) {
            message.warning('Hàng hoá đã tồn tại ở danh sách liên kết!')
            return
        }
        setSelectedProducts(prev => [...prev, item])
        setHasChange(true)
    }

    const handleRemoveFromLinked = (item: ProductItem) => {
        setSelectedProducts(prev => prev.filter(product => product.id !== item.id))
        setHasChange(true)
    }

    const handleSave = async () => {
        if (!selectedImage360) return
        try {
            await linkMutation({
                panorama_id: selectedImage360,
                product_ids: selectedProducts.map(product => product.id),
            }).unwrap()
            message.success('Lưu liên kết thành công!')
            refetchLinked()
            setHasChange(false)
        } catch {
            message.error('Lưu liên kết thất bại!')
        }
    }

    const columnProducts = [
        {
            title: 'Mã HH',
            key: 'product_code',
            width: 100,
            render: (_: unknown, record: ProductItem) => record.product_code || `#H${record.id}`,
        },
        {
            title: 'Tên hàng hoá',
            key: 'name',
            render: (_: unknown, record: ProductItem) => (
                <div className="line-clamp-1">{record.name || app.EMPTY_DISPLAY}</div>
            ),
        },
        {
            title: 'Thao tác',
            width: 100,
            align: 'center' as const,
            render: (_: unknown, record: ProductItem) => (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAddToLinked(record)} />
            ),
        },
    ]

    const columnProductsLinked = [
        {
            title: 'Mã HH',
            key: 'product_code',
            width: 100,
            render: (_: unknown, record: ProductItem) => record.product_code || `#H${record.id}`,
        },
        {
            title: 'Tên hàng hoá',
            key: 'name',
            render: (_: unknown, record: ProductItem) => (
                <div className="line-clamp-1">{record.name || app.EMPTY_DISPLAY}</div>
            ),
        },
        {
            title: 'Thao tác',
            width: 100,
            align: 'center' as const,
            render: (_: unknown, record: ProductItem) => (
                <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveFromLinked(record)} />
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
                    description="Vui lòng chọn ảnh 360 ở trên để quản lý liên kết"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-8"
                />
            )}

            {selectedImage360 && (
                <>
                    <Flex className="gap-4 relative">
                        <Flex className="flex-1 flex-col">
                            <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                                <Typography.Text strong>Hàng hoá ({productData?.data?.total || 0})</Typography.Text>
                                <Input
                                    placeholder="Tìm theo mã hoặc tên hàng hoá"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    value={productKeyword}
                                    onChange={event => {
                                        setProductKeyword(event.target.value)
                                        setProductPage(app.DEFAULT_PAGE)
                                    }}
                                    className="max-w-xs"
                                />
                            </Flex>

                            <Table
                                bordered
                                rowKey="id"
                                loading={loadingProducts}
                                dataSource={productData?.data?.items}
                                columns={columnProducts}
                                pagination={{
                                    current: productPage,
                                    pageSize: app.DEFAULT_PAGE_SIZE,
                                    total: productData?.data?.total || 0,
                                    onChange: page => setProductPage(page),
                                    showSizeChanger: false,
                                }}
                            />
                        </Flex>

                        <Flex className="flex-1 flex-col">
                            <Flex justify="space-between" align="center" className="!mb-2 h-[50px]">
                                <Typography.Text strong>
                                    Hàng hoá đã liên kết ({selectedProducts.length})
                                    {hasChange && <span className="text-orange-500 ml-2">Chưa lưu</span>}
                                </Typography.Text>
                            </Flex>

                            <Table
                                bordered
                                rowKey="id"
                                dataSource={selectedProducts}
                                columns={columnProductsLinked}
                                pagination={
                                    selectedProducts.length > app.DEFAULT_PAGE_SIZE
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

export default Image360ToProductTab
