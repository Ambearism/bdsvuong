import { useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { message, Spin } from 'antd'
import { useConnectGoogleMutation } from '@/api/googleCalendar'

const GOOGLE_CALLBACK_URL = import.meta.env.VITE_WEBSITE_URL + '/google/callback'

const GoogleCallback = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [connectGoogle] = useConnectGoogleMutation()
    const code = searchParams.get('code') ? decodeURIComponent(searchParams.get('code')!) : null
    const called = useRef(false)

    useEffect(() => {
        const handleConnect = async () => {
            if (code) {
                if (called.current) return
                called.current = true

                try {
                    await connectGoogle({ code, redirect_uri: GOOGLE_CALLBACK_URL }).unwrap()
                    message.success('Kết nối Google Calendar thành công!')
                } catch {
                    message.error('Kết nối thất bại. Vui lòng thử lại.')
                }
            } else {
                message.error('Không tìm thấy mã xác thực.')
            }
            navigate('/settings-google-calendar')
        }

        handleConnect()
    }, [code, connectGoogle, navigate])

    return (
        <div className="flex h-screen items-center justify-center">
            <Spin tip="Đang kết nối Google Calendar..." size="large" />
        </div>
    )
}

export default GoogleCallback
