import React, { useEffect, useMemo, useRef } from 'react'
import { Form, Input, TreeSelect, Button, Row, Col, Checkbox, Radio, Space, Card, Typography, Divider } from 'antd'
import type { FormInstance } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { TextEditor } from '@/components/tiptap'
import ImageUploader, { type ImageUploaderRef } from '@/components/uploads/ImageUploader'
import { useGetCategoryListQuery } from '@/api/category'
import { useGetProjectListQuery } from '@/api/project'
import type { NewsCreateInput } from '@/types/news'
import type { CategoryItem } from '@/types/category'
import { CATEGORY_MAP, IMAGE_TYPE, REGEX_SLUG } from '@/config/constant'
import dayjs from 'dayjs'
import { app } from '@/config/app'
import type { RcFile } from 'antd/es/upload'
import { slugify } from '@/utils/slugify'

const { Title } = Typography
const { Text } = Typography

export type NewsFormValues = NewsCreateInput & {
    id?: number
    created_at?: string
    updated_at?: string
    scheduled_at?: dayjs.Dayjs
}

type NewsFormProps = {
    form: FormInstance
    initialValues?: NewsFormValues
    onFinish: (values: NewsCreateInput, imageFile?: RcFile | null) => void
    onCancel?: () => void
    loading?: boolean
    isEdit?: boolean
    onValuesChange?: () => void
}

const filterCategoriesByAcceptNews = (categories: CategoryItem[]): CategoryItem[] => {
    return categories
        .filter(cat => cat.accept_news)
        .map(cat => ({
            ...cat,
            children: cat.children && cat.children.length > 0 ? filterCategoriesByAcceptNews(cat.children) : undefined,
        }))
}

const CounterSuffix: React.FC<{ count: number }> = ({ count }) => (
    <>
        <span className="mr-1 text-gray-600">{count}</span>
        <DownOutlined />
    </>
)

