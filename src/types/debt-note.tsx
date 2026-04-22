import type { TypeOfDebtNoteTargetType, TypeOfDebtNoteType } from '@/config/constant'
import type { AccountSimpleReponse } from '@/types/account'

export type DebtNoteBase = {
    id: number
    title: string

    content?: string | null
    amount?: number | null
    type: TypeOfDebtNoteType

    assigned_to: number
    reminder_date: string

    target_id: number
    target_type: TypeOfDebtNoteTargetType
    assigned_to_rel?: AccountSimpleReponse | null
}

export type DebtNoteCreateInput = Omit<DebtNoteBase, 'id'>

export type DebtNoteListResponse = {
    items: DebtNoteBase[]
    total: number
}
