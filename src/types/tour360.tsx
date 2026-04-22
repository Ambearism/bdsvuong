import type { ListResponse, SearchParams } from '@/types'

export interface Tour360UploadProps {
    nameFolder: string
    onUploadComplete?: (tempPath: string) => void
    currentZipUrl?: string
}

export type Tour360Base = {
    id: number
    name_folder: string
    display_name: string
    zip_url?: string
    category_id: number
    type_id: number
    divisive?: string
    zone_province_id?: number
    zone_ward_id?: number
    project_ids?: number[]
    product_id?: number
    thumbnail_image?: string
    publish?: boolean
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    temp_path?: string
    projects?: {
        id: number
        name: string
    }[]
}

export type Tour360Item = Tour360Base & {
    hitcount?: number
    created_at: string
    updated_at: string
    zone_province_name?: string
    zone_ward_name?: string
    category_label?: string
    type_label?: string
}

export type Tour360Output = Tour360Item

export type Tour360ListParams = SearchParams & {
    category_id?: number
    type_id?: number
    project_id?: number
    product_id?: number
    zone_province_id?: number
    zone_ward_id?: number
}
export type Tour360CreateInput = Tour360Base

export type Tour360UpdateInput = Partial<Tour360Base>

export type Tour360ListResponse = ListResponse<Tour360Item>

export type Tour360ProjectLink = {
    tour_id: number
    project_id: number
    sort_order?: number
}

export type Tour360ProjectLinkInput = Tour360ProjectLink

export type UploadZipChunkParams = {
    file: File
    resumableChunkNumber: number
    resumableTotalChunks: number
    resumableIdentifier: string
    resumableFilename: string
}

export type UploadZipOutput = {
    status: 'part' | 'success' | 'error'
    message?: string
    temp_path?: string
    uploaded_chunks?: number[]
    chunk?: number
}

export interface Tour360Option {
    value: number
    label: string
}

export interface Tour360OptionResponse {
    items: Tour360Option[]
    total: number
}
