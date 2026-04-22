import type { SearchParams } from '@/types'

export interface ExploreOutput {
    id: number
    project_id: number
    type_id?: number
    url?: string
    divisive?: string
    parcel?: string
    apartment?: string
    floor?: string
    number?: string
    acreage?: number
    acreage_build?: number
    block?: string
    link_block?: string
    code_block?: string
    temp_house?: string
    link_temp_house?: string
    code_temp_house?: string
    frontispiece?: string
    backside?: string
    gateway_1?: string
    gateway_2?: string
    number_floor?: number
    number_bedrooms?: number
    number_toilets?: number
    furniture?: string
    direction_house?: string
    direction_house_1?: string
    direction_balcony?: string
    is_corner?: boolean
    is_corner_center?: boolean
    note?: string
    status_building?: string
    status?: string
    is_rough?: boolean
    is_complete?: boolean
    hitcount?: number
    polygon_coordinates?: string
    marker_coordinates?: string
    project_name?: string
}

export type ExploreSearchInput = SearchParams & {
    divisive?: string
    parcel?: string
    number?: string
    apartment?: string
    floor?: string
    block?: string
    acreage?: number
    acreage_min?: number
    acreage_max?: number
    acreage_build?: number
    acreage_build_min?: number
    acreage_build_max?: number
    frontispiece?: string
    backside?: string
    gateway_1?: string
    gateway_2?: string
    number_floor?: number
    number_bedrooms?: number
    number_toilets?: number
    furniture?: string
    direction_house?: string
    direction_house_1?: string
    direction_balcony?: string
    is_corner?: boolean
    is_corner_center?: boolean
    status_building?: string
    status?: string
    is_rough?: boolean
    is_complete?: boolean
    note?: string
}
