import React, { useState, useMemo } from 'react'
import { AutoComplete, Input, message } from 'antd'
import debounce from 'lodash/debounce'
import { searchAddress } from '@/api/map'

interface AddressAutocompleteLeafletProps {
    value?: string
    onChange?: (value: string) => void
    onPlaceSelected: (place: { lat: number; lng: number; address: string }) => void
    placeholder?: string
}

const AddressAutocompleteLeaflet: React.FC<AddressAutocompleteLeafletProps> = ({
    value,
    onChange,
    onPlaceSelected,
    placeholder = 'Nhập địa chỉ để tìm kiếm trên bản đồ',
}) => {
    const [options, setOptions] = useState<{ value: string; label: string; lat: number; lng: number }[]>([])

    const fetchAddresses = useMemo(
        () =>
            debounce(async (searchText: string) => {
                if (!searchText || searchText.length < 3) {
                    setOptions([])
                    return
                }

                try {
                    const data = await searchAddress(searchText)

                    const formattedOptions = data.map(item => ({
                        value: item.display_name,
                        label: item.display_name,
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon),
                    }))

                    setOptions(formattedOptions)
                } catch {
                    message.error('Không thể tìm thấy địa chỉ từ từ khóa này')
                }
            }, 500),
        [],
    )

    const onSearch = (searchText: string) => {
        fetchAddresses(searchText)
    }

    const onSelect = (selectedValue: string, option: { value: string; label: string; lat: number; lng: number }) => {
        if (onChange) onChange(selectedValue)
        onPlaceSelected({
            lat: option.lat,
            lng: option.lng,
            address: selectedValue,
        })
    }

    return (
        <AutoComplete
            options={options}
            onSelect={onSelect}
            onSearch={onSearch}
            value={value}
            onChange={onChange}
            className="w-full">
            <Input placeholder={placeholder} allowClear />
        </AutoComplete>
    )
}

export default AddressAutocompleteLeaflet
