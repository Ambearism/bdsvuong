import type { ApiResponse } from '@/types'
import { api } from '@/api'
import type { NewsListParams, NewsListResponse, NewsOutput, NewsUpdateInput } from '@/types/news'

export const newsApi = api.injectEndpoints({
    endpoints: build => ({
        getNewsList: build.query<ApiResponse<NewsListResponse>, NewsListParams>({
            query: params => ({ url: '/admin/news', method: 'GET', params }),
        }),
        getNewsDetail: build.query<ApiResponse<NewsOutput>, { news_id: number }>({
            query: ({ news_id }) => ({ url: `/admin/news/${news_id}`, method: 'GET' }),
        }),
        createNews: build.mutation<ApiResponse<NewsOutput>, FormData>({
            query: payload => ({ url: '/admin/news', method: 'POST', body: payload }),
        }),
        updateNews: build.mutation<ApiResponse<NewsOutput>, { news_id: number; payload: NewsUpdateInput }>({
            query: ({ news_id, payload }) => ({ url: `/admin/news/${news_id}`, method: 'PUT', body: payload }),
        }),
        deleteNews: build.mutation<ApiResponse<string>, { news_id: number }>({
            query: ({ news_id }) => ({ url: `/admin/news/${news_id}`, method: 'DELETE' }),
        }),
    }),
    overrideExisting: false,
})

export const {
    useGetNewsListQuery,
    useGetNewsDetailQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApi
