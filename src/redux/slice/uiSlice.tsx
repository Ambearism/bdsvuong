import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'

interface UIState {
    isForbiddenModalOpen: boolean
}

const initialState: UIState = {
    isForbiddenModalOpen: false,
}

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openForbiddenModal: state => {
            state.isForbiddenModalOpen = true
        },
        closeForbiddenModal: state => {
            state.isForbiddenModalOpen = false
        },
    },
})

export const { openForbiddenModal, closeForbiddenModal } = uiSlice.actions
export const uiSelector = (state: RootState) => state.ui
export default uiSlice.reducer
