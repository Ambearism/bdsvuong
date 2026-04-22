import { useLazyCheckDuplicateQuery } from '@/api/product'
import { PRODUCT_TYPE_ID } from '@/config/constant'
import type { ProductCheckDuplicateInput, ProductFormValues } from '@/types/product'
import { Form, message } from 'antd'
import { useParams } from 'react-router'

type DuplicateRule = {
    requiredField: string
    message: string
}

type ValidateError = {
    field?: string
    errorMessage?: string
}

const DUPLICATE_RULES: Record<number, DuplicateRule[]> = {
    [PRODUCT_TYPE_ID.APARTMENT]: [
        {
            requiredField: 'number_floor',
            message: 'Vui lòng nhập tầng!',
        },
        {
            requiredField: 'number',
            message: 'Vui lòng nhập số căn!',
        },
    ],
    [PRODUCT_TYPE_ID.KIOSK]: [
        {
            requiredField: 'number_floor',
            message: 'Vui lòng nhập tầng!',
        },
        {
            requiredField: 'number',
            message: 'Vui lòng nhập số căn!',
        },
    ],
    [PRODUCT_TYPE_ID.TOWNHOUSE]: [
        {
            requiredField: 'parcel',
            message: 'Vui lòng nhập phân lô!',
        },
        {
            requiredField: 'number',
            message: 'Vui lòng nhập số căn!',
        },
    ],
    [PRODUCT_TYPE_ID.VILLA]: [
        {
            requiredField: 'parcel',
            message: 'Vui lòng nhập phân lô!',
        },
        {
            requiredField: 'number',
            message: 'Vui lòng nhập số căn!',
        },
    ],
}

const validateCheckDuplicateInput = (input: ProductCheckDuplicateInput): ValidateError[] => {
    const rules = DUPLICATE_RULES[Number(input.type_product_id)]

    if (!rules || !rules.length) return []

    const errors: ValidateError[] = []
    rules.forEach(rule => {
        const value = input[rule.requiredField as keyof ProductCheckDuplicateInput]

        if (!value) {
            errors.push({
                field: rule.requiredField as keyof ProductCheckDuplicateInput,
                errorMessage: rule.message,
            })
        }
    })

    return errors
}

const CheckDuplicateInfoButton = () => {
    const { product_id } = useParams<{ product_id?: string }>()

    const form = Form.useFormInstance<ProductFormValues>()

    const type_transaction_id = Form.useWatch('type_transaction_id', form)
    const type_product_id = Form.useWatch('type_product_id', form)
    const apartment = Form.useWatch('apartment', form)
    const number_floor = Form.useWatch('number_floor', form)
    const zone_province_id = Form.useWatch('zone_province_id', form)
    const zone_ward_id = Form.useWatch('zone_ward_id', form)
    const divisive = Form.useWatch('divisive', form)
    const parcel = Form.useWatch('parcel', form)
    const number = Form.useWatch('number', form)
    const project_id = Form.useWatch('project_id', form)

    const action: ProductCheckDuplicateInput['action'] = product_id ? 'update' : 'create'

    const [triggerCheckDuplicate] = useLazyCheckDuplicateQuery()

    const handleCheckDuplicate = async () => {
        const normalizedNumber = number?.trim()
        const normalizeString = (stringValue?: string) => {
            const value = stringValue?.trim()
            return value && value.length > 0 ? value : undefined
        }

        const normalizeNumber = (value: unknown) => {
            if (value === null || value === undefined || value === '') return undefined
            const n = Number(value)
            return Number.isFinite(n) ? n : undefined
        }

        const checkDuplidateInput: ProductCheckDuplicateInput = {
            action,
            number: normalizedNumber,
            type_product_id,
            type_transaction_id,
            apartment: normalizeString(apartment),
            divisive: normalizeString(divisive),
            number_floor: normalizeNumber(number_floor) as number | undefined,
            parcel: normalizeString(parcel),
            product_id: product_id ? Number(product_id) : undefined,
            project_id: project_id ? Number(project_id) : undefined,
            zone_province_id: normalizeNumber(zone_province_id) as number | undefined,
            zone_ward_id: normalizeNumber(zone_ward_id) as number | undefined,
        }

        const errors = validateCheckDuplicateInput(checkDuplidateInput)
        if (errors.length) {
            const errorFields = errors.map(error => {
                if (error.field && error.errorMessage) {
                    return {
                        name: error.field as keyof ProductFormValues,
                        errors: [error.errorMessage],
                    }
                } else {
                    return {
                        name: error.field as keyof ProductFormValues,
                        errors: [],
                    }
                }
            })
            form.setFields(errorFields)

            return
        }

        const { data: checkDuplicateData, isError } = await triggerCheckDuplicate(checkDuplidateInput)

        if (isError) {
            message.error('Kiểm tra trùng lặp không thành công!')
            return
        }

        if (checkDuplicateData?.data?.duplicate) {
            return message.error('Mã hàng này bị trùng lặp thông tin')
        }

        message.success('Không có mã hàng nào bị trùng lặp thông tin')
    }

    if (!type_product_id) {
        return null
    }

    return (
        <span className="text-blue-600 cursor-pointer hover:text-blue-400" onClick={handleCheckDuplicate}>
            Kiểm tra
        </span>
    )
}

export default CheckDuplicateInfoButton
