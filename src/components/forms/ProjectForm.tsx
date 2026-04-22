import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import { useGetProjectListQuery, useGetProjectExploreQuery } from '@/api/project'
import { TextEditor } from '@/components/tiptap'
import type { ImageUploaderRef } from '@/components/uploads/ImageUploader'
import { app } from '@/config/app'
import { IMAGE_TYPE, PROJECT_STATUS, REGEX_SLUG, MAX_PROJECT_ACREAGE, REGEX_NUMBER_COMMA_DOT } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import ProjectProcessList from '@/pages/projects/processes/ProjectProcessList'
import type { CustomTab, ProjectBase } from '@/types/project'
import type { FormInstance } from 'antd'
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Tabs,
    Typography,
    message,
    DatePicker,
    Checkbox,
    Flex,
    Popconfirm,
} from 'antd'
import { useSearchParams } from 'react-router'
import { DeleteOutlined } from '@ant-design/icons'
import type { RcFile } from 'antd/es/upload'
import React, { useEffect, useRef, useState } from 'react'
import ProjectToTourTab from '@/components/link-manager/ProjectToTourTab'
import { useGetTour360OptionsQuery } from '@/api/tour360'
import type { ProjectToTourTabRef } from '@/types/tour-link'
import { useGetImage360OptionsQuery } from '@/api/image-360'
import type { ProjectToImage360TabRef } from '@/types/image-360'
import ProjectToImage360Tab from '@/components/image-360/tab-link-image-360/ProjectToImage360Tab'
import { BaseMessage } from '@/components/base/BaseMessage'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import BaseImageUpload from '@/components/base/BaseImageUpload'
import AmenityManager from '@/components/projects/AmenityManager'
import BaseLocation from '@/components/base/BaseLocation'
import { slugify } from '@/utils/slugify'
import { formatter, parser } from '@/utils/number-utils'
import HotLinkManager from '@/components/projects/HotLinkManager'
import ProjectExplore, { type ProjectExploreRef } from '@/components/projects/ProjectExplore'
import SeoFormInputs from '@/components/seo-form-inputs'
import { useGetAccountOptionsQuery } from '@/api/account'
import AddressAutocomplete from '@/components/map/AddressAutocomplete'

dayjs.extend(quarterOfYear)

const { Title } = Typography

