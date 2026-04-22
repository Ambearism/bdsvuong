import type {
    OPPORTUNITY_TYPE,
    PERIOD_TYPE,
    PRODUCT_TRANSACTION,
    PRODUCT_UPDATE_LOGS,
    TABS_TYPE,
} from '@/config/constant'

export type ApiResponse<T> = {
    status: ApiStatus
    data: T
    errors?: ApiValidationError[]
}

export interface ApiValidationError {
    loc: (string | number)[]
    msg: string
    type: string
}

export type ApiError<Data, Error> = {
    status: number
    data?: ApiErrorData<Data, Error>
}

export type ApiErrorData<Data, Error> = {
    status: ApiStatus
    data?: Data
    errors?: Error
}

export interface ApiErrorHandler {
    notFoundPath?: string
    replace?: boolean
}

export type ApiStatus = {
    code: number
    message: string
}
export type SearchParams = {
    page?: number
    per_page?: number
    keyword?: string
    offset?: number
    is_option?: boolean
}

export type ListResponse<T> = {
    items: T[]
    total?: number
}

export type AuthData = {
    accessToken?: string | null
    refreshToken?: string | null
    account?: AccountData | null
    permissions?: UserPermission[]
}

export type AuthState = AuthData & {
    isSignedIn: boolean
    loading: boolean
    success: boolean
    error: boolean
}

export type AccountState = AccountData & {
    isSignedIn: boolean
    loading: boolean
    success: boolean
    error: boolean
}

export type LoginRequest = {
    account_name: string
    password: string
}

export interface UserPermission {
    module: string
    actions: string[]
}

export type LoginResponse = {
    account: {
        id: number
        account_name: string
        type_account: string
    }
    access_token: string
    refresh_token: string
    permissions: UserPermission[]
}

export type LoginErrorValidate = {
    username?: string[]
    password?: string[]
}

export type AccountData = {
    id: number
    account_name: string
    full_name?: string
    type_account: string
    google_access_token?: string
    permissions?: UserPermission[]
}

export type AccountList = {
    list: AccountData[]
    total: number
}

export type RegisterUserRequest = {
    username: string
    password: string
}

export type AuthStackParamList = {
    Login: undefined
    Register: undefined
}

export type MainStackParamList = {
    BottomTab: undefined
}

export type BottomTabParamList = {
    HomeTab: undefined
    ProfileTab: undefined
}

export type RootStackParamList = AuthStackParamList & MainStackParamList

export type AppState = {
    loading: boolean
}

export interface RefreshTokenResponse {
    access_token: string
    refresh_token?: string
    permissions?: UserPermission[]
}

export type TypeOfTransactionType = (typeof PRODUCT_TRANSACTION)[keyof typeof PRODUCT_TRANSACTION]

export type ProductUpdateLogType = (typeof PRODUCT_UPDATE_LOGS)[keyof typeof PRODUCT_UPDATE_LOGS]

export type TabType = (typeof TABS_TYPE)[keyof typeof TABS_TYPE]

export type PeriodType = (typeof PERIOD_TYPE)[keyof typeof PERIOD_TYPE]

export type TypeOfOpportunityType = (typeof OPPORTUNITY_TYPE)[keyof typeof OPPORTUNITY_TYPE]
