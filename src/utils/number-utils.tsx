import type { InputNumberProps } from 'antd'

const compactFormatter = Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 3,
})

export const parser: InputNumberProps['parser'] = value => {
    return value?.replace(/,/g, '') || ''
}

export const formatter: InputNumberProps['formatter'] = value => {
    if (value === undefined || value === null || value === '') {
        return ''
    }

    const numberString = value.toString()
    const [integerPart, decimalPart] = numberString.split('.')

    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    if (decimalPart !== undefined) {
        return `${formattedIntegerPart}.${decimalPart}`
    }

    return formattedIntegerPart
}

export const formatNumber = (value: number | string | null | undefined, displayDecimals: number = 2): string => {
    if (value === undefined || value === null || value === '') {
        return ''
    }

    const numberString = value.toString()
    const [integerPart, decimalPart] = numberString.split('.')

    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    if (decimalPart !== undefined) {
        return `${formattedIntegerPart}.${decimalPart.slice(0, displayDecimals)}`
    }

    return formattedIntegerPart
}

export const parseNumber = (val: string | number | null | undefined): number => {
    if (val == null || val === '') {
        return 0
    }

    const cleanValue = typeof val === 'string' ? val.replace(/,/g, '') : val
    const num = typeof cleanValue === 'number' ? cleanValue : parseFloat(cleanValue.toString())

    return isNaN(num) ? 0 : num
}

export const characterCountFormatter = (limit: number) => {
    return ({ count }: { count: number }): string => {
        return `${count} / ${limit}`
    }
}

export const compact = (value: number) => compactFormatter.format(value)
