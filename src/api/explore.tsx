import type { ApiResponse, ListResponse } from '@/types'
import type { ExploreOutput, ExploreSearchInput } from '@/types/explore'
import { api } from '@/api'

export interface ExploreImportResponse {
    success: number
    failed: number
    errors: string[]
}

export const exploreApi = api.injectEndpoints({
    endpoints: build => ({
        getExplores: build.query<
            ApiResponse<ListResponse<ExploreOutput>>,
            { project_id: number; params: ExploreSearchInput }
        >({
            query: ({ project_id, params }) => ({
                url: `/admin/projects/${project_id}/explores`,
                method: 'GET',
                params,
            }),
        }),
        exportExplores: build.mutation<Blob, { project_id: number }>({
            query: ({ project_id }) => ({
                url: `/admin/projects/${project_id}/explores/export`,
                method: 'GET',
                cache: 'no-cache',
                responseHandler: response => response.blob(),
            }),
        }),
        getImportTemplate: build.mutation<Blob, { project_id: number }>({
            query: ({ project_id }) => ({
                url: `/admin/projects/${project_id}/explores/import-template`,
                method: 'GET',
                cache: 'no-cache',
                responseHandler: response => response.blob(),
            }),
        }),
        importExplores: build.mutation<ApiResponse<ExploreImportResponse>, { project_id: number; file: File }>({
            query: ({ project_id, file }) => {
                const formData = new FormData()
                formData.append('file', file)
                return {
                    url: `/admin/projects/${project_id}/explores/import`,
                    method: 'POST',
                    body: formData,
                }
            },
        }),
        getExploreSearchInfo: build.query<
            ApiResponse<{ label: string; value: string }[]>,
            { project_id: number; type_id?: number; divisive?: string; parcel?: string }
        >({
            query: ({ project_id, ...params }) => ({
                url: `/admin/projects/${project_id}/explores/search-info`,
                method: 'GET',
                params,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetExploresQuery,
    useExportExploresMutation,
    useGetImportTemplateMutation,
    useImportExploresMutation,
    useGetExploreSearchInfoQuery,
} = exploreApi
