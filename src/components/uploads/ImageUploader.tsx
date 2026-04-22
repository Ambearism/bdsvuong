import { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Button, Flex, message, Spin, Upload } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { RcFile, UploadProps } from 'antd/es/upload'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetImagesQuery, useUploadImagesMutation, useDeleteImageMutation } from '@/api/image'
import { app } from '@/config/app'

interface ImageUploaderProps {
    itemId?: number
    imageType: number
    folder: string
    isPublic?: boolean
    onChange?: () => void
    hasError?: boolean
    maxWidth?: number
    maxHeight?: number
}

export interface ImageUploaderRef {
    uploadSelectedFile: (itemId: number) => Promise<void>
    hasSelectedFile: () => boolean
    getSelectedFile: () => RcFile | null
    hasImage: () => boolean
}

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
    ({ itemId, imageType, folder, isPublic = true, onChange, hasError = false, maxWidth, maxHeight }, ref) => {
        const [previewUrl, setPreviewUrl] = useState<string>('')
        const [selectedFile, setSelectedFile] = useState<RcFile | null>(null)

        const {
            data: apiData,
            isLoading: isLoadingImage,
            refetch,
        } = useGetImagesQuery(itemId ? { type: imageType, item_id: itemId } : skipToken, {
            refetchOnMountOrArgChange: true,
        })

        const [uploadImagesApi, { isLoading: isUploading }] = useUploadImagesMutation()
        const [deleteImageApi, { isLoading: isDeleting }] = useDeleteImageMutation()

        useEffect(() => {
            if (selectedFile) return

            const raw = apiData?.data?.items?.[0]?.image_url ?? ''
            if (raw) {
                setPreviewUrl(raw)
            }
        }, [apiData, selectedFile])

        const uploadFile = async (file: RcFile, targetItemId: number) => {
            const formData = new FormData()
            formData.append('files', file)
            formData.append('folder', folder)
            formData.append('type', String(imageType))
            formData.append('item_id', String(targetItemId))
            formData.append('is_public', isPublic.toString())
            formData.append('position', String(app.DEFAULT_POSITION))

            const res = await uploadImagesApi(formData).unwrap()
            const uploaded = res.data?.[0]

            if (uploaded) {
                await refetch()
                setPreviewUrl(uploaded.path || '')
                return uploaded
            }
        }

        const handleBeforeUpload = (file: RcFile) => {
            const isImage = file.type.startsWith('image/')
            if (!isImage) {
                message.error('Chỉ được upload file ảnh!')
                return Upload.LIST_IGNORE
            }

            const isLt5M = file.size / 1024 / 1024 < 5
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!')
                return Upload.LIST_IGNORE
            }

            return new Promise<boolean>((resolve, reject) => {
                const objectUrl = URL.createObjectURL(file)
                const img = new Image()
                img.onload = () => {
                    const { width, height } = img
                    URL.revokeObjectURL(objectUrl)

                    if (maxWidth && maxHeight) {
                        if (width > maxWidth || height > maxHeight) {
                            message.error(`Kích thước ảnh không vượt quá ${maxWidth}x${maxHeight}px!`)
                            reject()
                            return
                        }
                    }

                    if (!itemId) {
                        setSelectedFile(file)
                        const reader = new FileReader()
                        reader.onload = e => {
                            setPreviewUrl(e.target?.result as string)
                            onChange?.()
                            resolve(false)
                        }
                        reader.readAsDataURL(file)
                    } else {
                        resolve(true)
                    }
                }
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl)
                    message.error('Không thể đọc file ảnh!')
                    reject()
                }
                img.src = objectUrl
            })
        }

        const handleCustomRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
            if (!itemId) {
                onError?.(new Error('No itemId'))
                return
            }

            try {
                await uploadFile(file as RcFile, itemId)
                setSelectedFile(null)
                message.success('Upload ảnh thành công!')
                onSuccess?.(null)
            } catch {
                message.error('Upload ảnh thất bại')
                onError?.(new Error('Upload failed'))
            }
        }

        const handleDelete = async () => {
            if (selectedFile) {
                setSelectedFile(null)
                setPreviewUrl('')
                onChange?.()
                return
            }

            const imageId = apiData?.data?.items?.[0]?.id
            if (!imageId) return

            try {
                await deleteImageApi({ image_id: imageId }).unwrap()
                await refetch()
                setPreviewUrl('')
                onChange?.()
                message.success('Xóa ảnh thành công')
            } catch {
                message.error('Xóa ảnh thất bại')
            }
        }

        useImperativeHandle(ref, () => ({
            uploadSelectedFile: async (newItemId: number) => {
                if (!selectedFile) return

                try {
                    await uploadFile(selectedFile, newItemId)
                    setSelectedFile(null)
                    message.success('Upload ảnh thành công!')
                } catch {
                    message.error('Upload ảnh thất bại')
                }
            },
            hasSelectedFile: () => !!selectedFile,
            getSelectedFile: () => selectedFile,
            hasImage: () => !!selectedFile || !!previewUrl,
        }))

        const isLoading = isLoadingImage || isUploading || isDeleting

        if (!itemId && !selectedFile) {
            return (
                <div className={hasError ? 'rounded-lg border-2 border-red-500 p-1' : ''}>
                    <Upload
                        beforeUpload={handleBeforeUpload}
                        listType="picture-card"
                        showUploadList={false}
                        accept="image/*"
                        disabled={isLoading}
                        className="cursor-pointer">
                        <Flex vertical align="center" gap={4}>
                            <PlusOutlined />
                            <span>Chọn ảnh</span>
                        </Flex>
                    </Upload>
                </div>
            )
        }

        return (
            <Spin spinning={isLoading}>
                <div className={hasError ? 'rounded-lg border-2 border-red-500 p-1' : ''}>
                    {previewUrl ? (
                        <Flex vertical gap="middle">
                            <div className="relative group w-full rounded-lg border border-gray-300 overflow-hidden bg-white p-1">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-auto max-h-[300px] object-contain display-block mx-auto"
                                />
                            </div>
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                                danger
                                disabled={isLoading}
                                block
                                size="middle">
                                Xóa ảnh
                            </Button>
                        </Flex>
                    ) : (
                        <Upload
                            beforeUpload={handleBeforeUpload}
                            customRequest={handleCustomRequest}
                            listType="picture-card"
                            showUploadList={false}
                            accept="image/*"
                            disabled={isLoading}
                            className="cursor-pointer w-full">
                            <Flex vertical align="center" gap={4}>
                                <PlusOutlined />
                                <span>Chọn ảnh</span>
                            </Flex>
                        </Upload>
                    )}
                </div>
            </Spin>
        )
    },
)

ImageUploader.displayName = 'ImageUploader'

export default ImageUploader
