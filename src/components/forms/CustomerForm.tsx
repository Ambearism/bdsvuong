import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Radio, Row, Col, Button, DatePicker, Select, Alert, Spin, Tag, Divider } from 'antd'
import { UserOutlined, HomeOutlined, TagOutlined, TeamOutlined } from '@ant-design/icons'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetAccountOptionsQuery } from '@/api/account'
import { useLazyGetCustomerListQuery } from '@/api/customer'
import type { FormInstance } from 'antd'
import type { CustomerItem } from '@/types/customer'
import { REGEX_EMAIL, REGEX_PHONE, REGEX_FACEBOOK, MAX_LENGTH_255, MAX_LENGTH_1000 } from '@/config/constant'
import { app } from '@/config/app'
import { useDebounce } from '@/hooks/useDebounce'

type Props = {
    form: FormInstance<Partial<CustomerItem>>
    onFinish: (values: Partial<CustomerItem>) => void
    initialValues?: Partial<CustomerItem>
    loading?: boolean
    onCancel?: () => void
}

const gutter: [number, number] = [16, 16]

// Danh sách tỉnh/thành phố Việt Nam (rút gọn, có thể mở rộng)
const PROVINCES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
    'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
]

// Vai trò khách hàng
const CUSTOMER_ROLE_OPTIONS = [
    { value: 'buyer', label: '🏠 Khách mua / thuê' },
    { value: 'owner', label: '🔑 Chủ nhà / Nguồn hàng' },
    { value: 'both', label: '⚡ Cả hai' },
]

// Nguồn giới thiệu
const REFERRAL_TYPE_OPTIONS = [
    { value: 'direct', label: 'Trực tiếp' },
    { value: 'customer', label: 'Khách hàng giới thiệu' },
    { value: 'ctv', label: 'Cộng tác viên' },
    { value: 'platform', label: 'Nền tảng (Facebook, Zalo, web...)' },
    { value: 'other', label: 'Khác' },
]

