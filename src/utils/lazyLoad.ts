import { type ComponentType, lazy } from 'react'

const STORAGE_PREFIX = 'chunk-retry:'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyLoad = <T extends ComponentType<any>>(factory: () => Promise<{ default: T }>, chunkName: string) =>
    lazy(async () => {
        const key = `${STORAGE_PREFIX}${chunkName}`

        try {
            const component = await factory()
            sessionStorage.removeItem(key)
            return component
        } catch {
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, '1')
                location.replace(location.href)
                return new Promise<{ default: T }>(() => {})
            }
            throw new Error(`[lazyLoad] Chunk "${chunkName}" failed after retry.`)
        }
    })
