import React from 'react'
import CreateCategory from '@/components/categories/CreateCategory'
import { CATEGORY_MAP } from '@/config/constant'

const CreateNewsCategory: React.FC = () => {
    return (
        <CreateCategory
            pageTitle="Danh mục bài viết"
            categoryType={CATEGORY_MAP.NEWS.value}
            baseRoute={`/news/categories`}
        />
    )
}

export default CreateNewsCategory