type ProjectFormProps = {
    form: FormInstance
    initialValues?: ProjectBase
    onFinish: (values: ProjectBase, logoFile?: RcFile | null) => Promise<ProjectBase | void>
    onCancel?: () => void
    loading?: boolean
    isEdit?: boolean
    onValuesChange?: () => void
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    form,
    initialValues,
    onFinish,
    onCancel,
    isEdit = false,
    loading,
    onValuesChange,
}) => {
    const { hasPermission } = usePermission()
    const [searchParams] = useSearchParams()
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>(initialValues?.zone_province_id)
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'basic-info')
    const [projectId, setProjectId] = useState<number | undefined>(initialValues?.id)
    const [selectedStatus, setSelectedStatus] = useState<number | undefined>(initialValues?.status_project_id)

    const customTabsRaw = Form.useWatch('custom_tabs', form) as CustomTab[]
    const customTabs = React.useMemo(() => customTabsRaw || [], [customTabsRaw])
    const prevTabsLength = useRef(customTabs.length)

    useEffect(() => {
        if (customTabs.length > prevTabsLength.current) {
            const lastTab = customTabs[customTabs.length - 1]
            setActiveTab(`custom-${lastTab.id}`)
        } else if (customTabs.length < prevTabsLength.current) {
            setActiveTab('basic-info')
        }
        prevTabsLength.current = customTabs.length
    }, [customTabs])

    const handleExploreEnableChange = (enabled: boolean) => {
        form.setFieldValue('enable_explore', enabled)
    }

    const { data: exploreData } = useGetProjectExploreQuery(
        { project_id: projectId! },
        { skip: !isEdit || !projectId, refetchOnMountOrArgChange: true },
    )

    useEffect(() => {
        if (exploreData?.data) {
            form.setFieldValue('enable_explore', exploreData.data.enable_explore)
        }
    }, [exploreData, form])

    const logoUploaderRef = useRef<ImageUploaderRef>(null)
    const image360TabRef = useRef<ProjectToImage360TabRef>(null)
    const tourTabRef = useRef<ProjectToTourTabRef>(null)
    const exploreTabRef = useRef<ProjectExploreRef>(null)

    const { data: expertData, isLoading: loadingExperts } = useGetAccountOptionsQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
    })
    const { data: parentProjects, isLoading: loadingProjects } = useGetProjectListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
        is_option: true,
    })
    const { data: provinceData, isLoading: loadingProvinces } = useGetProvinceListQuery({ is_option: true })
    const { data: wardData, isLoading: loadingWards } = useGetWardsByProvinceIdQuery(
        { province_id: selectedProvince!, is_option: true },
        {
            skip: !selectedProvince,
        },
    )
    const { data: projectTypesData, isLoading: loadingProjectTypes } = useGetEnumOptionsQuery([
        'project_types',
        'project_status',
        'legal_status',
    ])
    const { data: imageData } = useGetImage360OptionsQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
    })
    const { data: tourData } = useGetTour360OptionsQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
    })

    const allTours = (tourData?.data?.items || []).map(tourItem => ({
        id: tourItem.value,
        display_name: tourItem.label,
    }))
    const allImages = (imageData?.data?.items || []).map(imageItem => ({ id: imageItem.value, title: imageItem.label }))

    const parentProjectOptions = (parentProjects?.data?.items || []).filter(p => !isEdit || p.id !== projectId)

    const shouldShowHandoverDate = selectedStatus === PROJECT_STATUS.DA_BAN_GIAO

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
            })
            setSelectedProvince(initialValues.zone_province_id)
            setSelectedStatus(initialValues.status_project_id)
            setProjectId(initialValues.id)
        }
    }, [initialValues, form])

    useEffect(() => {
        if (initialValues && selectedProvince === initialValues.zone_province_id) return
        form.setFieldsValue({ zone_ward_id: undefined })
    }, [selectedProvince, form, initialValues])

    useEffect(() => {
        if (selectedStatus !== PROJECT_STATUS.DA_BAN_GIAO) {
            form.setFieldsValue({ handover_date: undefined })
        }
    }, [selectedStatus, form])

    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldsValue({ url_project: slugify(e.target.value?.trim() || '') })
    }

    const handleSubmit = async (values: ProjectBase) => {
        const finalValues = { ...values }
        if (Array.isArray(finalValues.amenities)) {
            finalValues.amenities = finalValues.amenities
                .map(group => {
                    const title = group.title?.trim() ?? ''

                    const items = Array.isArray(group.items)
                        ? group.items.filter(item => {
                              const name = item.name?.trim() || ''
                              const description = item.description?.trim() || ''
                              return name !== '' || description !== ''
                          })
                        : []

                    return {
                        ...group,
                        title,
                        items,
                    }
                })
                .filter(group => {
                    return (group.title && group.title !== '') || (group.items && group.items.length > 0)
                })
        }
        if (finalValues.handover_date) {
            finalValues.handover_date = dayjs(finalValues.handover_date).startOf('quarter').format('YYYY-MM-DD')
        }

        const logoFile = logoUploaderRef.current?.getSelectedFile()
        const result = await onFinish(finalValues, logoFile)

        if (result?.id) {
            setProjectId(result.id)
        }

        if (activeTab === 'project-image-360' && image360TabRef.current?.hasChanges()) {
            await image360TabRef.current.save()
        }

        if (activeTab === 'project-tour' && tourTabRef.current?.hasChanges()) {
            await tourTabRef.current.save()
        }
    }

    const getTabKeyByFieldName = (fieldName: string): string => {
        const fieldToTabMap: Record<string, string> = {
            name: 'basic-info',
            url_project: 'basic-info',
            parent_id: 'basic-info',
            zone_province_id: 'basic-info',
            zone_ward_id: 'basic-info',
            address: 'basic-info',
            type_project_id: 'basic-info',
            status_project_id: 'basic-info',
            handover_date: 'basic-info',
            publish_status: 'basic-info',
            highlight_status: 'basic-info',
            expert_id: 'basic-info',
            construction: 'details',
            investor: 'details',
            acreage: 'details',
            scale: 'details',
            number_apartment: 'details',
            total_buildings: 'details',
            apartments_per_floor: 'details',
            elevators_per_building: 'details',
            basement_floors: 'details',
            legal_status: 'details',
            price_from: 'details',
            price_to: 'details',
            price_per_m2: 'details',
            fanpage: 'details',
            hotline: 'details',
            intro: 'intro',
            amenity: 'amenities',
            ground: 'ground',
            quote: 'quote',
            seo: 'seo',
        }

        return fieldToTabMap[fieldName] || 'basic-info'
    }

    const handleValidationFailed = async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        const firstErrorField = form.getFieldsError().find(field => field.errors.length > 0)

        if (firstErrorField) {
            const fieldName = firstErrorField.name[0] as string
            const tabKey = getTabKeyByFieldName(fieldName)
            setActiveTab(tabKey)
        }
    }

    const getNumberRangeValidator =
        (startNumberKey: string, invalidMessage?: string) => (_: unknown, value: number) => {
            const standardDesignFrom = form.getFieldValue(startNumberKey)
            if (!value || !standardDesignFrom || standardDesignFrom <= value) {
                return Promise.resolve()
            }
            return Promise.reject(new Error(invalidMessage ?? 'Số sau phải lớn hơn hoặc bằng số trước'))
        }

    const convertToDayjs = (value: ProjectBase['handover_date']) => ({
        value: value ? dayjs(value) : null,
    })

    const handleStatusChange = (value: number) => {
        setSelectedStatus(value)
    }

    const tabItems = [
        {
            key: 'basic-info',
            label: 'Thông tin cơ bản',
            children: (
                <Card size="small" className="!rounded-tl-none mb-4">
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="name"
                                label="Tên dự án"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên dự án' },
                                    { min: 6, message: 'Tên dự án phải có ít nhất 6 ký tự' },
                                    { max: 255, message: 'Tên dự án không được vượt quá 255 ký tự' },
                                    { whitespace: true, message: 'Tên dự án không được chỉ chứa khoảng trắng' },
                                ]}>
                                <Input placeholder="Nhập tên dự án" onChange={handleProjectNameChange} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="url_project"
                                label="Liên kết tĩnh"
                                rules={[
                                    { max: 255, message: 'Liên kết tĩnh không được vượt quá 255 ký tự!' },
                                    {
                                        pattern: REGEX_SLUG,
                                        message:
                                            'Liên kết tĩnh chỉ được chứa chữ cái, số, dấu gạch ngang, dấu gạch dưới!',
                                    },
                                ]}>
                                <Input placeholder="Liên kết tĩnh tự tạo theo tên dự án" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="parent_id" label="Dự án cha">
                                <Select
                                    placeholder="Chọn dự án cha"
                                    loading={loadingProjects}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={parentProjectOptions.map(p => ({ value: p.id, label: p.name }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="zone_province_id"
                                label="Tỉnh/Thành phố"
                                rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố' }]}>
                                <Select
                                    placeholder="-Chọn Tỉnh/TP-"
                                    loading={loadingProvinces}
                                    onChange={setSelectedProvince}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={provinceData?.data?.items?.map(p => ({ value: p.id, label: p.name }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="zone_ward_id"
                                label="Phường/Xã"
                                rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã' }]}>
                                <Select
                                    placeholder="Chọn Phường/Xã"
                                    disabled={!selectedProvince}
                                    loading={loadingWards}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={wardData?.data?.items?.map(w => ({ value: w.id, label: w.name }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập địa chỉ' },
                                    { max: 255, message: 'Địa chỉ không được vượt quá 255 ký tự' },
                                    { whitespace: true, message: 'Địa chỉ không được chỉ chứa khoảng trắng' },
                                ]}>
                                <AddressAutocomplete
                                    onChange={value => form.setFieldValue('address', value)}
                                    onPlaceSelected={place => {
                                        form.setFieldsValue({
                                            address: place.address,
                                            latitude: place.lat,
                                            longitude: place.lng,
                                        })
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="type_project_id"
                                label="Phân loại"
                                rules={[{ required: true, message: 'Vui lòng chọn loại hình dự án' }]}>
                                <Select
                                    placeholder="Chọn loại hình"
                                    loading={loadingProjectTypes}
                                    allowClear
                                    optionFilterProp="label"
                                    showSearch
                                    options={projectTypesData?.data?.project_types}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="expert_id" label="Chuyên viên phụ trách" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Chọn chuyên viên"
                                    loading={loadingExperts}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={expertData?.data?.items}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="status_project_id"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái dự án' }]}>
                                <Select
                                    placeholder="Chọn trạng thái"
                                    loading={loadingProjectTypes}
                                    allowClear
                                    optionFilterProp="label"
                                    showSearch
                                    onChange={handleStatusChange}
                                    options={projectTypesData?.data?.project_status}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Cài đặt hiển thị">
                                <Space>
                                    <Form.Item name="publish_status" valuePropName="checked" noStyle>
                                        <Checkbox>Hiển thị</Checkbox>
                                    </Form.Item>

                                    <Form.Item name="highlight_status" valuePropName="checked" noStyle>
                                        <Checkbox>Nổi bật</Checkbox>
                                    </Form.Item>
                                </Space>
                            </Form.Item>
                        </Col>
                        {shouldShowHandoverDate && (
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="handover_date"
                                    label="Ngày bàn giao"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày bàn giao' }]}
                                    getValueProps={convertToDayjs}>
                                    <DatePicker
                                        placeholder="Chọn Quý/Năm"
                                        picker="quarter"
                                        format="[Q]Q - YYYY"
                                        className="w-full"
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Card>
            ),
        },
        {
            key: 'details',
            label: 'Thông tin chi tiết',
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="investor"
                                label="Chủ đầu tư"
                                rules={[{ max: 255, message: 'Chủ đầu tư không được vượt quá 255 ký tự' }]}>
                                <Input placeholder="Nhập tên chủ đầu tư" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="acreage"
                                label="Diện tích dự án (m²)"
                                rules={[
                                    {
                                        pattern: REGEX_NUMBER_COMMA_DOT,
                                        message: 'Diện tích chỉ được chứa số và dấu phân cách',
                                    },
                                ]}>
                                <InputNumber
                                    placeholder="Ví dụ: 10,000"
                                    min={0}
                                    max={MAX_PROJECT_ACREAGE}
                                    className="!w-full"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="number_apartment" label="Số căn hộ">
                                <InputNumber
                                    placeholder="Nhập số căn hộ"
                                    min={0}
                                    max={10000}
                                    className="!w-full"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        {/* <Col xs={24} md={12}>
                            <Form.Item
                                name="construction"
                                label="Đơn vị thi công"
                                rules={[{ max: 255, message: 'Đơn vị thi công không được vượt quá 255 ký tự' }]}>
                                <Input placeholder="Nhập đơn vị thi công" />
                            </Form.Item>
                        </Col> */}
                        {/* <Col xs={24} md={12}>
                            <Form.Item
                                name="scale"
                                label="Quy mô"
                                rules={[{ max: 255, message: 'Quy mô không được vượt quá 255 ký tự' }]}>
                                <Input placeholder="Nhập quy mô dự án" />
                            </Form.Item>
                        </Col> */}
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item name="total_buildings" label="Số tòa nhà">
                                <InputNumber
                                    placeholder="Nhập số tòa nhà"
                                    min={0}
                                    max={10000}
                                    className="!w-full"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="building_height"
                                label="Độ cao mỗi toà"
                                rules={[{ max: 255, message: 'Độ cao mỗi toà không được vượt quá 255 ký tự' }]}>
                                <Input placeholder="Ví dụ: 30 - 35 tầng" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="elevators_per_building" label="Số thang máy/tòa">
                                <InputNumber
                                    placeholder="Nhập số thang máy/tòa"
                                    min={0}
                                    max={10000}
                                    className="!w-full"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="main_types"
                                label="Các loại hình chính"
                                rules={[{ max: 255, message: 'Các loại hình chính không được vượt quá 255 ký tự' }]}>
                                <Input placeholder="Ví dụ: Chung cư, Biệt thự,..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="density"
                                label="Mật độ xây dựng"
                                rules={[{ max: 255, message: 'Mật độ xây dựng không được vượt quá 255 ký tự' }]}>
                                <Input placeholder="Ví dụ: 30% quỹ đất" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        {/* <Col xs={24} md={8}>
                            <Form.Item name="basement_floors" label="Số tầng hầm đỗ xe">
                                <InputNumber
                                    placeholder="Nhập số tầng hầm"
                                    min={0}
                                    className="!w-full"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col> */}
                        <Col xs={24} md={8}>
                            <Form.Item name="legal_status" label="Pháp lý">
                                <Select
                                    placeholder="Chọn tình trạng pháp lý"
                                    loading={loadingProjectTypes}
                                    allowClear
                                    optionFilterProp="label"
                                    showSearch
                                    options={projectTypesData?.data?.legal_status}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Quy chuẩn thiết kế mỗi căn">
                                <Flex align="center" gap={12}>
                                    <Form.Item
                                        name="standard_design_from"
                                        noStyle
                                        rules={[{ type: 'number', message: 'Vui lòng nhập số!' }]}>
                                        <InputNumber
                                            placeholder="Từ diện tích"
                                            min={0}
                                            max={10000}
                                            className="flex-1 min-w-0"
                                            addonAfter="m²"
                                            formatter={formatter}
                                            parser={parser}
                                        />
                                    </Form.Item>
                                    <span className="text-gray-400 text-sm">đến</span>
                                    <Form.Item
                                        name="standard_design_to"
                                        noStyle
                                        dependencies={['standard_design_from']}
                                        rules={[
                                            { type: 'number', message: 'Vui lòng nhập số!' },
                                            { validator: getNumberRangeValidator('standard_design_from') },
                                        ]}>
                                        <InputNumber
                                            placeholder="Đến diện tích"
                                            min={0}
                                            max={10000}
                                            className="flex-1 min-w-0"
                                            addonAfter="m²"
                                            formatter={formatter}
                                            parser={parser}
                                        />
                                    </Form.Item>
                                </Flex>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Giá khởi điểm (Tỷ)">
                                <Flex align="center" gap={12}>
                                    <Form.Item
                                        name="price_from"
                                        noStyle
                                        rules={[
                                            { type: 'number', message: 'Vui lòng nhập số!' },
                                            { type: 'number', min: 0.000001, message: 'Giá bán phải lớn hơn 0' },
                                        ]}>
                                        <InputNumber
                                            placeholder="Giá khởi điểm"
                                            min={0}
                                            max={999999999999}
                                            className="flex-1 min-w-0"
                                            formatter={formatter}
                                            parser={parser}
                                        />
                                    </Form.Item>
                                    <span className="text-gray-400 text-sm">đến</span>
                                    <Form.Item
                                        name="price_to"
                                        noStyle
                                        dependencies={['price_from']}
                                        rules={[
                                            { type: 'number', message: 'Vui lòng nhập số!' },
                                            {
                                                validator: getNumberRangeValidator(
                                                    'price_from',
                                                    'Giá "Đến" phải lớn hơn hoặc bằng giá "Ban đầu"!',
                                                ),
                                            },
                                        ]}>
                                        <InputNumber
                                            placeholder="Giá đến"
                                            min={0}
                                            max={999999999999}
                                            className="flex-1 min-w-0"
                                            formatter={formatter}
                                            parser={parser}
                                        />
                                    </Form.Item>
                                </Flex>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="price_per_m2"
                                label="Giá bán/m² (triệu VNĐ)"
                                rules={[{ type: 'number', min: 0.0001, message: 'Giá bán phải lớn hơn 0' }]}>
                                <InputNumber
                                    placeholder="Ví dụ: 3.14"
                                    min={0}
                                    max={1000000}
                                    step={0.1}
                                    className="!w-full"
                                    addonAfter="triệu/m²"
                                    formatter={formatter}
                                    parser={parser}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="hotline"
                                label="Hotline"
                                rules={[
                                    { pattern: /^[0-9\s\-+()]+$/, message: 'Số hotline không hợp lệ' },
                                    { max: 20, message: 'Hotline không được vượt quá 20 ký tự' },
                                ]}>
                                <Input placeholder="Ví dụ: 0123 456 789" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="fanpage"
                                label="Fanpage"
                                rules={[
                                    { type: 'url', message: 'URL không hợp lệ' },
                                    { max: 500, message: 'URL không được vượt quá 500 ký tự' },
                                ]}>
                                <Input placeholder="https://facebook.com/..." />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            ),
        },
        {
            key: 'hot_links',
            label: 'Thông tin nổi bật',
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Form.Item name="hot_links">
                        <HotLinkManager />
                    </Form.Item>
                </Card>
            ),
        },
        {
            key: 'intro',
            label: 'Mô tả',
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Form.Item name="intro" label="Mô tả">
                        <TextEditor />
                    </Form.Item>
                </Card>
            ),
        },
        {
            key: 'location',
            label: 'Vị trí dự án',
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Form.Item label="Bản đồ vị trí dự án">
                        <BaseLocation />
                    </Form.Item>
                </Card>
            ),
        },
        {
            key: 'ground',
            label: 'Mặt bằng',
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Form.Item name="ground" label="Mặt bằng">
                        <TextEditor />
                    </Form.Item>
                </Card>
            ),
        },
        // {
        //     key: 'quote',
        //     label: 'Bảng giá',
        //     children: (
        //         <Card size="small" className="!rounded-tl-none">
        //             <Form.Item name="quote" label="Bảng giá">
        //                 <TextEditor />
        //             </Form.Item>
        //         </Card>
        //     ),
        // },
        {
            key: 'amenities',
            label: 'Tiện ích nội khu',
            children: (
                <Card size="small" className="!rounded-tl-none">
                    <Form.Item name="amenities">
                        <AmenityManager />
                    </Form.Item>
                </Card>
            ),
        },
        {
            key: 'image',
            label: 'Quản lý ảnh',
            children: projectId ? (
                <Space direction="vertical" size="middle" className="w-full">
                    <BaseImageUpload
                        itemId={projectId}
                        imageType={IMAGE_TYPE.PROJECT}
                        folderPrefix="projects"
                        title="dự án"
                        messageGuide="Kích thước khuyến nghị 880 x 585 px."
                    />
                    <BaseImageUpload
                        itemId={projectId}
                        imageType={IMAGE_TYPE.PROJECT_FLOOR_PLAN}
                        folderPrefix="projects"
                        title="mặt bằng dự án"
                        messageGuide="Kích thước khuyến nghị 880 x 585 px."
                    />
                    <BaseImageUpload
                        itemId={projectId}
                        imageType={IMAGE_TYPE.PROJECT_AMENITY}
                        folderPrefix="projects"
                        title="tiện ích dự án"
                        allowNameInput={true}
                        messageGuide="Kích thước khuyến nghị 1280 x 720 px."
                    />
                </Space>
            ) : (
                <BaseMessage text="Vui lòng quay trở lại khi lưu hàng hoá thành công!" />
            ),
        },
        {
            key: 'project-tour',
            label: 'Liên kết tour 360',
            children: hasPermission(RESOURCE_TYPE.TOUR_360, ACTION.READ) ? (
                projectId ? (
                    <ProjectToTourTab ref={tourTabRef} allTours={allTours} projectId={projectId} />
                ) : (
                    <BaseMessage text="Vui lòng quay trở lại khi lưu dự án thành công!" />
                )
            ) : (
                <BaseMessage text="Bạn không có quyền truy cập tính năng này!" />
            ),
        },
        {
            key: 'project-image-360',
            label: 'Liên kết ảnh 360',
            children: hasPermission(RESOURCE_TYPE.VIEW_360, ACTION.READ) ? (
                projectId ? (
                    <ProjectToImage360Tab ref={image360TabRef} allImages={allImages} projectId={projectId} />
                ) : (
                    <BaseMessage text="Vui lòng quay trở lại khi lưu dự án thành công!" />
                )
            ) : (
                <BaseMessage text="Bạn không có quyền truy cập tính năng này!" />
            ),
        },

        {
            key: 'process',
            label: 'Tiến độ dự án',
            children: projectId ? (
                <Card size="small" className="!rounded-tl-none">
                    <ProjectProcessList />
                </Card>
            ) : (
                <BaseMessage text="Vui lòng quay trở lại khi lưu dự án thành công!" />
            ),
        },
        {
            key: 'explore',
            label: 'Tra cứu dự án',
            children: projectId ? (
                <Card size="small" className="!rounded-tl-none">
                    <ProjectExplore
                        ref={exploreTabRef}
                        projectId={projectId}
                        onEnableChange={handleExploreEnableChange}
                    />
                </Card>
            ) : (
                <BaseMessage text="Vui lòng quay trở lại khi lưu dự án thành công!" />
            ),
        },
        {
            key: 'seo',
            label: 'SEO',
            children: <SeoFormInputs />,
        },
        ...customTabs
            .sort((a, b) => a.order - b.order)
            .map(tab => ({
                key: `custom-${tab.id}`,
                label: (
                    <span>
                        {tab.title}
                        <Popconfirm
                            title="Xóa tab này?"
                            onConfirm={e => {
                                e?.stopPropagation()
                                handleDeleteTab(tab.id)
                            }}
                            onCancel={e => e?.stopPropagation()}
                            okText="Xóa"
                            cancelText="Hủy">
                            <DeleteOutlined
                                className="ml-2 text-gray-400 hover:text-red-500"
                                onClick={e => e.stopPropagation()}
                            />
                        </Popconfirm>
                    </span>
                ),
                children: (
                    <Card size="small" className="!rounded-tl-none">
                        <TextEditor
                            value={tab.content ?? ''}
                            onChange={val => {
                                const updatedTabs = customTabs.map(t =>
                                    t.id === tab.id ? { ...t, content: val as string } : t,
                                )
                                form.setFieldsValue({ custom_tabs: updatedTabs })
                            }}
                        />
                    </Card>
                ),
            })),
    ]

    const handleSaveAndExit = async () => {
        try {
            if (activeTab === 'project-image-360' && image360TabRef.current?.hasChanges()) {
                await image360TabRef.current.save()
            } else if (activeTab === 'project-tour' && tourTabRef.current?.hasChanges()) {
                await tourTabRef.current.save()
            } else if (activeTab === 'explore') {
                await exploreTabRef.current?.save()
            } else {
                await form.validateFields()
                const values = form.getFieldsValue()
                await handleSubmit(values)
            }
        } catch {
            message.error('Vui lòng kiểm tra các lỗi trước khi lưu.')

            await new Promise(resolve => setTimeout(resolve, 100))
            const firstErrorField = form.getFieldsError().find(field => field.errors.length > 0)

            if (firstErrorField) {
                const fieldName = firstErrorField.name[0] as string
                const tabKey = getTabKeyByFieldName(fieldName)
                setActiveTab(tabKey)
            }
        }
    }

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab)
    }

    const handleDeleteTab = (tabId: string) => {
        const updatedTabs = customTabs.filter(t => t.id !== tabId)
        form.setFieldsValue({ custom_tabs: updatedTabs })
        const firstTab = updatedTabs.length > 0 ? `custom-${updatedTabs[0].id}` : 'basic-info'
        setActiveTab(firstTab)
        message.success('Đã xóa tab')
    }

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            onFinishFailed={handleValidationFailed}
            initialValues={initialValues}
            onValuesChange={onValuesChange}
            size="middle"
            preserve={true}
            scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}>
            <Card className="shadow-lg !mb-4">
                <Title level={4}>{isEdit ? 'Cập nhật dự án' : 'Tạo mới dự án'}</Title>
                <Form.Item name="custom_tabs" hidden>
                    <Input />
                </Form.Item>

                <Tabs type="card" items={tabItems} activeKey={activeTab} onChange={handleTabChange} />
                <Row justify="center" className="!mt-6">
                    <Space size="middle">
                        <Button onClick={onCancel} disabled={loading}>
                            Trở về
                        </Button>
                        <Button type="primary" onClick={handleSaveAndExit} loading={loading}>
                            {isEdit ? 'Lưu' : 'Tạo mới'}
                        </Button>
                    </Space>
                </Row>
            </Card>
        </Form>
    )
}

export default ProjectForm
