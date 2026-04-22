import type { ListResponse } from '@/types'

export type ListImageRequest = {
    type: number
    item_id: number
    is_public?: boolean
}

export type ImageResponse = {
    id: number
    name?: string
    type: string
    item_id: number
    image_url: string
    position: number
    is_public: boolean
    created_at: string
    created_by: number
}

export type ListImageResponse = ListResponse<ImageResponse>

export type UploadImageRequest = {
    file: File[]
    folder: string
    type: number
    item_id: number
    position: number
    is_public: boolean
}

export type UploadImageResponse = {
    filename: string
    path: string
    id_image: number
}

export type PositionImage = {
    id: number
    position: number
}

export type NameImage = {
    image_id: number
    name: string
}

export type UpdatePositionImageRequest = {
    images: PositionImage[]
}

export interface UpdatePositionImageResponse {
    success: boolean
    message: string
    updated: number
}

export interface DeleteImageRequest {
    image_id: number
}

export interface DeleteImageByPathRequest {
    image_path: string
}

export interface DeleteImageResponse {
    success: boolean
    message: string
}
