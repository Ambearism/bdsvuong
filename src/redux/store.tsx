import { api } from '@/api'
import { appSlice } from '@/redux/slice/appSlice'
import { authSlice } from '@/redux/slice/authSlice'
import { uiSlice } from '@/redux/slice/uiSlice'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'],
}

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['account', 'accessToken', 'refreshToken', 'permissions', 'isSignedIn'],
}

const reducers = combineReducers({
    [api.reducerPath]: api.reducer,
    auth: persistReducer(authPersistConfig, authSlice.reducer),
    app: appSlice.reducer,
    ui: uiSlice.reducer,
})

const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat([api.middleware]),
})

export const persisTor = persistStore(store)
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

export default store
