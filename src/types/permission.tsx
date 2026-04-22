export interface PermissionItem {
    id: number
    name: string
    module_name: string
    action: string
}

export type PermissionListResponse = Record<string, PermissionItem[]>

export type RolePermissionResponse = {
    actions: PermissionItem[]
}

export type UpdateRolePermissionPayload = {
    action_ids: number[]
}
