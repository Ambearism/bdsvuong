import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Checkbox, Col, Divider, Form, Input, Row, Select, Space, Tabs, Typography } from 'antd'
import type { FormInstance } from 'antd'
import { useGetProjectListQuery } from '@/api/project'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import ImageUploader from '@/components/uploads/ImageUploader'
import Tour360Upload from '@/components/uploads/Tour360Upload'
import { app } from '@/config/app'
import { IMAGE_TYPE, REGEX_SLUG } from '@/config/constant'
import type { Tour360Base } from '@/types/tour360'
import SeoFormInputs from '@/components/seo-form-inputs'
import { slugify } from '@/utils/slugify'

const { Title } = Typography

type Tour360FormProps = {
    form: FormInstance
    initialValues?: Tour360Base
    onFinish: (values: Tour360Base) => Promise<Tour360Base | void>
    onCancel?: () => void
    loading?: boolean
    isEdit?: boolean
}

const Tour360Form: React.FC<Tour360FormProps> = ({
    form,
    initialValues,
    onFinish,
    onCancel,
    loading = false,
    isEdit = false,
}) => {
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>(initialValues?.zone_province_id)
    const [zipUrl, setZipUrl] = useState<string | undefined>(initialValues?.zip_url)
    const [tempPath, setTempPath] = useState<string | undefined>()
    const [tourId, setTourId] = useState<number | undefined>(initialValues?.id)

    const nameFolder = Form.useWatch('name_folder', form)

    const { data: provinceData, isLoading: loadingProvinces } = useGetProvinceListQuery({ is_option: true })
    const { data: wardData, isLoading: loadingWards } = useGetWardsByProvinceIdQuery(
        { province_id: selectedProvince!, is_option: true },
        {
            skip: !selectedProvince,
        },
    )
    const { data: enumData, isLoading: loadingEnums } = useGetEnumOptionsQuery(['view_types', 'product_types'])
    const { data: projectListData, isLoading: loadingProjects } = useGetProjectListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
        is_option: true,
    })

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                project_ids: initialValues.projects?.map(p => p.id) ?? [],
            })
            setSelectedProvince(initialValues.zone_province_id)
            setZipUrl(initialValues.zip_url)
            setTourId(initialValues.id)
        } else {
            form.setFieldsValue({
                category_id: app.DEFAULT_CATEGORY,
            })
        }
    }, [initialValues, form])

    useEffect(() => {
        if (initialValues && selectedProvince === initialValues.zone_province_id) return
        form.resetFields(['zone_ward_id'])
    }, [selectedProvince, form, initialValues])

    const projectOptions = useMemo(() => {
        if (!projectListData?.data?.items) return []
        return projectListData.data.items
    }, [projectListData])

    const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldsValue({ name_folder: slugify(e.target.value?.trim() || '') })
    }

    const handleFinish = async (values: Tour360Base) => {
        const finalValues = { ...values }

        if (tempPath) {
            finalValues.temp_path = tempPath
        }
        delete finalValues.zip_url

        const savedRecord = await onFinish(finalValues)

        if (savedRecord?.id) {
            setTourId(savedRecord.id)
        }
    }

    const tabItems = [
        {
            key: 'basic-info',
            label: 'Thông tin cơ bản',
            children: (
                <div>
                    <Card size="small" className="!rounded-tl-none mb-4">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="display_name"
                                    label="Tên hiển thị"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên hiển thị' },
                                        { max: 255, message: 'Tối đa 255 ký tự' },
                                        { whitespace: true, message: 'Không được chỉ chứa khoảng trắng' },
                                    ]}>
                                    <Input placeholder="Nhập tên hiển thị" onChange={handleDisplayNameChange} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name_folder"
                                    label="Tên thư mục (Viết theo url)"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên thư mục' },
                                        { max: 255, message: 'Tối đa 255 ký tự' },
                                        {
                                            pattern: REGEX_SLUG,
                                            message: 'Chỉ được dùng chữ cái, số, gạch dưới (_), gạch ngang (-)',
                                        },
                                        { whitespace: true, message: 'Không được chỉ chứa khoảng trắng' },
                                    ]}>
                                    <Input placeholder="ten-thu-muc" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="category_id"
                                    label="Danh mục"
                                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                                    <Select
                                        placeholder="-- Chọn danh mục --"
                                        loading={loadingEnums}
                                        allowClear
                                        optionFilterProp="label"
                                        options={enumData?.data?.view_types}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="type_id"
                                    label="Loại hình"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại hình' }]}>
                                    <Select
                                        placeholder="Chọn loại hình"
                                        loading={loadingEnums}
                                        allowClear
                                        optionFilterProp="label"
                                        options={enumData?.data?.product_types}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="divisive"
                                    label="Phân khu"
                                    rules={[
                                        { max: 255, message: 'Tối đa 255 ký tự' },
                                        { whitespace: true, message: 'Không được chỉ chứa khoảng trắng' },
                                    ]}>
                                    <Input placeholder="Nhập phân khu" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="publish" valuePropName="checked">
                                    <Checkbox disabled={!zipUrl && !tempPath}>Xuất bản</Checkbox>
                                </Form.Item>
                                {!zipUrl && !tempPath && (
                                    <div className="text-red-500 text-sm -mt-3 mb-3">
                                        * Cần hoàn thiện upload tour 360 để xuất bản
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card>

                    <Divider />
                    <Title level={5}>Upload Tour 360</Title>
                    <Tour360Upload nameFolder={nameFolder} onUploadComplete={setTempPath} currentZipUrl={zipUrl} />
                </div>
            ),
        },
        {
            key: 'location-links',
            label: 'Vị trí & Liên kết',
            children: (
                <div>
                    <Card size="small" className="!rounded-tl-none">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="zone_province_id" label="Tỉnh/Thành phố">
                                    <Select
                                        placeholder="Chọn Tỉnh/TP"
                                        loading={loadingProvinces}
                                        onChange={setSelectedProvince}
                                        allowClear
                                        optionFilterProp="label"
                                        options={provinceData?.data?.items?.map(p => ({ value: p.id, label: p.name }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="zone_ward_id" label="Phường/Xã">
                                    <Select
                                        placeholder="Chọn Phường/Xã"
                                        disabled={!selectedProvince}
                                        loading={loadingWards}
                                        allowClear
                                        optionFilterProp="label"
                                        options={wardData?.data?.items?.map(w => ({ value: w.id, label: w.name }))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="project_ids" label="Dự án liên quan">
                            <Select
                                mode="multiple"
                                placeholder="Chọn dự án"
                                loading={loadingProjects}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={projectOptions.map(p => ({ value: p.id, label: p.name }))}
                            />
                        </Form.Item>
                    </Card>
                </div>
            ),
        },
        {
            key: 'seo',
            label: 'SEO',
            children: <SeoFormInputs />,
        },
        {
            key: 'thumbnail',
            label: 'Ảnh đại diện',
            children: (
                <Form.Item name="thumbnail_image">
                    <ImageUploader
                        itemId={tourId}
                        imageType={IMAGE_TYPE.TOUR360_THUMBNAIL}
                        folder="tour360"
                        isPublic={true}
                    />
                </Form.Item>
            ),
        },
    ]

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            size="middle"
            scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}>
            <Card className="shadow-lg">
                <Title level={4}>{isEdit ? 'Cập nhật Tour 360' : 'Tạo mới Tour 360'}</Title>
                <Tabs items={tabItems} defaultActiveKey="basic-info" />

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Row justify="center">
                        <Space size="middle">
                            <Button onClick={onCancel} block>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading} block>
                                {isEdit ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Row>
                </Form.Item>
            </Card>
        </Form>
    )
}

export default Tour360Form
