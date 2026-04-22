import type { ListResponse, SearchParams } from '@/types'

export type AlbumBase = {
    name: string
    description: string | null
}

export type AlbumItem = AlbumBase & {
    id: number
    created_at: string
    updated_at: string
}

export type AlbumCreatePayload = AlbumBase

export type AlbumUpdatePayload = Partial<AlbumBase>

export type AlbumListParams = SearchParams

export type AlbumListResponse = ListResponse<AlbumItem>
