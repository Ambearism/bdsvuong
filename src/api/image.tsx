import type { ApiResponse } from '@/types'

import { api } from '@/api'
import type {
    DeleteImageByPathRequest,
    DeleteImageRequest,
    DeleteImageResponse,
    ImageResponse,
    ListImageRequest,
    ListImageResponse,
    NameImage,
    UpdatePositionImageRequest,
    UpdatePositionImageResponse,
    UploadImageResponse,
} from '@/types/image'

export const productApi = api.injectEndpoints({
    endpoints: build => ({
        uploadImages: build.mutation<ApiResponse<UploadImageResponse[]>, FormData>({
            query: payload => {
                return {
                    url: '/admin/images',
                    method: 'POST',
                    body: payload,
                }
            },
        }),
        getImages: build.query<ApiResponse<ListImageResponse>, ListImageRequest>({
            query: params => {
                return {
                    url: '/admin/images',
                    method: 'GET',
                    params,
                }
            },
        }),
        updatePositonImages: build.mutation<ApiResponse<UpdatePositionImageResponse>, UpdatePositionImageRequest>({
            query: payload => {
                return {
                    url: '/admin/images/positions',
                    method: 'PUT',
                    body: payload,
                }
            },
        }),
        updateImageName: build.mutation<ApiResponse<ImageResponse>, NameImage>({
            query: ({ image_id, name }) => ({
                url: `/admin/images/${image_id}/name`,
                method: 'PUT',
                body: { name },
            }),
        }),
        deleteImage: build.mutation<ApiResponse<DeleteImageResponse>, DeleteImageRequest>({
            query: params => {
                return {
                    url: '/admin/images/delete-image',
                    method: 'DELETE',
                    params,
                }
            },
        }),
        deleteImageByPath: build.mutation<ApiResponse<DeleteImageResponse>, DeleteImageByPathRequest>({
            query: params => {
                return {
                    url: '/admin/images/delete-image-by-path',
                    method: 'DELETE',
                    params,
                }
            },
        }),
    }),
    overrideExisting: true,
})

export const {
    useUploadImagesMutation,
    useGetImagesQuery,
    useUpdatePositonImagesMutation,
    useUpdateImageNameMutation,
    useDeleteImageMutation,
    useDeleteImageByPathMutation,
} = productApi
