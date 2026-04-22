import { Form, message, Modal, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { useMemo } from 'react'
import TransactionForm from '@/components/forms/TransactionForm'
import { useGetTransactionDetailQuery, useUpdateTransactionMutation } from '@/api/transaction'
import type { TransactionUpdateInput, TransactionFormValues } from '@/types/opportunity'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const UpdateTransaction = () => {
    useDocumentTitle('Cập nhật giao dịch')
    const { transactionId } = useParams<{ transactionId: string }>()
    const id = Number(transactionId)
    const navigate = useNavigate()
    const [form] = Form.useForm<TransactionFormValues>()

    const { data, isLoading: isLoadingDetail } = useGetTransactionDetailQuery(
        { transaction_id: id },
        {
            skip: Number.isNaN(id),
            refetchOnMountOrArgChange: true,
        },
    )

    const transaction = useMemo(() => data?.data, [data])

    const [updateTransaction, { isLoading }] = useUpdateTransactionMutation()

    const handleSubmit = async (values: TransactionUpdateInput) => {
        try {
            await updateTransaction({
                transaction_id: id,
                payload: values,
            }).unwrap()
            message.success('Cập nhật giao dịch thành công!')
            navigate('/transactions')
        } catch {
            message.error('Cập nhật giao dịch thất bại, vui lòng thử lại!')
        }
    }

    const handleCancel = () => {
        navigate('/transactions')
    }

    return (
        <Modal
            open={true}
            title={`Cập nhật Giao Dịch - ${transaction?.transaction_code || `#${id}`}`}
            footer={null}
            width={900}
            onCancel={handleCancel}
            centered
            destroyOnHidden>
            <Spin spinning={isLoadingDetail}>
                {transaction && (
                    <TransactionForm
                        form={form}
                        onFinish={handleSubmit}
                        initialValues={transaction}
                        loading={isLoading}
                        onCancel={handleCancel}
                        isEdit
                    />
                )}
            </Spin>
        </Modal>
    )
}

export default UpdateTransaction
