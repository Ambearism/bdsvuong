import { Breadcrumb, Button, Card, Flex, Form, message, Space, Typography } from 'antd'
import CustomerForm from '@/components/forms/CustomerForm'
import { useGetCustomerDetailQuery, useUpdateCustomerMutation } from '@/api/customer'
import { useNavigate, useParams, Link } from 'react-router'
import { GoHome } from 'react-icons/go'
import { isApiError } from '@/lib/utils'
import dayjs, { Dayjs } from 'dayjs'
import type { CustomerItem, CustomerUpdateInput } from '@/types/customer'
import CustomerPermissionsModal from '@/components/customers/CustomerPermissionsModal'
import { useState, useEffect } from 'react'
import { ACTION } from '@/config/permission'
import Loading from '@/components/Loading'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const UpdateCustomer = () => {
    useDocumentTitle('Cập nhật khách hàng')
    const { customerId } = useParams<{ customerId: string }>()
    const id = Number(customerId)
    const navigate = useNavigate()
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
    const [form] = Form.useForm()

    const {
        data,
        isLoading: isLoadingDetail,
        isError,
    } = useGetCustomerDetailQuery(
        { customer_id: id },
        {
            skip: Number.isNaN(id),
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
        },
    )

    useEffect(() => {
        if (data?.data && data.data.customer_permissions) {
            const canUpdate = data.data.customer_permissions.includes(ACTION.UPDATE)
            if (!canUpdate) {
                navigate('/404', { replace: true })
            }
        }
    }, [data, navigate])

    useEffect(() => {
        if (isError) {
            navigate('/404', { replace: true })
        }
    }, [isError, navigate])

    const [updateCustomer, { isLoading }] = useUpdateCustomerMutation()

    if (isLoadingDetail) {
        return <Loading />
    }

    const customerData = data?.data
        ? {
              ...data.data,
              birthday: data.data.birthday ? dayjs(data.data.birthday) : undefined,
          }
        : undefined

    const handleSubmit = async (rawValues: Partial<CustomerItem>) => {
        const values: Partial<CustomerItem> = { ...rawValues }

        if (values.birthday && dayjs.isDayjs(values.birthday)) {
            values.birthday = (values.birthday as Dayjs).format('YYYY-MM-DD')
        }

        try {
            await updateCustomer({
                customer_id: id,
                payload: values as unknown as CustomerUpdateInput,
            }).unwrap()

            message.success('Cập nhật khách hàng thành công!')
            navigate('/customers', { replace: true })
        } catch (err) {
            if (isApiError(err)) {
                message.error(
                    err.data?.errors?.[0]?.msg || err.data?.status?.message || 'Cập nhật khách hàng thất bại!',
                )
            } else {
                message.error('Cập nhật khách hàng thất bại, vui lòng thử lại!')
            }
        }
    }

    const handleCancel = () => {
        navigate('/customers')
    }

    return (
        <Space direction="vertical" className="w-full" size="middle">
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
                                title: 'Cập nhật khách hàng',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <CustomerPermissionsModal
                visible={isPermissionsOpen}
                onCancel={() => setIsPermissionsOpen(false)}
                customerId={id}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center">
                        <Typography.Title level={4} className="!mb-0">
                            Cập nhật khách hàng
                        </Typography.Title>
                        <Button onClick={() => setIsPermissionsOpen(true)}>Phân quyền</Button>
                    </Flex>
                }>
                <CustomerForm
                    key={id}
                    form={form}
                    onFinish={handleSubmit}
                    initialValues={customerData}
                    loading={isLoading}
                    onCancel={handleCancel}
                />
            </Card>
        </Space>
    )
}

export default UpdateCustomer
