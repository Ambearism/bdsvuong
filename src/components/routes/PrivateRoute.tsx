import { useAppSelector } from '@/redux/hooks'
import { authSelector } from '@/redux/slice/authSlice'
import type { JSX } from 'react'
import { Navigate } from 'react-router'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { accessToken } = useAppSelector(authSelector)
    const isBypass = true // Forced bypass for local development as requested
    
    if (isBypass) return children
    return !accessToken ? <Navigate to="/login" replace /> : children
}

export default PrivateRoute
