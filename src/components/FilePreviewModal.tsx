import { useEffect, useMemo, useState } from 'react'
import { Button, Empty, Image, List, Modal, Space, Typography } from 'antd'
import { DownloadOutlined, ExportOutlined, FileTextOutlined } from '@ant-design/icons'
import { FILE_PREVIEW, FILE_PREVIEW_EXTENSIONS } from '@/config/constant'

type FilePreviewModalProps = {
    open: boolean
    onCancel: () => void
    file_urls?: string | string[]
    title?: string
}

export default function FilePreviewModal({ open, onCancel, file_urls, title }: FilePreviewModalProps) {
    const getFileExtension = (value: string) => value.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() || ''

    const files = useMemo(() => {
        const rawItems = Array.isArray(file_urls) ? file_urls : file_urls ? [file_urls] : []

        return rawItems
            .flatMap(item =>
                String(item)
                    .split(',')
                    .map(value => value.trim()),
            )
            .filter(file =>
                FILE_PREVIEW_EXTENSIONS.includes(getFileExtension(file) as (typeof FILE_PREVIEW_EXTENSIONS)[number]),
            )
            .filter(Boolean)
    }, [file_urls])

    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        if (open) setActiveIndex(0)
    }, [open, file_urls])

    const current = files[activeIndex]
    const fileName = current ? decodeURIComponent(String(current).split('/').pop() || '') : ''
    const ext = current ? getFileExtension(current) : ''
    const isImage = FILE_PREVIEW.IMAGE_EXTENSIONS.includes(ext as (typeof FILE_PREVIEW.IMAGE_EXTENSIONS)[number])
    const isPdf = FILE_PREVIEW.DOCUMENT_EXTENSIONS.includes(ext as (typeof FILE_PREVIEW.DOCUMENT_EXTENSIONS)[number])

    const handleDownload = (url: string) => {
        const link = document.createElement('a')
        link.href = url
        link.download = decodeURIComponent(url.split('/').pop() || 'tai-lieu')
        link.target = '_blank'
        link.rel = 'noreferrer'
        document.body.appendChild(link)
        link.click()
        link.remove()
    }

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1200}
            title={title || 'Xem Tài Liệu'}
            destroyOnHidden>
            <div className="flex gap-0 overflow-hidden rounded-xl border border-slate-200">
                <div className="w-75 border-r border-slate-200 bg-slate-50 p-4">
                    <Typography.Title level={5} className="!mb-3 !text-sm !font-semibold !uppercase !text-slate-500">
                        Danh sách tài liệu ({files.length})
                    </Typography.Title>

                    <List
                        dataSource={files}
                        locale={{ emptyText: <Empty description="Không có tài liệu" /> }}
                        renderItem={(file, index) => {
                            const name = decodeURIComponent(String(file).split('/').pop() || `Tệp ${index + 1}`)
                            const active = index === activeIndex

                            return (
                                <List.Item className="!border-none !p-0 !pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveIndex(index)}
                                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                                            active
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}>
                                        <FileTextOutlined className="!text-slate-500" />
                                        <Typography.Text className="!mb-0 !line-clamp-2 !font-medium">
                                            {name}
                                        </Typography.Text>
                                    </button>
                                </List.Item>
                            )
                        }}
                    />
                </div>

                <div className="flex min-h-170 flex-1 flex-col bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <Typography.Text ellipsis className="!max-w-[620px] !font-semibold">
                            {fileName || 'Không có tài liệu'}
                        </Typography.Text>

                        <Space>
                            <Button
                                icon={<DownloadOutlined />}
                                disabled={!current}
                                onClick={() => current && handleDownload(current)}>
                                Tải xuống
                            </Button>
                            <Button
                                icon={<ExportOutlined />}
                                disabled={!current}
                                onClick={() => current && window.open(current, '_blank', 'noopener,noreferrer')}>
                                Mở tab mới
                            </Button>
                        </Space>
                    </div>

                    <div className="flex-1 bg-slate-100 p-4">
                        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                            {current ? (
                                isImage ? (
                                    <Image src={current} alt={fileName} className="max-h-full max-w-full" />
                                ) : isPdf ? (
                                    <iframe src={current} title={fileName} className="h-full w-full border-0" />
                                ) : (
                                    <div className="text-center">
                                        <Typography.Text>Không hỗ trợ xem trước loại file này.</Typography.Text>
                                        <div className="mt-3">
                                            <Button type="primary" onClick={() => handleDownload(current)}>
                                                Tải xuống
                                            </Button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <Empty description="Không có tài liệu" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
