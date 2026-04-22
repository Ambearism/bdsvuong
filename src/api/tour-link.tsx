import { api } from '@/api'
import type { ApiResponse } from '@/types'
import type {
    LinkTourToProjectsPayload,
    LinkProjectsToTourPayload,
    LinkTourToProductsPayload,
    LinkProductsToTourPayload,
    TourLinkedProjectsResponse,
    ProjectLinkedToursResponse,
    TourLinkedProductsResponse,
    ProductLinkedToursResponse,
} from '@/types/tour-link'

export const tour360LinkApi = api.injectEndpoints({
    endpoints: build => ({
        linkTourToProjects: build.mutation<ApiResponse<TourLinkedProjectsResponse>, LinkTourToProjectsPayload>({
            query: payload => ({
                url: '/admin/tour360-link/tour-to-projects',
                method: 'POST',
                body: payload,
            }),
        }),

        linkProjectsToTour: build.mutation<ApiResponse<ProjectLinkedToursResponse>, LinkProjectsToTourPayload>({
            query: payload => ({
                url: '/admin/tour360-link/projects-to-tour',
                method: 'POST',
                body: payload,
            }),
        }),

        getProjectsByTour: build.query<ApiResponse<TourLinkedProjectsResponse>, { tour_id: number }>({
            query: ({ tour_id }) => ({
                url: `/admin/tour360-link/tours/${tour_id}/projects`,
                method: 'GET',
            }),
        }),

        getToursByProject: build.query<ApiResponse<ProjectLinkedToursResponse>, { project_id: number }>({
            query: ({ project_id }) => ({
                url: `/admin/tour360-link/projects/${project_id}/tours`,
                method: 'GET',
            }),
        }),

        linkTourToProducts: build.mutation<ApiResponse<TourLinkedProductsResponse>, LinkTourToProductsPayload>({
            query: payload => ({
                url: '/admin/tour360-link/tour-to-products',
                method: 'POST',
                body: payload,
            }),
        }),

        linkProductsToTour: build.mutation<ApiResponse<ProductLinkedToursResponse>, LinkProductsToTourPayload>({
            query: payload => ({
                url: '/admin/tour360-link/products-to-tour',
                method: 'POST',
                body: payload,
            }),
        }),

        getProductsByTour: build.query<ApiResponse<TourLinkedProductsResponse>, { tour_id: number }>({
            query: ({ tour_id }) => ({
                url: `/admin/tour360-link/tours/${tour_id}/products`,
                method: 'GET',
            }),
        }),

        getToursByProduct: build.query<ApiResponse<ProductLinkedToursResponse>, { product_id: number }>({
            query: ({ product_id }) => ({
                url: `/admin/tour360-link/products/${product_id}/tours`,
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useLinkTourToProjectsMutation,
    useLinkProjectsToTourMutation,
    useGetProjectsByTourQuery,
    useGetToursByProjectQuery,
    useLinkTourToProductsMutation,
    useLinkProductsToTourMutation,
    useGetProductsByTourQuery,
    useGetToursByProductQuery,
} = tour360LinkApi
