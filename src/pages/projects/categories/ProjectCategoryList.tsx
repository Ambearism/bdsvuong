import React from 'react'
import { useParams } from 'react-router'
import CategoryList from '@/components/categories/CategoryList'
import { CATEGORY_MAP } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const ProjectCategoryList: React.FC = () => {
    useDocumentTitle('Danh mục dự án')
    const { project_id } = useParams<{ project_id: string }>()

    return (
        <CategoryList
            pageTitle="Danh mục dự án"
            categoryType={CATEGORY_MAP.PROJECT.value}
            baseRoute={`/projects/${project_id}/categories`}
            projectId={project_id ? Number(project_id) : undefined}
        />
    )
}

export default ProjectCategoryList
