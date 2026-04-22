import type { ApiResponse } from '@/types'
import { api } from '@/api'
import type { BasicConfigData, AboutConfigData, BasicConfigInput, AboutConfigInput } from '@/types/config'

export const configApi = api.injectEndpoints({
    endpoints: build => ({
        getBasicConfig: build.query<ApiResponse<BasicConfigData>, void>({
            query: () => ({
                url: '/admin/basic-config',
                method: 'GET',
            }),
        }),
        saveBasicConfig: build.mutation<ApiResponse<{ message: string; success: boolean }>, BasicConfigInput>({
            query: data => ({
                url: '/admin/basic-config',
                method: 'POST',
                body: data,
            }),
        }),
        randomProductNews: build.mutation<ApiResponse<{ product_news_list: number[] }>, void>({
            query: () => ({
                url: '/admin/basic-config/random-product-news',
                method: 'POST',
            }),
        }),
        randomProductHot: build.mutation<ApiResponse<{ product_hot_list: number[] }>, void>({
            query: () => ({
                url: '/admin/basic-config/random-product-hot',
                method: 'POST',
            }),
        }),
        getAboutConfig: build.query<ApiResponse<AboutConfigData>, void>({
            query: () => ({
                url: '/admin/about-config',
                method: 'GET',
            }),
        }),
        saveAboutConfig: build.mutation<ApiResponse<{ message: string; success: boolean }>, AboutConfigInput>({
            query: data => ({
                url: '/admin/about-config',
                method: 'POST',
                body: data,
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetBasicConfigQuery,
    useSaveBasicConfigMutation,
    useRandomProductNewsMutation,
    useRandomProductHotMutation,
    useGetAboutConfigQuery,
    useSaveAboutConfigMutation,
} = configApi