const NewsForm: React.FC<NewsFormProps> = ({
    form,
    initialValues,
    onFinish,
    onCancel,
    loading,
    isEdit = false,
    onValuesChange,
}) => {
    const imageUploaderRef = useRef<ImageUploaderRef>(null)
    const [imageError, setImageError] = React.useState<string>('')
    const [descriptionError, setDescriptionError] = React.useState<string>('')
    const [briefError, setBriefError] = React.useState<string>('')
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState<boolean>(false)

    const { data: projectListData, isLoading: loadingProjects } = useGetProjectListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
    })

    const writeForProject = Form.useWatch('for_project', form)
    const selectedProjects = Form.useWatch('project_ids', form) || []
    const selectedCategories = Form.useWatch('category_ids', form) || []

    const isProjectMode = !!(writeForProject || initialValues?.project_ids?.length)

    const categoryType = CATEGORY_MAP.NEWS
    const { data: categoriesData, isLoading: loadingCategories } = useGetCategoryListQuery(
        {
            type: categoryType.value,
            accept_news: categoryType.acceptNews,
        },
        { skip: !categoryType },
    )

    const { data: projectCategoriesData, isFetching: fetchingProjectCategories } = useGetCategoryListQuery(
        {
            type: CATEGORY_MAP.PROJECT.value,
            accept_news: true,
            project_id: selectedProjects?.[0],
        },
        { skip: !writeForProject || !selectedProjects?.length },
    )

    useEffect(() => {
        if (!writeForProject) {
            form.setFieldsValue({ project_ids: [], project_category_ids: [] })
        }
    }, [writeForProject, form])

    useEffect(() => {
        if (initialValues) {
            const transformedValues = {
                ...initialValues,
                scheduled_at: initialValues.updated_at ? dayjs(initialValues.updated_at) : undefined,
            }
            form.setFieldsValue(transformedValues)
        }
    }, [initialValues, form])

    const categoryTreeData = useMemo(() => {
        const items = categoriesData?.data?.items || []
        if (!items.length) return []
        return filterCategoriesByAcceptNews(items)
    }, [categoriesData])

    const projectTreeData = useMemo(() => {
        const items = projectListData?.data?.items || []
        return items
    }, [projectListData])

    const projectCategoryTreeData = useMemo(() => {
        const items = projectCategoriesData?.data?.items || []
        if (!items.length) return []
        return filterCategoriesByAcceptNews(items)
    }, [projectCategoriesData])

    const shouldShowProjectCategories = useMemo(() => {
        return projectCategoryTreeData.length > 0
    }, [projectCategoryTreeData])

    const handleNewsNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldsValue({ name_slug: slugify(e.target.value?.trim() || '') })
    }

    const handleFinish = async (values: NewsFormValues) => {
        setHasAttemptedSubmit(true)
        const finalValues = { ...values }

        if (!finalValues.scheduled_at) {
            delete finalValues.scheduled_at
        }

        if (!isProjectMode) {
            delete finalValues.project_ids
            delete finalValues.project_category_ids
            delete finalValues.for_project
        }

        const imageFile = imageUploaderRef.current?.getSelectedFile()
        onFinish(finalValues as NewsCreateInput, imageFile)
    }

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            initialValues={initialValues}
            onValuesChange={changedValues => {
                if (changedValues.project_ids) {
                    form.setFieldsValue({ project_category_ids: [] })
                }
                onValuesChange?.()
            }}
            size="middle"
            scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card styles={{ body: { padding: 16 } }} className="h-full shadow-lg">
                        <Title level={5}>Thông tin cơ bản</Title>
                        <Divider />

                        <Form.Item
                            name="name"
                            label="Tiêu đề"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tiêu đề!' },
                                { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự!' },
                                { max: 255, message: 'Tiêu đề không được vượt quá 255 ký tự!' },
                                { whitespace: true, message: 'Tiêu đề không được chỉ chứa khoảng trắng!' },
                            ]}>
                            <Input
                                placeholder="Nhập tiêu đề bài viết"
                                onChange={handleNewsNameChange}
                                showCount
                                maxLength={255}
                            />
                        </Form.Item>

                        <Form.Item
                            name="name_slug"
                            label="Liên kết tĩnh"
                            rules={[
                                { max: 255, message: 'Liên kết tĩnh không được vượt quá 255 ký tự!' },
                                {
                                    pattern: REGEX_SLUG,
                                    message: 'Liên kết tĩnh chỉ được chứa chữ cái, số, dấu gạch ngang, dấu gạch dưới!',
                                },
                            ]}>
                            <Input placeholder="auto-generate-from-title" />
                        </Form.Item>

                        <Form.Item
                            name="tags"
                            label="Tags"
                            rules={[{ max: 500, message: 'Tags không được vượt quá 500 ký tự!' }]}>
                            <Input placeholder="Nhập tags, phân cách bằng dấu phẩy" showCount maxLength={500} />
                        </Form.Item>

                        <Title level={5}>Nội dung chi tiết</Title>
                        <Divider />

                        <Form.Item
                            name="brief"
                            label="Tóm tắt"
                            validateTrigger={hasAttemptedSubmit ? ['onChange', 'onBlur'] : []}
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (value && value.length > 2000) {
                                            setBriefError('Tóm tắt không được vượt quá 2000 ký tự!')
                                            return Promise.reject(new Error('Tóm tắt không được vượt quá 2000 ký tự!'))
                                        }
                                        setBriefError('')
                                        return Promise.resolve()
                                    },
                                },
                            ]}>
                            <TextEditor hasError={!!briefError} />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Nội dung chính"
                            validateTrigger={hasAttemptedSubmit ? ['onChange', 'onBlur'] : []}
                            rules={[
                                {
                                    required: true,
                                    validator: async (_, value) => {
                                        if (!value) {
                                            setDescriptionError('Vui lòng nhập nội dung chính!')
                                            return Promise.reject(new Error('Vui lòng nhập nội dung chính!'))
                                        }
                                        const textContent = value.replace(/<[^>]*>/g, '').trim()
                                        if (!textContent) {
                                            setDescriptionError('Vui lòng nhập nội dung chính!')
                                            return Promise.reject(new Error('Vui lòng nhập nội dung chính!'))
                                        }
                                        setDescriptionError('')
                                        return Promise.resolve()
                                    },
                                },
                                { max: 50000, message: 'Nội dung không được vượt quá 50000 ký tự!' },
                            ]}>
                            <TextEditor hasError={!!descriptionError} />
                        </Form.Item>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" className="w-full">
                        <Card styles={{ body: { padding: 16 } }} className="bg-gray-50 shadow-lg">
                            <Title level={5}>
                                Ảnh đại diện <span className="text-red-500">*</span>
                            </Title>
                            <Divider />
                            <Text strong>Kích thước khuyến nghị 960 x 520 px.</Text>
                            <Form.Item
                                name="avatar_validator"
                                rules={[
                                    {
                                        validator: async () => {
                                            if (!imageUploaderRef.current?.hasImage()) {
                                                setImageError('Vui lòng chọn ảnh đại diện!')
                                                return Promise.reject()
                                            }
                                            setImageError('')
                                            return Promise.resolve()
                                        },
                                    },
                                ]}
                                className="!mb-0">
                                <ImageUploader
                                    ref={imageUploaderRef}
                                    itemId={initialValues?.id}
                                    imageType={IMAGE_TYPE.NEWS_THUMBNAIL}
                                    folder="news"
                                    isPublic={true}
                                    maxWidth={960}
                                    maxHeight={520}
                                    hasError={!!imageError}
                                    onChange={() => {
                                        setImageError('')
                                        form.validateFields(['avatar_validator'])
                                    }}
                                />
                            </Form.Item>
                            {imageError && <div className="mt-1 text-red-500">{imageError}</div>}
                        </Card>

                        <Card styles={{ body: { padding: 16 } }} className="bg-gray-50 shadow-lg">
                            <Title level={5}>Cài đặt hiển thị</Title>
                            <Divider />

                            <Form.Item name="for_project" valuePropName="checked">
                                <Checkbox>Viết bài cho dự án cụ thể</Checkbox>
                            </Form.Item>

                            {writeForProject && (
                                <>
                                    <Form.Item
                                        name="project_ids"
                                        label="Dự án"
                                        dependencies={['for_project']}
                                        rules={[{ required: true, message: 'Vui lòng chọn dự án!' }]}
                                        getValueProps={value => ({ value: value?.[0] })}
                                        normalize={value => (value ? [value] : [])}>
                                        <TreeSelect
                                            treeData={projectTreeData}
                                            placeholder="-- Chọn dự án --"
                                            loading={loadingProjects}
                                            allowClear
                                            showSearch
                                            showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                            className="w-full"
                                            treeNodeFilterProp="name"
                                            fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                                        />
                                    </Form.Item>

                                    {shouldShowProjectCategories && (
                                        <Form.Item name="project_category_ids" label="Danh mục thuộc Dự Án">
                                            <TreeSelect
                                                treeData={projectCategoryTreeData}
                                                placeholder="Chọn danh mục dự án"
                                                allowClear
                                                showSearch
                                                treeCheckable
                                                multiple
                                                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                                className="w-full"
                                                treeNodeFilterProp="name"
                                                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                                                loading={fetchingProjectCategories}
                                            />
                                        </Form.Item>
                                    )}
                                </>
                            )}

                            <Form.Item
                                name="category_ids"
                                label="Danh mục Tiện Ích"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục tiện ích!' }]}>
                                <TreeSelect
                                    treeData={categoryTreeData}
                                    placeholder="Chọn danh mục bài viết"
                                    loading={loadingCategories}
                                    allowClear
                                    showSearch
                                    treeCheckable
                                    multiple
                                    suffixIcon={<CounterSuffix count={selectedCategories.length} />}
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                    className="w-full"
                                    treeNodeFilterProp="name"
                                    fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                {/* <Col xs={10}>
                                    <Form.Item name="scheduled_at" label="Hẹn giờ đăng">
                                        <DatePicker showTime className="w-full" />
                                    </Form.Item>
                                </Col> */}
                                <Col xs={8}>
                                    <Form.Item name="publish" valuePropName="checked">
                                        <Checkbox>Xuất bản</Checkbox>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item name="is_hot" valuePropName="checked">
                                        <Checkbox>Nổi bật</Checkbox>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card styles={{ body: { padding: 16 } }} className="bg-gray-50 shadow-lg">
                            <Title level={5}>Hỗ trợ SEO</Title>
                            <Divider />

                            <Form.Item
                                name="seo_title"
                                label="SEO Title"
                                rules={[
                                    { max: 60, message: 'SEO Title không được vượt quá 60 ký tự!' },
                                    { min: 10, message: 'SEO Title nên có ít nhất 10 ký tự!' },
                                ]}>
                                <Input placeholder="50 ~ 60 ký tự" maxLength={60} showCount />
                            </Form.Item>

                            <Form.Item
                                name="seo_description"
                                label="SEO Description"
                                rules={[
                                    { max: 160, message: 'SEO Description không được vượt quá 160 ký tự!' },
                                    { min: 50, message: 'SEO Description nên có ít nhất 50 ký tự!' },
                                ]}>
                                <Input.TextArea rows={4} placeholder="150 ~ 160 ký tự" maxLength={160} showCount />
                            </Form.Item>

                            <Form.Item name="seo_robots" label="Meta robots">
                                <Radio.Group className="w-full">
                                    <Row gutter={[8, 8]}>
                                        <Col span={12}>
                                            <Radio value="index,follow">ALL</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="none">NONE</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="index">INDEX</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="noindex">NOINDEX</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="follow">FOLLOW</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="nofollow">NOFOLLOW</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="noindex,follow">NOINDEX, FOLLOW</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="index,nofollow">INDEX, NOFOLLOW</Radio>
                                        </Col>
                                    </Row>
                                </Radio.Group>
                            </Form.Item>
                        </Card>

                        <Card styles={{ body: { padding: 16 } }} className="shadow-lg">
                            <Form.Item className="!mb-0">
                                <Space direction="vertical" className="w-full">
                                    <Button type="primary" htmlType="submit" block loading={loading}>
                                        {isEdit ? 'Cập nhật' : 'Tạo mới'}
                                    </Button>
                                    <Button onClick={onCancel} block disabled={loading}>
                                        Quay lại
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </Form>
    )
}

export default NewsForm
