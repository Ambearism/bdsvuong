import type { ApiResponse } from '@/types'
import { api } from '@/api'
import type {
    ProjectProcessListResponse,
    ProjectProcessListParams,
    ProjectProcessCreateInput,
    ProjectProcessUpdateInput,
    ProjectProcessItem,
} from '@/types/project-process'

export const projectProcessApi = api.injectEndpoints({
    endpoints: build => ({
        getProjectProcessList: build.query<ApiResponse<ProjectProcessListResponse>, ProjectProcessListParams>({
            query: ({ project_id, ...params }) => ({
                url: `/admin/project-processes/by-project/${project_id}`,
                method: 'GET',
                params,
            }),
        }),

        getProjectProcessDetail: build.query<ApiResponse<ProjectProcessItem>, { process_id: number }>({
            query: ({ process_id }) => ({
                url: `/admin/project-processes/${process_id}`,
                method: 'GET',
            }),
        }),

        createProjectProcess: build.mutation<ApiResponse<ProjectProcessItem>, ProjectProcessCreateInput>({
            query: payload => ({
                url: '/admin/project-processes',
                method: 'POST',
                body: payload,
            }),
        }),

        updateProjectProcess: build.mutation<
            ApiResponse<ProjectProcessItem>,
            { process_id: number; payload: ProjectProcessUpdateInput }
        >({
            query: ({ process_id, payload }) => ({
                url: `/admin/project-processes/${process_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
    }),
})

export const {
    useGetProjectProcessListQuery,
    useGetProjectProcessDetailQuery,
    useCreateProjectProcessMutation,
    useUpdateProjectProcessMutation,
} = projectProcessApi
