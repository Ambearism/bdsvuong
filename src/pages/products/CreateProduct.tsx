import { Breadcrumb, Card, Form, message, Space } from 'antd'
import ProductForm from '@/components/forms/ProductForm'
import { useCreateProductMutation, useGetProductMaxIdQuery } from '@/api/product'
import { useNavigate, Link } from 'react-router'
import type { ProductItem, ProductCreateInput, ProductFormValues } from '@/types/product'
import dayjs from 'dayjs'
import { GoHome } from 'react-icons/go'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'
import React, { useState } from 'react'
import ConfirmDiscardModal from '@/components/modals/ConfirmDiscardModal'
import { useNavBlocker } from '@/hooks/useNavBlocker'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CreateProduct: React.FC = () => {
    useDocumentTitle('Tạo hàng hoá')
    const [form] = Form.useForm<Partial<ProductFormValues>>()
    const [createProduct, { error }] = useCreateProductMutation()
    const { data: maxIdRes } = useGetProductMaxIdQuery()
    const navigate = useNavigate()
    const { handleError } = useApiError()
    const [isDirty, setIsDirty] = useState(false)
    const { showModal, handleConfirm, handleCancel } = useNavBlocker({ isDirty })

    const handleSubmit = async (values: Partial<ProductItem>) => {
        const maxData = maxIdRes?.data
        if (!maxData) {
            message.error('Không lấy được mã hàng hoá, vui lòng thử lại!')
            return
        }

        const product_code = `#H${maxData.max_id}.${maxData.max_sub_id}`
        const payload: ProductCreateInput = {
            ...values,
            product_code,
            send_date: values?.send_date
                ? typeof values.send_date === 'string'
                    ? values.send_date
                    : dayjs(values.send_date).format('YYYY-MM-DD')
                : null,
        } as ProductCreateInput

        try {
            setIsDirty(false)
            await createProduct(payload).unwrap()
            message.success('Tạo hàng hoá thành công!')
            setTimeout(() => {
                navigate('/products')
            }, 0)
        } catch (err) {
            handleError(err)
        }
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Space direction="vertical" className="w-full">
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
                                title: 'Tạo mới hàng hoá',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Space>
            </Card>
            <ErrorAlert error={error} />
            <Card>
                <ProductForm
                    form={form}
                    onFinish={handleSubmit}
                    onValuesChange={() => setIsDirty(true)}
                    showProductCode
                />
            </Card>
            <ConfirmDiscardModal open={showModal} onConfirm={handleConfirm} onCancel={handleCancel} />
        </Space>
    )
}

export default CreateProduct
