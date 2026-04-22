import { Breadcrumb, Card, Flex, Form, message, Space } from 'antd'
import { useNavigate } from 'react-router'
import { GoHome } from 'react-icons/go'
import type { CreateImage360Request } from '@/types/image-360'
import { useCreateImage360Mutation } from '@/api/image-360'
import Image360Form from '@/components/forms/Image360Form'
import { useUploadImagesMutation } from '@/api/image'
import { IMAGE_TYPE } from '@/config/constant'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CreateImage360 = () => {
    useDocumentTitle('Tạo ảnh 360')
    const [form] = Form.useForm<CreateImage360Request>()
    const [createImage360, { error: createError, isLoading: isCreating }] = useCreateImage360Mutation()
    const [uploadImagesApi, { error: uploadError, isLoading: isUploading }] = useUploadImagesMutation()
    const navigate = useNavigate()
    const { handleError } = useApiError()

    const handleSubmit = async (values: CreateImage360Request & { panoFile?: File; thumbFile?: File }) => {
        try {
            const created = await createImage360(values).unwrap()
            const recordId = created.data.panorama_id

            if (values.panoFile) {
                const formData = new FormData()
                formData.append('files', values.panoFile)
                formData.append('item_id', recordId.toString())
                formData.append('folder', `image-360/${recordId}`)
                formData.append('type', String(IMAGE_TYPE.VIEW360_PANORAMA))
                await uploadImagesApi(formData).unwrap()
            }

            if (values.thumbFile) {
                const formData = new FormData()
                formData.append('files', values.thumbFile)
                formData.append('item_id', recordId.toString())
                formData.append('folder', `image-360/${recordId}`)
                formData.append('type', String(IMAGE_TYPE.VIEW360_THUMBNAIL))
                await uploadImagesApi(formData).unwrap()
            }

            message.success('Tạo ảnh 360 thành công!')
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
                                href: '/image-360/create',
                                title: 'Tạo mới ảnh 360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <ErrorAlert error={createError || uploadError} />
            <Card>
                <Image360Form
                    form={form}
                    onFinish={handleSubmit}
                    onCancel={handleCancel}
                    loading={isCreating || isUploading}
                />
            </Card>
        </Space>
    )
}

export default CreateImage360
