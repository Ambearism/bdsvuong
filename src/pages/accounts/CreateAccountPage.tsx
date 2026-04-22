import { Breadcrumb, Card, Flex, Space, message, Form } from 'antd'
import { GoHome } from 'react-icons/go'
import AccountForm from '@/components/forms/AccountForm'
import { useCreateAccountMutation, useUpdateAccountMutation } from '@/api/account'
import { useUploadImagesMutation } from '@/api/image'
import { useNavigate } from 'react-router'
import type { CreateAccountRequest } from '@/types/account'
import { IMAGE_TYPE } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useApiError } from '@/utils/error'

const CreateAccountPage = () => {
    useDocumentTitle('Tạo tài khoản')
    const navigate = useNavigate()
    const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation()
    const [updateAccount] = useUpdateAccountMutation()
    const [uploadImages] = useUploadImagesMutation()
    const { handleError } = useApiError()
    const [form] = Form.useForm<CreateAccountRequest>()

    const handleCreate = async (values: CreateAccountRequest, file?: File | null) => {
        try {
            const res = await createAccount(values).unwrap()
            const accountId = res.data?.id

            if (file && accountId) {
                const formData = new FormData()
                formData.append('files', file)
                formData.append('item_id', accountId.toString())
                formData.append('folder', `accounts/${accountId}`)
                formData.append('type', String(IMAGE_TYPE.ACCOUNT_AVATAR))

                const uploadRes = await uploadImages(formData).unwrap()

                const uploadedPath = uploadRes.data?.[0]?.path
                if (uploadedPath) {
                    await updateAccount({
                        id: Number(accountId),
                        payload: { ...values, image_url: uploadedPath },
                    }).unwrap()
                }
            }

            message.success('Tạo tài khoản thành công!')
            navigate('/accounts')
        } catch (err: unknown) {
            handleError(err, 'Tạo tài khoản thất bại!', form)
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
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                href: '/accounts',
                                title: 'Danh sách nhân viên',
                            },
                            {
                                title: 'Tạo mới',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <AccountForm form={form} onFinish={handleCreate} loading={isCreating} />
        </Space>
    )
}

export default CreateAccountPage
