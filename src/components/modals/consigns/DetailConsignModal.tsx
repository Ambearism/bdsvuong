import React from 'react'
import { Modal, Typography, Space, Input, Row, Col } from 'antd'
import { FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import type { ConsignItem } from '@/types/consign'

dayjs.extend(relativeTime)
dayjs.locale('vi')

type Props = {
    open: boolean
    onClose: () => void
    consign?: ConsignItem | null
}

const padId = (id?: number) => (id ? `#${String(id)}` : '')

const getFileInfo = (url: string) => {
    const parts = url.split('/')
    const fullFileName = parts.at(-1)?.split('?')[0] || ''

    const fileExtension = fullFileName.split('.').pop()?.toLowerCase() || ''
    const fileNameDisplay = fullFileName

    let icon = <FilePdfOutlined className="text-3xl !text-red-500" />

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        icon = <FileImageOutlined className="text-3xl !text-blue-500" />
    }

    return { icon, fileNameDisplay, fileUrl: url }
}

const ReadOnlyInput: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <>
        <Typography.Text className="font-medium block !my-2">{label}</Typography.Text>
        <Input readOnly value={value ?? '-'} />
    </>
)

const DetailConsignModal: React.FC<Props> = ({ open, onClose, consign }) => {
    return (
        <Modal open={open} onCancel={onClose} footer={false} title={`Ký Gửi ${padId(consign?.id) || '#123'}`}>
            <Typography.Title level={4} className="text-base !my-2">
                Thông tin Ký gửi & Liên hệ
            </Typography.Title>
            <ReadOnlyInput label="Tên khách hàng" value={consign?.name_customer} />
            <ReadOnlyInput label="Số điện thoại" value={consign?.phone_customer} />
            <ReadOnlyInput label="Email" value={consign?.email_customer} />
            <ReadOnlyInput label="Nhu cầu ký gửi" value={consign?.type_transaction_name} />
            <ReadOnlyInput label="Loại hình BĐS" value={consign?.type_product_name} />

            <Typography.Title level={4} className="text-base !my-2">
                Thông tin chi tiết
            </Typography.Title>
            <Input.TextArea value={consign?.note} rows={6} readOnly />

            <Typography.Title level={4} className="text-base !my-2">
                File Đính Kèm
            </Typography.Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                {consign?.files.map((fileUrl, index) => {
                    const { icon, fileNameDisplay, fileUrl: actualUrl } = getFileInfo(fileUrl)
                    return (
                        <Row gutter={16} key={index} align="middle" className="py-2 border-b border-gray-200">
                            <Col>{icon}</Col>
                            <Col>
                                <a href={actualUrl} target="_blank" rel="noopener noreferrer">
                                    <Typography.Text strong>{fileNameDisplay}</Typography.Text>
                                </a>
                            </Col>
                        </Row>
                    )
                })}
            </Space>
        </Modal>
    )
}

export default DetailConsignModal
