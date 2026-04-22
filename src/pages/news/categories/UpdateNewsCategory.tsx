import UpdateCategory from '@/components/categories/UpdateCategory'
import { CATEGORY_MAP } from '@/config/constant'
import React from 'react'

const UpdateNewsCategory: React.FC = () => {
    return (
        <UpdateCategory
            pageTitle="Danh mục bài viết"
            categoryType={CATEGORY_MAP.NEWS.value}
            baseRoute={`/news/categories`}
        />
    )
}

export default UpdateNewsCategory
