import React, { useState } from 'react'
import { Button, Card, Checkbox, Flex, Input, Select, Space, Tag, Typography } from 'antd'
import { SendOutlined, UserOutlined, EditOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import { message, Empty, Spin, Tooltip, Popconfirm } from 'antd'

import {
    useGetCareCaseLogsQuery,
    useAddCareCaseLogMutation,
    useUpdateCareCaseLogMutation,
    useDeleteCareCaseLogMutation,
} from '@/api/care-case-log'
import type { CareCaseLogItem } from '@/types/care-case-log'
import { REGEX_REMOVE_SECONDS, INTERACTION_OPTIONS } from '@/config/constant'

import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'

interface CareCaseLogTabProps {
    caseId: number
}

const CareCaseLogTab: React.FC<CareCaseLogTabProps> = ({ caseId }) => {
    const { hasPermission } = usePermission()
    const [interactionType, setInteractionType] = useState('call')
    const [content, setContent] = useState('')
    const [followUp, setFollowUp] = useState(false)
    const [editLogId, setEditLogId] = useState<number | null>(null)

    const {
        data: logsData,
        isLoading,
        refetch,
    } = useGetCareCaseLogsQuery(caseId, {
        skip: !caseId,
    })
    const logs = logsData?.data || []

    const [addLog, { isLoading: isAdding }] = useAddCareCaseLogMutation()
    const [updateLog, { isLoading: isUpdating }] = useUpdateCareCaseLogMutation()
    const [deleteLog] = useDeleteCareCaseLogMutation()

    const handleEditClick = (log: CareCaseLogItem) => {
        setEditLogId(log.id)
        setInteractionType(log.interaction_type)
        setContent(log.content)
        setFollowUp(log.follow_up)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditLogId(null)
        setContent('')
        setFollowUp(false)
        setInteractionType('call')
    }

    const handleDelete = async (logId: number) => {
        try {
            await deleteLog(logId).unwrap()
            message.success('Xóa nhật ký thành công')
            refetch()
            if (editLogId === logId) {
                cancelEdit()
            }
        } catch {
            message.error('Có lỗi xảy ra khi xóa nhật ký')
        }
    }

    const handleSubmit = async () => {
        if (!content.trim()) {
            message.warning('Vui lòng nhập nội dung tương tác')
            return
        }
        try {
            if (editLogId) {
                await updateLog({
                    log_id: editLogId,
                    care_case_id: caseId,
                    payload: {
                        interaction_type: interactionType,
                        content,
                        follow_up: followUp,
                    },
                }).unwrap()
                message.success('Cập nhật nhật ký thành công')
                setEditLogId(null)
                refetch()
            } else {
                await addLog({
                    payload: {
                        care_case_id: caseId,
                        interaction_type: interactionType,
                        content,
                        follow_up: followUp,
                    },
                }).unwrap()
                message.success('Thêm nhật ký thành công')
                refetch()
            }
            setContent('')
            setFollowUp(false)
            setInteractionType('call')
        } catch {
            message.error(editLogId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi thêm nhật ký')
        }
    }

    return (
        <Space direction="vertical" size={24} className="w-full">
            {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE) && (
                <Card className="!rounded-xl !border !border-slate-200 shadow-sm" classNames={{ body: '!p-5' }}>
                    <Space direction="vertical" size={16} className="w-full">
                        <Flex justify="space-between" align="center">
                            <Select
                                value={interactionType}
                                onChange={setInteractionType}
                                options={INTERACTION_OPTIONS}
                                className="w-32"
                            />
                        </Flex>

                        <Input.TextArea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Ghi lại nội dung cuộc gọi hoặc tương tác với chủ nhà/khách thuê..."
                            autoSize={{ minRows: 4, maxRows: 6 }}
                            className="!rounded-lg !border-slate-200 !resize-none"
                        />

                        <Flex justify="space-between" align="center">
                            <Checkbox checked={followUp} onChange={e => setFollowUp(e.target.checked)}>
                                <Typography.Text className="!text-slate-700 !font-semibold text-sm">
                                    Yêu cầu phản hồi (Follow-up)
                                </Typography.Text>
                            </Checkbox>
                            <Space>
                                {editLogId && (
                                    <Button icon={<CloseOutlined />} onClick={cancelEdit}>
                                        Hủy
                                    </Button>
                                )}
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    className="!bg-blue-600 hover:!bg-blue-700 border-none shadow-md"
                                    onClick={handleSubmit}
                                    loading={isAdding || isUpdating}>
                                    {editLogId ? 'Lưu thay đổi' : 'Lưu tương tác'}
                                </Button>
                            </Space>
                        </Flex>
                    </Space>
                </Card>
            )}

            <Spin spinning={isLoading}>
                <div className="relative ml-1 mt-2 space-y-6">
                    {logs.length > 0 && (
                        <div className="absolute left-2 -translate-x-1/2 top-8 bottom-8 w-0.5 bg-slate-100" />
                    )}

                    {logs.length > 0 ? (
                        logs.map(log => (
                            <div key={log.id} className="relative flex gap-5">
                                <div className="relative z-10 mt-6 h-4 w-4 shrink-0 rounded-full border-2 !border-blue-600 bg-white" />

                                <Card
                                    className="flex-1 !rounded-xl !border !border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
                                    classNames={{ body: '!p-5' }}>
                                    <Space direction="vertical" size={16} className="w-full">
                                        <Flex justify="space-between" align="center">
                                            <Space size={12}>
                                                <Tag className="!m-0 !rounded !border-blue-200 !bg-blue-50 !text-blue-600 !font-bold px-2 py-0.5">
                                                    {log.interaction_type.toUpperCase()}
                                                </Tag>
                                                <Typography.Text className="!text-slate-500 !font-bold text-xs uppercase tracking-wide">
                                                    {log.created_at?.replace(REGEX_REMOVE_SECONDS, ' ')}
                                                </Typography.Text>
                                            </Space>
                                            {log.follow_up && (
                                                <Tag className="!m-0 !rounded-full !border-rose-200 !bg-white !text-rose-500 !font-bold !px-4 !py-1 text-xs">
                                                    CẦN PHẢN HỒI
                                                </Tag>
                                            )}
                                        </Flex>

                                        <Typography.Text className="block text-base font-semibold italic !text-slate-600 whitespace-pre-wrap">
                                            &quot;{log.content}&quot;
                                        </Typography.Text>

                                        <Flex align="center" justify="space-between">
                                            <Flex align="center" gap={6}>
                                                <UserOutlined className="!text-blue-600 text-xs" />
                                                <Typography.Text className="!text-blue-600 font-bold text-xs uppercase">
                                                    {log.created_by_rel?.full_name || 'HỆ THỐNG'}
                                                </Typography.Text>
                                            </Flex>
                                            <Space>
                                                {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE) && (
                                                    <Tooltip title="Chỉnh sửa">
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<EditOutlined />}
                                                            className="!text-blue-600 !bg-blue-50 hover:!bg-blue-100"
                                                            onClick={() => handleEditClick(log)}
                                                        />
                                                    </Tooltip>
                                                )}
                                                {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.DELETE) && (
                                                    <Popconfirm
                                                        title="Xóa nhật ký"
                                                        description="Bạn có chắc chắn muốn xóa nhật ký này không?"
                                                        onConfirm={() => handleDelete(log.id)}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        okButtonProps={{ danger: true }}>
                                                        <Tooltip title="Xóa">
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<DeleteOutlined />}
                                                                className="!text-red-500 !bg-red-50 hover:!bg-red-100"
                                                            />
                                                        </Tooltip>
                                                    </Popconfirm>
                                                )}
                                            </Space>
                                        </Flex>
                                    </Space>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <Empty description="Chưa có nhật ký tương tác" className="mt-8" />
                    )}
                </div>
            </Spin>
        </Space>
    )
}

export default CareCaseLogTab
