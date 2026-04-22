import { app } from '@/config/app'
import { MILLION_PER_BILLION } from '@/config/constant'
import type { ApiResponse } from '@/types'
import type { LeaseContractItem, SimpleLeaseContractItem } from '@/types/lease-contract'
import type { ProductItem } from '@/types/product'
import { formatNumber } from '@/utils/number-utils'
import type { FetchArgs } from '@reduxjs/toolkit/query'

function hasStatus<T>(obj: unknown): obj is { data: ApiResponse<T> } {
    return typeof obj === 'object' && obj !== null && 'data' in obj
}

export function isApiError<T>(error: unknown): error is { data: ApiResponse<T> } {
    return hasStatus(error) && error.data.status.code !== 200
}

export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
    return hasStatus(response) && response.data.status.code === 200
}

export function isFetchArgs(args: unknown): args is FetchArgs {
    return typeof args === 'object' && args !== null && 'url' in args
}

export function pickAndRename<Raw extends object, Result extends object>(
    source: Raw,
    map: Record<keyof Result, keyof Raw>,
): Result {
    const out = {} as Result

    for (const newKey of Object.keys(map) as Array<keyof Result>) {
        const oldKey = map[newKey]
        if (oldKey in source) {
            out[newKey] = source[oldKey] as unknown as Result[typeof newKey]
        }
    }

    return out
}

export function sumToBillion(billion: number, million: number) {
    return billion + million / MILLION_PER_BILLION
}

export const renderProductCode = (product: Pick<ProductItem, 'id' | 'sub_id' | 'product_code'>) => {
    return product.product_code ?? `#H${product.id}.${product.sub_id}`
}

const getPriceSuffixBuilder =
    (suffix: string, shorten?: string) =>
    (
        value: number | string | null | undefined,
        options?: {
            compact?: boolean
            defaultValue?: string
            shorten?: boolean
        },
    ) => {
        const number = typeof value === 'string' ? Number(value) : value

        if (typeof number !== 'number' || isNaN(number)) return options?.defaultValue ?? '--'

        return `${formatNumber(value)} ${options?.shorten && shorten ? shorten : suffix}`
    }
export const withPrice = getPriceSuffixBuilder('triệu', 'tr')
export const withTotalPrice = getPriceSuffixBuilder('tỷ')
export const withPricePerM2 = getPriceSuffixBuilder('triệu/m²')

export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
}

export const padId = (id: number, prefix?: string) => `#${prefix ?? ''}${String(id).padStart(app.CODE_PAD_LENGTH, '0')}`

export const renderTemplate = (template: string, variables: Record<string, string | number>) => {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
        return variables[key.trim()]?.toString() ?? ''
    })
}

export const getBillingUnitLabel = (record: LeaseContractItem | SimpleLeaseContractItem) => {
    if (!record.billing_unit || !record.billing_period) {
        return app.EMPTY_DISPLAY
    }

    if (!record.billing_period && !record.billing_unit) {
        return 'Thanh toán 1 lần'
    }

    const unitLabel = record.billing_unit === 'MONTH' ? 'tháng' : 'năm'
    return `${record.billing_period} ${unitLabel}`
}

export function normalizeFileUrls<T extends { file_urls?: string[] | string }>(payload: T): T {
    if (!payload || payload.file_urls == null) return payload

    if (Array.isArray(payload.file_urls)) return payload

    const raw = String(payload.file_urls).trim()
    if (!raw) {
        return { ...payload, file_urls: [] }
    }

    return {
        ...payload,
        file_urls: raw
            .split(',')
            .map(url => url.trim())
            .filter(Boolean),
    }
}

export function ellipsize(text: string, maxLength = 32) {
    if (text.length <= maxLength) return text
    const head = text.slice(0, Math.floor(maxLength / 2) - 1)
    const tail = text.slice(-Math.ceil(maxLength / 2) + 1)
    return `${head}...${tail}`
}

export const parseCareFee = (feeString: string): number => {
    if (!feeString) return 0
    const match = feeString.match(/([\d,]+)/)
    if (!match) return 0
    const numberStr = match[1].replace(',', '.')
    return parseFloat(numberStr) || 0
}
