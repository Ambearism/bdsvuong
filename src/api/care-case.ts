import type { ApiResponse } from '@/types'
import type { ListResponse } from '@/types'
import type {
    CareCaseItem,
    CareCaseListParams,
    CareCaseCreateInput,
    CareCaseUpdateInput,
    CareCaseStatisticsOutput,
} from '@/types/care-case'
import type { StatusValue } from '@/config/constant'
import { api } from '@/api'

export const careCaseApi = api.injectEndpoints({
    endpoints: build => ({
        getCareCaseList: build.query<ApiResponse<ListResponse<CareCaseItem>>, CareCaseListParams>({
            query: params => ({
                url: '/admin/care-cases',
                method: 'GET',
                params,
            }),
        }),
        getCareCaseDetail: build.query<ApiResponse<CareCaseItem>, number | string>({
            query: id => ({
                url: `/admin/care-cases/${id}`,
                method: 'GET',
            }),
        }),
        getCareCaseStatistics: build.query<ApiResponse<CareCaseStatisticsOutput>, void>({
            query: () => ({
                url: '/admin/care-cases/statistics',
                method: 'GET',
            }),
        }),
        createCareCase: build.mutation<ApiResponse<CareCaseItem>, { payload: CareCaseCreateInput; images?: File[] }>({
            query: ({ payload, images }) => {
                const formData = new FormData()
                formData.append('payload', JSON.stringify(payload))
                if (images?.length) {
                    images.forEach(file => formData.append('images', file))
                }
                return {
                    url: '/admin/care-cases',
                    method: 'POST',
                    body: formData,
                }
            },
        }),
        updateCareCaseStatus: build.mutation<ApiResponse<CareCaseItem>, { case_code: string; status: StatusValue }>({
            query: ({ case_code, status }) => ({
                url: '/admin/care-cases/status',
                method: 'PATCH',
                params: { case_code, status },
            }),
        }),
        updateCareCase: build.mutation<
            ApiResponse<CareCaseItem>,
            { care_case_id: number; payload: CareCaseUpdateInput; images?: File[] }
        >({
            query: ({ care_case_id, payload, images }) => {
                const formData = new FormData()
                formData.append('payload', JSON.stringify(payload))
                if (images?.length) {
                    images.forEach(file => formData.append('images', file))
                }
                return {
                    url: `/admin/care-cases/${care_case_id}`,
                    method: 'PATCH',
                    body: formData,
                }
            },
        }),
        deleteCareCaseImage: build.mutation<ApiResponse<CareCaseItem>, { care_case_id: number; image_url: string }>({
            query: ({ care_case_id, image_url }) => ({
                url: `/admin/care-cases/${care_case_id}/images`,
                method: 'DELETE',
                body: { image_url },
            }),
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetCareCaseListQuery,
    useGetCareCaseStatisticsQuery,
    useGetCareCaseDetailQuery,
    useCreateCareCaseMutation,
    useUpdateCareCaseStatusMutation,
    useUpdateCareCaseMutation,
    useDeleteCareCaseImageMutation,
} = careCaseApi
