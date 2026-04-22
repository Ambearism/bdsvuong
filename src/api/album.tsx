import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type {
    AlbumCreatePayload,
    AlbumItem,
    AlbumListParams,
    AlbumListResponse,
    AlbumUpdatePayload,
} from '@/types/album'

export const albumApi = api.injectEndpoints({
    endpoints: build => ({
        getAlbumList: build.query<ApiResponse<AlbumListResponse>, AlbumListParams>({
            query: params => ({
                url: '/admin/albums',
                method: 'GET',
                params,
            }),
        }),

        getAlbumDetail: build.query<ApiResponse<AlbumItem>, { album_id: number }>({
            query: ({ album_id }) => ({
                url: `/admin/albums/${album_id}`,
                method: 'GET',
            }),
        }),

        createAlbum: build.mutation<ApiResponse<AlbumItem>, AlbumCreatePayload>({
            query: payload => ({
                url: '/admin/albums',
                method: 'POST',
                body: payload,
            }),
        }),

        updateAlbum: build.mutation<ApiResponse<AlbumItem>, { album_id: number; payload: AlbumUpdatePayload }>({
            query: ({ album_id, payload }) => ({
                url: `/admin/albums/${album_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),

        deleteAlbum: build.mutation<ApiResponse<string>, { album_id: number }>({
            query: ({ album_id }) => ({
                url: `/admin/albums/${album_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetAlbumListQuery,
    useGetAlbumDetailQuery,
    useCreateAlbumMutation,
    useUpdateAlbumMutation,
    useDeleteAlbumMutation,
} = albumApi
