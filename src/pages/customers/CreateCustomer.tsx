import { Breadcrumb, Card, Flex, Form, message, Space, Typography } from 'antd'
import CustomerForm from '@/components/forms/CustomerForm'
import { useCreateCustomerMutation } from '@/api/customer'
import { useNavigate, Link } from 'react-router'
import { GoHome } from 'react-icons/go'
import { isApiError } from '@/lib/utils'
import type { CustomerItem, CustomerCreateInput } from '@/types/customer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CreateCustomer = () => {
    useDocumentTitle('Tạo khách hàng')
    const [form] = Form.useForm<Partial<CustomerItem>>()
    const [createCustomer, { isLoading }] = useCreateCustomerMutation()
    const navigate = useNavigate()

    const handleSubmit = async (values: Partial<CustomerItem>) => {
        const payload: CustomerCreateInput = {
            ...values,
            birthday: values.birthday || undefined,
        } as CustomerCreateInput

        try {
            await createCustomer(payload).unwrap()
            message.success('Tạo khách hàng thành công!')
            navigate('/customers')
        } catch (err) {
            if (isApiError(err)) {
                message.error(err.data?.errors?.[0]?.msg || err.data?.status?.message || 'Tạo khách hàng thất bại!')
            } else {
                message.error('Tạo khách hàng thất bại, vui lòng thử lại!')
            }
        }
    }

    const handleCancel = () => {
        navigate('/customers')
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="start" align="center" gap="middle">
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
                                title: (
                                    <Link to="/customers" className="text-md font-medium">
                                        Danh sách khách hàng
                                    </Link>
                                ),
                            },
                            {
                                title: 'Tạo khách hàng mới',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <Card
                title={
                    <Space>
                        <Typography.Title level={4} className="!mb-0">
                            Tạo mới khách hàng
                        </Typography.Title>
                    </Space>
                }>
                <CustomerForm form={form} onFinish={handleSubmit} loading={isLoading} onCancel={handleCancel} />
            </Card>
        </Space>
    )
}

export default CreateCustomer
