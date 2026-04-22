import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Button, Space, Tag, Typography, message, Flex, Row, Col, Modal, Form, Card } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import {
    useGetCostCategoryGroupsQuery,
    useCreateCostCategoryGroupMutation,
    useUpdateCostCategoryGroupMutation,
    useCreateCostCategoryItemMutation,
    useUpdateCostCategoryItemMutation,
    useReorderItemsMutation,
} from '@/api/cost-category'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type {
    CostCategoryGroup,
    CostCategoryItem,
    CostCategoryGroupCreateInput,
    CostCategoryItemCreateInput,
} from '@/types/cost-category'
import SortableItem from './SortableItem'
import { COST_CATEGORY_TYPE } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import CostCategoryGroupModal from '@/components/modals/CostCategoryGroupModal'
import CostCategoryItemModal from '@/components/modals/CostCategoryItemModal'
import { useApiError } from '@/utils/error'

const { Text, Title } = Typography

export interface CostCategoryManagerRef {
    openGroupModal: () => void
}

const CostCategoryManager = forwardRef<CostCategoryManagerRef>((_, ref) => {
    useDocumentTitle('Danh mục chi phí')
    const { hasPermission } = usePermission()
    const { data: groupsData, refetch } = useGetCostCategoryGroupsQuery()
    const { handleError } = useApiError()

    const [createGroup] = useCreateCostCategoryGroupMutation()
    const [updateGroup] = useUpdateCostCategoryGroupMutation()
    const [createItem] = useCreateCostCategoryItemMutation()
    const [updateItem] = useUpdateCostCategoryItemMutation()
    const [reorderItems] = useReorderItemsMutation()

    const [groupModalOpen, setGroupModalOpen] = useState(false)
    const [itemModalOpen, setItemModalOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState<Partial<CostCategoryGroup> | null>(null)
    const [editingItem, setEditingItem] = useState<Partial<CostCategoryItem> | null>(null)
    const [selectedGroupForItems, setSelectedGroupForItems] = useState<CostCategoryGroup | null>(null)
    const [itemsListModalOpen, setItemsListModalOpen] = useState(false)
    const [localItems, setLocalItems] = useState<CostCategoryItem[]>([])
    const [editingItemId, setEditingItemId] = useState<number | null>(null)
    const [inlineForm] = Form.useForm()

    React.useEffect(() => {
        if (selectedGroupForItems && groupsData?.data) {
            const group = groupsData.data.find(item => item.id === selectedGroupForItems.id)
            if (group) {
                setLocalItems(group.items || [])
            }
        }
    }, [groupsData, selectedGroupForItems])

    useImperativeHandle(ref, () => ({
        openGroupModal: () => {
            setEditingGroup({ display_order: (groupsData?.data?.length || 0) + 1, is_active: true })
            setGroupModalOpen(true)
        },
    }))

    const handleEditGroup = (group: CostCategoryGroup, event: React.MouseEvent) => {
        event.stopPropagation()
        setEditingGroup(group)
        setGroupModalOpen(true)
    }

    const handleOpenItemsManagement = (group: CostCategoryGroup) => {
        setSelectedGroupForItems(group)
        setLocalItems(group.items || [])
        setItemsListModalOpen(true)
    }

    const saveGroup = async (values: Partial<CostCategoryGroup>) => {
        if (editingGroup?.id) {
            await updateGroup({ id: editingGroup.id, payload: values }).unwrap()
            message.success('Cập nhật nhóm thành công')
        } else {
            await createGroup(values as CostCategoryGroupCreateInput).unwrap()
            message.success('Thêm nhóm thành công')
        }
        setGroupModalOpen(false)
        refetch()
    }

    const handleAddItem = (groupId: number, event?: React.MouseEvent) => {
        event?.stopPropagation()
        const targetGroup = groupsData?.data?.find(group => group.id === groupId)
        const currentItems = targetGroup?.items || []

        const newItem: Partial<CostCategoryItem> = {
            group_id: groupId,
            display_order: currentItems.length + 1,
            is_active: true,
            tenant_related_flag: targetGroup?.code === 'GRP_TENANT',
            is_tax_deductible: false,
            requires_attachment: false,
        }
        setEditingItem(newItem)
        setItemModalOpen(true)
    }

    const handleEditItem = (item: CostCategoryItem) => {
        setEditingItemId(item.id)
        inlineForm.setFieldsValue(item)
    }

    const handleCancelInlineEdit = () => {
        setEditingItemId(null)
        inlineForm.resetFields()
    }

    const handleSaveInlineEdit = async () => {
        try {
            const values = await inlineForm.validateFields()
            if (editingItemId) {
                await updateItem({ id: editingItemId, payload: values }).unwrap()
                message.success('Cập nhật thành công')
                setEditingItemId(null)
                refetch()
            }
        } catch (error) {
            handleError(error, undefined, inlineForm)
        }
    }

    const saveItem = async (values: Partial<CostCategoryItem>) => {
        if (!values.group_id && editingItem?.group_id) values.group_id = editingItem.group_id

        if (editingItem?.id) {
            await updateItem({ id: editingItem.id, payload: values }).unwrap()
            message.success('Cập nhật mục thành công')
        } else {
            await createItem(values as CostCategoryItemCreateInput).unwrap()
            message.success('Thêm mục thành công')
        }
        setItemModalOpen(false)
        refetch()
    }

    const renderGroupHeader = (group: CostCategoryGroup) => (
        <Flex justify="space-between" align="center" className="w-full py-1">
            <Flex vertical>
                <Space>
                    <Text strong className="text-base">
                        {group.name}
                    </Text>
                </Space>
                {group.description && (
                    <Text type="secondary" className="text-xs">
                        {group.description}
                    </Text>
                )}
            </Flex>
            <Space onClick={event => event.stopPropagation()}>
                <Tag className="rounded-full bg-white border-transparent shadow-sm">{group.items?.length || 0} MỤC</Tag>
                {hasPermission(RESOURCE_TYPE.TAX_CONFIGURATION, ACTION.UPDATE) && (
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={event => handleEditGroup(group, event)}
                        className="text-gray-400 hover:text-blue-600"
                    />
                )}
            </Space>
        </Flex>
    )

    const revenueGroups = groupsData?.data?.filter(group => group.type === COST_CATEGORY_TYPE.REVENUE) || []
    const expenseGroups = groupsData?.data?.filter(group => group.type === COST_CATEGORY_TYPE.EXPENSE) || []

    const currentGroup = groupsData?.data?.find(group => group.id === selectedGroupForItems?.id)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = localItems.findIndex(item => item.id === active.id)
            const newIndex = localItems.findIndex(item => item.id === over.id)

            const newItems = arrayMove(localItems, oldIndex, newIndex)
            setLocalItems(newItems)

            const itemIds = newItems.map(item => item.id)

            try {
                await reorderItems({ item_ids: itemIds }).unwrap()
                refetch()
            } catch (error) {
                setLocalItems(selectedGroupForItems?.items || [])
                handleError(error)
            }
        }
    }

    const renderItemsList = () => (
        <Flex vertical gap="small" className="p-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={localItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    {localItems.map(item => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            isEditing={editingItemId === item.id}
                            onCancelInlineEdit={handleCancelInlineEdit}
                            onEditItem={handleEditItem}
                            inlineForm={inlineForm}
                            onSaveInlineEdit={handleSaveInlineEdit}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            {hasPermission(RESOURCE_TYPE.TAX_CONFIGURATION, ACTION.CREATE) && (
                <Button
                    type="dashed"
                    block
                    className="h-10 border-gray-300 text-gray-500 hover:text-blue-500 hover:border-blue-500 mt-2 bg-white"
                    icon={<PlusOutlined />}
                    onClick={event => selectedGroupForItems && handleAddItem(selectedGroupForItems.id, event)}>
                    Thêm mục con trực tiếp
                </Button>
            )}
        </Flex>
    )

    const renderGroupsCollapse = (groups: CostCategoryGroup[]) => (
        <Row gutter={[16, 16]}>
            {groups.map(group => (
                <Col span={24} key={group.id}>
                    <div
                        onClick={() => handleOpenItemsManagement(group)}
                        className="bg-white !rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5 transition-[box-shadow,border-color,transform] duration-300 ease-out cursor-pointer p-5 h-full flex flex-col justify-between group/card">
                        <div>{renderGroupHeader(group)}</div>
                        <div className="mt-4 flex justify-end">
                            <Text
                                type="secondary"
                                className="text-xs uppercase font-bold tracking-wider opacity-0 group-hover/card:opacity-100 translate-x-2 group-hover/card:translate-x-0 transition-all duration-300 ease-out text-blue-500">
                                Quản lý mục con →
                            </Text>
                        </div>
                    </div>
                </Col>
            ))}
        </Row>
    )

    return (
        <>
            <Card className="shadow-sm !rounded-xl border-gray-100">
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Flex vertical gap="middle" className="mb-0">
                            <Flex align="center" gap="small" className="px-1">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                <Title level={4} className="!m-0 text-gray-700">
                                    Doanh thu
                                </Title>
                                <Tag color="blue" className="rounded-full !px-3 font-medium">
                                    {revenueGroups.length} nhóm
                                </Tag>
                            </Flex>
                            <div className="bg-blue-50/20 p-5 rounded-xl border border-blue-100/60">
                                {renderGroupsCollapse(revenueGroups)}
                            </div>
                        </Flex>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Flex vertical gap="middle" className="mb-0">
                            <Flex align="center" gap="small" className="px-1">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                <Title level={4} className="!m-0 text-gray-700">
                                    Chi phí
                                </Title>
                                <Tag color="orange" className="rounded-full !px-3 font-medium">
                                    {expenseGroups.length} nhóm
                                </Tag>
                            </Flex>
                            <div className="bg-orange-50/20 p-5 rounded-xl border border-orange-100/60">
                                {renderGroupsCollapse(expenseGroups)}
                            </div>
                        </Flex>
                    </Col>
                </Row>
            </Card>

            <Modal
                title={`Quản lý mục con: ${currentGroup?.name}`}
                open={itemsListModalOpen}
                onCancel={() => setItemsListModalOpen(false)}
                footer={null}
                width={700}
                centered
                destroyOnHidden>
                {currentGroup && renderItemsList()}
            </Modal>

            <CostCategoryGroupModal
                open={groupModalOpen}
                initialValues={editingGroup}
                onCancel={() => setGroupModalOpen(false)}
                onOk={saveGroup}
            />

            <CostCategoryItemModal
                open={itemModalOpen}
                initialValues={editingItem}
                onCancel={() => setItemModalOpen(false)}
                onOk={saveItem}
                zIndex={itemsListModalOpen ? 1001 : undefined}
            />
        </>
    )
})

export default CostCategoryManager
