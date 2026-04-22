import { app } from '@/config/app'
import { authAction } from '@/config/constant'
import { isFetchArgs } from '@/lib/utils'
import type { RootState } from '@/redux/store'
import type { ApiResponse, RefreshTokenResponse } from '@/types'
import type { BaseQueryApi, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { openForbiddenModal } from '@/redux/slice/uiSlice'
import { Mutex } from 'async-mutex'
const mutex = new Mutex()

const BASE_URL = app.API_URL

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState, arg }) => {
        const token = (getState() as RootState).auth.accessToken
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        if (!isFetchArgs(arg) || !(arg.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json')
        }
        return headers
    },
    validateStatus: response => {
        return response.ok
    },
})

const baseQueryWithInterceptor: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    await mutex.waitForUnlock()
    let response = await baseQuery(args, api, extraOptions)

    if (response.error && response.error.status === 403) {
        const method = typeof args === 'string' ? 'GET' : args.method || 'GET'
        if (method !== 'GET') {
            const state = api.getState() as RootState
            if (!state.ui.isForbiddenModalOpen) {
                api.dispatch(openForbiddenModal())
            }
        } else {
            if (window.location.pathname !== '/403') {
                window.location.href = '/403'
            }
        }
    }

    if (response.error && response.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire()
            try {
                const refreshResult = await _refreshToken(api, extraOptions)
                if (refreshResult) {
                    api.dispatch({ type: authAction.REFRESH_TOKEN, payload: refreshResult.data })
                    response = await baseQuery(args, api, extraOptions)
                } else {
                    api.dispatch({ type: authAction.LOGOUT })
                }
            } finally {
                release()
            }
        } else {
            await mutex.waitForUnlock()
            response = await baseQuery(args, api, extraOptions)
        }
    }
    return response
}

const baseQueryWithRetry = retry(baseQueryWithInterceptor, { maxRetries: 0 })

const _refreshToken = async (
    api: BaseQueryApi,
    extraOptions = {},
): Promise<ApiResponse<RefreshTokenResponse> | undefined> => {
    const response = await baseQuery(
        {
            url: '/auth/refresh-token',
            method: 'POST',
            body: {
                refresh_token: (api.getState() as RootState).auth.refreshToken,
            },
        },
        api,
        extraOptions,
    )

    return response.data as ApiResponse<RefreshTokenResponse> | undefined
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithRetry,
    tagTypes: ['Product', 'Customer'],
    endpoints: () => ({}),
})
