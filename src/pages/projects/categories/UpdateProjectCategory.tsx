import UpdateCategory from '@/components/categories/UpdateCategory'
import { CATEGORY_MAP } from '@/config/constant'
import React from 'react'
import { useParams } from 'react-router'

const UpdateProjectCategory: React.FC = () => {
    const { project_id } = useParams<{ project_id: string }>()

    return (
        <UpdateCategory
            pageTitle="Danh mục dự án"
            categoryType={CATEGORY_MAP.PROJECT.value}
            baseRoute={`/projects/${project_id}/categories`}
            projectId={Number(project_id)}
        />
    )
}

export default UpdateProjectCategory
