import React, { useState, useEffect } from 'react'
import { Upload, message, Button, Space, Modal } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import {
    InboxOutlined,
    DeleteOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileTextOutlined,
    EyeOutlined,
} from '@ant-design/icons'
import { useUploadFileMutation, useDeleteFileMutation } from '@/api/file'
import { UPLOAD } from '@/config/constant'
import { app } from '@/config/app'

const { Dragger } = Upload
const { confirm } = Modal

interface BaseFileUploadProps {
    value?: string | string[]
    onChange?: (value: string) => void
    folder?: string
    maxSize?: number
    accept?: string
    multiple?: boolean
    maxCount?: number
    existingFiles?: string[] | null
    disabled?: boolean
}

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return <FilePdfOutlined className="text-red-500 text-2xl" />
    if (['doc', 'docx'].includes(ext || '')) return <FileWordOutlined className="text-blue-500 text-2xl" />
    return <FileTextOutlined className="text-gray-500 text-2xl" />
}

const BaseFileUpload: React.FC<BaseFileUploadProps> = ({
    value,
    onChange,
    existingFiles,
    folder = 'documents',
    maxSize = UPLOAD.MAX_FILE_SIZE_DOCS,
    accept = UPLOAD.ACCEPTED_EXTENSIONS,
    multiple = true,
    maxCount = UPLOAD.MAX_FILE_UPLOAD_DOCS,
    disabled = false,
}) => {
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [initializedFromProps, setInitializedFromProps] = useState(false)
    const [uploadFile] = useUploadFileMutation()
    const [deleteFile] = useDeleteFileMutation()

    useEffect(() => {
        let incomingPaths: string[] = []
        if (existingFiles && Array.isArray(existingFiles)) {
            incomingPaths = existingFiles
        } else if (Array.isArray(value)) {
            incomingPaths = value
        } else if (typeof value === 'string') {
            incomingPaths = value.split(',').filter(Boolean)
        }

        if (!initializedFromProps && fileList.length === 0 && incomingPaths.length > 0) {
            const newFiles: UploadFile[] = incomingPaths.map((path, index) => ({
                uid: `init-${index}`,
                name: path.split('/').pop() || 'Tài liệu',
                status: 'done',
                url: path,
            }))
            setFileList(newFiles)
            setInitializedFromProps(true)
        }
    }, [existingFiles, fileList.length, initializedFromProps, value])

    const customRequest: UploadProps['customRequest'] = async options => {
        const { onSuccess, onError, file } = options

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        try {
            const res = await uploadFile(formData).unwrap()
            const filePath = res.data.path
            if (onSuccess) onSuccess({ url: filePath })
            message.success('Upload thành công')
        } catch (err) {
            message.error('Upload thất bại')
            if (onError) onError(err as Error)
        }
    }

    const handleChange: UploadProps['onChange'] = info => {
        let newFileList = [...info.fileList]

        newFileList = newFileList.map(file => {
            if (file.response) {
                const resp = file.response
                const respUrl = typeof resp === 'string' ? resp : resp.url || resp.path || resp
                file.url = respUrl as string
                file.status = 'done'
            }
            return file
        })

        setFileList(newFileList)

        const doneFiles = newFileList.filter(f => f.status === 'done' && f.url)
        const pathString = doneFiles.map(f => f.url).join(',')

        if (onChange) onChange(pathString)
    }

    const handleRemove = (file: UploadFile) => {
        confirm({
            title: 'Xóa file?',
            content: 'Bạn có chắc chắn muốn xóa file này không? Hành động này sẽ xóa file khỏi hệ thống.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    if (file.status === 'done' && file.url) {
                        await deleteFile({ path: file.url }).unwrap()
                        message.success('Đã xóa file')
                    }

                    const newFileList = fileList.filter(f => f.uid !== file.uid)
                    setFileList(newFileList)

                    const pathString = newFileList
                        .filter(f => f.status === 'done' && f.url)
                        .map(f => f.url)
                        .join(',')

                    if (onChange) onChange(pathString)
                } catch {
                    message.error('Lỗi khi xóa file')
                }
            },
        })
    }

    const beforeUpload: UploadProps['beforeUpload'] = (file, currentBatchList) => {
        if (file.size > maxSize) {
            message.error(`File ${file.name} quá lớn (Max ${maxSize / 1024 / 1024}MB)`)
            return Upload.LIST_IGNORE
        }

        const currentTotal = fileList.length
        const indexInBatch = currentBatchList.indexOf(file)

        if (maxCount !== UPLOAD.SINGLE_FILE_LIMIT && currentTotal + indexInBatch === maxCount) {
            message.error(`Bạn chỉ được tải lên tối đa ${maxCount} file`)
        }

        return maxCount !== UPLOAD.SINGLE_FILE_LIMIT && currentTotal + indexInBatch >= maxCount
            ? Upload.LIST_IGNORE
            : true
    }

    return (
        <div className="w-full">
            <Dragger
                customRequest={customRequest}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                fileList={fileList}
                multiple={multiple}
                accept={accept}
                maxCount={maxCount}
                disabled={disabled}
                itemRender={() => null}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Kéo thả file hoặc click để upload</p>
                <p className="ant-upload-hint">Hỗ trợ PDF, DOCX, JPG, PNG (Tối đa {maxSize / 1024 / 1024}MB)</p>
            </Dragger>

            <div className="mt-4">
                {fileList.map(file => (
                    <div
                        key={file.uid}
                        className="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2 min-w-0">
                            {getFileIcon(file.name)}
                            <span className="flex-1 truncate">{file.name}</span>
                        </div>
                        <Space>
                            {file.url && (
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => {
                                        if (!file.url) return
                                        const baseUrl = app.API_URL
                                        const fullUrl = file.url.startsWith('http')
                                            ? file.url
                                            : `${baseUrl}/${file.url.replace(/^\//, '')}`
                                        window.open(fullUrl, '_blank')
                                    }}
                                />
                            )}
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemove(file)}
                                disabled={disabled}
                            />
                        </Space>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BaseFileUpload
