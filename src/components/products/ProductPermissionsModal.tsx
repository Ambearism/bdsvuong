import React from 'react'
import BasePermissionsModal from '../common/BasePermissionsModal'
import { useGetProductAccountPermissionsQuery, useUpdateProductAccountPermissionsMutation } from '@/api/product'

interface ProductPermissionsModalProps {
    visible: boolean
    onCancel: () => void
    productId: number
}

const ProductPermissionsModal: React.FC<ProductPermissionsModalProps> = ({ visible, onCancel, productId }) => {
    return (
        <BasePermissionsModal
            visible={visible}
            onCancel={onCancel}
            id={productId}
            title="hàng hoá"
            useGetPermissionsQuery={useGetProductAccountPermissionsQuery}
            useUpdatePermissionsMutation={useUpdateProductAccountPermissionsMutation}
            idFieldName="product_id"
        />
    )
}

export default ProductPermissionsModal