const CustomerForm: React.FC<Props> = ({ form, onFinish, initialValues, loading, onCancel }) => {
    const { data: enumData } = useGetEnumOptionsQuery(['lead_source'])
    const { data: accountData, isLoading: loadingAccounts } = useGetAccountOptionsQuery({
        per_page: app.FETCH_ALL,
    })

    // Duplicate phone check
    const [phoneValue, setPhoneValue] = useState<string>('')
    const [duplicateCustomer, setDuplicateCustomer] = useState<CustomerItem | null>(null)
    const [checkingPhone, setCheckingPhone] = useState(false)
    const debouncedPhone = useDebounce(phoneValue, 600)
    const [getCustomerList] = useLazyGetCustomerListQuery()

    // Referral type state (để hiển thị field động)
    const [referralType, setReferralType] = useState<string>('')

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues)
            if ((initialValues as any).referral_type) {
                setReferralType((initialValues as any).referral_type)
            }
        }
    }, [initialValues, form])

    // Check trùng SĐT
    useEffect(() => {
        const isEditMode = !!initialValues?.id
        if (!debouncedPhone || debouncedPhone.length < 9 || isEditMode) {
            setDuplicateCustomer(null)
            return
        }
        setCheckingPhone(true)
        getCustomerList({ keyword: debouncedPhone, per_page: 5 })
            .unwrap()
            .then(res => {
                const items = res?.data?.items || []
                const found = items.find(c => c.phone === debouncedPhone)
                setDuplicateCustomer(found ?? null)
            })
            .catch(() => setDuplicateCustomer(null))
            .finally(() => setCheckingPhone(false))
    }, [debouncedPhone])

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                gender: true,
                is_supplier: false,
                is_agency: false,
                is_master: false,
                is_relative: false,
                is_relatived: false,
                is_share: false,
                customer_role: 'buyer',
            }}>
            <Row gutter={16} className="w-full">
                <Col xs={24} className="w-full">

                    {/* ── BLOCK 1: Thông tin cơ bản ── */}
                    <Card
                        title={<span><UserOutlined className="mr-2 text-blue-500" />Thông tin cơ bản</span>}
                        className="mb-4">
                        <Row gutter={gutter}>
                            <Col xs={24} md={16}>
                                <Form.Item
                                    label="Tên khách hàng"
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên khách hàng' },
                                        { max: MAX_LENGTH_255, message: `Tên không được vượt quá ${MAX_LENGTH_255} ký tự` },
                                    ]}>
                                    <Input placeholder="Nhập tên khách hàng" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="Giới tính" name="gender">
                                    <Radio.Group>
                                        <Radio value={true}>Nam</Radio>
                                        <Radio value={false}>Nữ</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>

                            {/* SĐT với check trùng */}
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="phone"
                                    validateStatus={duplicateCustomer ? 'error' : checkingPhone ? 'validating' : undefined}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                                        { pattern: REGEX_PHONE, message: 'Số điện thoại không hợp lệ' },
                                    ]}>
                                    <Input
                                        placeholder="Nhập số điện thoại"
                                        suffix={checkingPhone ? <Spin size="small" /> : undefined}
                                        onChange={e => setPhoneValue(e.target.value)}
                                    />
                                </Form.Item>
                                {duplicateCustomer && (
                                    <Alert
                                        type="error"
                                        showIcon
                                        className="mb-3 -mt-2"
                                        message={
                                            <span>
                                                <strong>Số điện thoại đã tồn tại</strong> — Khách hàng{' '}
                                                <Tag color="red">#{duplicateCustomer.id}</Tag>
                                                <strong>{duplicateCustomer.name}</strong> đang dùng số này.{' '}
                                                <a
                                                    href={`/customers/${duplicateCustomer.id}/hub`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="underline">
                                                    Mở hồ sơ →
                                                </a>
                                            </span>
                                        }
                                    />
                                )}
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ pattern: REGEX_EMAIL, message: 'Email không hợp lệ' }]}>
                                    <Input placeholder="Nhập email" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item label="Ngày sinh" name="birthday">
                                    <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Facebook"
                                    name="facebook"
                                    rules={[
                                        { max: MAX_LENGTH_255, message: `Facebook không được vượt quá ${MAX_LENGTH_255} ký tự` },
                                        { pattern: REGEX_FACEBOOK, message: 'Facebook không đúng định dạng link' },
                                    ]}>
                                    <Input placeholder="Nhập link Facebook" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Nơi công tác"
                                    name="work_place"
                                    rules={[{ max: MAX_LENGTH_255, message: `Không được vượt quá ${MAX_LENGTH_255} ký tự` }]}>
                                    <Input placeholder="Cơ quan / Trường học" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="Người phụ trách" name="assigned_to">
                                    <Select
                                        placeholder="Chọn người phụ trách"
                                        loading={loadingAccounts}
                                        options={accountData?.data?.items}
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* ── BLOCK 2: Vai trò & Nguồn khách ── */}
                    <Card
                        title={<span><TagOutlined className="mr-2 text-purple-500" />Vai trò & Nguồn khách</span>}
                        className="mb-4">
                        <Row gutter={gutter}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Vai trò khách hàng"
                                    name="customer_role"
                                    tooltip="Xác định khách là người mua, chủ nhà/nguồn hàng, hoặc cả hai">
                                    <Select
                                        placeholder="Chọn vai trò"
                                        options={CUSTOMER_ROLE_OPTIONS}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="Nguồn khách hàng (kênh)" name="lead_source">
                                    <Select
                                        placeholder="Chọn nguồn"
                                        options={enumData?.data?.lead_source}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item label="Loại giới thiệu" name="referral_type">
                                    <Select
                                        placeholder="Chọn loại giới thiệu"
                                        options={REFERRAL_TYPE_OPTIONS}
                                        allowClear
                                        onChange={v => setReferralType(v)}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Hiện field động theo loại giới thiệu */}
                            {referralType === 'customer' && (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Khách hàng giới thiệu"
                                        name="referral_customer_name"
                                        tooltip="Tên hoặc SĐT của khách hàng đã giới thiệu">
                                        <Input placeholder="Tên / SĐT người giới thiệu" />
                                    </Form.Item>
                                </Col>
                            )}
                            {referralType === 'ctv' && (
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Cộng tác viên giới thiệu"
                                        name="referral_ctv_name"
                                        tooltip="Tên hoặc mã CTV đã giới thiệu khách này">
                                        <Input placeholder="Tên / mã CTV" />
                                    </Form.Item>
                                </Col>
                            )}
                            {referralType === 'platform' && (
                                <Col xs={24} md={12}>
                                    <Form.Item label="Tên nền tảng" name="referral_platform">
                                        <Input placeholder="Facebook / Zalo / Google / batdongsan.com..." />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>
                    </Card>

                    {/* ── BLOCK 3: Địa chỉ ── */}
                    <Card
                        title={<span><HomeOutlined className="mr-2 text-green-500" />Địa chỉ & Khu vực quan tâm</span>}
                        className="mb-4">
                        <Row gutter={gutter}>
                            <Col xs={24} md={8}>
                                <Form.Item label="Tỉnh / Thành phố" name="province">
                                    <Select
                                        placeholder="Chọn tỉnh / TP"
                                        showSearch
                                        allowClear
                                        optionFilterProp="label"
                                        options={PROVINCES.map(p => ({ value: p, label: p }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Quận / Huyện"
                                    name="district"
                                    rules={[{ max: MAX_LENGTH_255, message: `Không được vượt quá ${MAX_LENGTH_255} ký tự` }]}>
                                    <Input placeholder="Nhập quận / huyện" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Địa chỉ chi tiết"
                                    name="address"
                                    rules={[{ max: MAX_LENGTH_255, message: `Không được vượt quá ${MAX_LENGTH_255} ký tự` }]}>
                                    <Input placeholder="Số nhà, đường..." />
                                </Form.Item>
                            </Col>

                            <Col xs={24}>
                                <Form.Item
                                    label="Khu vực quan tâm"
                                    name="area_of_interest"
                                    tooltip="Các khu vực / dự án khách đang quan tâm để match hàng hoá">
                                    <Select
                                        mode="tags"
                                        placeholder="Nhập khu vực quan tâm (VD: Thanh Hà, Văn Phú, Hà Đông...)"
                                        allowClear
                                        tokenSeparators={[',']}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* ── BLOCK 4: Nhu cầu ── */}
                    <Card
                        title={<span><TeamOutlined className="mr-2 text-orange-500" />Nhu cầu</span>}
                        className="mb-4">
                        <Row gutter={gutter}>
                            <Col xs={24} md={8}>
                                <Form.Item label="Loại hình quan tâm" name="interest_property_type">
                                    <Select
                                        mode="multiple"
                                        placeholder="Liền kề / biệt thự / chung cư..."
                                        allowClear
                                        options={[
                                            { value: 'lien_ke', label: 'Liền kề' },
                                            { value: 'biet_thu', label: 'Biệt thự' },
                                            { value: 'chung_cu', label: 'Chung cư' },
                                            { value: 'shophouse', label: 'Shophouse / Kiosk' },
                                            { value: 'dat_nen', label: 'Đất nền' },
                                            { value: 'nha_rieng', label: 'Nhà riêng' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="Mục đích" name="interest_purpose">
                                    <Select
                                        placeholder="Để ở / đầu tư / kinh doanh"
                                        allowClear
                                        options={[
                                            { value: 'o', label: 'Để ở' },
                                            { value: 'dau_tu', label: 'Đầu tư' },
                                            { value: 'kinh_doanh', label: 'Kinh doanh' },
                                            { value: 'cho_thue', label: 'Cho thuê' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="Khoảng ngân sách" name="interest_budget">
                                    <Input placeholder="VD: 5-7 tỷ" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* ── BLOCK 5: Ghi chú ── */}
                    <Card title="Ghi chú">
                        <Form.Item
                            name="note"
                            rules={[{ max: MAX_LENGTH_1000, message: `Ghi chú không được vượt quá ${MAX_LENGTH_1000} ký tự` }]}>
                            <Input.TextArea rows={4} placeholder="Ghi chú thêm về khách hàng..." showCount maxLength={MAX_LENGTH_1000} />
                        </Form.Item>
                    </Card>

                    <Form.Item name="product_ids" hidden><Input /></Form.Item>
                    <Form.Item name="group_ids" hidden><Input /></Form.Item>
                </Col>
            </Row>

            <Row justify="center" gutter={12} style={{ marginTop: 24 }}>
                <Col>
                    <Button onClick={onCancel}>Hủy</Button>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={!!duplicateCustomer}>
                        Lưu
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default CustomerForm
