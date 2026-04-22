import React from 'react'
import { useNavigate } from 'react-router'
import { message, Form, Breadcrumb, Card, Space } from 'antd'
import { useCreateCategoryMutation, useGetCategoryListQuery } from '@/api/category'
import CategoryForm from '@/components/forms/CategoryForm'
import { GoHome } from 'react-icons/go'
import type { CategoryCreateInput, CategoryType } from '@/types/category'
import Loading from '@/components/Loading'
import { CATEGORY_MAP } from '@/config/constant'

type CreateCategoryProps = {
    pageTitle: string
    categoryType: CategoryType
    baseRoute: string
    projectId?: number
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ pageTitle, categoryType, baseRoute, projectId }) => {
    const navigate = useNavigate()
    const [form] = Form.useForm()

    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()

    const { data: categoryListData, isLoading: isLoadingCategories } = useGetCategoryListQuery({
        type: CATEGORY_MAP[categoryType].value,
        accept_news: CATEGORY_MAP[categoryType].acceptNews,
        project_id: CATEGORY_MAP[categoryType].requireProjectId ? projectId : undefined,
    })

    const handleFinish = async (values: CategoryCreateInput | Partial<CategoryCreateInput>) => {
        try {
            const payload = {
                ...values,
                type: CATEGORY_MAP[categoryType].value,
                accept_news: CATEGORY_MAP[categoryType].acceptNews,
            } as CategoryCreateInput

            if (projectId && CATEGORY_MAP[categoryType].requireProjectId) {
                payload.project_id = projectId
            }

            await createCategory(payload).unwrap()
            message.success(`Tạo danh mục "${values.name}" thành công!`)
            navigate(baseRoute)
        } catch {
            message.error('Tạo danh mục thất bại!')
        }
    }

    const handleCancel = () => {
        navigate(baseRoute)
    }

    if (isLoadingCategories) {
        return <Loading />
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card size="small">
                <Space direction="vertical" className="w-full">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: pageTitle,
                                className: 'text-md font-medium',
                                href: baseRoute,
                            },
                            {
                                title: 'Tạo danh mục',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Space>
            </Card>
            <CategoryForm
                form={form}
                onFinish={handleFinish}
                onCancel={handleCancel}
                loading={isCreating}
                categoryType={CATEGORY_MAP[categoryType].value}
                defaultProjectId={projectId}
                categories={categoryListData?.data?.items || []}
                loadingCategories={isLoadingCategories}
            />
        </Space>
    )
}

export default CreateCategory
