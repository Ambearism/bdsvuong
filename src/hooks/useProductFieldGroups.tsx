import type {
    ApartmentDetailField,
    KioskDetailField,
    LandDetailField,
    PriceInfoField,
    PrivateHouseDetailField,
    ProviderInfoField,
    RealEstateInfoField,
    ResortDetailField,
    TownHouseDetailField,
} from '@/types/product-field'
import { useMemo } from 'react'

export const useProductFieldGroups = () => {
    const providerInfoField = useMemo<ProviderInfoField[]>(
        () => [
            'type_transaction_id',
            'status_transaction_sell_id',
            'status_transaction_rent_id',
            'supplier_type_id',
            'send_date',
            'customer_id',
            'ref_id',
            'expert_id',
            'supplier_note',
        ],
        [],
    )

    const realEstateInfoField = useMemo<RealEstateInfoField[]>(
        () => [
            'name',
            'slug',
            'address',
            'type_product_id',
            'zone_province_id',
            'zone_ward_id',
            'project_id',
            'identifier_code',
            'product_code',
            'publish_status',
        ],
        [],
    )

    const priceInfoField = useMemo<PriceInfoField[]>(
        () => [
            'status_product_id',
            'acreage',
            'price_build',
            'price_contact',
            'total_contact',
            'difference',
            'percent_closed',
            'total_closed',
            'price_receive',
            'total_price_receive',
            'price_sell',
            'total_price_sell',
            'percent_brokerage',
            'price_brokerage',
            'tax_type_id',
            'price_rent',
            'deposit_rent',
            'cycle_rent',
            'price_rent_brokerage',
            'price_note',
            'product_value',
        ],
        [],
    )

    const apartmentDetailField = useMemo<ApartmentDetailField[]>(
        () => [
            'apartment',
            'number_floor',
            'number',
            'is_corner',
            'finish_house',
            'direction_house_id',
            'direction_balcony_id',
            'number_bedrooms',
            'number_toilets',
            'description',
        ],
        [],
    )

    const kioskDetailField = useMemo<KioskDetailField[]>(
        () => [
            'apartment',
            'number_floor',
            'number',
            'is_corner',
            'finish_house',
            'direction_house_id',
            'street_frontage',
            'description',
        ],
        [],
    )

    const landDetailField = useMemo<LandDetailField[]>(
        () => ['address', 'number', 'finish_house', 'direction_house_id', 'street_frontage', 'gateway', 'description'],
        [],
    )

    const privateHouseDetailField = useMemo<PrivateHouseDetailField[]>(
        () => [
            'address',
            'number',
            'finish_house',
            'direction_house_id',
            'direction_balcony_id',
            'street_frontage',
            'gateway',
            'number_bedrooms',
            'number_toilets',
            'description',
        ],
        [],
    )

    const resortDetailField = useMemo<ResortDetailField[]>(() => ['address', 'finish_house', 'description'], [])

    const townHouseDetailField = useMemo<TownHouseDetailField[]>(
        () => [
            'divisive',
            'parcel',
            'number',
            'is_corner',
            'finish_house',
            'direction_house_id',
            'street_frontage',
            'gateway',
            'number_bedrooms',
            'number_toilets',
            'description',
        ],
        [],
    )

    return {
        providerInfoField,
        realEstateInfoField,
        priceInfoField,
        apartmentDetailField,
        kioskDetailField,
        landDetailField,
        privateHouseDetailField,
        resortDetailField,
        townHouseDetailField,
    }
}
