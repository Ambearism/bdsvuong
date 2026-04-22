import type {
    ProjectListResponse,
    ProjectListParams,
    ProjectOutput,
    ProjectUpdateInput,
    ProjectConfigExplore,
    ProjectPermissionItem,
    UpdateProjectPermissionRequest,
    ProjectExploreOverviewResponse,
} from '@/types/project'
import type { ApiResponse } from '@/types'

import { api } from '@/api'

export const projectApi = api.injectEndpoints({
    endpoints: build => ({
        getProjectList: build.query<ApiResponse<ProjectListResponse>, ProjectListParams>({
            query: params => ({
                url: '/admin/projects',
                method: 'GET',
                params,
            }),
        }),
        getProjectExploreList: build.query<ApiResponse<ProjectListResponse>, void>({
            query: () => ({
                url: '/admin/projects/explore/list',
                method: 'GET',
            }),
        }),
        getProjectDetail: build.query<ApiResponse<ProjectOutput>, { project_id: number }>({
            query: ({ project_id }) => ({
                url: `/admin/projects/${project_id}`,
                method: 'GET',
            }),
        }),
        createProject: build.mutation<ApiResponse<ProjectOutput>, FormData>({
            query: payload => ({
                url: '/admin/projects',
                method: 'POST',
                body: payload,
            }),
        }),
        updateProject: build.mutation<ApiResponse<ProjectOutput>, { project_id: number; payload: ProjectUpdateInput }>({
            query: ({ project_id, payload }) => ({
                url: `/admin/projects/${project_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteProject: build.mutation<ApiResponse<string>, { project_id: number }>({
            query: ({ project_id }) => ({
                url: `/admin/projects/${project_id}`,
                method: 'DELETE',
            }),
        }),
        getProjectExplore: build.query<ApiResponse<ProjectOutput>, { project_id: number }>({
            query: ({ project_id }) => ({
                url: `/admin/projects/${project_id}/explore`,
                method: 'GET',
            }),
        }),
        updateProjectExplore: build.mutation<
            ApiResponse<ProjectOutput>,
            { project_id: number; payload: ProjectConfigExplore }
        >({
            query: ({ project_id, payload }) => ({
                url: `/admin/projects/${project_id}/explore`,
                method: 'PUT',
                body: payload,
            }),
        }),
        getProjectAccountPermissions: build.query<ApiResponse<ProjectPermissionItem[]>, number>({
            query: project_id => ({
                url: `/admin/projects/${project_id}/permissions`,
                method: 'GET',
            }),
        }),
        updateProjectAccountPermissions: build.mutation<
            ApiResponse<unknown>,
            { project_id: number; payload: UpdateProjectPermissionRequest }
        >({
            query: ({ project_id, payload }) => ({
                url: `/admin/projects/${project_id}/permissions`,
                method: 'PUT',
                body: payload,
            }),
        }),
        getProjectOverviewAdmin: build.query<ApiResponse<ProjectExploreOverviewResponse>, void>({
            query: () => ({
                url: '/admin/projects/explore/overview',
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetProjectListQuery,
    useGetProjectExploreListQuery,
    useGetProjectDetailQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useGetProjectExploreQuery,
    useUpdateProjectExploreMutation,
    useGetProjectAccountPermissionsQuery,
    useUpdateProjectAccountPermissionsMutation,
    useGetProjectOverviewAdminQuery,
} = projectApi
