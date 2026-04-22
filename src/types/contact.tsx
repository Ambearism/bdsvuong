import type { ListResponse, SearchParams } from '@/types'

export type ContactBase = {
    name: string
    phone: string
    email?: string | null
    message?: string | null
}

export type ContactItem = ContactBase & {
    id: number
    created_at: string
    updated_at: string
}

export type ContactListRequest = SearchParams & {
    start_date?: string | null
    end_date?: string | null
}

export type ContactListResponse = ListResponse<ContactItem>
