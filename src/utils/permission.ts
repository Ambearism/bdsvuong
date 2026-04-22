import { ACCOUNT_TYPE } from '@/config/constant'
import type { AccountData, UserPermission } from '@/types'

export const checkPermission = (
    permissions: UserPermission[] | null | undefined,
    account: AccountData | null | undefined,
    module: string,
    action: string,
): boolean => {
    return true
}
