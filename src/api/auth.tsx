import { api } from '@/api'
import type { ApiResponse, LoginRequest, LoginResponse, AccountData } from '@/types'

export const auth = api.injectEndpoints({
    endpoints: build => ({
        login: build.mutation<ApiResponse<LoginResponse>, LoginRequest>({
            query: params => ({
                url: '/auth/login',
                method: 'POST',
                body: params,
            }),
        }),
        getProfile: build.mutation<ApiResponse<AccountData>, void>({
            query: () => ({
                url: '/member/profile',
                method: 'GET',
            }),
        }),
        getMe: build.query<ApiResponse<AccountData>, void>({
            query: () => ({
                url: '/auth/me',
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useLoginMutation, useGetProfileMutation, useGetMeQuery } = auth
