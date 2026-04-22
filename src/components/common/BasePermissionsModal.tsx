import { Modal } from 'antd'
import BasePermissionsTab from '../common/BasePermissionsTab'
import type { PermissionItem } from '../common/BasePermissionsTab'

export interface BasePermissionsModalProps<TMutationArg> {
    visible: boolean
    onCancel: () => void
    id: number
    title: string
    useGetPermissionsQuery: (id: number) => {
        data?: { data: PermissionItem[] }
        isLoading: boolean
        refetch: () => void
    }
    useUpdatePermissionsMutation: () => readonly [
        (args: TMutationArg) => {
            unwrap: () => Promise<unknown>
        },
        { isLoading: boolean },
    ]
    idFieldName: string
}

const BasePermissionsModal = <TMutationArg,>({
    visible,
    onCancel,
    id,
    title,
    useGetPermissionsQuery,
    useUpdatePermissionsMutation,
    idFieldName,
}: BasePermissionsModalProps<TMutationArg>) => {
    return (
        <Modal
            title={`Phân quyền ${title}`}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={1000}
            centered
            destroyOnClose>
            <BasePermissionsTab
                id={id}
                useGetPermissionsQuery={useGetPermissionsQuery}
                useUpdatePermissionsMutation={useUpdatePermissionsMutation}
                idFieldName={idFieldName}
                onSuccess={onCancel}
            />
        </Modal>
    )
}

export default BasePermissionsModal
