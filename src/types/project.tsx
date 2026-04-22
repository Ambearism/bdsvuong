import type { ListResponse, SearchParams, TabType } from '@/types'
import dayjs from 'dayjs'

export type ProjectTypeData = {
    id: number
    name: string
}

export type CustomTab = {
    id: string
    key: string
    title: string
    type: TabType
    content: string | null
    url: string | null
    order: number
    is_active?: boolean
}

export interface AmenityItem {
    id?: number
    name: string
    description?: string
}

export interface AmenityCategory {
    id?: number
    title: string
    items: AmenityItem[]
}

export interface HotLink {
    title: string
    url: string
}

export type ConfigExploreData = {
    find: Record<string, string>
    setting: Record<string, string>
    data: string[]
}
export type ProjectConfigExplore = {
    enable_explore: boolean
    config_explore: ConfigExploreData | null
    enable_explore_map: boolean
    content_explore_map: string
    is_explore: boolean
}

export type ProjectBase = {
    id: number
    expert_id?: number
    name: string
    type_project_id: number
    status_project_id?: number
    url_project?: string
    parent_id?: number | null
    video_url?: string
    logo_image?: string
    intro?: string
    location_utility?: string
    ground?: string
    quote?: string
    process?: string
    is_finish?: boolean
    zone_province_id?: number
    zone_ward_id?: number
    image_url?: string
    investor?: string
    address?: string
    acreage?: string
    scale?: string
    number_apartment?: number
    construction?: string
    price_from?: number
    price_to?: number
    price_per_m2?: number
    hotline?: string
    fanpage?: string
    permission_ids?: number[]
    is_hot?: boolean
    is_regularly?: boolean
    total_buildings?: number
    building_height?: number
    standard_design_from?: number
    standard_design_to?: number
    main_types?: string
    density?: string
    handover_date?: string | dayjs.Dayjs | null
    apartments_per_floor?: number
    elevators_per_building?: number
    basement_floors?: number
    legal_status?: number
    amenities?: AmenityCategory[]
    hot_links?: HotLink[]
    publish_status: boolean
    highlight_status: boolean
    latitude?: number
    longitude?: number
    custom_tabs?: CustomTab[]
    seo_description?: string
    seo_keywords?: string
    seo_robots?: string
    seo_title?: string
    news_count?: number
    product_count?: number
    is_explore: boolean
    enable_explore?: boolean
}

export type ProjectCreateInput = ProjectBase

export type ProjectUpdateInput = Partial<ProjectBase>

export type ProjectItem = ProjectBase & {
    id: number
    hitcount: number
    created_at: string
    updated_at: string
    zone_province_name: string
    zone_ward_name: string
    type_project_label: string
    type_project_slug: string
    status_project_label?: string
    handover_display?: string
    enable_explore: boolean
    config_explore: ConfigExploreData | null
    enable_explore_map: boolean
    content_explore_map: string
    is_explore: boolean
    project_permissions?: string[]
}

export type ProjectOutput = ProjectItem

export type ProjectListParams = SearchParams & {
    zone_ward_id?: number
    zone_province_id?: number
    type_project_id?: number
}

export type ProjectListResponse = ListResponse<ProjectItem>

export type ProjectPermissionItem = {
    account_id: number
    action: string
}

export type UpdateProjectPermissionRequest = {
    items: ProjectPermissionItem[]
}

export type ProjectExploreOverview = {
    id: number
    name: string
    product_count: number
    divisive: number
    parcel: number
    total_units: number
    enable_explore: boolean
    url_project: string
    project_permissions?: string[]
}

export type ProjectExploreOverviewResponse = ListResponse<ProjectExploreOverview>
