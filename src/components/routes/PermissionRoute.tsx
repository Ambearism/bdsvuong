import { authSelector } from '@/redux/slice/authSlice'
import { checkPermission } from '@/utils/permission'
import { message } from 'antd'
import React, { useEffect, useRef } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { Navigate } from 'react-router'

type PermissionRouteProps = {
    children: React.ReactElement
    module: string
    action: string
}

const PermissionRoute = ({ children, module, action }: PermissionRouteProps) => {
    const { permissions, account } = useAppSelector(authSelector)
    const messageShown = useRef(false)

    const hasPermission = checkPermission(permissions, account, module, action)

    useEffect(() => {
        if (!hasPermission && !messageShown.current) {
            message.error('Bạn không có quyền truy cập vào chức năng này')
            messageShown.current = true
        }
    }, [hasPermission])

    if (!hasPermission) {
        return <Navigate to="/403" replace />
    }

    return children
}

export default PermissionRoute
