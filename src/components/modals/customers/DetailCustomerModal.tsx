import React from 'react'
import { Modal, Descriptions, Tag, Typography, Space } from 'antd'
import dayjs from 'dayjs'
import { app } from '@/config/app'
import type { CustomerItem } from '@/types/customer'

type Props = {
    open: boolean
    onClose: () => void
    customer?: CustomerItem | null
}

const padId = (id?: number) => (id ? `#K${String(id)}` : app.EMPTY_DISPLAY)

const genderTag = (g: boolean | null | undefined) => {
    if (g === true) return <Tag color="cyan">Nam</Tag>
    if (g === false) return <Tag color="magenta">Nữ</Tag>
    return <Tag>{app.EMPTY_DISPLAY}</Tag>
}

const DetailCustomerModal: React.FC<Props> = ({ open, onClose, customer }) => {
    const createdAtText = customer?.created_at || app.EMPTY_DISPLAY

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={720}
            title={
                <Space size={12}>
                    <Typography.Text strong>Thông tin khách hàng</Typography.Text>
                    <Tag>{padId(customer?.id)}</Tag>
                </Space>
            }>
            <Descriptions
                column={1}
                labelStyle={{ width: 170, fontWeight: 500 }}
                contentStyle={{ background: '#fafafa' }}
                bordered
                size="middle">
                <Descriptions.Item label="Mã khách">
                    <Tag>{padId(customer?.id)}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Tên khách">
                    <Space size={8}>
                        <Typography.Text>{customer?.name ?? app.EMPTY_DISPLAY}</Typography.Text>
                        {genderTag(customer?.gender ?? null)}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">{createdAtText}</Descriptions.Item>
                <Descriptions.Item label="Điện thoại">{customer?.phone ?? app.EMPTY_DISPLAY}</Descriptions.Item>
                <Descriptions.Item label="Email">{customer?.email ?? app.EMPTY_DISPLAY}</Descriptions.Item>
                <Descriptions.Item label="Facebook">{customer?.facebook ?? app.EMPTY_DISPLAY}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                    {customer?.birthday ? dayjs(customer.birthday).format('DD/MM/YYYY') : app.EMPTY_DISPLAY}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{customer?.address ?? app.EMPTY_DISPLAY}</Descriptions.Item>
                <Descriptions.Item label="Nơi công tác">{customer?.work_place ?? app.EMPTY_DISPLAY}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{customer?.note ?? app.EMPTY_DISPLAY}</Descriptions.Item>
            </Descriptions>
        </Modal>
    )
}

export default DetailCustomerModal
