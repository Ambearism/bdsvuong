import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type { PermissionListResponse, RolePermissionResponse, UpdateRolePermissionPayload } from '@/types/permission'
import type { RoleCreatePayload, RoleItem, RoleListParams, RoleListResponse, RoleUpdatePayload } from '@/types/role'

export const roleApi = api.injectEndpoints({
    endpoints: build => ({
        getRoles: build.query<ApiResponse<RoleListResponse>, RoleListParams>({
            query: params => ({
                url: '/admin/roles',
                method: 'GET',
                params,
            }),
        }),
        createRole: build.mutation<ApiResponse<RoleItem>, RoleCreatePayload>({
            query: payload => ({
                url: '/admin/roles',
                method: 'POST',
                body: payload,
            }),
        }),
        updateRole: build.mutation<ApiResponse<RoleItem>, { id: number; payload: RoleUpdatePayload }>({
            query: ({ id, payload }) => ({
                url: `/admin/roles/${id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteRole: build.mutation<ApiResponse<string>, { id: number; replacement_id?: number }>({
            query: ({ id, replacement_id }) => ({
                url: `/admin/roles/${id}`,
                method: 'DELETE',
                params: { replacement_id },
            }),
        }),
        getAllPermissions: build.query<ApiResponse<PermissionListResponse>, void>({
            query: () => ({
                url: '/admin/permissions',
                method: 'GET',
            }),
        }),
        getRolePermissions: build.query<ApiResponse<RolePermissionResponse>, number>({
            query: roleId => ({
                url: `/admin/roles/${roleId}/permissions`,
                method: 'GET',
            }),
        }),
        updateRolePermissions: build.mutation<
            ApiResponse<unknown>,
            { roleId: number; payload: UpdateRolePermissionPayload }
        >({
            query: ({ roleId, payload }) => ({
                url: `/admin/roles/${roleId}/permissions`,
                method: 'PUT',
                body: payload,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetAllPermissionsQuery,
    useGetRolePermissionsQuery,
    useUpdateRolePermissionsMutation,
} = roleApi
