import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Space, Select, Row, Col, Radio, Checkbox, Typography, Divider } from 'antd'
import type { FormInstance } from 'antd'
import type { CategoryCreateInput, CategoryItem, CategoryUpdateInput } from '@/types/category'
import { useGetEnumOptionsQuery } from '@/api/types'
import { TextEditor } from '@/components/tiptap'
import { CATEGORY_MAP, REGEX_SLUG } from '@/config/constant'

const { Title } = Typography

type CategoryFormProps = {
    form: FormInstance
    initialValues?: Partial<CategoryItem>
    onFinish: (values: CategoryCreateInput | CategoryUpdateInput) => void
    onCancel: () => void
    loading?: boolean
    isEdit?: boolean
    categoryType: string
    categories?: CategoryItem[]
    loadingCategories?: boolean
    defaultProjectId?: number
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    form,
    initialValues,
    onFinish,
    onCancel,
    loading = false,
    isEdit = false,
    categoryType,
    categories = [],
    loadingCategories = false,
    defaultProjectId,
}) => {
    const { data: enumData, isLoading: isLoadingEnumData } = useGetEnumOptionsQuery([
        'category_status',
        'category_targets',
    ])

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues)
        } else {
            const defaults: Partial<CategoryCreateInput> = {}

            if (!isEdit && defaultProjectId && categoryType === CATEGORY_MAP.PROJECT.value) {
                defaults.project_id = defaultProjectId
            }

            if (!isEdit && categoryType === CATEGORY_MAP.NEWS.value) {
                defaults.accept_news = true
            }

            form.setFieldsValue({ ...(initialValues || {}), ...defaults })
        }
    }, [initialValues, defaultProjectId, isEdit, form, categoryType])

    const handleFinish = (formValues: CategoryCreateInput | CategoryUpdateInput) => {
        const finalValues = { ...formValues, type: categoryType }

        if (categoryType === CATEGORY_MAP.PROJECT.value && defaultProjectId) {
            finalValues.project_id = defaultProjectId
        }

        if (categoryType === CATEGORY_MAP.NEWS.value) {
            finalValues.accept_news = true
        } else {
            finalValues.accept_news = !!finalValues.accept_news
        }

        onFinish(finalValues)
    }

    const renderParentOptions = (cats: CategoryItem[], excludeId?: number) =>
        cats.filter(c => c.id !== excludeId).map(c => ({ value: c.id, label: c.name }))

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            initialValues={initialValues}
            size="middle"
            scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card styles={{ body: { padding: 16 } }} className="h-full shadow-lg">
                        <Title level={5}>Thông tin cơ bản</Title>
                        <Divider />

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name"
                                    label="Tên danh mục"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên danh mục!' },
                                        { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' },
                                        { max: 255, message: 'Tên danh mục không được vượt quá 255 ký tự!' },
                                        { whitespace: true, message: 'Tên danh mục không được chỉ chứa khoảng trắng!' },
                                    ]}>
                                    <Input placeholder="Nhập tên danh mục" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="parent_id" label="Danh mục cha">
                                    <Select
                                        placeholder="Chọn danh mục cha"
                                        loading={loadingCategories}
                                        allowClear
                                        showSearch
                                        options={renderParentOptions(categories, initialValues?.id)}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name_id"
                                    label="Liên kết tĩnh"
                                    rules={[
                                        { max: 255, message: 'Liên kết tĩnh không được vượt quá 255 ký tự!' },
                                        {
                                            pattern: REGEX_SLUG,
                                            message:
                                                'Liên kết tĩnh chỉ được chứa chữ cái, số, dấu gạch ngang, dấu gạch dưới!',
                                        },
                                    ]}>
                                    <Input placeholder="auto-generate-from-name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="url"
                                    label="Đường dẫn"
                                    rules={[
                                        { max: 500, message: 'Đường dẫn không được vượt quá 500 ký tự!' },
                                        {
                                            pattern: /^\/[a-z0-9-/]*$/,
                                            message:
                                                'Đường dẫn phải bắt đầu bằng / và chỉ chứa chữ thường, số, gạch ngang!',
                                        },
                                    ]}>
                                    <Input placeholder="/duong-dan" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="status"
                                    label="Trạng thái"
                                    initialValue="SHOW"
                                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                                    <Select loading={isLoadingEnumData} options={enumData?.data.category_status} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="position"
                                    label="Vị trí"
                                    rules={[
                                        { type: 'number', min: 0, message: 'Vị trí phải là số không âm!' },
                                        { type: 'number', max: 9999, message: 'Vị trí không được vượt quá 9999!' },
                                        {
                                            whitespace: true,
                                            message: 'Vị trí không được chỉ chứa khoảng trắng.',
                                        },
                                    ]}>
                                    <Input className="w-full" placeholder="Tự động" min={0} max={9999} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="target"
                                    label="Target"
                                    initialValue="_self"
                                    rules={[{ required: true, message: 'Vui lòng chọn target!' }]}>
                                    <Select loading={isLoadingEnumData} options={enumData?.data.category_targets} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="accept_news" valuePropName="checked">
                                    <Checkbox disabled={categoryType === CATEGORY_MAP.NEWS.value}>
                                        Được thêm bài
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12} className="text-right">
                                <Form.Item name="is_home" valuePropName="checked">
                                    <Checkbox>Hiển thị ở trang chủ</Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Title level={5}>Nội dung mô tả</Title>
                        <Divider />

                        <Form.Item
                            name="description"
                            label="Nội dung"
                            rules={[{ max: 5000, message: 'Nội dung mô tả không được vượt quá 5000 ký tự!' }]}>
                            <TextEditor />
                        </Form.Item>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" className="w-full">
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

                            <Form.Item
                                name="seo_keywords"
                                label="SEO Keywords"
                                rules={[{ max: 255, message: 'SEO Keywords không được vượt quá 255 ký tự!' }]}>
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Phân cách bằng dấu phẩy"
                                    maxLength={255}
                                    showCount
                                />
                            </Form.Item>

                            <Form.Item
                                name="seo_robots"
                                label="Meta robots"
                                rules={[{ required: true, message: 'Vui lòng chọn Meta robots!' }]}
                                initialValue="index,follow">
                                <Radio.Group className="w-full">
                                    <Row gutter={[8, 8]}>
                                        <Col span={12}>
                                            <Radio value="index,follow">ALL</Radio>
                                        </Col>
                                        <Col span={12}>
                                            <Radio value="noindex,nofollow">NONE</Radio>
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
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space direction="vertical" className="w-full">
                                    <Button type="primary" htmlType="submit" loading={loading} block>
                                        {isEdit ? 'Lưu' : 'Tạo mới'}
                                    </Button>
                                    <Button onClick={onCancel} block>
                                        Hủy
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

export default CategoryForm
