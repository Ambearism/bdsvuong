import React from 'react'
import BasePermissionsModal from '../common/BasePermissionsModal'
import { useGetCustomerAccountPermissionsQuery, useUpdateCustomerAccountPermissionsMutation } from '@/api/customer'

interface CustomerPermissionsModalProps {
    visible: boolean
    onCancel: () => void
    customerId: number
}

const CustomerPermissionsModal: React.FC<CustomerPermissionsModalProps> = ({ visible, onCancel, customerId }) => {
    return (
        <BasePermissionsModal
            visible={visible}
            onCancel={onCancel}
            id={customerId}
            title="khách hàng"
            useGetPermissionsQuery={useGetCustomerAccountPermissionsQuery}
            useUpdatePermissionsMutation={useUpdateCustomerAccountPermissionsMutation}
            idFieldName="customer_id"
        />
    )
}

export default CustomerPermissionsModal
