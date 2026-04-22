import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
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
    useUpdateImageNameMutation,
} from '@/api/image'
import { UPLOAD } from '@/config/constant'
import { skipToken } from '@reduxjs/toolkit/query/react'
import type { UpdatePositionImageRequest, UploadImageResponse } from '@/types/image'
import { SortableItem } from '@/components/uploads/SortableItem'

const { Paragraph, Text } = Typography

interface BaseImageUploadProps {
    itemId: number
    imageType: number
    folderPrefix: string
    title: string
    allowNameInput?: boolean
    messageGuide?: string
}

type UploadableFile = RcFile & { alreadyUploaded?: boolean }

type ImageItem = {
    id: number
    image_url: string
    position: number
    is_public: boolean
    name?: string
}

export default function BaseImageUpload({
    itemId,
    imageType,
    folderPrefix,
    title,
    allowNameInput = false,
    messageGuide,
}: BaseImageUploadProps) {
    const [images, setImages] = useState<ImageItem[]>([])
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [activeEditing, setActiveEditing] = useState<{ id: number; name: string } | null>(null)
    const debouncedEditing = useDebounce(activeEditing, 1000)

    const {
        data: apiData,
        isLoading: isLoadingImages,
        refetch: refetchImages,
    } = useGetImagesQuery(itemId ? { type: imageType, item_id: Number(itemId) } : skipToken, {
        refetchOnMountOrArgChange: true,
    })

    const [uploadImagesApi, { isLoading }] = useUploadImagesMutation()
    const [updatePositionImages, { isLoading: isSavingPosition }] = useUpdatePositonImagesMutation()
    const [deleteImageApi] = useDeleteImageMutation()
    const [updateImageNameApi] = useUpdateImageNameMutation()

    useEffect(() => {
        if (apiData?.data?.items) {
            setImages(
                apiData.data.items.map((img: ImageItem) => ({
                    ...img,
                    name: img.name || (allowNameInput ? 'Tiện ích' : ''),
                })),
            )
        }
    }, [apiData, allowNameInput])

    useEffect(() => {
        if (debouncedEditing) {
            const saveName = async () => {
                try {
                    await updateImageNameApi({
                        image_id: debouncedEditing.id,
                        name: debouncedEditing.name,
                    }).unwrap()
                    message.success('Đã cập nhật tên ảnh!')
                } catch {
                    message.error('Lỗi khi cập nhật tên ảnh')
                }
            }
            saveName()
        }
    }, [debouncedEditing, updateImageNameApi])

    const handleNameChange = (id: number, newName: string) => {
        setImages(prev => prev.map(img => (img.id === id ? { ...img, name: newName } : img)))
        setActiveEditing({ id, name: newName })
    }

    const uploadFiles = async (files: RcFile[]) => {
        if (!files.length || !itemId) return

        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('folder', `${folderPrefix}/${itemId}`)
        formData.append('type', String(imageType))
        formData.append('item_id', String(itemId))
        formData.append('is_public', 'true')

        try {
            const res = await uploadImagesApi(formData).unwrap()

            const uploadedImages: ImageItem[] = res.data.map((item: UploadImageResponse, index: number) => ({
                id: item.id_image,
                image_url: item.path,
                position: images.length + index + 1,
                is_public: true,
                name: allowNameInput ? 'Tiện ích' : '',
            }))

            setImages(prev => [...prev, ...uploadedImages])
            message.success('Upload ảnh thành công!')
        } catch {
            message.error('Upload ảnh thất bại')
        }
    }

    const handleBeforeUpload = (_: RcFile, files: RcFile[]) => {
        if (files.length > UPLOAD.MAX_FILE_UPLOAD) {
            message.error(`Bạn chỉ được chọn tối đa ${UPLOAD.MAX_FILE_UPLOAD} ảnh mỗi lần upload`)
            return Upload.LIST_IGNORE
        }

        const invalidFiles = files.filter(file => file.size > UPLOAD.MAX_FILE_SIZE)

        if (invalidFiles.length > 0) {
            message.error(`Có ${invalidFiles.length} ảnh vượt quá dung lượng 2MB. Vui lòng chọn ảnh khác.`)
            return Upload.LIST_IGNORE
        }

        const invalidFormat = files.some(file => !UPLOAD.ALLOWED_IMAGE_FORMATS.includes(file.type))

        if (invalidFormat) {
            message.error('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, GIF, BMP')
            return Upload.LIST_IGNORE
        }

        setFileList(prev => [...prev, ...files])
        return false
    }

    const handleUploadImages = async (info: UploadChangeParam) => {
        const newFiles = info.fileList
            .map(file => file.originFileObj)
            .filter((file): file is RcFile => !!file && !(file as UploadableFile).alreadyUploaded)

        if (!newFiles.length) return
        newFiles.forEach(file => ((file as UploadableFile).alreadyUploaded = true))

        await uploadFiles(newFiles)
        setFileList([])
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteImageApi({ image_id: id }).unwrap()
            setImages(prev => prev.filter(img => img.id !== id))
            message.success('Xóa ảnh thành công')
        } catch {
            message.error('Xóa ảnh thất bại')
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setImages(prev => {
                const oldIndex = prev.findIndex(img => img.id.toString() === active.id)
                const newIndex = prev.findIndex(img => img.id.toString() === over.id)
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
            await refetchImages()
            message.success('Lưu vị trí thành công')
        } catch {
            message.error('Lưu vị trí thất bại')
        }
    }

    return (
        <Card title={`Upload ảnh ${title}`}>
            <Paragraph>
                Dung lượng tối đa mỗi ảnh là 2MB. <br />
                Chấp nhận các định dạng *.jpg, *.jpeg, *.png, *.gif, *.bmp. <br />
                Mỗi lần upload tối đa {UPLOAD.MAX_FILE_UPLOAD} ảnh. <br />
                {messageGuide && (
                    <>
                        <Text strong>{messageGuide}</Text>
                        <br />
                    </>
                )}
                <Text type="danger">Có thể kéo thả các ảnh để thay đổi vị trí</Text>
            </Paragraph>

            <Space className="mb-4" align="center">
                <Upload
                    multiple
                    accept={UPLOAD.IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                    showUploadList={false}
                    fileList={fileList}
                    beforeUpload={handleBeforeUpload}
                    onChange={handleUploadImages}>
                    <Button icon={<PlusOutlined />} loading={isLoading}>
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

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map(i => i.id.toString())} strategy={horizontalListSortingStrategy}>
                    <Row gutter={[16, 16]}>
                        {images.map((img, index) => (
                            <Col key={img.id} className="inline-block">
                                <SortableItem
                                    id={img.id.toString()}
                                    url={img.image_url}
                                    index={index}
                                    name={img.name}
                                    onRemove={() => handleDelete(img.id)}
                                    onNameChange={newName => handleNameChange(img.id, newName)}
                                    showNameInput={allowNameInput}
                                />
                            </Col>
                        ))}
                    </Row>
                </SortableContext>
            </DndContext>
        </Card>
    )
}
