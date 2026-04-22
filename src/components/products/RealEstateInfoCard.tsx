import type { ApiResponse } from '@/types'
import type { ProductFormValues } from '@/types/product'
import type { ProjectItem, ProjectListResponse } from '@/types/project'
import type { ZoneItem, ZoneListResponse } from '@/types/zone'
import { slugify } from '@/utils/slugify'
import { Checkbox, Col, Form, Input, Row, Select, Space, type FormInstance } from 'antd'
import AddressAutocomplete from '@/components/map/AddressAutocomplete'
import { REGEX_SLUG } from '@/config/constant'

interface RealEstateInfoCardProps {
    form: FormInstance<Partial<ProductFormValues>>
    productTypeOptions?: { label: string; value: string | number }[]
    province?: number
    ward?: number
    project?: number
    loadingProvince: boolean
    loadingWard: boolean
    loadingProject: boolean
    provinceData?: ApiResponse<ZoneListResponse>
    wardData?: ApiResponse<ZoneListResponse>
    projectData?: ApiResponse<ProjectListResponse>
    setProvince: (val: number | undefined) => void
    setWard: (val: number | undefined) => void
    setProject: (val: number | undefined) => void
    showProductCode?: boolean
}

const RealEstateInfoCard = ({
    form,
    productTypeOptions,
    province,
    ward,
    project,
    loadingProvince,
    loadingWard,
    loadingProject,
    provinceData,
    wardData,
    projectData,
    setProvince,
    setWard,
    setProject,
    showProductCode,
}: RealEstateInfoCardProps) => {
    const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldsValue({ slug: slugify(e.target.value?.trim() || '') })
    }

    return (
        <>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Tên BĐS" name="name" rules={[{ max: 255, required: true }]}>
                        <Input placeholder="Nhập tên BĐS" onChange={handleProductNameChange} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="Liên kết tĩnh"
                        name="slug"
                        rules={[
                            { max: 255, message: 'Liên kết tĩnh không được vượt quá 255 ký tự!' },
                            {
                                pattern: REGEX_SLUG,
                                message: 'Liên kết tĩnh chỉ được chứa chữ cái, số, dấu gạch ngang, dấu gạch dưới!',
                            },
                        ]}>
                        <Input placeholder="Nhập liên kết tĩnh" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Địa chỉ cụ thể" name="address" rules={[{ max: 255, required: true }]}>
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

            <Row gutter={16} className="mt-4">
                <Col span={8}>
                    <Form.Item label="Loại BĐS" name="type_product_id" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Chọn loại hàng hóa"
                            allowClear
                            options={productTypeOptions}
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="zone_province_id" label="Tỉnh/Thành phố" rules={[{ required: true }]}>
                        <Select
                            placeholder="Chọn Tỉnh/Thành phố"
                            allowClear
                            loading={loadingProvince}
                            value={province}
                            showSearch
                            optionFilterProp="label"
                            onChange={value => {
                                setProvince(value)
                                setWard(undefined)
                            }}
                            options={provinceData?.data?.items.map((item: ZoneItem) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                        />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item name="zone_ward_id" label="Phường/Xã" rules={[{ required: true }]}>
                        <Select
                            placeholder="Chọn Phường/Xã"
                            allowClear
                            loading={loadingWard}
                            value={ward}
                            disabled={!province}
                            showSearch
                            optionFilterProp="label"
                            onChange={value => setWard(value)}
                            options={wardData?.data?.items.map((item: ZoneItem) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16} className="mt-4">
                <Col span={8}>
                    <Form.Item name="project_id" label="Dự án">
                        <Select
                            placeholder="Chọn Dự án"
                            allowClear
                            disabled={!province || !ward}
                            loading={loadingProject}
                            value={project}
                            showSearch
                            optionFilterProp="label"
                            onChange={value => setProject(value ?? undefined)}
                            options={projectData?.data?.items.map((item: ProjectItem) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Mã định danh" name="identifier_code" rules={[{ max: 255 }]}>
                        <Input placeholder="Nhập mã định danh" />
                    </Form.Item>
                </Col>
                {showProductCode && (
                    <Col span={8}>
                        <Form.Item
                            label="Mã hàng hoá"
                            name="product_code"
                            rules={[{ max: 50, message: 'Mã hàng hoá không được vượt quá 50 ký tự' }]}>
                            <Input placeholder="Nhập mã hàng hoá" />
                        </Form.Item>
                    </Col>
                )}
            </Row>
            <Row gutter={16} className="mt-4">
                <Col span={8}>
                    <Form.Item label="Cài đặt hiển thị">
                        <Space>
                            <Form.Item name="publish_status" valuePropName="checked" noStyle>
                                <Checkbox>Hiển thị</Checkbox>
                            </Form.Item>
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </>
    )
}

export default RealEstateInfoCard
