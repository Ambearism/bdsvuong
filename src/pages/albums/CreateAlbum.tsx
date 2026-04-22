import { useCreateAlbumMutation } from '@/api/album'
import AlbumForm from '@/components/forms/AlbumForm'
import type { AlbumCreatePayload } from '@/types/album'
import { Breadcrumb, Card, Flex, Form, Space, message } from 'antd'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'

const CreateAlbum = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [createAlbum, { isLoading }] = useCreateAlbumMutation()

    const onCancel = () => {
        navigate(-1)
    }

    const handleCreate = async (values: AlbumCreatePayload) => {
        try {
            await createAlbum(values).unwrap()
            message.success('Tạo Album thành công!')
            onCancel()
        } catch {
            message.error('Tạo Album thất bại!')
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
                                href: '/albums',
                                title: 'Danh sách Album',
                                className: 'text-md font-medium',
                            },
                            {
                                href: '/albums/create',
                                title: 'Tạo Album',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <AlbumForm form={form} onFinish={handleCreate} onCancel={onCancel} loading={isLoading} />
        </Space>
    )
}

export default CreateAlbum
