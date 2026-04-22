import { auth } from '@/api/auth'
import { authAction } from '@/config/constant'
import type { RootState } from '@/redux/store'
import type { AccountData, ApiResponse, AuthState, LoginResponse, RefreshTokenResponse } from '@/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const isBypass = true // Forced bypass for local development as requested

const bypassState: Partial<AuthState> = {
    accessToken: 'bypass-dev-token',
    refreshToken: 'bypass-dev-refresh',
    permissions: [],
    account: { id: 0, account_name: 'admin', full_name: 'Admin Bypass', type_account: 'ADMIN' } as AccountData,
    success: true,
    isSignedIn: true,
}

const initialState: AuthState = {
    accessToken: isBypass ? (bypassState.accessToken as string) : null,
    refreshToken: isBypass ? (bypassState.refreshToken as string) : null,
    permissions: isBypass ? [] : [], 
    account: isBypass 
        ? (bypassState.account as AccountData)
        : {} as AccountData,
    loading: false,
    success: isBypass,
    error: false,
    isSignedIn: isBypass,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state: AuthState, { payload }: PayloadAction<ApiResponse<LoginResponse>>) => {
            const {
                access_token: accessToken,
                refresh_token: refreshToken,
                account: account,
                permissions,
            } = payload.data
            state.account = account
            state.permissions = permissions
            if (accessToken) {
                state.accessToken = accessToken
            }
            if (refreshToken) {
                state.refreshToken = refreshToken
            }
            state.isSignedIn = true
        },
        logout: (state) => {
            if (isBypass) {
                Object.assign(state, bypassState)
            } else {
                return initialState
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(authAction.LOGOUT, () => initialState)
            .addCase(authAction.REFRESH_TOKEN, (state: AuthState, { payload }: PayloadAction<RefreshTokenResponse>) => {
                state.accessToken = payload.access_token
                payload.refresh_token && (state.refreshToken = payload.refresh_token)
                if (payload.permissions) {
                    state.permissions = payload.permissions
                }
            })
            .addMatcher(auth.endpoints.getProfile.matchPending, (state: AuthState) => {
                state.loading = true
            })
            .addMatcher(
                (action): action is PayloadAction<ApiResponse<AccountData>> =>
                    auth.endpoints.getProfile.matchFulfilled(action) || auth.endpoints.getMe.matchFulfilled(action),
                (state: AuthState, { payload }: PayloadAction<ApiResponse<AccountData>>) => {
                    state.loading = false
                    state.success = true
                    state.error = false
                    state.account = payload.data
                    if (payload.data.permissions) {
                        state.permissions = payload.data.permissions
                    }
                    state.isSignedIn = true
                },
            )

            .addMatcher(auth.endpoints.getProfile.matchRejected, (state: AuthState) => {
                state.loading = false
                state.success = false
                state.error = true
                state.accessToken = null
                state.refreshToken = null
            })
    },
})

export const authSelector = (state: RootState) => state.auth
export const { setAuth, logout } = authSlice.actions
