import axios from 'axios'

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

export interface NominatimPlace {
    display_name: string
    lat: string
    lon: string
    address?: {
        [key: string]: string
    }
}

export const searchAddress = async (query: string): Promise<NominatimPlace[]> => {
    if (!query) return []
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
        params: {
            format: 'json',
            q: query,
            addressdetails: 1,
            limit: 5,
            countrycodes: 'vn',
        },
    })
    return response.data
}

export const reverseGeocode = async (lat: number, lon: number): Promise<NominatimPlace> => {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
        params: {
            format: 'json',
            lat,
            lon,
            addressdetails: 1,
        },
    })
    return response.data
}
