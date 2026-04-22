import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AddressAutocompleteLeaflet from '@/components/map/AddressAutocompleteLeaflet'
import { HA_NOI_LOCATION, ZOOM_SIZE } from '@/config/constant'
import { Col, Form, Input, message, Row } from 'antd'
import { useDebounce } from '@/hooks/useDebounce'
import { reverseGeocode as fetchReverseGeocode, searchAddress } from '@/api/map'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const MapController = ({ center }: { center: [number, number] }) => {
    const map = useMap()

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom())
            setTimeout(() => {
                map.invalidateSize()
            }, 100)
        }
    }, [center, map])

    return null
}

const BaseLocationLeafletContent: React.FC = () => {
    const form = Form.useFormInstance()

    const latitude = Form.useWatch('latitude', form)
    const longitude = Form.useWatch('longitude', form)
    const addressFromForm = Form.useWatch('address', form)

    const [markerPos, setMarkerPos] = useState<[number, number]>([HA_NOI_LOCATION.LAT, HA_NOI_LOCATION.LONG])

    const debouncedAddress = useDebounce(addressFromForm, 1000)
    const lastGeocodedAddress = useRef<string>('')

    const reverseGeocode = useCallback(
        async (lat: number, lng: number) => {
            try {
                const data = await fetchReverseGeocode(lat, lng)
                if (data && data.display_name) {
                    lastGeocodedAddress.current = data.display_name
                    form.setFieldsValue({ address: data.display_name })
                }
            } catch {
                message.error('Không thể lấy địa chỉ từ vị trí này')
            }
        },
        [form],
    )

    const updatePosition = useCallback(
        (lat: number, lng: number, shouldReverseGeocode = false) => {
            setMarkerPos([lat, lng])
            form.setFieldsValue({
                latitude: lat,
                longitude: lng,
            })
            if (shouldReverseGeocode) {
                reverseGeocode(lat, lng)
            }
        },
        [form, reverseGeocode],
    )

    const geocodeAddress = useCallback(
        async (address: string) => {
            if (!address || address === lastGeocodedAddress.current) return
            try {
                const data = await searchAddress(address)
                if (data && data[0]) {
                    const lat = parseFloat(data[0].lat)
                    const lng = parseFloat(data[0].lon)
                    updatePosition(lat, lng, false)
                    lastGeocodedAddress.current = address
                }
            } catch {
                message.error('Không thể tìm thấy vị trí từ địa chỉ đã nhập')
            }
        },
        [updatePosition],
    )

    useEffect(() => {
        if (debouncedAddress) {
            geocodeAddress(debouncedAddress)
        }
    }, [debouncedAddress, geocodeAddress])

    useEffect(() => {
        if (latitude && longitude) {
            setMarkerPos([latitude, longitude])
        }
    }, [latitude, longitude])

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                updatePosition(e.latlng.lat, e.latlng.lng, true)
            },
        })
        return null
    }

    const handleMarkerDragEnd = (event: L.LeafletEvent) => {
        const marker = event.target as L.Marker
        if (marker != null) {
            const { lat, lng } = marker.getLatLng()
            updatePosition(lat, lng, true)
        }
    }

    return (
        <>
            <div className="mb-4">
                <AddressAutocompleteLeaflet
                    value={addressFromForm || ''}
                    onChange={value => form.setFieldValue('address', value)}
                    onPlaceSelected={place => {
                        updatePosition(place.lat, place.lng, false)
                        lastGeocodedAddress.current = place.address
                        form.setFieldValue('address', place.address)
                    }}
                />
            </div>
            <Row gutter={16} className="mb-4">
                <Col span={12}>
                    <Form.Item name="latitude" label={<span className="font-medium">Vĩ độ (Latitude)</span>}>
                        <Input
                            type="number"
                            step="any"
                            onChange={e => {
                                const val = parseFloat(e.target.value)
                                if (!isNaN(val)) {
                                    setMarkerPos([val, markerPos[1]])
                                }
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="longitude" label={<span className="font-medium">Kinh độ (Longitude)</span>}>
                        <Input
                            type="number"
                            step="any"
                            onChange={e => {
                                const val = parseFloat(e.target.value)
                                if (!isNaN(val)) {
                                    setMarkerPos([markerPos[0], val])
                                }
                            }}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md border relative z-0">
                <MapContainer
                    center={markerPos}
                    zoom={ZOOM_SIZE.SMALL}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={markerPos} draggable={true} eventHandlers={{ dragend: handleMarkerDragEnd }} />
                    <MapController center={markerPos} />
                    <MapEvents />
                </MapContainer>
            </div>
        </>
    )
}

const BaseLocationLeaflet: React.FC = () => {
    return (
        <>
            <BaseLocationLeafletContent />
        </>
    )
}

export default BaseLocationLeaflet
