import React, { useEffect, useState } from 'react'
import { Table, Input, Button, message, Flex, Typography, Select, Empty } from 'antd'
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

import { app } from '@/config/app'
import { useGetProductListQuery } from '@/api/product'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTour360ListQuery } from '@/api/tour360'
import type { Tour360Item } from '@/types/tour360'
import { useGetProductsByTourQuery, useLinkTourToProductsMutation } from '@/api/tour-link'

import type { ProductItem } from '@/types/product'

const TourToProductTab: React.FC = () => {
    const [keywordTour360, setKeywordTour360] = useState('')
    const [productKeyword, setProductKeyword] = useState('')
    const debouncedTour360Keyword = useDebounce(keywordTour360)
    const debouncedProductKeyword = useDebounce(productKeyword)

    const [selectedTour360, setSelectedTour360] = useState<number | null>(null)
    const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([])
    const [tour360Options, setTour360Options] = useState<Tour360Item[]>([])
    const [hasMoreTour, setHasMoreTour] = useState(true)
    const [hasChange, setHasChange] = useState(false)

    const [productPage, setProductPage] = useState(app.DEFAULT_PAGE)
    const [tour360Page, setTour360Page] = useState(1)

    const { data: tour360Data, isFetching: fetchingTour360 } = useGetTour360ListQuery({
        page: tour360Page,
        per_page: app.DEFAULT_PAGE_SIZE,
        keyword: debouncedTour360Keyword,
    })

    const { data: productData, isLoading: loadingProducts } = useGetProductListQuery({
        page: productPage,
        per_page: app.DEFAULT_PAGE_SIZE,
        keyword: debouncedProductKeyword,
        is_option: true,
    })

    const { data: linkedData, refetch: refetchLinked } = useGetProductsByTourQuery(
        { tour_id: selectedTour360! },
        { skip: !selectedTour360 },
    )

    const [linkMutation, { isLoading: saving }] = useLinkTourToProductsMutation()

    useEffect(() => {
        const items = tour360Data?.data?.items
        if (!items) return

        setTour360Options(prev => {
            if (tour360Page === app.DEFAULT_PAGE) return items
            const merged = [...prev, ...items]
            return Array.from(new Map(merged.map(item => [item.id, item])).values())
        })
        setHasMoreTour(items.length === app.DEFAULT_PAGE_SIZE)
    }, [tour360Data, tour360Page])

    useEffect(() => {
        setTour360Page(1)
    }, [debouncedTour360Keyword])

    const handleTourScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const { scrollTop, scrollHeight, clientHeight } = target

        if (scrollTop + clientHeight >= scrollHeight - 5 && hasMoreTour && !fetchingTour360) {
            setTour360Page(prev => prev + 1)
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
        if (!selectedTour360) return
        try {
            await linkMutation({
                tour_id: selectedTour360,
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
                <Typography.Text strong>Danh sách Tour 360</Typography.Text>

                <Select
                    showSearch
                    value={selectedTour360 || undefined}
                    placeholder="Chọn tour360..."
                    filterOption={false}
                    loading={fetchingTour360}
                    onSearch={value => {
                        setKeywordTour360(value)
                        setTour360Page(app.DEFAULT_PAGE)
                    }}
                    onChange={value => setSelectedTour360(value)}
                    onPopupScroll={handleTourScroll}
                    options={tour360Options.map(item => ({
                        label: item.display_name,
                        value: item.id,
                    }))}
                />
            </Flex>

            {!selectedTour360 && (
                <Empty
                    description="Vui lòng chọn tour 360 ở trên để quản lý liên kết"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-8"
                />
            )}

            {selectedTour360 && (
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

export default TourToProductTab
