import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { message, Spin, Form, Breadcrumb, Card, Space, Flex, Alert } from 'antd'
import NewsForm from '@/components/forms/NewsForm'
import { useGetNewsDetailQuery, useUpdateNewsMutation } from '@/api/news'
import { GoHome } from 'react-icons/go'
import type { NewsUpdateInput } from '@/types/news'
import { isApiError } from '@/lib/utils'
import ConfirmDiscardModal from '@/components/modals/ConfirmDiscardModal'
import { useNavBlocker } from '@/hooks/useNavBlocker'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const UpdateNews = () => {
    useDocumentTitle('Cập nhật bài viết')
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [isDirty, setIsDirty] = useState(false)

    const { news_id } = useParams<{ news_id: string }>()
    const newsId = Number(news_id)

    const { data, isLoading } = useGetNewsDetailQuery(
        { news_id: newsId },
        { skip: !newsId, refetchOnMountOrArgChange: true },
    )

    const [updateNews, { isLoading: isUpdating, error }] = useUpdateNewsMutation()

    const { showModal, handleConfirm, handleCancel } = useNavBlocker({ isDirty })

    const handleUpdate = async (values: NewsUpdateInput) => {
        if (!newsId) return
        try {
            await updateNews({ news_id: newsId, payload: values }).unwrap()
            message.success('Cập nhật tin tức thành công!')
            setIsDirty(false)
        } catch (err) {
            if (isApiError(err)) {
                message.error(err.data?.errors?.[0]?.msg || err.data?.status?.message)
            }
        }
    }

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
                                title: <Link to="/news">Danh sách bài viết</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Chỉnh sửa bài viết',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            {isApiError(error) && (
                <Alert message={error.data.errors?.[0]?.msg || error.data.status.message} type="error" />
            )}
            {data?.data && (
                <NewsForm
                    form={form}
                    initialValues={data.data}
                    onFinish={handleUpdate}
                    onCancel={() => navigate(-1)}
                    onValuesChange={() => setIsDirty(true)}
                    isEdit
                    loading={isUpdating}
                />
            )}
            <ConfirmDiscardModal open={showModal} onConfirm={handleConfirm} onCancel={handleCancel} />
        </Space>
    )
}

export default UpdateNews
