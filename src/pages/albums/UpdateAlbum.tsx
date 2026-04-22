import { useGetAlbumDetailQuery, useUpdateAlbumMutation } from '@/api/album'
import Loading from '@/components/Loading'
import AlbumForm from '@/components/forms/AlbumForm'
import type { AlbumUpdatePayload } from '@/types/album'
import { Breadcrumb, Card, Flex, Form, Space, message } from 'antd'
import { GoHome } from 'react-icons/go'
import { useNavigate, useParams } from 'react-router'

const UpdateAlbum = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const { album_id } = useParams<{ album_id: string }>()
    const albumId = Number(album_id)

    const { data, isLoading } = useGetAlbumDetailQuery(
        { album_id: albumId },
        { skip: !albumId, refetchOnMountOrArgChange: true },
    )

    const [updateAlbum, { isLoading: isUpdating }] = useUpdateAlbumMutation()

    const onCancel = () => {
        navigate(-1)
    }

    const handleUpdate = async (values: AlbumUpdatePayload) => {
        if (!albumId) return
        try {
            await updateAlbum({ album_id: albumId, payload: values }).unwrap()
            message.success('Cập nhật Album thành công!')
        } catch {
            message.error('Cập nhật Album thất bại!')
        }
    }

    if (isLoading) {
        return <Loading />
    }

    const albumData = data?.data

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
                                title: 'Danh sách Album',
                                className: 'text-md font-medium',
                                href: '/albums',
                            },
                            {
                                href: `/albums/${albumId}/update`,
                                title: 'Chỉnh sửa Album',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            {albumData && (
                <AlbumForm
                    form={form}
                    initialValues={albumData}
                    onFinish={handleUpdate}
                    onCancel={onCancel}
                    isEdit
                    loading={isUpdating}
                />
            )}
        </Space>
    )
}

export default UpdateAlbum
