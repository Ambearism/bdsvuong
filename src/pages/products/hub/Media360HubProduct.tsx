import React, { useState } from 'react'
import { Card, Table, Typography, Space, Spin, Empty, Button, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOutletContext } from 'react-router'
import { EyeOutlined } from '@ant-design/icons'
import Image360ViewerModal from '@/components/modals/image-360/Image360ViewerModal'
import type { HubOutletContext } from '@/pages/products/hub/ProductHub'
import type { ProductImage360, ProductMediaItem, ProductTour } from '@/types/product'
import { MEDIA_TYPE, type TypeOfMediaType } from '@/config/constant'

const { Title, Text } = Typography

const Media360HubProduct: React.FC = () => {
    const { productData, isLoading } = useOutletContext<HubOutletContext>()

    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)
    const [viewingImageUrl, setViewingImageUrl] = useState('')

    const tours = productData?.product_tours || []
    const panoramas = productData?.product_images?.image360 || []

    const handleOpenTour = (zipUrl: string | null) => {
        if (zipUrl) {
            window.open(zipUrl, '_blank')
        }
    }

    const handleOpenImage = (url: string | null) => {
        if (url) {
            setViewingImageUrl(url)
            setIsViewerModalOpen(true)
        }
    }

    const commonColumns = (type: TypeOfMediaType): ColumnsType<ProductMediaItem> => [
        { title: 'ID', dataIndex: 'id', width: 80 },
        {
            title: type === MEDIA_TYPE.TOUR ? 'Tên Tour 360' : 'Tên Ảnh 360',
            dataIndex: type === MEDIA_TYPE.TOUR ? 'display_name' : 'title',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Thao tác',
            align: 'center' as const,
            width: 100,
            render: (_: unknown, record: ProductMediaItem) => {
                const url =
                    type === MEDIA_TYPE.TOUR
                        ? (record as ProductTour).zip_url
                        : (record as ProductImage360).panorama_url
                const label = type === MEDIA_TYPE.TOUR ? 'Xem Tour 360' : 'Xem Ảnh 360'

                return (
                    <Tooltip title={url ? label : 'Nội dung chưa sẵn sàng'}>
                        <Button
                            type="text"
                            disabled={!url}
                            icon={
                                <EyeOutlined
                                    className={url ? 'text-blue-500 hover:scale-110 transition-all' : 'text-gray-300'}
                                />
                            }
                            onClick={() =>
                                type === MEDIA_TYPE.TOUR
                                    ? handleOpenTour((record as ProductTour).zip_url)
                                    : handleOpenImage((record as ProductImage360).panorama_url)
                            }
                        />
                    </Tooltip>
                )
            },
        },
    ]

    if (isLoading) {
        return (
            <Card className="text-center h-64 flex items-center justify-center">
                <Spin tip="Đang tải dữ liệu media..." />
            </Card>
        )
    }

    return (
        <Space direction="vertical" size="large" className="w-full">
            <Card
                title={
                    <Title level={5} className="!m-0 text-blue-600">
                        Tour 360 đã liên kết ({tours.length})
                    </Title>
                }>
                <Table
                    columns={commonColumns(MEDIA_TYPE.TOUR)}
                    dataSource={tours}
                    rowKey="id"
                    pagination={false}
                    locale={{
                        emptyText: <Empty description="Thông tin: Không có Tour 360 nào được gán cho hàng hoá này." />,
                    }}
                />
            </Card>

            <Card
                title={
                    <Title level={5} className="!m-0 text-blue-600">
                        Ảnh 360 (Panorama) đã liên kết ({panoramas.length})
                    </Title>
                }>
                <Table
                    columns={commonColumns(MEDIA_TYPE.PANORAMA)}
                    dataSource={panoramas}
                    rowKey="id"
                    pagination={false}
                    locale={{
                        emptyText: <Empty description="Thông tin: Không có Ảnh 360 nào được gán cho hàng hoá này." />,
                    }}
                />
            </Card>

            <Image360ViewerModal
                open={isViewerModalOpen}
                onClose={() => setIsViewerModalOpen(false)}
                image_url={viewingImageUrl}
            />
        </Space>
    )
}

export default Media360HubProduct
