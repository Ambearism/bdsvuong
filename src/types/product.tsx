import type { PRODUCT_UPDATE_LOGS } from '@/config/constant'
import type { ListResponse, SearchParams } from '@/types'
import type { Image360InitialView } from '@/types/image-360'
import type { Dayjs } from 'dayjs'

export type ProductBase = {
    sub_id: number
    expert_id?: number
    type_transaction_id: string
    type_product_id: number
    status_product_id: number
    name: string
    slug: string
    zone_province_id: number
    zone_ward_id: number
    project_id: number | null
    address: string
    latitude: number
    longitude: number
    main_image_url: string
    divisive: string
    parcel: string
    apartment: string
    number: string
    is_corner: boolean
    street_frontage: number
    gateway: number
    number_floor: string
    number_bedrooms: number
    number_toilets: number
    furniture_ids: string
    convenient_ids: string
    direction_house_id: number
    direction_balcony_id: number
    note: string
    acreage: number
    is_build: boolean
    price_build: number
    price_contact: number | null
    total_contact: number | null
    difference: number
    percent_closed: number
    total_closed: number
    price_receive: number
    total_price_receive: number
    price_sell: number
    total_price_sell: number
    price_rent: number
    deposit_rent: number | null
    cycle_rent: number | null
    is_percent_agency: boolean
    percent_brokerage: number
    price_brokerage: number
    price_rent_brokerage: number | null
    price_note: string
    tax_type_id: number
    supplier_type_id: number
    customer_id: number
    customer_sub_id: number
    customer_relation: string
    supplier_name: string
    supplier_phone: string
    supplier_note: string
    ref_id: number
    ref_name: string
    ref_phone: string
    send_date: string | Dayjs
    status_transaction_sell_id: number
    status_transaction_rent_id: number
    exchange_sub_id: number
    keywords: string
    account_responsible_id: number
    publish_status: boolean
    highlight_status: boolean
    publish_type_id: number
    publish_web: string
    show_parcel: boolean
    show_floor: boolean
    show_position: boolean
    show_address: boolean
    show_image: boolean
    publish_system: boolean
    status_publish_system: string
    note_publish_system: string
    total_user_sale: number
    user_sale_ids: number
    rate: number
    fit_ids: string
    description: string
    finish_house: boolean
    new_ids: string
    hit_count: number
    seo_description?: string
    seo_keywords?: string
    seo_robots?: string
    seo_title?: string
    product_code?: string
    identifier_code?: string
    product_value?: number
}

export type ProductImage360 = {
    id: number
    title: string
    slug: string
    panorama_url: string | null
    thumbnail_url: string | null
    initial_view: Image360InitialView | null
}

export type ProductTour = {
    id: number
    name_folder: string
    display_name: string
    zip_url: string | null
    thumbnail_image: string | null
}

export type ProductMediaItem = ProductTour | ProductImage360

export type ProductItem = ProductBase & {
    id: number
    created_at: string
    updated_at: string

    status_product_name: string
    zone_province_name: string
    zone_ward_name: string
    project_name: string
    customer_name: string
    account_responsible_name: string
    product_type_name: string
    direction_house_name: string
    direction_balcony_name: string
    product_permissions?: string[]
    product_images?: {
        image: {
            id: number
            type: number
            image_url: string
            position: number
        }[]
        thumbnail: object[]
        image360: ProductImage360[]
        floor_plan: object[]
    }
    product_tours?: ProductTour[]
}

export type ProductSimple = {
    id: number
    product_code?: string
    name?: string
    sub_id?: number
    product_type_name: string
    project_name: string
}

export type ProductListParams = SearchParams & {
    owner_id?: number
    id?: number
    type_transaction_name?: string
    type_product_id?: number
    status_product_id?: number
    status_transaction_sell_id?: number
    status_transaction_rent_id?: number
    zone_province_id?: number
    zone_ward_id?: number
    project_id?: number
    start_date?: string | null
    end_date?: string | null
    sort_by?: number
}

export type ProductListResponse = ListResponse<ProductItem>

export type ProductCreateInput = ProductBase

export type ProductUpdateInput = ProductBase

export type ProductOutput = ProductItem

export type ProductFormValues = Omit<ProductBase, 'send_date'> & {
    send_date?: Dayjs
}

export type UpdateProductLocationRequest = {
    latitude: number
    longitude: number
}

export type ProductCheckDuplicateInput = {
    action: 'create' | 'update'
    number: string
    type_product_id: number
    type_transaction_id?: string | undefined
    zone_province_id?: number | undefined
    zone_ward_id?: number | undefined
    project_id?: number | undefined
    apartment?: string | undefined
    number_floor?: number | undefined
    divisive?: string | undefined
    parcel?: string | undefined
    product_id?: number | undefined
}

export type ProductCheckDuplicateIdentifierCodeInput = {
    action: 'create' | 'update'
    identifier_code: string
    product_id?: number | undefined
}

export type ProductCheckDuplicateProductCodeInput = {
    action: 'create' | 'update'
    product_code: string
    product_id?: number | undefined
}

export type ProductDuplicateCheckResponse = {
    duplicate: boolean
}

export type ProductIdentifierCodeCheckStatus = 'unchecked' | 'available' | 'duplicated'

export type ProductMaxIdResponse = {
    max_id: number
    max_sub_id: number
}

export type ProductTimeline = {
    created_at: string
    updated_at: string
    created_by: number
    updated_by: number
    id: number
    product_id: number
    type: keyof typeof PRODUCT_UPDATE_LOGS
    old: Record<string, string>
    new: Record<string, string>
    reason: string
    created_by_name: string
    target_id?: number
}

export type ProductTimelineResponse = {
    items: ProductTimeline[]
}

export type ProductPermissionItem = {
    account_id: number
    action: string
}

export type UpdateProductPermissionRequest = {
    items: ProductPermissionItem[]
}

export type ProductLocationItem = {
    id: number
    sub_id: number
    product_code?: string
    name?: string | null
    address?: string | null
    zone_province_id?: number | null
    zone_ward_id?: number | null
    longitude?: number | null
    latitude?: number | null
    zone_province_name?: string | null
    zone_ward_name?: string | null
    project_name?: string | null
    created_at?: string | null
    updated_at?: string | null
    product_permissions?: string[]
}

export type ProductLocationListResponse = ListResponse<ProductLocationItem>
