import { authSelector } from '@/redux/slice/authSlice'
import { checkPermission } from '@/utils/permission'
import { useAppSelector } from '@/redux/hooks'

export const usePermission = () => {
    const { permissions, account } = useAppSelector(authSelector)

    const hasPermission = (module: string, action: string) => {
        return checkPermission(permissions, account, module, action)
    }

    return { hasPermission }
}
