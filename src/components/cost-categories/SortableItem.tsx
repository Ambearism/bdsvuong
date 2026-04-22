import React from 'react'
import { Button, Space, Tag, Typography, Flex, Row, Col, Form, Input, Switch, Card } from 'antd'
import type { FormInstance } from 'antd'
import { HolderOutlined } from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CostCategoryItem } from '@/types/cost-category'

const { Text } = Typography

export interface SortableItemProps {
    item: CostCategoryItem
    isEditing: boolean
    onCancelInlineEdit: () => void
    onEditItem: (item: CostCategoryItem) => void
    inlineForm: FormInstance
    onSaveInlineEdit: () => Promise<void>
}

const SortableItem = React.memo(
    ({ item, isEditing, onCancelInlineEdit, onEditItem, inlineForm, onSaveInlineEdit }: SortableItemProps) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: item.id,
        })

        const style = {
            transform: CSS.Translate.toString(transform),
            transition,
            zIndex: isDragging ? 2 : 1,
            position: 'relative' as const,
        }

        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`border !rounded-lg overflow-hidden transition-[box-shadow,border-color,transform,opacity] duration-200 ease-out ${
                    isDragging
                        ? 'opacity-40 scale-95 shadow-xl border-blue-400 z-50'
                        : isEditing
                          ? 'border-blue-300 shadow-md ring-1 ring-blue-50/50'
                          : 'border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200'
                }`}>
                <div
                    onClick={() => (isEditing ? onCancelInlineEdit() : onEditItem(item))}
                    className={`!px-4 !py-3 cursor-pointer select-none transition-colors duration-200 ${isEditing ? 'bg-blue-50/20' : 'bg-white hover:bg-gray-50/30'}`}>
                    <Flex justify="space-between" align="flex-start">
                        <Flex align="flex-start" gap="small" className="flex-1">
                            <div
                                className="mt-1 text-gray-300 cursor-move h-6 flex items-center"
                                {...attributes}
                                {...listeners}
                                onClick={e => e.stopPropagation()}>
                                <HolderOutlined />
                            </div>
                            <Flex vertical className="w-full">
                                <Space wrap>
                                    <Text strong>{item.name}</Text>
                                    {!item.is_active && (
                                        <Tag color="error" className="text-xs leading-3 m-0">
                                            Không hoạt động
                                        </Tag>
                                    )}
                                    <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                        {isEditing ? (
                                            <Tag color="blue" className="m-0 text-xs border-0">
                                                Đang sửa
                                            </Tag>
                                        ) : null}
                                    </div>
                                </Space>
                                <Text type="secondary" className="text-xs mt-1">
                                    {item.description || item.code}
                                </Text>
                                <Flex gap="4px" className="mt-1" wrap="wrap">
                                    {item.tenant_related_flag && (
                                        <Tag className="text-xs m-0 border-0 bg-orange-50 text-orange-600">
                                            Khách thuê
                                        </Tag>
                                    )}
                                    {item.requires_attachment && (
                                        <Tag className="text-xs m-0 border-0 bg-blue-50 text-blue-600">Chứng từ</Tag>
                                    )}
                                    {item.is_tax_deductible && (
                                        <Tag className="text-xs m-0 border-0 bg-green-50 text-green-600">Tính thuế</Tag>
                                    )}
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex gap="small" vertical align="flex-end">
                            <Tag className="font-mono font-bold border-0 bg-gray-100 text-gray-600 m-0 px-2 py-0.5 rounded text-xs">
                                {item.code}
                            </Tag>
                        </Flex>
                    </Flex>
                </div>

                <div
                    className={`transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden grid ${
                        isEditing ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}>
                    <div className="min-h-0">
                        <div className="px-5 py-4 bg-white border-t border-blue-50">
                            <Form form={inlineForm} layout="vertical" initialValues={item}>
                                <Row gutter={12}>
                                    <Col span={6}>
                                        <Form.Item
                                            name="code"
                                            label={<Text className="text-xs text-gray-400">Mã</Text>}
                                            rules={[{ required: true }]}>
                                            <Input
                                                size="small"
                                                onChange={event =>
                                                    inlineForm.setFieldValue('code', event.target.value.toUpperCase())
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name="name"
                                            label={<Text className="text-xs text-gray-400">Tên mục</Text>}
                                            rules={[{ required: true }]}>
                                            <Input size="small" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    name="description"
                                    label={<Text className="text-xs text-gray-400">Mô tả</Text>}
                                    className="mb-3">
                                    <Input.TextArea size="small" rows={1} autoSize={{ minRows: 1, maxRows: 3 }} />
                                </Form.Item>
                                <Row gutter={[8, 8]} className="mb-4">
                                    <Col span={12}>
                                        <Card size="small" className="bg-gray-50/50">
                                            <Flex justify="space-between" align="center">
                                                <Flex vertical>
                                                    <Text strong className="text-xs">
                                                        Khách thuê
                                                    </Text>
                                                    <Text type="secondary" className="text-xs">
                                                        Yêu cầu chọn khách
                                                    </Text>
                                                </Flex>
                                                <Form.Item name="tenant_related_flag" valuePropName="checked" noStyle>
                                                    <Switch size="small" />
                                                </Form.Item>
                                            </Flex>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small" className="bg-gray-50/50">
                                            <Flex justify="space-between" align="center">
                                                <Flex vertical>
                                                    <Text strong className="text-xs">
                                                        Đính kèm
                                                    </Text>
                                                    <Text type="secondary" className="text-xs">
                                                        Bắt buộc file/ảnh
                                                    </Text>
                                                </Flex>
                                                <Form.Item name="requires_attachment" valuePropName="checked" noStyle>
                                                    <Switch size="small" />
                                                </Form.Item>
                                            </Flex>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small" className="bg-gray-50/50">
                                            <Flex justify="space-between" align="center">
                                                <Flex vertical>
                                                    <Text strong className="text-xs">
                                                        Tính thuế
                                                    </Text>
                                                    <Text type="secondary" className="text-xs">
                                                        Khoản thu tính thuế
                                                    </Text>
                                                </Flex>
                                                <Form.Item name="is_tax_deductible" valuePropName="checked" noStyle>
                                                    <Switch size="small" />
                                                </Form.Item>
                                            </Flex>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small" className="bg-gray-50/50">
                                            <Flex justify="space-between" align="center">
                                                <Flex vertical>
                                                    <Text strong className="text-xs">
                                                        Hoạt động
                                                    </Text>
                                                    <Text type="secondary" className="text-xs">
                                                        Cho phép nhập liệu
                                                    </Text>
                                                </Flex>
                                                <Form.Item name="is_active" valuePropName="checked" noStyle>
                                                    <Switch size="small" />
                                                </Form.Item>
                                            </Flex>
                                        </Card>
                                    </Col>
                                </Row>
                                <Flex justify="end" gap="small" className="pt-4 mt-4 border-t border-gray-50">
                                    <Button size="middle" onClick={onCancelInlineEdit}>
                                        Hủy bỏ
                                    </Button>
                                    <Button size="middle" type="primary" onClick={onSaveInlineEdit}>
                                        Cập nhật ngay
                                    </Button>
                                </Flex>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
)

export default SortableItem
