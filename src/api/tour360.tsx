import type {
    Tour360ListResponse,
    Tour360ListParams,
    Tour360CreateInput,
    Tour360Output,
    Tour360UpdateInput,
    UploadZipOutput,
    UploadZipChunkParams,
    Tour360OptionResponse,
} from '@/types/tour360'
import type { ApiResponse } from '@/types'

import { api } from '@/api'

export const tour360Api = api.injectEndpoints({
    endpoints: build => ({
        uploadZipTour: build.mutation<ApiResponse<UploadZipOutput>, UploadZipChunkParams>({
            query: ({ file, resumableChunkNumber, resumableTotalChunks, resumableIdentifier, resumableFilename }) => {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('resumableChunkNumber', resumableChunkNumber.toString())
                formData.append('resumableTotalChunks', resumableTotalChunks.toString())
                formData.append('resumableIdentifier', resumableIdentifier)
                formData.append('resumableFilename', resumableFilename)

                return {
                    url: '/admin/tour360/upload-zip-tour',
                    method: 'POST',
                    body: formData,
                }
            },
        }),
        getTour360List: build.query<ApiResponse<Tour360ListResponse>, Tour360ListParams>({
            query: params => ({
                url: '/admin/tour360',
                method: 'GET',
                params,
            }),
        }),
        getTour360Detail: build.query<ApiResponse<Tour360Output>, { tour360_id: number }>({
            query: ({ tour360_id }) => ({
                url: `/admin/tour360/${tour360_id}`,
                method: 'GET',
            }),
        }),
        createTour360: build.mutation<ApiResponse<Tour360Output>, Tour360CreateInput>({
            query: payload => ({
                url: '/admin/tour360',
                method: 'POST',
                body: payload,
            }),
        }),
        updateTour360: build.mutation<ApiResponse<Tour360Output>, { tour360_id: number; payload: Tour360UpdateInput }>({
            query: ({ tour360_id, payload }) => ({
                url: `/admin/tour360/${tour360_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteTour360: build.mutation<ApiResponse<string>, { tour360_id: number }>({
            query: ({ tour360_id }) => ({
                url: `/admin/tour360/${tour360_id}`,
                method: 'DELETE',
            }),
        }),
        getTour360Options: build.query<ApiResponse<Tour360OptionResponse>, Tour360ListParams>({
            query: params => ({
                url: '/admin/options/tour360',
                method: 'GET',
                params,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useUploadZipTourMutation,
    useGetTour360ListQuery,
    useGetTour360DetailQuery,
    useCreateTour360Mutation,
    useUpdateTour360Mutation,
    useDeleteTour360Mutation,
    useGetTour360OptionsQuery,
} = tour360Api
