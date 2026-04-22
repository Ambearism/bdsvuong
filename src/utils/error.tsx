import { useCallback } from 'react'
import { message } from 'antd'
import type { FormInstance } from 'antd'
import { isApiError } from '@/lib/utils'

export const useApiError = () => {
    const handleError = useCallback((err: unknown, customMessage?: string, form?: FormInstance) => {
        if (isApiError(err)) {
            if (form && err.data?.errors) {
                const fields = err.data.errors.map(error => ({
                    name: error.loc[error.loc.length - 1] as string | number,
                    errors: [error.msg],
                }))
                form.setFields(fields)
                return
            }

            const errorMessage = err.data?.errors?.[0]?.msg || err.data?.status?.message || customMessage
            if (errorMessage) {
                message.error(errorMessage)
            }
        } else if (customMessage) {
            message.error(customMessage)
        }
    }, [])

    return { handleError }
}
