import { useAppSelector } from '@/redux/hooks'
import { authSelector } from '@/redux/slice/authSlice'
import type { JSX } from 'react'
import { Navigate } from 'react-router'

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const { accessToken } = useAppSelector(authSelector)
    const isBypass = true // Forced bypass for local development as requested
    
    if (isBypass || accessToken) return <Navigate to="/" replace />
    return children
}

export default PublicRoute
