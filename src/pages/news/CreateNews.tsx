import React, { useState } from 'react'
import { Form, message, Breadcrumb, Card, Space, Flex, Alert } from 'antd'
import { useNavigate, Link } from 'react-router'
import { GoHome } from 'react-icons/go'
import NewsForm from '@/components/forms/NewsForm'
import type { NewsCreateInput } from '@/types/news'
import type { RcFile } from 'antd/es/upload'
import { useCreateNewsMutation } from '@/api/news'
import { isApiError } from '@/lib/utils'
import ConfirmDiscardModal from '@/components/modals/ConfirmDiscardModal'
import { useNavBlocker } from '@/hooks/useNavBlocker'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CreateNews: React.FC = () => {
    useDocumentTitle('Tạo tin tức')
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [isDirty, setIsDirty] = useState(false)
    const [createNews, { error, isLoading }] = useCreateNewsMutation()
    const { showModal, handleConfirm, handleCancel } = useNavBlocker({ isDirty })

    const handleCreate = async (values: NewsCreateInput, imageFile?: RcFile | null) => {
        try {
            setIsDirty(false)
            const formData = new FormData()

            formData.append('payload', JSON.stringify(values))

            if (imageFile) {
                formData.append('thumbnail', imageFile)
            }

            await createNews(formData).unwrap()

            message.success('Tạo tin tức thành công!')

            setTimeout(() => {
                navigate('/news')
            }, 0)
        } catch (err) {
            if (isApiError(err)) {
                message.error(err.data?.errors?.[0]?.msg || err.data?.status?.message)
            }
        }
    }

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
                                title: <Link to="/news">Danh sách tin tức</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Tạo tin tức',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            {isApiError(error) && (
                <Alert message={error.data.errors?.[0]?.msg || error.data.status.message} type="error" />
            )}
            <NewsForm
                form={form}
                onFinish={handleCreate}
                onCancel={() => navigate(-1)}
                onValuesChange={() => setIsDirty(true)}
                loading={isLoading}
                isEdit={false}
            />
            <ConfirmDiscardModal open={showModal} onConfirm={handleConfirm} onCancel={handleCancel} />
        </Space>
    )
}

export default CreateNews
