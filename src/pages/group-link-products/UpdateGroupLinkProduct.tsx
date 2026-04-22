import { useGetGroupLinkProductDetailQuery, useUpdateGroupLinkProductMutation } from '@/api/group-link-product'
import { TextEditor } from '@/components/tiptap'
import { app } from '@/config/app'
import { isApiError } from '@/lib/utils'
import type { GroupLinkProductUpdateInput } from '@/types/group-link-product'
import { GoHome } from 'react-icons/go'
import {
    Alert,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    Radio,
    Row,
    Space,
    Spin,
    message,
} from 'antd'
import { MAX_LENGTH_2000, MAX_LENGTH_255 } from '@/config/constant'
import React, { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { FilterConditionsCard } from '@/components/group-link-products/FilterConditionsCard'

const UpdateGroupLinkProduct: React.FC = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const { id } = useParams<{ id: string }>()
    const numericId = Number(id)

    const {
        data: detailData,
        isLoading,
        refetch,
    } = useGetGroupLinkProductDetailQuery({ id: numericId }, { skip: !numericId, refetchOnMountOrArgChange: true })

    const [updateGroupLink, { isLoading: isUpdating, error: updateError }] = useUpdateGroupLinkProductMutation()

    useEffect(() => {
        if (detailData?.data) {
            form.setFieldsValue(detailData.data)
        }
    }, [detailData, form])

    const handleFinish = async (values: GroupLinkProductUpdateInput) => {
        if (!numericId) return
        try {
            await updateGroupLink({ id: numericId, payload: values }).unwrap()
            message.success('Cập nhật thành công!')
            refetch()
        } catch (err) {
            if (isApiError(err)) {
                message.error(err.data?.errors?.[0]?.msg || err.data?.status?.message)
            }
        }
    }

    const conditions = detailData?.data?.cond || {}

    if (isLoading) return <Spin fullscreen />

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                title: (
                                    <Link to="/">
                                        <GoHome size={24} />
                                    </Link>
                                ),
                            },
                            {
                                title: <Link to="/group-link-products">Quản lý tổ hợp Link</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Chỉnh sửa',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            {isApiError(updateError) && (
                <Alert
                    message={updateError.data?.errors?.[0]?.msg || updateError.data?.status?.message}
                    type="error"
                    showIcon
                />
            )}

            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={detailData?.data}>
                <Row gutter={24}>
                    <Col span={6}>
                        <FilterConditionsCard conditions={conditions} />
                    </Col>

                    <Col span={18}>
                        <Card className="shadow-sm">
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tiêu đề' },
                                    {
                                        max: MAX_LENGTH_255,
                                        message: `Tiêu đề không được vượt quá ${MAX_LENGTH_255} ký tự`,
                                    },
                                ]}>
                                <Input />
                            </Form.Item>

                            <Form.Item name="url" label="Đường dẫn">
                                <Input disabled className="bg-gray-50 text-gray-500" />
                            </Form.Item>
                            <div className="mb-4">
                                <Link
                                    to={`${app.CLIENT_URL}/${detailData?.data?.url}`}
                                    target="_blank"
                                    className="text-blue-500 hover:underline">
                                    Xem trên web
                                </Link>
                            </div>

                            <Form.Item name="not_show_description" valuePropName="checked">
                                <Checkbox>Không hiện nội dung chính</Checkbox>
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label="Nội dung chính"
                                rules={[
                                    {
                                        max: MAX_LENGTH_2000,
                                        message: `Nội dung không được vượt quá ${MAX_LENGTH_2000} ký tự`,
                                    },
                                ]}>
                                <TextEditor textOnly />
                            </Form.Item>

                            <Divider />

                            <Form.Item name="seo_robots" label="Robots">
                                <Radio.Group className="w-full">
                                    <Row gutter={[8, 8]}>
                                        <Col span={8}>
                                            <Radio value="all">ALL (index, follow)</Radio>
                                        </Col>
                                        <Col span={8}>
                                            <Radio value="index">INDEX</Radio>
                                        </Col>
                                        <Col span={8}>
                                            <Radio value="follow">FOLLOW</Radio>
                                        </Col>
                                        <Col span={8}>
                                            <Radio value="none">NONE (noindex, nofollow)</Radio>
                                        </Col>
                                        <Col span={8}>
                                            <Radio value="noindex">NOINDEX</Radio>
                                        </Col>
                                        <Col span={8}>
                                            <Radio value="nofollow">NOFOLLOW</Radio>
                                        </Col>
                                    </Row>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item
                                name="seo_keywords"
                                label="Seo Keywords"
                                rules={[
                                    {
                                        max: MAX_LENGTH_255,
                                        message: `Keywords không được vượt quá ${MAX_LENGTH_255} ký tự`,
                                    },
                                ]}>
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="extra_code"
                                label="Extra Code"
                                rules={[
                                    {
                                        max: MAX_LENGTH_2000,
                                        message: `Extra code không được vượt quá ${MAX_LENGTH_2000} ký tự`,
                                    },
                                ]}>
                                <Input.TextArea rows={4} className="font-mono text-xs" showCount />
                            </Form.Item>

                            <Space className="w-full justify-end mt-4">
                                <Button onClick={() => navigate('/group-link-products')}>Quay lại</Button>
                                <Button type="primary" htmlType="submit" loading={isUpdating}>
                                    Lưu cập nhật
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Space>
    )
}

export default UpdateGroupLinkProduct
