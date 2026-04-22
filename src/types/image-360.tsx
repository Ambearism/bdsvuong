import type { ListResponse, SearchParams } from '@/types'
import type { ProductSimple } from '@/types/product'

export interface ImageSimpleItem {
    id: number
    title: string
}

export interface ProjectToImage360TabRef {
    save: () => Promise<void>
    hasChanges: () => boolean
}

export interface Image360InitialView {
    yaw: number
    pitch: number
    fov: number
}

export type Image360ListParams = SearchParams & {
    id?: number
    type_product_id?: number
    category_id?: number
    province_id?: number
    ward_id?: number
    product_id?: number
    album_id?: number
}

export type Image360Item = {
    id: number
    title: string
    slug: string
    description: string
    province_id: number
    ward_id: number
    album_id: number
    type_product_id: number
    category_id: number
    area_m2: number
    latitude: number
    longitude: number
    panorama_url: string
    thumbnail_url: string
    display_type: boolean
    initial_view: Image360InitialView
    seo_title: string
    seo_description: string
    seo_keywords: string
    category_name: string
    type_name: string
    province_name: string
    ward_name: string
}

export type Image360ListResponse = ListResponse<Image360Item>

export type Image360Request = {
    title: string
    slug: string
    description: string
    province_id: number
    ward_id: number
    album_id: number
    type_product_id: number
    category_id: number
    area_m2: number
    latitude: number
    longitude: number
    panorama_url?: string
    thumbnail_url?: string
    display_type: boolean
    initial_view: Image360InitialView
    seo_title: string
    seo_description: string
    seo_keywords: string
}

export type CreateImage360Request = Image360Request

export type UpdateImage360Request = Image360Request

export type CreateImage360Response = {
    panorama_id: number
    message: string
}

export type UpdateImage360Response = CreateImage360Response

export type DeleteImage360Response = CreateImage360Response

export type ProjectItem = {
    id: number
    name: string
}

export type PanoramaItem = {
    id: number
    title: string
}

export type LinkImage360ToProductsRequest = {
    panorama_id: number
    product_ids: number[]
}

export type LinkImage360ToProductsResponse = {
    panorama_id: number
    products: ProductSimple[]
}

export type LinkImage360ToProjectsRequest = {
    panorama_id: number
    project_ids: number[]
}

export type LinkImage360ToProjectsResponse = {
    panorama_id: number
    projects: ProjectItem[]
}

export type LinkProdcutToImage360sRequest = {
    product_id: number
    panorama_ids: number[]
}

export type LinkProdcutToImage360sResponse = {
    product_id: number
    panoramas: PanoramaItem[]
}

export type LinkProjectToImage360sRequest = {
    project_id: number
    panorama_ids: number[]
}

export type LinkProjectToImage360sResponse = {
    project_id: number
    panoramas: PanoramaItem[]
}

export type ListImage360WithProductsRequest = SearchParams

export type Product = {
    product_id: number
    product_type_product_id: number
    product_type_name: string
    project_id: number
    project_name: string
}

export type Image360WithProducts = {
    panorama_id: number
    products: Product[]
}

export type ListImage360WithProductsResponse = {
    items: Image360WithProducts[]
    total: number
}

export type ListImage360WithProjectsRequest = SearchParams

export type Project = {
    project_id: number
    project_name: string
}

export type Image360WithProjects = {
    panorama_id: number
    projects: Project[]
}

export type ListImage360WithProjectsResponse = {
    items: Image360WithProjects[]
    total: number
}

export interface Image360Option {
    value: number
    label: string
}

export interface Image360OptionResponse {
    items: Image360Option[]
    total: number
}
// End Type Link Image 360
