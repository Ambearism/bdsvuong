import React from 'react'
import { Avatar, Badge, Button, Card, Flex, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import type { DebtNoteBase } from '@/types/debt-note'
import { DEBT_NOTE_TYPE_LABELS, DEBT_NOTE_TYPE_TAG_COLORS } from '@/config/constant'
import { app } from '@/config/app'
import { UserOutlined, CalendarOutlined, SendOutlined } from '@ant-design/icons'

interface DebtReminderColumnProps {
    items: DebtNoteBase[]
    onSendReminder: (item: DebtNoteBase) => void
    sendingReminderId?: number
}

export const DebtReminderColumn: React.FC<DebtReminderColumnProps> = ({ items, onSendReminder, sendingReminderId }) => {
    return (
        <div className="flex-shrink-0 w-80 h-full">
            <Card
                size="small"
                styles={{
                    body: {
                        padding: 12,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                    },
                }}
                className="!h-full !flex !flex-col !border !border-[#e5e7eb]">
                <div className="mb-3 rounded-lg px-3 py-2.5 bg-[#fff7e6]">
                    <Flex justify="space-between" align="center">
                        <Typography.Text strong className="!text-sm !text-[#d46b08]">
                            NHẮC NỢ
                        </Typography.Text>
                        <Badge
                            count={items.length}
                            className="!text-white !font-bold !min-w-8 !h-6 !leading-6 !rounded-xl !px-2"
                            styles={{
                                indicator: {
                                    backgroundColor: '#d46b08',
                                },
                            }}
                        />
                    </Flex>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 !min-h-0 !relative">
                    <div className="flex flex-col gap-3">
                        {items.map(item => (
                            <Card key={item.id} size="small" className="!border !border-[#e5e7eb]">
                                <Flex vertical gap={8}>
                                    <Flex justify="space-between" align="center" gap={8}>
                                        <Typography.Text strong className="!line-clamp-2">
                                            {item.title}
                                        </Typography.Text>
                                        <Tag color={DEBT_NOTE_TYPE_TAG_COLORS[item.type]}>
                                            {DEBT_NOTE_TYPE_LABELS[item.type]}
                                        </Tag>
                                    </Flex>
                                    {item.content && (
                                        <Typography.Text type="secondary" className="!line-clamp-3">
                                            {item.content}
                                        </Typography.Text>
                                    )}
                                    <Typography.Text>
                                        <strong>Tiền:</strong> {item.amount ?? app.EMPTY_DISPLAY} triệu
                                    </Typography.Text>
                                </Flex>
                                <div className="!border-t !border-[#E3E3E3] !mt-2 !mb-2" />
                                <Flex justify="space-between" align="center" className="pt-2">
                                    <Flex align="center" gap={4}>
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <Typography.Text type="secondary" className="text-xs">
                                            {item.assigned_to_rel?.full_name || app.EMPTY_DISPLAY}
                                        </Typography.Text>
                                    </Flex>
                                    {item.reminder_date && dayjs(item.reminder_date).isValid() && (
                                        <Flex align="center" gap={4}>
                                            <CalendarOutlined className="text-xs text-gray-400" />
                                            <Typography.Text type="secondary" className="text-xs">
                                                {dayjs(item.reminder_date).format('DD/MM/YYYY')}
                                            </Typography.Text>
                                        </Flex>
                                    )}
                                </Flex>
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    className="!mt-3"
                                    block
                                    loading={sendingReminderId === item.id}
                                    onClick={e => {
                                        e.stopPropagation()
                                        onSendReminder(item)
                                    }}>
                                    Gửi Nhắc Việc
                                </Button>
                            </Card>
                        ))}
                    </div>
                    {items.length === 0 && <div className="!min-h-25 !w-full" />}
                </div>
            </Card>
        </div>
    )
}
