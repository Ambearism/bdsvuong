import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DeleteOutlined, DragOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Tag, Image, Typography, Flex, Modal, Input } from 'antd'
import { NameDisplay } from '@/components/uploads/NameDisplay'

const { Text } = Typography

interface SortableItemProps {
    id: string
    url: string
    index: number
    name?: string
    onRemove: (id: string) => void
    onNameChange?: (newName: string) => void
    showNameInput?: boolean
}

export function SortableItem({
    id,
    url,
    index,
    name,
    onRemove,
    onNameChange,
    showNameInput = false,
}: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = () => {
        onRemove(id)
        setIsDeleteModalOpen(false)
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
    }

    const handleStopEditing = () => {
        setIsEditing(false)
    }

    return (
        <>
            <Flex vertical gap={8}>
                <div
                    ref={setNodeRef}
                    style={style}
                    className="relative w-40 h-40 rounded-lg overflow-hidden shadow-md bg-gray-50">
                    <Tag color="white" className="!absolute top-1 left-1 z-10 !text-black">
                        {index + 1}
                    </Tag>
                    <Image
                        src={url}
                        alt={name || `Ảnh ${index}`}
                        preview={true}
                        className="!w-full !h-full"
                        rootClassName="!w-full !h-full"
                    />
                    <Flex className="!absolute top-1 right-1 z-10" gap={4}>
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteClick}
                            title="Xóa ảnh"
                        />
                    </Flex>

                    <Button
                        type="default"
                        size="small"
                        {...listeners}
                        {...attributes}
                        className="!absolute bottom-1 left-1 z-10"
                        icon={<DragOutlined />}
                        title="Kéo để thay đổi vị trí"
                    />
                </div>

                {showNameInput && (
                    <div className="w-40" style={{ minHeight: '32px' }}>
                        {isEditing ? (
                            <Input
                                placeholder="Nhập tên ảnh"
                                value={name || ''}
                                onChange={e => onNameChange?.(e.target.value)}
                                onBlur={handleStopEditing}
                                onPressEnter={handleStopEditing}
                                autoFocus
                            />
                        ) : (
                            <NameDisplay name={name} onClick={() => setIsEditing(true)} />
                        )}
                    </div>
                )}
            </Flex>

            <Modal
                title={
                    <Flex align="center" gap={8}>
                        <ExclamationCircleOutlined className="text-red-500 text-xl" />
                        <span>Xác nhận xóa ảnh</span>
                    </Flex>
                }
                open={isDeleteModalOpen}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                centered>
                <Flex vertical gap={16} className="py-4">
                    <Text>Bạn có chắc chắn muốn xóa ảnh này không?</Text>
                    {name && (
                        <Text type="secondary">
                            Tên ảnh: <Text strong>{name}</Text>
                        </Text>
                    )}
                    <Text type="warning">Hành động này không thể hoàn tác!</Text>
                </Flex>
            </Modal>
        </>
    )
}
