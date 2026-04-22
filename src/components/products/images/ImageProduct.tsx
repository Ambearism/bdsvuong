import { useState, useEffect } from 'react'
import { Button, Card, Col, Row, Space, Typography, Upload, message } from 'antd'
import type { RcFile, UploadFile, UploadChangeParam } from 'antd/es/upload'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import {
    useUploadImagesMutation,
    useGetImagesQuery,
    useDeleteImageMutation,
    useUpdatePositonImagesMutation,
} from '@/api/image'
import { IMAGE_TYPE, UPLOAD } from '@/config/constant'
import { skipToken } from '@reduxjs/toolkit/query/react'
import type { UpdatePositionImageRequest, UploadImageResponse } from '@/types/image'
import { SortableItem } from '@/components/uploads/SortableItem'
import { isApiError } from '@/lib/utils'

const { Paragraph, Text } = Typography

interface Props {
    product_id: number
}

type UploadableFile = RcFile & { alreadyUploaded?: boolean }

type ImageItem = {
    id: number
    image_url: string
    position: number
    is_public: boolean
}

export default function ImageProduct({ product_id }: Props) {
    const [images, setImages] = useState<ImageItem[]>([])
    const [personalImages, setPersonalImages] = useState<ImageItem[]>([])
    const [fileListPublic, setFileListPublic] = useState<UploadFile[]>([])
    const [fileListPersonal, setFileListPersonal] = useState<UploadFile[]>([])

    const { data: apiData, isLoading: isLoadingImages } = useGetImagesQuery(
        product_id ? { type: IMAGE_TYPE.PRODUCT, item_id: Number(product_id) } : skipToken,
        {
            refetchOnMountOrArgChange: true,
        },
    )

    const [uploadPublicImages, { isLoading: isUploadingPublic }] = useUploadImagesMutation()
    const [uploadPersonalImages, { isLoading: isUploadingPersonal }] = useUploadImagesMutation()
    const [updatePositionImages, { isLoading: isSavingPosition }] = useUpdatePositonImagesMutation()
    const [deleteImageApi] = useDeleteImageMutation()

    useEffect(() => {
        if (apiData?.data?.items) {
            const allImages = apiData.data.items
            setImages(
                allImages
                    .filter(img => img.is_public)
                    .map(img => ({
                        id: img.id,
                        image_url: img.image_url,
                        position: img.position,
                        is_public: true,
                    })),
            )
            setPersonalImages(
                allImages
                    .filter(img => !img.is_public)
                    .map(img => ({
                        id: img.id,
                        image_url: img.image_url,
                        position: img.position,
                        is_public: false,
                    })),
            )
        }
    }, [apiData])

    const uploadFiles = async (
        files: RcFile[],
        is_public: boolean,
        setTarget: React.Dispatch<React.SetStateAction<ImageItem[]>>,
        trigger: ReturnType<typeof useUploadImagesMutation>[0],
    ) => {
        if (!files.length || !product_id) return

        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('folder', `products/${product_id}`)
        formData.append('type', String(IMAGE_TYPE.PRODUCT))
        formData.append('item_id', String(product_id))
        formData.append('is_public', is_public.toString())

        try {
            const res = await trigger(formData).unwrap()
            const uploadedImages: ImageItem[] = res.data.map((item: UploadImageResponse, index: number) => ({
                id: item.id_image,
                image_url: item.path,
                position: (setTarget === setImages ? images : personalImages).length + index + 1,
                is_public: is_public,
            }))

            setTarget(prev => [...prev, ...uploadedImages])
            message.success('Upload ảnh thành công!')
        } catch (err) {
            if (isApiError(err)) {
                message.error(err.data?.status?.message || 'Upload ảnh thất bại')
                return
            }

            message.error('Upload ảnh thất bại')
        }
    }
    const handleBeforeUpload = (
        file: RcFile,
        files: RcFile[],
        setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>,
    ) => {
        const isValidFormat = UPLOAD.ALLOWED_IMAGE_FORMATS.includes(file.type)
        if (!isValidFormat) {
            message.error(`File '${file.name}' không đúng định dạng. Chỉ chấp nhận: jpg, jpeg, png, gif, bmp.`)
            return Upload.LIST_IGNORE
        }

        if (file.size > UPLOAD.MAX_FILE_SIZE) {
            message.error(`File '${file.name}' quá lớn. Tối đa 2MB.`)
            return Upload.LIST_IGNORE
        }

        if (files.length > UPLOAD.MAX_FILE_UPLOAD) {
            message.error(`Bạn chỉ được chọn tối đa ${UPLOAD.MAX_FILE_UPLOAD} ảnh mỗi lần upload`)
            return Upload.LIST_IGNORE
        }

        setFileList(prev => [
            ...prev,
            ...files.filter(
                item => item.size <= UPLOAD.MAX_FILE_SIZE && UPLOAD.ALLOWED_IMAGE_FORMATS.includes(item.type),
            ),
        ])
        return false
    }

    const handleUploadImages = async (is_public: boolean, info: UploadChangeParam) => {
        const newFiles = info.fileList
            .map(file => file.originFileObj)
            .filter((file): file is RcFile => !!file && !(file as UploadableFile).alreadyUploaded)

        if (!newFiles.length) return
        newFiles.forEach(file => ((file as UploadableFile).alreadyUploaded = true))

        if (is_public) {
            await uploadFiles(newFiles, true, setImages, uploadPublicImages)
            setFileListPublic([])
        } else {
            await uploadFiles(newFiles, false, setPersonalImages, uploadPersonalImages)
            setFileListPersonal([])
        }
    }

    const handleDelete = async (id: number, setTarget: React.Dispatch<React.SetStateAction<ImageItem[]>>) => {
        try {
            await deleteImageApi({ image_id: id }).unwrap()
            setTarget(prev => prev.filter(img => img.id !== id))
            message.success('Xóa ảnh thành công')
        } catch {
            message.error('Xóa ảnh thất bại')
        }
    }

    const handleDragEnd = (event: DragEndEvent, setImageList: React.Dispatch<React.SetStateAction<ImageItem[]>>) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setImageList(prev => {
                const oldIndex = prev.findIndex(index => index.id.toString() === active.id)
                const newIndex = prev.findIndex(index => index.id.toString() === over.id)
                return arrayMove(prev, oldIndex, newIndex)
            })
        }
    }

    const handleSavePosition = async () => {
        try {
            const payload: UpdatePositionImageRequest = {
                images: images.map((img, index) => ({
                    id: img.id,
                    position: index,
                })),
            }

            await updatePositionImages(payload).unwrap()
        } catch {
            message.error('Lưu vị trí thất bại')
        }
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card title="Upload ảnh hàng hoá">
                <Paragraph>
                    - Dung lượng tối đa mỗi ảnh là 2MB. <br />
                    - Chấp nhận các định dạng *.jpg, *.jpeg, *.png, *.gif, *.bmp. <br />- Mỗi lần upload tối đa{' '}
                    {UPLOAD.MAX_FILE_UPLOAD} ảnh. <br />
                    <Text strong>Kích thước khuyến nghị 880 x 585 px.</Text>
                    <br />
                    <Text type="danger">Có thể kéo thả các ảnh để thay đổi vị trí</Text>
                </Paragraph>

                <Space className="mb-4" align="center">
                    <Upload
                        multiple
                        accept={UPLOAD.IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                        showUploadList={false}
                        fileList={fileListPublic}
                        beforeUpload={(file, files) => handleBeforeUpload(file, files, setFileListPublic)}
                        onChange={info => handleUploadImages(true, info)}>
                        <Button icon={<PlusOutlined />} loading={isUploadingPublic}>
                            Chọn ảnh
                        </Button>
                    </Upload>

                    <Button
                        icon={<SaveOutlined />}
                        type="primary"
                        onClick={handleSavePosition}
                        loading={isSavingPosition || isLoadingImages}>
                        Lưu vị trí
                    </Button>
                </Space>

                <DndContext collisionDetection={closestCenter} onDragEnd={event => handleDragEnd(event, setImages)}>
                    <SortableContext items={images.map(i => i.id.toString())} strategy={horizontalListSortingStrategy}>
                        <Row gutter={[16, 16]}>
                            {images.map(img => (
                                <Col key={img.id} className="inline-block">
                                    <SortableItem
                                        id={img.id.toString()}
                                        url={img.image_url}
                                        index={images.findIndex(i => i.id === img.id)}
                                        onRemove={() => handleDelete(img.id, setImages)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </SortableContext>
                </DndContext>
            </Card>

            <Card title="Upload ảnh lưu trữ cá nhân">
                <Paragraph>
                    - Dung lượng tối đa mỗi ảnh là 2MB. <br />
                    - Chấp nhận các định dạng *.jpg, *.jpeg, *.png, *.gif, *.bmp. <br />- Mỗi lần upload tối đa{' '}
                    {UPLOAD.MAX_FILE_UPLOAD} ảnh. <br />
                    <Text strong>Kích thước khuyến nghị 880 x 585 px.</Text>
                    <br />
                    <Text type="danger">Có thể kéo thả các ảnh để thay đổi vị trí</Text>
                </Paragraph>

                <Space className="mb-4">
                    <Upload
                        multiple
                        accept={UPLOAD.IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                        showUploadList={false}
                        fileList={fileListPersonal}
                        beforeUpload={(file, files) => handleBeforeUpload(file, files, setFileListPersonal)}
                        onChange={info => handleUploadImages(false, info)}>
                        <Button icon={<PlusOutlined />} loading={isUploadingPersonal}>
                            Chọn ảnh
                        </Button>
                    </Upload>
                </Space>

                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={event => handleDragEnd(event, setPersonalImages)}>
                    <SortableContext
                        items={personalImages.map(i => i.id.toString())}
                        strategy={horizontalListSortingStrategy}>
                        <Row gutter={[16, 16]}>
                            {personalImages.map((img, index) => (
                                <Col key={img.id} className="inline-block">
                                    <SortableItem
                                        id={img.id.toString()}
                                        url={img.image_url}
                                        index={index}
                                        onRemove={() => handleDelete(img.id, setPersonalImages)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </SortableContext>
                </DndContext>
            </Card>
        </Space>
    )
}
