import React from 'react'
import { Modal, Form, Input, Select, Button, Flex, Row, Col, Typography, message, type FormInstance } from 'antd'
import { DollarOutlined } from '@ant-design/icons'
import { MdBusiness } from 'react-icons/md'
import { useCreateProductMutation, useGetProductMaxIdQuery } from '@/api/product'
import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import { useGetProjectListQuery } from '@/api/project'
import { useGetEnumOptionsQuery } from '@/api/types'
import { buildProductPayload } from '@/utils/buildProductPayload'
import { app } from '@/config/app'
import { LEGAL_STATUS, PRODUCT_TRANSACTION, PRODUCT_TYPE } from '@/config/constant'
import { CARE_COLOR_CLASSES } from '@/config/colors'
import type { ProductCreateInput } from '@/types/product'
import type { ZoneItem } from '@/types/zone'
import type { ProjectItem } from '@/types/project'

const labelClassName = 'text-slate-500 !text-[10.5px] font-medium'

interface AddRealEstateModalProps {
    open: boolean
    onCancel: () => void
    onSubmit: (productId: number) => void
    form: FormInstance
}

const AddRealEstateModal: React.FC<AddRealEstateModalProps> = ({ open, onCancel, onSubmit, form }) => {
    const province = Form.useWatch('zone_province_id', form)
    const ward = Form.useWatch('zone_ward_id', form)

    const { data: maxIdRes } = useGetProductMaxIdQuery(undefined, { skip: !open })
    const { data: provinceData, isLoading: loadingProvince } = useGetProvinceListQuery(undefined, { skip: !open })
    const { data: wardData, isLoading: loadingWard } = useGetWardsByProvinceIdQuery(
        { province_id: province },
        {
            skip: !open || !province,
        },
    )
    const { data: projectData, isLoading: loadingProject } = useGetProjectListQuery(
        {
            page: app.DEFAULT_PAGE,
            per_page: app.BIG_PAGE_SIZE,
            zone_province_id: province,
            zone_ward_id: ward,
            is_option: true,
        },
        { skip: !open || !province || !ward },
    )
    const { data: enumData } = useGetEnumOptionsQuery(
        ['transaction_types', 'product_types', 'supplier_types', 'sell_status', 'rent_status'],
        { skip: !open },
    )
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()

    const handleCancel = () => {
        onCancel()
    }

    const handleSubmit = async () => {
        const values = form.getFieldsValue()
        const hasData =
            String(values.name || '').trim() || values.zone_province_id || values.zone_ward_id || values.project_id
        if (!hasData) {
            message.error('Thêm BĐS thất bại')
            handleCancel()
            return
        }
        if (!maxIdRes?.data) {
            message.error('Không lấy được mã hàng hoá, vui lòng thử lại!')
            return
        }
        try {
            const productCode = maxIdRes?.data ? `#H${maxIdRes.data.max_id}.${maxIdRes.data.max_sub_id}` : null
            const payload = buildProductPayload({
                values,
                productCode,
                sellStatus: Number(enumData?.data?.sell_status?.[0]?.value ?? 6),
                rentStatus: Number(enumData?.data?.rent_status?.[0]?.value ?? 6),
                supplierType: Number(enumData?.data?.supplier_types?.[0]?.value ?? 1),
            })
            const res = await createProduct(payload as unknown as ProductCreateInput).unwrap()
            const newId = res?.data?.id
            if (newId) {
                message.success('Đã thêm BĐS thành công')
                onSubmit(newId)
                handleCancel()
            }
        } catch (err: unknown) {
            const e = err as { data?: { errors?: Array<{ msg?: string }> } }
            message.error(e?.data?.errors?.[0]?.msg || 'Tạo BĐS thất bại')
        }
    }

    return (
        <Modal
            title="Thêm Bất Động Sản Mới"
            open={open}
            onCancel={handleCancel}
            afterClose={() => form.resetFields()}
            footer={null}
            width={600}
            centered>
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item label={<span className={labelClassName}>TÊN BĐS / TIÊU ĐỀ TIN</span>} name="name">
                    <Input
                        placeholder="VD: Căn hộ 2PN tòa S2.01 Ocean Park..."
                        prefix={<MdBusiness size={16} className="!text-neutral-400" />}
                        className="!h-10"
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label={<span className={labelClassName}>TỈNH / TP</span>} name="zone_province_id">
                            <Select
                                placeholder="Chọn tỉnh/thành"
                                className="!h-10"
                                loading={loadingProvince}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                                onChange={() => form.setFieldsValue({ zone_ward_id: undefined, project_id: undefined })}
                                options={provinceData?.data?.items?.map((p: { id: number; name: string }) => ({
                                    label: p.name,
                                    value: p.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={<span className={labelClassName}>PHƯỜNG / XÃ</span>} name="zone_ward_id">
                            <Select
                                placeholder="Chọn phường/xã"
                                className="!h-10"
                                loading={loadingWard}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                                onChange={() => form.setFieldsValue({ project_id: undefined })}
                                options={wardData?.data?.items?.map((item: ZoneItem) => ({
                                    label: item.name,
                                    value: item.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={<span className={labelClassName}>DỰ ÁN</span>} name="project_id">
                            <Select
                                placeholder="Chọn dự án"
                                className="!h-10"
                                loading={loadingProject}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                                options={projectData?.data?.items?.map((item: ProjectItem) => ({
                                    label: item.name,
                                    value: item.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mb-4 mt-4 p-4 rounded-lg !bg-slate-50">
                    <Flex align="center" gap={8} className="mb-4">
                        <span className="text-xs">◆</span>
                        <Typography.Text strong className="text-base text-slate-500 !text-[10.5px]">
                            PHÂN LOẠI BĐS
                        </Typography.Text>
                    </Flex>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={<span className={labelClassName}>MỤC ĐÍCH</span>} name="purpose">
                                <Select
                                    placeholder="Chọn mục đích"
                                    className="!h-10"
                                    defaultValue={PRODUCT_TRANSACTION.SELL}>
                                    <Select.Option value={PRODUCT_TRANSACTION.SELL}>Bán (Sell)</Select.Option>
                                    <Select.Option value={PRODUCT_TRANSACTION.RENT}>Thuê (Rent)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={<span className={labelClassName}>LOẠI HÌNH</span>} name="type">
                                <Select
                                    placeholder="Chọn loại hình"
                                    className="!h-10"
                                    defaultValue={PRODUCT_TYPE.APARTMENT}>
                                    {Object.entries(PRODUCT_TYPE).map(([key, label]) => (
                                        <Select.Option key={key} value={label}>
                                            {label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label={<span className={labelClassName}>DIỆN TÍCH (M²)</span>} name="area">
                            <Input prefix={<span className="!text-neutral-400">📏</span>} className="!h-10" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={<span className={labelClassName}>GIÁ BÁN (TỶ)</span>} name="price">
                            <Input
                                prefix={<DollarOutlined className="!text-neutral-400" />}
                                className="!h-10"
                                defaultValue="0.0"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={<span className={labelClassName}>PHÁP LÝ</span>} name="legal">
                            <Select placeholder="Chọn pháp lý" className="!h-10" defaultValue={LEGAL_STATUS.CO_SO_DO}>
                                {Object.entries(LEGAL_STATUS).map(([key, label]) => (
                                    <Select.Option key={key} value={label}>
                                        {label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Flex justify="flex-end" gap={12} className="mt-6 pt-4">
                    <Button onClick={handleCancel}>Hủy bỏ</Button>
                    <Button
                        type="primary"
                        className={`${CARE_COLOR_CLASSES.primary.bg} ${CARE_COLOR_CLASSES.primary.border} ${CARE_COLOR_CLASSES.primaryHover.bgHover} ${CARE_COLOR_CLASSES.primaryHover.borderHover}`}
                        loading={isCreating}
                        onClick={handleSubmit}>
                        Lưu Bất Động Sản
                    </Button>
                </Flex>
            </Form>
        </Modal>
    )
}

export default AddRealEstateModal
