import type { CreateImage360Request } from '@/types/image-360'

export const useImage360Fields = () => {
    return {
        basicInfo: ['title', 'slug', 'description'] as (keyof CreateImage360Request)[],
        productInfo: ['province_id', 'ward_id', 'type_product_id', 'area_m2', 'latitude', 'longitude'],
        seo: ['seo_title', 'seo_description', 'seo_keywords'],
        image360: ['panorama_url', 'thumbnail_url', 'initial_view'],
    }
}
