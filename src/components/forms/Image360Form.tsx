import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Card, Form, Input, Row, Col, Button, Tabs, Upload, message, Select, Checkbox, Popconfirm, Flex } from 'antd'
import type { FormInstance, UploadFile, UploadProps } from 'antd'
import type { CreateImage360Request, Image360InitialView, Image360Item } from '@/types/image-360'
import { DeleteOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons'
import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'
import { TextEditor } from '@/components/tiptap'
import { useGetEnumOptionsQuery } from '@/api/types'
import { app } from '@/config/app'
import { REGEX_SLUG } from '@/config/constant'
import { useDeleteImageByPathMutation } from '@/api/image'
import { useImage360Fields } from '@/hooks/fields/useImage360Fields'
import { useGetAlbumListQuery } from '@/api/album'
import { slugify } from '@/utils/slugify'

const { TextArea } = Input

type Props = {
    form: FormInstance<CreateImage360Request>
    onFinish: (
        values: CreateImage360Request & {
            panoFile?: File
            thumbFile?: File
        },
    ) => void
    initialValues?: Image360Item
    onCancel?: () => void
    loading?: boolean
}

type FieldError = {
    name: (string | number)[]
    errors: string[]
}

const Image360Form: React.FC<Props> = ({ form, onFinish, initialValues, onCancel, loading }) => {
    const [page] = useState<number>(app.DEFAULT_PAGE)
    const [activeTabKey, setActiveTabKey] = useState('basicInfo')
    const [tabErrorState, setTabErrorState] = useState<Record<string, boolean>>({
        basicInfo: false,
        productInfo: false,
        seo: false,
        image360: false,
    })
    const [image360FileList, setImage360FileList] = useState<UploadFile[]>([])
    const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([])
    const viewerRef = useRef<Viewer | null>(null)
    const panoContainerRef = useRef<HTMLDivElement | null>(null)
    const [currentImage360Url, setCurrentImage360Url] = useState<string | null>(null)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const initialView = Form.useWatch('initial_view', form) as Image360InitialView | undefined

    const { data: enumData, isLoading: loadingEnums } = useGetEnumOptionsQuery(['view_types', 'product_types'])
    const [deleteImageByPathApi] = useDeleteImageByPathMutation()
    const { data: albumList } = useGetAlbumListQuery({ page, is_option: true }, { refetchOnMountOrArgChange: true })
    const image360Fields = useImage360Fields()

    useEffect(() => {
        if (enumData && initialValues) {
            form.setFieldsValue(initialValues)
            if (initialValues.panorama_url) setCurrentImage360Url(initialValues.panorama_url)
            if (initialValues.thumbnail_url) setThumbnailUrl(initialValues.thumbnail_url)
        } else if (enumData) {
            form.setFieldsValue({
                category_id: app.DEFAULT_CATEGORY,
            })
        }
    }, [enumData, initialValues, form])

    useEffect(() => {
        if (!panoContainerRef.current || !currentImage360Url) return

        viewerRef.current?.destroy()
        viewerRef.current = new Viewer({
            container: panoContainerRef.current,
            panorama: currentImage360Url,
            defaultYaw: initialView?.yaw ?? 0,
            defaultPitch: initialView?.pitch ?? 0,
            defaultZoomLvl: initialView?.fov ?? 70,
            navbar: ['zoom', 'fullscreen'],
        })
    }, [currentImage360Url, initialView])

    const handlePickDefaultView = () => {
        const viewer = viewerRef.current
        if (!viewer) {
            message.error('Chưa có ảnh 360 để chọn góc.')
            return
        }

        const position = viewer.getPosition()
        const viewObj: Image360InitialView = {
            yaw: position.yaw,
            pitch: position.pitch,
            fov: viewer.getZoomLevel(),
        }

        form.setFieldsValue({ initial_view: viewObj })
        message.success('Đã lưu góc mặc định.')
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldsValue({ slug: slugify(e.target.value?.trim() || '') })
    }

    const handleImage360Change: UploadProps['onChange'] = info => {
        const newFileList = info.fileList.map(file => {
            if (file.originFileObj) file.url = URL.createObjectURL(file.originFileObj)
            return file
        })
        setImage360FileList(newFileList)
        setCurrentImage360Url(newFileList[0]?.url ?? null)
    }

    const handleImageThumbnailChange: UploadProps['onChange'] = info => {
        const newFileList = info.fileList.map(file => {
            if (file.originFileObj) file.url = URL.createObjectURL(file.originFileObj)
            return file
        })
        setThumbnailFileList(newFileList)
        setThumbnailUrl(newFileList[0]?.url ?? null)
    }

    const handleDeleteImage360 = async () => {
        try {
            if (viewerRef.current) {
                viewerRef.current.destroy()
                viewerRef.current = null
            }

            setCurrentImage360Url(null)
            if (initialValues?.panorama_url) {
                await deleteImageByPathApi({ image_path: initialValues.panorama_url })
            }

            message.success('Xoá ảnh 360 thành công!')
        } catch {
            message.error('Xoá ảnh 360 thất bại!')
        }
    }

    const handleDeleteThumbnail = async () => {
        try {
            setThumbnailUrl(null)
            if (!initialValues?.thumbnail_url) return

            await deleteImageByPathApi({ image_path: initialValues.thumbnail_url })
            message.success('Xoá thumbnail thành công!')
        } catch {
            message.error('Xoá thumbnail thất bại!')
        }
    }

    const renderTabTitle = (key: string, title: string) => {
        const hasError = tabErrorState[key]
        return (
            <span className={`px-2 py-1 rounded ${hasError ? 'bg-red-100 text-red-700 font-semibold' : ''}`}>
                {title} {hasError && <WarningOutlined />}
            </span>
        )
    }

    const updateTabErrorState = useCallback(
        (errors: FieldError[]) => {
            const newErrorState: Record<string, boolean> = {}
            Object.entries(image360Fields).forEach(([tabKey, fields]) => {
                const hasError = errors.some(fieldError => {
                    const isError = fieldError.errors.length > 0
                    const fieldName = fieldError.name[0]
                    return isError && fields.includes(fieldName as keyof CreateImage360Request)
                })
                newErrorState[tabKey] = hasError
            })
            setTabErrorState(newErrorState)
            return newErrorState
        },
        [image360Fields],
    )

    const onFinishFailed = () => {
        form.validateFields()
            .then(() => {})
            .catch(info => {
                const newErrorState = updateTabErrorState(info.errorFields)
                const firstErrorTab = Object.keys(newErrorState).find(key => newErrorState[key])
                if (firstErrorTab) setActiveTabKey(firstErrorTab)
            })
    }

    const handleSubmit = async (values: CreateImage360Request) => {
        const panoFile = image360FileList[0]?.originFileObj
        const thumbFile = thumbnailFileList[0]?.originFileObj

        onFinish({
            ...values,
            panoFile,
            thumbFile,
        })
    }

    const BasicInfoTabContent = (
        <Row gutter={[16, 16]}>
            <Col span={16}>
                <Col span={24}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }, { max: 100 }]}>
                        <Input placeholder="Nhập tiêu đề" onChange={handleTitleChange} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        name="slug"
                        label="Liên kết tĩnh"
                        rules={[
                            { max: 100, message: 'Liên kết tĩnh không được vượt quá 100 ký tự!' },
                            {
                                pattern: REGEX_SLUG,
                                message: 'Liên kết tĩnh chỉ được chứa chữ cái, số, dấu gạch ngang, dấu gạch dưới!',
                            },
                        ]}>
                        <Input placeholder="Nhập liên kết tĩnh" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="description" label="Mô tả" rules={[{ max: 255 }]}>
                        <TextEditor />
                    </Form.Item>
                </Col>
            </Col>

            <Col span={8}>
                <Col span={24}>
                    <Form.Item
                        name="category_id"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                        <Select
                            placeholder="Chọn danh mục"
                            loading={loadingEnums}
                            allowClear
                            optionFilterProp="label"
                            showSearch
                            options={enumData?.data?.view_types}
                        />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        name="type_product_id"
                        label="Loại hình"
                        rules={[{ required: true, message: 'Vui lòng chọn loại hình' }]}>
                        <Select
                            placeholder="Chọn loại hình"
                            loading={loadingEnums}
                            allowClear
                            optionFilterProp="label"
                            showSearch
                            options={enumData?.data?.product_types}
                        />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="album_id" label="Chọn Album">
                        <Select
                            placeholder="Chọn ablum"
                            loading={loadingEnums}
                            allowClear
                            optionFilterProp="label"
                            showSearch
                            options={albumList?.data?.items.map(album => ({
                                value: album.id,
                                label: album.name,
                            }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="display_type" valuePropName="checked">
                        <Checkbox disabled={!currentImage360Url}>Xuất bản</Checkbox>
                    </Form.Item>
                    {!currentImage360Url && (
                        <div className="text-red-500 text-sm -mt-3 mb-3">
                            * Cần hoàn thiện upload ảnh 360 để xuất bản
                        </div>
                    )}
                </Col>
            </Col>
        </Row>
    )

    const SEOTabContent = (
        <Row gutter={[16, 16]}>
            <Col span={24}>
                <Form.Item name="seo_title" label="Title SEO" rules={[{ max: 60 }]}>
                    <Input placeholder="Nhập Title SEO (tối đa 60 ký tự)" />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item name="seo_description" label="Description SEO" rules={[{ max: 160 }]}>
                    <TextArea rows={3} placeholder="Nhập Description SEO (tối đa 160 ký tự)" />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item name="seo_keywords" label="Keywords SEO" rules={[{ max: 255 }]}>
                    <Input placeholder="Nhập Keywords SEO (tối đa 255 ký tự)" />
                </Form.Item>
            </Col>
        </Row>
    )

    const Image360TabContent = (
        <Row gutter={[16, 16]}>
            <Col span={16}>
                <Card title="Ảnh 360 (panorama)" size="small">
                    <Flex gap={16} align="center">
                        <Upload
                            maxCount={1}
                            accept="image/*"
                            fileList={image360FileList}
                            onChange={handleImage360Change}
                            beforeUpload={() => false}
                            showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Tải ảnh 360 lên</Button>
                        </Upload>

                        {currentImage360Url && (
                            <Popconfirm
                                title="Bạn có chắc muốn xoá ảnh 360 này?"
                                okText="Xoá"
                                cancelText="Hủy"
                                onConfirm={handleDeleteImage360}>
                                <Button type="primary" danger icon={<DeleteOutlined />}>
                                    Xoá
                                </Button>
                            </Popconfirm>
                        )}

                        <Button onClick={handlePickDefaultView}>Chọn góc hiển thị mặc định</Button>
                        <Form.Item name="initial_view">
                            <Input hidden />
                        </Form.Item>
                    </Flex>
                    {currentImage360Url && <div ref={panoContainerRef} className="h-[500px] w-full" />}
                </Card>
            </Col>

            <Col span={8}>
                <Card title="Ảnh thumbnail" size="small">
                    <Flex gap={16} align="center">
                        <Upload
                            maxCount={1}
                            accept="image/*"
                            fileList={thumbnailFileList}
                            onChange={handleImageThumbnailChange}
                            beforeUpload={() => false}
                            showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Tải thumbnail</Button>
                        </Upload>

                        {thumbnailUrl && (
                            <Popconfirm
                                title="Bạn có chắc muốn xoá ảnh thumbnail này?"
                                okText="Xoá"
                                cancelText="Hủy"
                                onConfirm={handleDeleteThumbnail}>
                                <Button type="primary" danger icon={<DeleteOutlined />}>
                                    Xoá
                                </Button>
                            </Popconfirm>
                        )}
                    </Flex>

                    {thumbnailUrl && (
                        <div className="mt-2">
                            <img src={thumbnailUrl} alt="Thumbnail" className="w-100 h-100 object-cover rounded" />
                        </div>
                    )}
                </Card>
            </Col>
        </Row>
    )

    const tabItems = [
        { key: 'basicInfo', label: renderTabTitle('basicInfo', 'Thông tin cơ bản'), children: BasicInfoTabContent },
        { key: 'seo', label: renderTabTitle('seo', 'Hỗ trợ SEO'), children: SEOTabContent },
        { key: 'image360', label: renderTabTitle('image360', 'Ảnh 360'), children: Image360TabContent },
    ]

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            initialValues={initialValues}>
            <Card>
                <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={tabItems} />
            </Card>

            <Row justify="center" className="mt-6">
                <Col>
                    <Button onClick={onCancel} className="mr-2">
                        Hủy
                    </Button>
                </Col>
                <Col>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu thông tin
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default Image360Form
