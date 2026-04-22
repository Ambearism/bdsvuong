import { Breadcrumb, Card, Flex, Space, message, Form, Spin } from 'antd'
import { GoHome } from 'react-icons/go'
import AccountForm from '@/components/forms/AccountForm'
import { useUpdateAccountMutation, useGetAccountDetailQuery } from '@/api/account'

import { useNavigate, useParams } from 'react-router'
import type { CreateAccountRequest } from '@/types/account'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useApiError } from '@/utils/error'

const UpdateAccountPage = () => {
    useDocumentTitle('Cập nhật tài khoản')
    const { account_id } = useParams<{ account_id: string }>()
    const accountId = Number(account_id)
    const navigate = useNavigate()
    const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation()
    const {
        data: accountData,
        isLoading: isLoadingDetail,
        refetch,
    } = useGetAccountDetailQuery(accountId, {
        skip: !accountId,
        refetchOnMountOrArgChange: true,
    })
    const { handleError } = useApiError()
    const [form] = Form.useForm<CreateAccountRequest>()

    const executeAccountUpdate = async (values: CreateAccountRequest, stayOnPage: boolean = false) => {
        if (!accountId) return
        try {
            const payload = { ...values }
            await updateAccount({ id: accountId, payload }).unwrap()
            message.success('Cập nhật tài khoản thành công!')
            refetch()
            if (!stayOnPage) {
                navigate('/accounts')
            }
        } catch (err: unknown) {
            handleError(err, 'Cập nhật tài khoản thất bại!', form)
        }
    }

    const handleUpdate = (values: CreateAccountRequest) => {
        executeAccountUpdate(values, false)
    }

    if (isLoadingDetail) {
        return <Spin className="flex justify-center mt-10" size="large" />
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
                                href: '/accounts',
                                title: 'Danh sách nhân viên',
                            },
                            {
                                title: 'Cập nhật',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <AccountForm
                form={form}
                onFinish={handleUpdate}
                initialValues={accountData?.data}
                loading={isUpdating}
                isEdit
                accountId={accountId}
            />
        </Space>
    )
}

export default UpdateAccountPage
