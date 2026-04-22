import type { RootState } from '@/redux/store'
import type { AppState } from '@/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export const appSlice = createSlice({
    name: 'app',
    initialState: {
        loading: false,
    } as AppState,
    reducers: {
        setLoading: (state: AppState, { payload }: PayloadAction<boolean>) => {
            state.loading = payload
        },
    },
})

export const appSelector = (state: RootState) => state.app
export const { setLoading } = appSlice.actions
