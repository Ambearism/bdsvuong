import React from 'react'
import CategoryList from '@/components/categories/CategoryList'
import { CATEGORY_MAP } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const NewsCategoryList: React.FC = () => {
    useDocumentTitle('Danh mục tin tức')
    return (
        <CategoryList
            pageTitle="Danh mục bài viết"
            categoryType={CATEGORY_MAP.NEWS.value}
            baseRoute="/news/categories"
        />
    )
}

export default NewsCategoryList
