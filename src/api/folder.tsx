import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type {
    CreateFolderRequest,
    CreateFolderResponse,
    DeleteFolderRequest,
    DeleteFolderResponse,
    ListFolderRequest,
    ListFolderResponse,
    RenameFolderRequest,
    RenameFolderResponse,
} from '@/types/folder'

export const uploadApi = api.injectEndpoints({
    endpoints: build => ({
        getFolders: build.query<ApiResponse<ListFolderResponse>, ListFolderRequest | undefined>({
            query: params => ({
                url: '/admin/folders',
                method: 'GET',
                params,
            }),
        }),

        createFolder: build.mutation<ApiResponse<CreateFolderResponse>, CreateFolderRequest>({
            query: request => ({
                url: '/admin/folders',
                method: 'POST',
                body: request,
            }),
        }),

        deleteFolder: build.mutation<ApiResponse<DeleteFolderResponse>, DeleteFolderRequest>({
            query: request => ({
                url: '/admin/folders',
                method: 'DELETE',
                body: request,
            }),
        }),

        renameFolder: build.mutation<ApiResponse<RenameFolderResponse>, RenameFolderRequest>({
            query: request => ({
                url: '/admin/folders',
                method: 'POST',
                body: request,
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useGetFoldersQuery, useCreateFolderMutation, useDeleteFolderMutation, useRenameFolderMutation } =
    uploadApi
