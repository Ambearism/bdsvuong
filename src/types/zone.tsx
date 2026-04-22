export type ZoneItem = {
    id: number
    name: string
    level: number
    parent_id: number | null
    position: number
    publish: boolean
    created_at: string
    updated_at: string
}

export type ZoneListResponse = {
    items: ZoneItem[]
}
