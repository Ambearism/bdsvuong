import { useGetProductDetailQuery, useUpdateProductMutation } from '@/api/product'
import ProductForm from '@/components/forms/ProductForm'
import { Breadcrumb, Card, Form, message, Space } from 'antd'
import { useParams, Link, useNavigate } from 'react-router'
import Loading from '@/components/Loading'
import dayjs from 'dayjs'
import type { ProductItem, ProductUpdateInput, ProductFormValues } from '@/types/product'
import { GoHome } from 'react-icons/go'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'
import React, { useState } from 'react'
import ConfirmDiscardModal from '@/components/modals/ConfirmDiscardModal'
import { useNavBlocker } from '@/hooks/useNavBlocker'
import ProductPermissionsModal from '@/components/products/ProductPermissionsModal'
import { Flex, Button } from 'antd'
import { ACTION } from '@/config/permission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const UpdateProduct: React.FC = () => {
    useDocumentTitle('Cập nhật hàng hoá')
    const navigate = useNavigate()
    const { product_id } = useParams<{ product_id: string }>()
    const productId = Number(product_id)
    const [form] = Form.useForm<Partial<ProductFormValues>>()
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
    const { handleError } = useApiError()
    const isReadyRef = React.useRef(false)

    const { data, isLoading, isError } = useGetProductDetailQuery(
        { product_id: productId },
        {
            skip: Number.isNaN(productId),
            refetchOnMountOrArgChange: true,
        },
    )
    const productData = data?.data

    React.useEffect(() => {
        if (productData && productData.product_permissions) {
            const canUpdate = productData.product_permissions.includes(ACTION.UPDATE)
            if (!canUpdate) {
                navigate('/404', { replace: true })
            }
        }
    }, [productData, navigate])

    React.useEffect(() => {
        if (isError) {
            navigate('/404', { replace: true })
        }
    }, [isError, navigate])
    const [isDirty, setIsDirty] = useState(false)

    React.useEffect(() => {
        if (productData) {
            const timer = setTimeout(() => {
                isReadyRef.current = true
            }, 1000)
            return () => {
                clearTimeout(timer)
                isReadyRef.current = false
            }
        }
    }, [productData])

    const [updateProduct, { error }] = useUpdateProductMutation()

    const { showModal, handleConfirm, handleCancel } = useNavBlocker({ isDirty })

    const handleSubmit = async (rawValues: Partial<ProductItem>) => {
        const values = { ...rawValues }
        if (values.send_date) {
            const sendDate = dayjs(values.send_date)
            values.send_date = sendDate.format('YYYY-MM-DD')
        }

        try {
            await updateProduct({ product_id: productId, payload: values as ProductUpdateInput }).unwrap()
            message.success('Cập nhật hàng hoá thành công!')

            setIsDirty(false)
        } catch (err) {
            handleError(err)
        }
    }

    const handleValuesChange = () => {
        if (isReadyRef.current) {
            setIsDirty(true)
        }
    }

    if (isLoading) {
        return <Loading />
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Space direction="vertical" className="w-full">
                    <Flex justify="space-between" align="center">
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
                                    title: <Link to="/products">Danh sách hàng hoá</Link>,
                                    className: 'text-md font-medium',
                                },
                                {
                                    title: 'Cập nhật hàng hoá',
                                    className: 'text-md font-medium',
                                },
                            ]}
                        />
                        <Button onClick={() => setIsPermissionsOpen(true)}>Phân quyền</Button>
                    </Flex>
                </Space>
            </Card>
            <ErrorAlert error={error} />
            <ProductPermissionsModal
                visible={isPermissionsOpen}
                onCancel={() => setIsPermissionsOpen(false)}
                productId={productId}
            />
            <Card>
                <ProductForm
                    key={productId}
                    form={form}
                    onFinish={handleSubmit}
                    initialValues={productData}
                    onValuesChange={handleValuesChange}
                    showProductCode={true}
                />
            </Card>
            <ConfirmDiscardModal open={showModal} onConfirm={handleConfirm} onCancel={handleCancel} />
        </Space>
    )
}

export default UpdateProduct
