import { useGetTour360DetailQuery, useUpdateTour360Mutation } from '@/api/tour360'
import Tour360Form from '@/components/forms/Tour360Form'
import type { Tour360UpdateInput } from '@/types/tour360'
import { Breadcrumb, Card, Flex, Form, Space, message } from 'antd'
import { GoHome } from 'react-icons/go'
import { useNavigate, useParams } from 'react-router'
import Loading from '@/components/Loading'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'

const UpdateTour360 = () => {
    const navigate = useNavigate()
    const { tourId } = useParams<{ tourId: string }>()
    const tour360Id = parseInt(tourId!)
    const [form] = Form.useForm()
    const { handleError } = useApiError()

    const { data, isLoading: isLoadingDetail } = useGetTour360DetailQuery(
        { tour360_id: tour360Id },
        { skip: !tour360Id, refetchOnMountOrArgChange: true },
    )
    const [updateTour360, { error, isLoading }] = useUpdateTour360Mutation()

    const handleUpdate = async (values: Tour360UpdateInput) => {
        try {
            await updateTour360({ tour360_id: tour360Id, payload: values }).unwrap()
            message.success('Cập nhật tour 360 thành công!')
            navigate(-1)
        } catch (err) {
            handleError(err)
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (isLoadingDetail) {
        return <Loading />
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
                                href: '/tour360s',
                                title: 'Danh sách Tour 360',
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Chỉnh sửa Tour 360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <ErrorAlert error={error} />
            <Tour360Form
                form={form}
                initialValues={data?.data}
                onFinish={handleUpdate}
                onCancel={handleCancel}
                loading={isLoading}
                isEdit
            />
        </Space>
    )
}

export default UpdateTour360
