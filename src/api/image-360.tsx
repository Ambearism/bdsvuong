import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type {
    CreateImage360Request,
    CreateImage360Response,
    DeleteImage360Response,
    Image360Item,
    Image360ListParams,
    Image360ListResponse,
    LinkImage360ToProductsRequest,
    LinkImage360ToProductsResponse,
    LinkImage360ToProjectsRequest,
    LinkImage360ToProjectsResponse,
    LinkProdcutToImage360sRequest,
    LinkProdcutToImage360sResponse,
    LinkProjectToImage360sRequest,
    LinkProjectToImage360sResponse,
    ListImage360WithProductsRequest,
    ListImage360WithProductsResponse,
    ListImage360WithProjectsRequest,
    ListImage360WithProjectsResponse,
    UpdateImage360Request,
    UpdateImage360Response,
    Image360OptionResponse,
} from '@/types/image-360'

export const image360Api = api.injectEndpoints({
    endpoints: build => ({
        getImage360List: build.query<ApiResponse<Image360ListResponse>, Image360ListParams>({
            query: params => ({
                url: '/admin/panorama360',
                method: 'GET',
                params,
            }),
        }),
        getImage360Detail: build.query<ApiResponse<Image360Item>, { panorama_id: number }>({
            query: ({ panorama_id }) => ({
                url: `/admin/panorama360/${panorama_id}`,
                method: 'GET',
            }),
        }),
        createImage360: build.mutation<ApiResponse<CreateImage360Response>, CreateImage360Request>({
            query: payload => ({
                url: '/admin/panorama360',
                method: 'POST',
                body: payload,
            }),
        }),
        updateImage360: build.mutation<
            ApiResponse<UpdateImage360Response>,
            { panorama_id: number; payload: UpdateImage360Request }
        >({
            query: ({ panorama_id, payload }) => ({
                url: `/admin/panorama360/${panorama_id}`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deleteImage360: build.mutation<ApiResponse<DeleteImage360Response>, { panorama_id: number }>({
            query: ({ panorama_id }) => ({
                url: `/admin/panorama360/${panorama_id}`,
                method: 'DELETE',
            }),
        }),
        linkImage360ToProducts: build.mutation<
            ApiResponse<LinkImage360ToProductsResponse>,
            LinkImage360ToProductsRequest
        >({
            query: payload => ({
                url: '/admin/panorama-link/panorama-to-products',
                method: 'POST',
                body: payload,
            }),
        }),
        linkImage360ToProjects: build.mutation<
            ApiResponse<LinkImage360ToProjectsResponse>,
            LinkImage360ToProjectsRequest
        >({
            query: payload => ({
                url: '/admin/panorama-link/panorama-to-projects',
                method: 'POST',
                body: payload,
            }),
        }),
        linkProdcutToImage360s: build.mutation<
            ApiResponse<LinkProdcutToImage360sResponse>,
            LinkProdcutToImage360sRequest
        >({
            query: payload => ({
                url: '/admin/panorama-link/products-to-panorama',
                method: 'POST',
                body: payload,
            }),
        }),
        linkProjectToImage360s: build.mutation<
            ApiResponse<LinkProjectToImage360sResponse>,
            LinkProjectToImage360sRequest
        >({
            query: payload => ({
                url: '/admin/panorama-link/projects-to-panorama',
                method: 'POST',
                body: payload,
            }),
        }),
        getProductLinkedByImage360: build.query<ApiResponse<LinkImage360ToProductsResponse>, { panorama_id: number }>({
            query: ({ panorama_id }) => ({
                url: `/admin/panorama-link/panoramas/${panorama_id}/products`,
                method: 'GET',
            }),
        }),
        getProjectLinkedByImage360: build.query<ApiResponse<LinkImage360ToProjectsResponse>, { panorama_id: number }>({
            query: ({ panorama_id }) => ({
                url: `/admin/panorama-link/panoramas/${panorama_id}/projects`,
                method: 'GET',
            }),
        }),
        getImage360LinkedByProduct: build.query<ApiResponse<LinkProdcutToImage360sResponse>, { product_id: number }>({
            query: ({ product_id }) => ({
                url: `/admin/panorama-link/products/${product_id}/panoramas`,
                method: 'GET',
            }),
        }),
        getImage360LinkedByProject: build.query<ApiResponse<LinkProjectToImage360sResponse>, { project_id: number }>({
            query: ({ project_id }) => ({
                url: `/admin/panorama-link/projects/${project_id}/panoramas`,
                method: 'GET',
            }),
        }),

        getListImage360WithProducts: build.query<
            ApiResponse<ListImage360WithProductsResponse>,
            ListImage360WithProductsRequest
        >({
            query: params => ({
                url: '/admin/panorama-link/list-panorama-with-products',
                method: 'GET',
                params,
            }),
        }),
        getListImage360WithProjects: build.query<
            ApiResponse<ListImage360WithProjectsResponse>,
            ListImage360WithProjectsRequest
        >({
            query: params => ({
                url: '/admin/panorama-link/list-panorama-with-projects',
                method: 'GET',
                params,
            }),
        }),
        getImage360Options: build.query<ApiResponse<Image360OptionResponse>, Image360ListParams>({
            query: params => ({
                url: '/admin/options/panorama360',
                method: 'GET',
                params,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetImage360ListQuery,
    useGetImage360DetailQuery,
    useCreateImage360Mutation,
    useUpdateImage360Mutation,
    useDeleteImage360Mutation,
    useLinkImage360ToProductsMutation,
    useLinkImage360ToProjectsMutation,
    useLinkProdcutToImage360sMutation,
    useLinkProjectToImage360sMutation,
    useGetProductLinkedByImage360Query,
    useGetProjectLinkedByImage360Query,
    useGetImage360LinkedByProductQuery,
    useGetImage360LinkedByProjectQuery,
    useGetListImage360WithProductsQuery,
    useGetListImage360WithProjectsQuery,
    useGetImage360OptionsQuery,
} = image360Api
