import React, { useState, useRef } from 'react'
import { Alert, Upload, Typography, Space, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import { useUploadZipTourMutation } from '@/api/tour360'
import { CHUNK_SIZE } from '@/config/constant'
import type { Tour360UploadProps } from '@/types/tour360'

const { Dragger } = Upload
const { Text, Link } = Typography

const Tour360Upload: React.FC<Tour360UploadProps> = ({ nameFolder, onUploadComplete, currentZipUrl }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const abortControllerRef = useRef<AbortController | null>(null)
    const [uploadChunkMutation] = useUploadZipTourMutation()

    const handleCustomRequest: UploadProps['customRequest'] = async ({ file, onProgress, onSuccess, onError }) => {
        if (!nameFolder) {
            message.error('Vui lòng nhập tên thư mục trước khi upload')
            return
        }

        const uploadFile = file as File

        if (!uploadFile.name.endsWith('.zip')) {
            message.error('Vui lòng chọn file .zip')
            return
        }

        const totalChunks = Math.ceil(uploadFile.size / CHUNK_SIZE)
        const safeName = uploadFile.name.replace(/[^0-9a-zA-Z_.-]/g, '')
        const identifier = `${nameFolder}-${uploadFile.size}-${safeName}`

        abortControllerRef.current = new AbortController()

        try {
            for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
                if (abortControllerRef.current?.signal.aborted) {
                    throw new Error('Upload đã bị hủy')
                }

                const start = (chunkNumber - 1) * CHUNK_SIZE
                const end = Math.min(start + CHUNK_SIZE, uploadFile.size)
                const blob = uploadFile.slice(start, end)
                const chunk = new File([blob], uploadFile.name, {
                    type: uploadFile.type,
                    lastModified: uploadFile.lastModified,
                })

                const result = await uploadChunkMutation({
                    file: chunk,
                    resumableChunkNumber: chunkNumber,
                    resumableTotalChunks: totalChunks,
                    resumableIdentifier: identifier,
                    resumableFilename: uploadFile.name,
                }).unwrap()

                const progressPercent = Math.floor((chunkNumber / totalChunks) * 100)
                onProgress?.({ percent: progressPercent })

                if (result.data?.status === 'success' && result.data.temp_path) {
                    message.success('Upload hoàn tất! Vui lòng nhấn "Lưu" để áp dụng.')
                    onUploadComplete?.(result.data.temp_path)
                    onSuccess?.(result.data)
                    return
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name === 'AbortError' || err.message.includes('hủy')) {
                    message.warning('Upload đã bị hủy')
                } else {
                    message.error(err.message || 'Upload thất bại')
                }
                onError?.(err)
            } else {
                message.error('Upload thất bại')
            }
        }
    }

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList)
    }

    const handleRemove = () => {
        abortControllerRef.current?.abort()
        return true
    }

    const tourViewUrl = currentZipUrl ? `${import.meta.env.VITE_API_URL}/${currentZipUrl}` : null

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <div>
                <Text strong>Tải lên file .zip mới</Text>
                <div className="text-gray-500 text-sm mt-1">
                    Lưu ý: Nếu bạn tải lên file mới, tour cũ (nếu có) sẽ bị ghi đè sau khi bạn nhấn Lưu.
                </div>
            </div>

            {!nameFolder && <Alert message="Vui lòng nhập tên thư mục trước khi upload" type="warning" showIcon />}

            <Dragger
                name="file"
                accept=".zip"
                fileList={fileList}
                customRequest={handleCustomRequest}
                onChange={handleChange}
                onRemove={handleRemove}
                maxCount={1}
                disabled={!nameFolder}
                showUploadList={{
                    showRemoveIcon: true,
                    removeIcon: 'Hủy',
                }}>
                <div className="text-5xl text-blue-500 mb-4">
                    <InboxOutlined />
                </div>
                <p className="text-base text-gray-800 mb-1">Click hoặc kéo thả file ZIP vào đây</p>
                <p className="text-sm text-gray-500">Hỗ trợ upload file .zip dung lượng lớn với chunked upload</p>
            </Dragger>

            {currentZipUrl && tourViewUrl && (
                <Alert
                    message={
                        <div>
                            <Text strong>Tour hiện tại: </Text>
                            <Link href={tourViewUrl} target="_blank" rel="noopener noreferrer">
                                Xem tour 360
                            </Link>
                            <div className="text-xs text-gray-500 mt-1">Đường dẫn: {currentZipUrl}</div>
                        </div>
                    }
                    type="info"
                    showIcon
                />
            )}
        </Space>
    )
}

export default Tour360Upload
