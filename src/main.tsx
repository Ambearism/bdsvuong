import App from '@/App.tsx'
import '@/assets/styles/index.css'
import store, { persisTor } from '@/redux/store.tsx'
import '@ant-design/v5-patch-for-react-19'
import { ConfigProvider } from 'antd'
import vi from 'antd/lib/locale/vi_VN'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import { PersistGate } from 'redux-persist/integration/react'

const router = createBrowserRouter(createRoutesFromElements(<Route path="*" element={<App />} />))

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate persistor={persisTor} loading={null}>
                <ConfigProvider locale={vi}>
                    <RouterProvider router={router} />
                </ConfigProvider>
            </PersistGate>
        </Provider>
    </React.StrictMode>,
)
