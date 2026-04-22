import { api } from './index'
import type { ApiResponse } from '@/types'
import type { CreateBatchEventsRequest, GoogleAuthUrlResponse, GoogleConnectRequest } from '@/types/googleCalendar'

const GOOGLE_CALLBACK_URL = import.meta.env.VITE_WEBSITE_URL + '/google/callback'

export const googleCalendarApi = api.injectEndpoints({
    endpoints: build => ({
        getGoogleAuthUrl: build.query<ApiResponse<GoogleAuthUrlResponse>, void>({
            query: () => ({
                url: '/google/auth-url',
                method: 'GET',
                params: {
                    redirect_uri: GOOGLE_CALLBACK_URL,
                },
            }),
        }),
        connectGoogle: build.mutation<ApiResponse<void>, GoogleConnectRequest>({
            query: body => ({
                url: '/google/connect',
                method: 'POST',
                body,
            }),
        }),
        createGoogleEvent: build.mutation<ApiResponse<void>, CreateBatchEventsRequest>({
            query: body => ({
                url: '/google/create-event',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const {
    useGetGoogleAuthUrlQuery,
    useLazyGetGoogleAuthUrlQuery,
    useConnectGoogleMutation,
    useCreateGoogleEventMutation,
} = googleCalendarApi
