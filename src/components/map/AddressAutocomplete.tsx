import React from 'react'
import { app } from '@/config/app'
import AddressAutocompleteGoogle from '@/components/map/AddressAutocompleteGoogle'
import AddressAutocompleteLeaflet from '@/components/map/AddressAutocompleteLeaflet'

interface NormalizedPlace {
    lat: number
    lng: number
    address: string
}

interface AddressAutocompleteProps {
    value?: string
    onChange?: (value: string) => void
    onPlaceSelected: (place: NormalizedPlace) => void
    placeholder?: string
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = props => {
    const mapProvider = app.MAP_PROVIDER

    const handleGooglePlaceSelected = (place: google.maps.places.PlaceResult) => {
        if (!place.geometry?.location) return

        props.onPlaceSelected({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || props.value || '',
        })
    }

    if (mapProvider === 'leaflet') {
        return <AddressAutocompleteLeaflet {...props} />
    }

    return <AddressAutocompleteGoogle {...props} onPlaceSelected={handleGooglePlaceSelected} />
}

export default AddressAutocomplete
