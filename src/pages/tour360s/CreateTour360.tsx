import { useCreateTour360Mutation } from '@/api/tour360'
import Tour360Form from '@/components/forms/Tour360Form'
import type { Tour360CreateInput } from '@/types/tour360'
import { Breadcrumb, Card, Flex, Form, Space, message } from 'antd'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'

const CreateTour360 = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [createTour360, { error, isLoading }] = useCreateTour360Mutation()
    const { handleError } = useApiError()

    const handleCreate = async (values: Tour360CreateInput) => {
        try {
            await createTour360(values).unwrap()
            message.success('Tạo tour 360 thành công!')
            navigate(-1)
        } catch (err) {
            handleError(err)
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Danh sách Tour 360',
                                className: 'text-md font-medium',
                                href: '/tour360s',
                            },
                            {
                                title: 'Tạo Tour 360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <ErrorAlert error={error} />
            <Tour360Form form={form} onFinish={handleCreate} onCancel={handleCancel} loading={isLoading} />
        </Space>
    )
}

export default CreateTour360
