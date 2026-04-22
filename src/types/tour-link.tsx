import type { ProductSimple } from '@/types/product'

export interface ProjectToTourTabRef {
    save: () => Promise<void>
    hasChanges: () => boolean
}

export type ProjectSimple = {
    id: number
    name: string
}

export type Tour360Simple = {
    id: number
    display_name: string
}

export type LinkTourToProjectsPayload = {
    tour_id: number | undefined
    project_ids: number[]
}

export type LinkProjectsToTourPayload = {
    project_id: number | undefined
    tour_ids: number[]
}

export type LinkTourToProductsPayload = {
    tour_id: number | undefined
    product_ids: number[]
}

export type LinkProductsToTourPayload = {
    product_id: number | undefined
    tour_ids: number[]
}

export type TourLinkedProjectsResponse = {
    tour_id: number
    projects: ProjectSimple[]
}

export type ProjectLinkedToursResponse = {
    project_id: number
    tours: Tour360Simple[]
}

export type TourLinkedProductsResponse = {
    tour_id: number
    products: ProductSimple[]
}

export type ProductLinkedToursResponse = {
    product_id: number
    tours: Tour360Simple[]
}
