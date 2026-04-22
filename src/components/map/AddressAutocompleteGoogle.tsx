import React, { useEffect, useRef } from 'react'
import { Input, type InputRef } from 'antd'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

interface AddressAutocompleteProps {
    value?: string
    onChange?: (value: string) => void
    onPlaceSelected: (place: google.maps.places.PlaceResult) => void
    placeholder?: string
}

const AddressAutocompleteGoogle: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onPlaceSelected,
    placeholder = 'Nhập địa chỉ để tìm kiếm trên bản đồ',
}) => {
    const inputRef = useRef<InputRef>(null)
    const places = useMapsLibrary('places')

    useEffect(() => {
        if (!places) return
        const inputEl = inputRef.current?.input
        if (!inputEl) return

        const autocomplete = new places.Autocomplete(inputEl, {
            fields: ['geometry', 'formatted_address', 'address_components'],
        })

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            onPlaceSelected(place)

            if (onChange) onChange(place.formatted_address || '')
        })
    }, [places, onPlaceSelected, onChange])

    return <Input ref={inputRef} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} />
}

export default AddressAutocompleteGoogle
