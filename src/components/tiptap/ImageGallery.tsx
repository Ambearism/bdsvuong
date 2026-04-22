import { useUploadImagesMutation } from '@/api/image'
import type { UploadImageResponse } from '@/types/image'
import { InboxOutlined } from '@ant-design/icons'
import { Button, message, Modal, Upload, type UploadFile } from 'antd'
import type { UploadChangeParam } from 'antd/es/upload'
import { useState } from 'react'

const { Dragger } = Upload

interface ImageGalleryProps {
    open: boolean
    onCancel: () => void
    onUploadComplete: (uploadedFiles: UploadImageResponse[]) => void
    folder: string
    imageType: number
}

export const ImageGallery = ({ open, onCancel, onUploadComplete, folder, imageType }: ImageGalleryProps) => {
    const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([])
    const [uploadImagesApi, { isLoading: isUploading }] = useUploadImagesMutation()

    const handleUpload = async () => {
        if (!uploadFileList.length) return

        const formData = new FormData()
        formData.append('folder', folder)
        formData.append('type', String(imageType))

        uploadFileList.forEach(file => {
            if (file.originFileObj) {
                formData.append('files', file.originFileObj)
            }
        })

        try {
            const res = await uploadImagesApi(formData).unwrap()
            message.success('Upload ảnh thành công!')
            setUploadFileList([])
            onUploadComplete(res.data)
        } catch {
            message.error('Upload thất bại.')
        }
    }

    const handleClose = () => {
        setUploadFileList([])
        onCancel()
    }

    return (
        <Modal
            open={open}
            centered
            title="Upload ảnh mới"
            onCancel={handleClose}
            footer={[
                <Button key="back" onClick={handleClose}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isUploading}
                    onClick={handleUpload}
                    disabled={!uploadFileList.length}>
                    Upload
                </Button>,
            ]}>
            <Dragger
                multiple
                accept="image/*"
                fileList={uploadFileList}
                onChange={(info: UploadChangeParam) => {
                    setUploadFileList(info.fileList)
                }}
                beforeUpload={() => false}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Nhấn hoặc kéo file vào khu vực này</p>
            </Dragger>
        </Modal>
    )
}
