import type { ApiResponse } from '@/types'
import { api } from '@/api'
import type { DebtNoteListResponse } from '@/types/debt-note'

export const debtNoteApi = api.injectEndpoints({
    endpoints: build => ({
        getMyDebtReminders: build.query<ApiResponse<DebtNoteListResponse>, void>({
            query: () => ({
                url: '/admin/debt-notes/my-reminders',
                method: 'GET',
            }),
        }),
        deleteDebtNote: build.mutation<ApiResponse<string>, { debt_note_id: number }>({
            query: ({ debt_note_id }) => ({
                url: `/admin/debt-notes/${debt_note_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useGetMyDebtRemindersQuery, useDeleteDebtNoteMutation } = debtNoteApi
