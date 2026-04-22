import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { message, Form, Breadcrumb, Card, Space } from 'antd'
import CategoryForm from '@/components/forms/CategoryForm'
import { useUpdateCategoryMutation, useGetCategoryListQuery, useGetCategoryDetailQuery } from '@/api/category'
import type { CategoryType, CategoryUpdateInput } from '@/types/category'
import { GoHome } from 'react-icons/go'
import Loading from '@/components/Loading'
import { CATEGORY_MAP } from '@/config/constant'

type UpdateCategoryProps = {
    pageTitle: string
    categoryType: CategoryType
    baseRoute: string
    projectId?: number
}

const UpdateCategory: React.FC<UpdateCategoryProps> = ({ pageTitle, categoryType, baseRoute, projectId }) => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const { categoryId } = useParams<{ categoryId: string }>()

    const categoryConfig = CATEGORY_MAP[categoryType]
    const categoryTypeValue = categoryConfig.value
    const requireProjectId = categoryConfig.requireProjectId
    const acceptNews = categoryConfig.acceptNews

    const { data: categoryToEdit, isLoading: isLoadingDetails } = useGetCategoryDetailQuery(
        { category_id: Number(categoryId) },
        {
            skip: !categoryId,
            refetchOnMountOrArgChange: true,
        },
    )

    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()

    const { data: categoryListData, isLoading: isLoadingCategories } = useGetCategoryListQuery({
        type: categoryTypeValue,
        accept_news: acceptNews,
        project_id: requireProjectId ? projectId : undefined,
    })

    useEffect(() => {
        if (categoryToEdit?.data) {
            form.setFieldsValue(categoryToEdit.data)
        }
    }, [categoryToEdit, form])

    const handleFinish = async (values: CategoryUpdateInput) => {
        if (!categoryId) return

        try {
            const payload: CategoryUpdateInput = {
                ...values,
                type: categoryTypeValue,
                accept_news: acceptNews,
            }

            if (projectId && requireProjectId) {
                payload.project_id = projectId
            }

            await updateCategory({
                category_id: Number(categoryId),
                payload,
            }).unwrap()

            message.success(`Cập nhật danh mục "${values.name}" thành công!`)
            navigate(baseRoute)
        } catch {
            message.error('Cập nhật danh mục thất bại!')
        }
    }

    const handleCancel = () => navigate(baseRoute)

    if (isLoadingDetails || isLoadingCategories) {
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
                                title: 'Chỉnh sửa danh mục',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Space>
            </Card>
            <CategoryForm
                form={form}
                isEdit={true}
                onFinish={handleFinish}
                onCancel={handleCancel}
                loading={isUpdating}
                categoryType={categoryTypeValue}
                categories={categoryListData?.data?.items || []}
                loadingCategories={isLoadingCategories}
            />
        </Space>
    )
}

export default UpdateCategory
