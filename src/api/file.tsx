import { api } from '@/api'
import type { ApiResponse } from '@/types'

export const fileApi = api.injectEndpoints({
    endpoints: build => ({
        uploadFile: build.mutation<ApiResponse<{ path: string }>, FormData>({
            query: payload => ({
                url: '/admin/uploads/file',
                method: 'POST',
                body: payload,
            }),
        }),
        deleteFile: build.mutation<ApiResponse<unknown>, { path: string }>({
            query: ({ path }) => ({
                url: '/admin/uploads/file',
                method: 'DELETE',
                params: { path },
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useUploadFileMutation, useDeleteFileMutation } = fileApi
