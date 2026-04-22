import React from 'react'
import { app } from '@/config/app'
import BaseLocationGoogle from '@/components/base/BaseLocationGoogle'
import BaseLocationLeaflet from '@/components/base/BaseLocationLeaflet'

const BaseLocation: React.FC = () => {
    const mapProvider = app.MAP_PROVIDER

    if (mapProvider === 'leaflet') {
        return <BaseLocationLeaflet />
    }

    return <BaseLocationGoogle />
}

export default BaseLocation
