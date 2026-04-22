import type { ApiResponse } from '@/types'
import { api } from '@/api'
import type { ContactItem, ContactListRequest, ContactListResponse } from '@/types/contact'

export const contactApi = api.injectEndpoints({
    endpoints: build => ({
        getContactList: build.query<ApiResponse<ContactListResponse>, ContactListRequest>({
            query: params => ({
                url: '/admin/contacts',
                method: 'GET',
                params,
            }),
        }),
        getContactDetail: build.query<ApiResponse<ContactItem>, { contact_id: number }>({
            query: ({ contact_id }) => ({
                url: `/admin/contacts/${contact_id}`,
                method: 'GET',
            }),
        }),
        deleteContact: build.mutation<ApiResponse<string>, { contact_id: number }>({
            query: ({ contact_id }) => ({
                url: `/admin/contacts/${contact_id}`,
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
})

export const { useGetContactListQuery, useGetContactDetailQuery, useDeleteContactMutation } = contactApi
