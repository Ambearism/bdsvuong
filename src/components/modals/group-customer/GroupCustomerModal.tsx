import React, { useEffect, useMemo } from 'react'
import { Modal, Form, Input, TreeSelect, message } from 'antd'
import {
    useCreateGroupCustomerMutation,
    useGetGroupCustomerListQuery,
    useUpdateGroupCustomerMutation,
    useGetGroupCustomerDetailQuery,
} from '@/api/group-customer'
import { buildPartialTree } from '@/utils/tree'
import type { GroupCustomerBase, GroupCustomerNode } from '@/types/group-customer'

export type TreeNode = {
    title: string
    value: number | string
    disabled?: boolean
    children?: TreeNode[]
}

type Mode = 'create' | 'update'

type Props = {
    open: boolean
    onCancel: () => void
    onSuccess?: () => void
    defaultParentId?: number | null
    mode?: Mode
    editingId?: number | null
}

const GroupCustomerModal: React.FC<Props> = ({
    open,
    onCancel,
    onSuccess,
    defaultParentId = null,
    mode = 'create',
    editingId = null,
}) => {
    const [form] = Form.useForm<GroupCustomerBase>()

    const { data: groupListData, isLoading: loadingGroups } = useGetGroupCustomerListQuery(
        { page: 1, per_page: 1000 },
        { refetchOnMountOrArgChange: true },
    )

    const {
        data: detailData,
        isLoading: loadingDetail,
        refetch: refetchDetail,
    } = useGetGroupCustomerDetailQuery(
        { customer_group_id: editingId as number },
        {
            skip: mode !== 'update' || !editingId,
            refetchOnMountOrArgChange: true,
        },
    )

    const [createGroup, { isLoading: creating }] = useCreateGroupCustomerMutation()
    const [updateGroup, { isLoading: updating }] = useUpdateGroupCustomerMutation()

    const treeData = useMemo(() => {
        const items = groupListData?.data?.items ?? []
        const roots = buildPartialTree(items)
        const toNodes = (nodes: GroupCustomerNode[]): TreeNode[] =>
            nodes.map(
                (n): TreeNode => ({
                    title: `${n.name} (#${n.id})`,
                    value: n.id,
                    disabled: mode === 'update' && editingId === n.id,
                    children: n.children?.length ? toNodes(n.children) : undefined,
                }),
            )
        return toNodes(roots)
    }, [groupListData, mode, editingId])

    useEffect(() => {
        if (open && mode === 'update' && editingId) {
            refetchDetail()
        }
    }, [open, mode, editingId, refetchDetail])

    useEffect(() => {
        if (!open) {
            form.resetFields()
            return
        }

        if (mode === 'update') {
            const g = detailData?.data
            if (g) {
                form.resetFields()
                form.setFieldsValue({
                    name: g.name ?? '',
                    parent_id: g.parent_id ?? null,
                    content: g.content ?? '',
                })
            }
        } else {
            form.resetFields()
            form.setFieldsValue({
                name: '',
                content: null,
                parent_id: defaultParentId ?? null,
            })
        }
    }, [open, mode, defaultParentId, detailData, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()

            const nameTrimmed = (values.name ?? '').trim()
            const contentTrimmed = (values.content ?? '').trim()

            const payload: GroupCustomerBase = {
                name: nameTrimmed,
                content: contentTrimmed ?? '',
                parent_id: values.parent_id ?? null,
            }

            if (mode === 'update' && editingId) {
                await updateGroup({ customer_group_id: editingId, payload }).unwrap()
                message.success('Cập nhật nhóm khách hàng thành công')
            } else {
                await createGroup(payload).unwrap()
                message.success('Tạo nhóm khách hàng thành công')
            }

            onCancel()
            onSuccess?.()
        } catch {
            message.error('Đã có lỗi xảy ra, vui lòng thử lại sau')
        }
    }

    const confirmLoading = creating || updating || (mode === 'update' && loadingDetail)

    return (
        <Modal
            open={open}
            title={mode === 'update' ? 'Cập nhật nhóm khách hàng' : 'Thêm nhóm khách hàng'}
            okText={mode === 'update' ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            destroyOnClose>
            <Form<GroupCustomerBase> form={form} layout="vertical" className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                        <Form.Item
                            name="name"
                            label={<span className="font-semibold text-gray-600">Tên nhóm</span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên nhóm' },
                                { max: 255, message: 'Tên nhóm tối đa 255 ký tự' },
                            ]}>
                            <Input placeholder="Nhập tên nhóm" />
                        </Form.Item>

                        <Form.Item
                            name="parent_id"
                            label={<span className="font-semibold text-gray-600">Nhóm cấp trên</span>}>
                            <TreeSelect
                                allowClear
                                placeholder="-Chọn nhóm cấp trên-"
                                loading={loadingGroups}
                                treeData={treeData}
                                showSearch
                                treeNodeFilterProp="title"
                                treeLine
                                treeDefaultExpandAll={false}
                                filterTreeNode={(input, node) =>
                                    (node?.title as string)?.toLowerCase().includes(input.toLowerCase())
                                }
                                className="w-full"
                            />
                        </Form.Item>
                    </div>

                    <div className="flex flex-col">
                        <Form.Item
                            name="content"
                            label={<span className="font-semibold text-gray-600">Nội dung</span>}
                            className="h-full">
                            <Input.TextArea
                                rows={8}
                                placeholder="Nhập nội dung/mô tả nhóm"
                                className="h-full min-h-[220px]"
                            />
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default GroupCustomerModal
