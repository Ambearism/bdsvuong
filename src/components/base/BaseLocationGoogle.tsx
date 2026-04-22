import { useState, useEffect, useCallback } from 'react'
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary, type MapMouseEvent } from '@vis.gl/react-google-maps'
import AddressAutocompleteGoogle from '@/components/map/AddressAutocompleteGoogle'
import { app } from '@/config/app'
import { HA_NOI_LOCATION, ZOOM_SIZE } from '@/config/constant'
import { Col, Form, Input, message, Row } from 'antd'
import { useDebounce } from '@/hooks/useDebounce'

const MapController = ({ pos }: { pos: { lat: number; lng: number } }) => {
    const map = useMap()

    useEffect(() => {
        if (map && pos.lat && pos.lng) {
            map.panTo(pos)
        }
    }, [pos, map])

    return null
}

const BaseLocationContent: React.FC = () => {
    const form = Form.useFormInstance()
    const geocodingLib = useMapsLibrary('geocoding')

    const latitude = Form.useWatch('latitude', form)
    const longitude = Form.useWatch('longitude', form)
    const addressFromForm = Form.useWatch('address', form)

    const [markerPos, setMarkerPos] = useState({
        lat: HA_NOI_LOCATION.LAT,
        lng: HA_NOI_LOCATION.LONG,
    })

    const debouncedAddress = useDebounce(addressFromForm, 800)

    const reverseGeocode = useCallback(
        async (lat: number, lng: number) => {
            if (!geocodingLib) return
            try {
                const geocoder = new geocodingLib.Geocoder()
                const response = await geocoder.geocode({ location: { lat, lng } })
                if (response.results && response.results[0]) {
                    form.setFieldsValue({ address: response.results[0].formatted_address })
                }
            } catch {
                message.error('Không thể lấy địa chỉ từ vị trí này')
            }
        },
        [geocodingLib, form],
    )

    const updatePosition = useCallback(
        (pos: { lat: number; lng: number }, shouldReverseGeocode = false) => {
            setMarkerPos(pos)
            form.setFieldsValue({
                latitude: pos.lat,
                longitude: pos.lng,
            })
            if (shouldReverseGeocode) {
                reverseGeocode(pos.lat, pos.lng)
            }
        },
        [form, reverseGeocode],
    )

    const geocodeAddress = useCallback(
        async (address: string) => {
            if (!geocodingLib || !address) return
            const geocoder = new geocodingLib.Geocoder()
            try {
                const response = await geocoder.geocode({ address })
                if (response.results && response.results[0]?.geometry.location) {
                    const location = response.results[0].geometry.location
                    const newPos = { lat: location.lat(), lng: location.lng() }
                    updatePosition(newPos, false)
                }
            } catch {
                message.error('Không thể tìm thấy vị trí từ địa chỉ đã nhập')
            }
        },
        [geocodingLib, updatePosition],
    )

    useEffect(() => {
        if (debouncedAddress && geocodingLib) {
            geocodeAddress(debouncedAddress)
        }
    }, [debouncedAddress, geocodingLib, geocodeAddress])

    useEffect(() => {
        if (latitude && longitude) {
            setMarkerPos({ lat: latitude, lng: longitude })
        }
    }, [latitude, longitude])

    const handleMapClick = (event: MapMouseEvent) => {
        if (!event.detail.latLng) return
        const newPos = { lat: event.detail.latLng.lat, lng: event.detail.latLng.lng }
        updatePosition(newPos, true)
    }

    const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        updatePosition(newPos, true)
    }

    return (
        <>
            <div className="mb-4">
                <AddressAutocompleteGoogle
                    value={addressFromForm || ''}
                    onChange={value => form.setFieldValue('address', value)}
                    onPlaceSelected={place => {
                        if (!place.geometry?.location) return
                        const newPos = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        }
                        updatePosition(newPos, false)
                        form.setFieldValue('address', place.formatted_address || '')
                    }}
                />
            </div>
            <Row gutter={16} className="mb-4">
                <Col span={12}>
                    <Form.Item label={<span className="font-medium">Vĩ độ (Latitude)</span>}>
                        <Input value={markerPos.lat} disabled />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={<span className="font-medium">Kinh độ (Longitude)</span>}>
                        <Input value={markerPos.lng} disabled />
                    </Form.Item>
                </Col>
            </Row>
            <div className="w-full h-100 rounded-lg overflow-hidden shadow-sm border">
                <Map
                    defaultCenter={markerPos}
                    defaultZoom={ZOOM_SIZE.SMALL}
                    mapId={app.GOOGLE_MAPS_MAP_ID}
                    onClick={handleMapClick}
                    className="w-full h-full"
                    gestureHandling={'cooperative'}
                    zoomControl={true}>
                    <AdvancedMarker position={markerPos} draggable onDragEnd={handleMarkerDragEnd} />
                    <MapController pos={markerPos} />
                </Map>
            </div>
        </>
    )
}

const BaseLocationGoogle: React.FC = () => {
    return (
        <>
            <Form.Item name="latitude" hidden>
                <Input />
            </Form.Item>
            <Form.Item name="longitude" hidden>
                <Input />
            </Form.Item>
            <APIProvider apiKey={app.GOOGLE_MAPS_API_KEY} libraries={['places', 'geocoding']}>
                <BaseLocationContent />
            </APIProvider>
        </>
    )
}

export default BaseLocationGoogle
