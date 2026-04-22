import { Breadcrumb, Card, Flex, Form, message, Space } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { GoHome } from 'react-icons/go'
import type { CreateImage360Request, UpdateImage360Request } from '@/types/image-360'
import { useGetImage360DetailQuery, useUpdateImage360Mutation } from '@/api/image-360'
import Image360Form from '@/components/forms/Image360Form'
import { useUploadImagesMutation } from '@/api/image'
import { IMAGE_TYPE } from '@/config/constant'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const UpdateImage360 = () => {
    useDocumentTitle('Cập nhật ảnh 360')
    const { image_360_id } = useParams<{ image_360_id: string }>()
    const image360Id = Number(image_360_id)

    const [form] = Form.useForm<CreateImage360Request>()
    const [updateImage360, { error: updateError, isLoading: isUpdating }] = useUpdateImage360Mutation()
    const { data } = useGetImage360DetailQuery({ panorama_id: image360Id }, { refetchOnMountOrArgChange: true })
    const navigate = useNavigate()
    const [uploadImagesApi, { error: uploadError, isLoading: isUploading }] = useUploadImagesMutation()
    const { handleError } = useApiError()

    const dataImage360 = data?.data
    const handleSubmit = async (values: UpdateImage360Request & { panoFile?: File; thumbFile?: File }) => {
        try {
            if (values.panoFile) {
                const formData = new FormData()
                formData.append('files', values.panoFile)
                formData.append('item_id', image360Id.toString())
                formData.append('folder', `image-360/${image360Id}`)
                formData.append('type', String(IMAGE_TYPE.VIEW360_PANORAMA))
                await uploadImagesApi(formData).unwrap()
            }

            if (values.thumbFile) {
                const formData = new FormData()
                formData.append('files', values.thumbFile)
                formData.append('item_id', image360Id.toString())
                formData.append('folder', `image-360/${image360Id}`)
                formData.append('type', String(IMAGE_TYPE.VIEW360_THUMBNAIL))
                await uploadImagesApi(formData).unwrap()
            }

            await updateImage360({ panorama_id: image360Id, payload: values })

            message.success('Cập nhật ảnh 360 thành công!')
            navigate('/image-360')
        } catch (err) {
            handleError(err)
        }
    }

    const handleCancel = async () => {
        navigate('/image-360')
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
                                href: '/image-360',
                                title: 'Danh sách ảnh 360',
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Cập nhật ảnh 360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <ErrorAlert error={updateError || uploadError} />
            <Card>
                <Image360Form
                    form={form}
                    onFinish={handleSubmit}
                    onCancel={handleCancel}
                    initialValues={dataImage360}
                    loading={isUpdating || isUploading}
                />
            </Card>
        </Space>
    )
}

export default UpdateImage360
