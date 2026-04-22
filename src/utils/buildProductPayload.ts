import { slugify } from '@/utils/slugify'
import { PRODUCT_TRANSACTION, PRODUCT_TYPE_ID } from '@/config/constant'
import dayjs from 'dayjs'

const TYPE_PURPOSE_MAP: Record<string, string> = { Bán: PRODUCT_TRANSACTION.SELL, Thuê: PRODUCT_TRANSACTION.RENT }
const TYPE_PRODUCT_MAP: Record<string, number> = {
    'Chung cư': PRODUCT_TYPE_ID.APARTMENT,
    'Nhà phố': PRODUCT_TYPE_ID.PRIVATE_HOUSE,
    'Liền kề': PRODUCT_TYPE_ID.TOWNHOUSE,
    'Biệt thự': PRODUCT_TYPE_ID.VILLA,
}

export interface BuildProductPayloadParams {
    values: Record<string, unknown>
    productCode?: string | null
    sellStatus?: number
    rentStatus?: number
    supplierType?: number
}

export function buildProductPayload({
    values,
    productCode = null,
    sellStatus = 6,
    rentStatus = 6,
    supplierType = 1,
}: BuildProductPayloadParams): Record<string, unknown> {
    const name = String(values.name || '')
    const typeTransactionId = TYPE_PURPOSE_MAP[String(values.purpose || 'Bán')] || PRODUCT_TRANSACTION.SELL
    const typeProductId = TYPE_PRODUCT_MAP[String(values.type || 'Chung cư')] || PRODUCT_TYPE_ID.APARTMENT
    const acreage = Number(values.area) || 0
    const priceVal = Number(values.price) || 0
    const zoneProvinceId = Number(values.zone_province_id) || 1
    const zoneWardId = Number(values.zone_ward_id) || 1
    const projectId = Number(values.project_id) || 1

    return {
        expert_id: null,
        sub_id: null,
        type_transaction_id: typeTransactionId,
        type_product_id: typeProductId,
        status_product_id: 1,
        name,
        slug: slugify(name) || null,
        zone_province_id: zoneProvinceId,
        zone_ward_id: zoneWardId,
        project_id: projectId,
        address: values.address || values.name || null,
        latitude: null,
        longitude: null,
        divisive: null,
        parcel: null,
        apartment: null,
        number: null,
        is_corner: true,
        street_frontage: null,
        gateway: null,
        number_floor: null,
        number_bedrooms: null,
        number_toilets: null,
        furniture_ids: [],
        convenient_ids: [],
        direction_house_id: 1,
        direction_balcony_id: 1,
        note: null,
        acreage,
        is_build: true,
        price_build: null,
        price_contact: null,
        total_contact: null,
        difference: null,
        percent_closed: null,
        total_closed: null,
        price_receive: null,
        total_price_receive: null,
        price_sell: priceVal,
        total_price_sell: null,
        price_rent: null,
        deposit_rent: null,
        cycle_rent: null,
        is_percent_agency: true,
        percent_brokerage: null,
        price_brokerage: null,
        price_rent_brokerage: null,
        price_note: null,
        tax_type_id: 1,
        supplier_type_id: supplierType,
        customer_id: null,
        customer_relation: null,
        supplier_name: null,
        supplier_phone: null,
        supplier_note: null,
        ref_id: null,
        ref_name: null,
        ref_phone: null,
        send_date: dayjs().format('YYYY-MM-DD'),
        status_transaction_sell_id: sellStatus,
        status_transaction_rent_id: rentStatus,
        exchange_sub_id: null,
        keywords: null,
        account_responsible_id: null,
        publish_status: true,
        highlight_status: true,
        publish_type_id: 1,
        publish_web: null,
        show_parcel: true,
        show_floor: true,
        show_position: true,
        show_address: true,
        show_image: true,
        publish_system: true,
        status_publish_system: 'PENDING_CHECK',
        note_publish_system: null,
        total_user_sale: null,
        user_sale_ids: null,
        rate: null,
        fit_ids: [],
        description: null,
        finish_house: true,
        new_ids: null,
        created_by: null,
        owner_id: null,
        seo_title: null,
        seo_description: null,
        seo_keywords: null,
        seo_robots: null,
        product_code: productCode,
        identifier_code: null,
    }
}
