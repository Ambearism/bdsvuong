import React from 'react'
import { useParams } from 'react-router'
import CreateCategory from '@/components/categories/CreateCategory'
import { CATEGORY_MAP } from '@/config/constant'

const CreateProjectCategory: React.FC = () => {
    const { project_id } = useParams<{ project_id: string }>()

    return (
        <CreateCategory
            pageTitle="Danh mục dự án"
            categoryType={CATEGORY_MAP.PROJECT.value}
            baseRoute={`/projects/${project_id}/categories`}
            projectId={project_id ? Number(project_id) : undefined}
        />
    )
}

export default CreateProjectCategory
