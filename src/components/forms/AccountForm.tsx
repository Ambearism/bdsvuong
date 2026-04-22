import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Button, Select, Row, Col, Avatar, Upload, Space, message } from 'antd'
import type { FormInstance } from 'antd'
import type { Rule } from 'antd/es/form'
import type { RcFile, UploadChangeParam } from 'antd/es/upload'
import { useNavigate } from 'react-router'
import { useGetRolesQuery } from '@/api/role'
import { useUploadImagesMutation } from '@/api/image'
import type { CreateAccountRequest, AccountItem } from '@/types/account'
import { DeleteOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons'
import { IMAGE_TYPE, UPLOAD, REGEX_PHONE, REGEX_FACEBOOK, REGEX_ACCOUNT_NAME } from '@/config/constant'
import { app } from '@/config/app'

type Props = {
    form: FormInstance<CreateAccountRequest & { confirm_password?: string }>
    onFinish: (values: CreateAccountRequest, avatarFile?: File | null) => void
    initialValues?: AccountItem
    loading?: boolean
    isEdit?: boolean
    accountId?: number
    onAvatarUploaded?: (path: string) => void
}

const AccountForm: React.FC<Props> = ({
    form,
    onFinish,
    initialValues,
    loading,
    isEdit,
    accountId,
    onAvatarUploaded,
}) => {
    const navigate = useNavigate()
    const { data: roleData, isLoading: isLoadingRoles } = useGetRolesQuery({
        page: app.DEFAULT_PAGE_SIZE,
        per_page: app.DEFAULT_PAGE_SIZE,
    })
    const [uploadImages] = useUploadImagesMutation()

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues as Partial<CreateAccountRequest>)
            if (initialValues.image_url) {
                setAvatarUrl(initialValues.image_url)
            }
        }
    }, [initialValues, form])

    const roleOptions =
        roleData?.data?.items?.map(role => ({
            label: role.name,
            value: role.id,
        })) || []

    const getConfirmPasswordRules = (isRequired: boolean) => [
        { required: isRequired, message: 'Vui lòng nhập lại mật khẩu' },
        {
            validator: (_rule: Rule, value: string) => {
                const password = form.getFieldValue('password')
                if (!value || password === value) {
                    return Promise.resolve()
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'))
            },
        },
    ]

    const handleBeforeUpload = (file: RcFile) => {
        if (file.size >= UPLOAD.MAX_FILE_SIZE) {
            message.error('Ảnh phải nhỏ hơn 2MB!')
            return Upload.LIST_IGNORE
        }
        return false
    }

    const handleAvatarChange = async (info: UploadChangeParam) => {
        const file = info.fileList[info.fileList.length - 1]?.originFileObj
        if (!file) return

        const tempUrl = URL.createObjectURL(file)
        setAvatarUrl(tempUrl)
        setAvatarFile(file)

        if (isEdit && accountId) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append('files', file)
            formData.append('folder', `accounts/${accountId}`)
            formData.append('type', String(IMAGE_TYPE.ACCOUNT_AVATAR))
            formData.append('item_id', String(accountId))

            try {
                const res = await uploadImages(formData).unwrap()
                const path = res.data?.[0]?.path
                if (path) {
                    form.setFieldValue('image_url', path)
                    if (onAvatarUploaded) {
                        onAvatarUploaded(path)
                    }
                }
            } catch {
                message.error('Upload ảnh thất bại!')
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleDeleteAvatar = () => {
        setAvatarUrl(null)
        setAvatarFile(null)
        form.setFieldValue('image_url', null)
    }

    const handleSubmit = (values: CreateAccountRequest & { confirm_password?: string }) => {
        const formData = { ...values }
        delete formData.confirm_password
        onFinish(formData, avatarFile)
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                is_active: true,
            }}>
            <Card title={isEdit ? 'Cập nhật nhân viên' : 'Tạo Nhân Viên'} className="shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <Avatar
                            size={120}
                            src={avatarUrl}
                            icon={!avatarUrl && <UserOutlined />}
                            className="border-2 border-dashed border-gray-300 bg-gray-50 mb-4"
                        />
                    </div>
                    <Space size="middle">
                        <Upload
                            name="avatar"
                            showUploadList={false}
                            beforeUpload={handleBeforeUpload}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            fileList={avatarFile ? ([avatarFile] as unknown as []) : []}>
                            <Button
                                type="text"
                                icon={<SyncOutlined />}
                                loading={isUploading}
                                className="text-gray-600 hover:text-blue-600">
                                Change
                            </Button>
                        </Upload>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={handleDeleteAvatar}>
                            Delete
                        </Button>
                    </Space>
                </div>

                <Row gutter={[24, 16]}>
                    <Col span={12}>
                        <Form.Item
                            name="account_name"
                            label="Username"
                            required
                            rules={[
                                { required: true, message: 'Vui lòng nhập Username' },
                                { min: 3, message: 'Username tối thiểu 3 ký tự' },
                                { max: 20, message: 'Username tối đa 20 ký tự' },
                                {
                                    pattern: REGEX_ACCOUNT_NAME,
                                    message: 'Username không hợp lệ (không chứa dấu, không khoảng trắng)',
                                },
                            ]}>
                            <Input disabled={isEdit} size="large" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật Khẩu"
                            required={!isEdit}
                            rules={[
                                { required: !isEdit, message: 'Vui lòng nhập mật khẩu' },
                                { min: 6, message: 'Mật khẩu tối thiểu 6 kí tự' },
                                { max: 20, message: 'Mật khẩu tối đa 20 kí tự' },
                            ]}>
                            <Input.Password placeholder="Nhập mật khẩu" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            required
                            rules={[
                                { required: true, message: 'Thông tin bắt buộc' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}>
                            <Input placeholder="Nhập email" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="facebook"
                            label="Link Facebook"
                            rules={[{ pattern: REGEX_FACEBOOK, message: 'Link Facebook không đúng định dạng' }]}>
                            <Input placeholder="facebook.com/nva" size="large" />
                        </Form.Item>

                        <Form.Item name="job_title" label="Chức Danh">
                            <Input placeholder="VD: Chuyên Viên Môi Giới" size="large" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="full_name"
                            label="Họ tên Nhân Viên"
                            required
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                            <Input placeholder="VD: Nguyễn Văn A" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="confirm_password"
                            label="Nhập lại Mật Khẩu"
                            required={!isEdit}
                            dependencies={['password']}
                            rules={getConfirmPasswordRules(!isEdit)}>
                            <Input.Password placeholder="Nhập lại mật khẩu" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số Điện Thoại"
                            required
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: REGEX_PHONE, message: 'Số điện thoại không hợp lệ' },
                            ]}>
                            <Input placeholder="091 xxx xxx xxx" size="large" />
                        </Form.Item>

                        <Form.Item name="experience_years" label="Năm Kinh Nghiệm">
                            <Input placeholder="Nhập số năm kinh nghiệm" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="role_id"
                            label="Phân Quyền"
                            required
                            rules={[{ required: true, message: 'Vui lòng chọn phân quyền' }]}>
                            <Select
                                placeholder="Chuyên Viên"
                                options={roleOptions}
                                loading={isLoadingRoles}
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Form.Item name="type_account_id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="is_active" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="image_url" hidden>
                        <Input />
                    </Form.Item>
                </Row>

                <Row justify="center" className="mt-8 gap-4">
                    <Button size="large" onClick={() => navigate('/accounts')}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} size="large">
                        {isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </Row>
            </Card>
        </Form>
    )
}

export default AccountForm
