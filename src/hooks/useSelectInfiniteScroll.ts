import { useState, useEffect, useCallback } from 'react'
import { app } from '@/config/app'

interface UseSelectInfiniteScrollProps<T> {
    items: T[] | undefined
    isFetching: boolean
    debouncedKeyword: string
    page: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    pageSize?: number
    threshold?: number
}

export const useSelectInfiniteScroll = <T extends { id: number | string }>({
    items,
    isFetching,
    debouncedKeyword,
    page,
    setPage,
    pageSize = app.DEFAULT_PAGE_SIZE,
    threshold = 5,
}: UseSelectInfiniteScrollProps<T>) => {
    const [accumulatedItems, setAccumulatedItems] = useState<T[]>([])
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        setPage(app.DEFAULT_PAGE)
        setAccumulatedItems([])
        setHasMore(true)
    }, [debouncedKeyword, setPage])

    useEffect(() => {
        if (!items) return

        setAccumulatedItems(prev => {
            if (page === app.DEFAULT_PAGE) {
                const isSameById =
                    prev.length === items.length && prev.every((item, index) => item.id === items[index]?.id)

                if (isSameById) return prev

                return items
            }

            if (items.length === 0) return prev

            const merged = [...prev, ...items]
            const map = new Map()
            merged.forEach(item => map.set(item.id, item))
            const nextItems = Array.from(map.values()) as T[]

            const isSameById =
                prev.length === nextItems.length && prev.every((item, index) => item.id === nextItems[index]?.id)

            if (isSameById) return prev

            return nextItems
        })
        setHasMore(items.length === pageSize)
    }, [items, page, pageSize])

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement
            const { scrollTop, scrollHeight, clientHeight } = target

            if (scrollTop + clientHeight >= scrollHeight - threshold && hasMore && !isFetching) {
                setPage(prev => prev + 1)
            }
        },
        [hasMore, isFetching, setPage, threshold],
    )

    return {
        accumulatedItems,
        handleScroll,
    }
}
