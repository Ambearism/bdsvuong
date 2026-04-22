import type { ApiResponse } from '@/types'

import { api } from '@/api'
import type { ZoneItem, ZoneListResponse } from '@/types/zone'

export const projectApi = api.injectEndpoints({
    endpoints: build => ({
        getProvinceList: build.query<ApiResponse<ZoneListResponse>, { is_option?: boolean } | void>({
            query: params => ({
                url: '/admin/zones/provinces',
                method: 'GET',
                params: params || {},
            }),
        }),
        getWardsByProvinceId: build.query<ApiResponse<ZoneListResponse>, { province_id: number; is_option?: boolean }>({
            query: ({ province_id, ...params }) => ({
                url: `/admin/zones/provinces/${province_id}/wards`,
                method: 'GET',
                params,
            }),
        }),
        getZoneDetail: build.query<ApiResponse<ZoneItem>, { zone_id: number }>({
            query: ({ zone_id }) => ({
                url: `/admin/zones/${zone_id}`,
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useGetProvinceListQuery, useGetWardsByProvinceIdQuery, useGetZoneDetailQuery } = projectApi
