import React, { useEffect, useCallback } from 'react'
import { Modal, Button, Flex, Spin, type FormInstance } from 'antd'
import { useGetCareCaseDetailQuery } from '@/api/care-case'
import CareCaseForm from '@/components/care/CareCaseForm'
import type { CareCaseItem } from '@/types/care-case'
import type { CustomerItem } from '@/types/customer'
import { parseCareFee } from '@/lib/utils'

interface EditCareCaseModalProps {
    open: boolean
    onCancel: () => void
    onOk?: (values: Record<string, unknown>) => void
    form: FormInstance
    record: CareCaseItem | null
    loading?: boolean
    onOpenAddCustomerModal: () => void
    newlyCreatedCustomer?: CustomerItem | null
}

const EditCareCaseModal: React.FC<EditCareCaseModalProps> = ({
    open,
    onCancel,
    onOk,
    form,
    record,
    loading = false,
    onOpenAddCustomerModal,
    newlyCreatedCustomer,
}) => {
    const { data: detailData, isLoading: isLoadingDetail } = useGetCareCaseDetailQuery(record?.id ?? 0, {
        skip: !open || !record?.id,
        refetchOnMountOrArgChange: true,
    })

    const detail = detailData?.data

    useEffect(() => {
        if (!open || !record) return
        const sourceData = (detail as CareCaseItem) || record
        if (sourceData) {
            const relatedBds = sourceData.related_bds
            const realEstate = Array.isArray(relatedBds) ? relatedBds : relatedBds ? [relatedBds] : []

            form.setFieldsValue({
                customer_id: sourceData.customer_id ?? '',
                related_bds: realEstate,
                assigned_to: sourceData.assigned_to ?? '',
                care_fee: sourceData.care_fee_display
                    ? parseCareFee(sourceData.care_fee_display)
                    : sourceData.care_fee || undefined,
                contract_files: sourceData.contract_files ?? '',
                note: sourceData.note ?? '',
            })
        }
    }, [open, record, form, detail, isLoadingDetail])

    const handleOk = useCallback(() => {
        form.validateFields().then(() => {
            const values = form.getFieldsValue()
            onOk?.(values)
        })
    }, [form, onOk])

    if (!record) return null

    return (
        <Modal
            title="Chỉnh sửa Case Chăm Sóc (Care)"
            open={open}
            onCancel={onCancel}
            afterClose={() => form.resetFields()}
            footer={null}
            width={600}
            centered
            maskClosable={false}>
            <Spin spinning={isLoadingDetail} tip="Đang tải dữ liệu...">
                <CareCaseForm
                    form={form}
                    isEdit
                    record={detail || record}
                    onOpenAddCustomerModal={onOpenAddCustomerModal}
                    newlyCreatedCustomer={newlyCreatedCustomer}
                />

                <Flex justify="flex-end" gap={12} className="mt-6 pt-4">
                    <Button onClick={onCancel}>Hủy bỏ</Button>
                    <Button type="primary" loading={loading} onClick={handleOk}>
                        Lưu thay đổi
                    </Button>
                </Flex>
            </Spin>
        </Modal>
    )
}

export default EditCareCaseModal
