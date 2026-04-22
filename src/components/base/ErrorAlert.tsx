import React from 'react'
import { Alert } from 'antd'
import { isApiError } from '@/lib/utils'

interface ErrorAlertProps {
    error: unknown
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
    if (!isApiError(error)) return null

    return <Alert message={error.data?.errors?.[0]?.msg || error.data?.status?.message} type="error" />
}
