import { Form, message, Modal } from 'antd'
import { useNavigate } from 'react-router'
import TransactionForm from '@/components/forms/TransactionForm'
import { useCreateTransactionMutation } from '@/api/transaction'
import type { TransactionCreateInput, TransactionFormValues } from '@/types/opportunity'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CreateTransaction = () => {
    useDocumentTitle('Tạo giao dịch')
    const navigate = useNavigate()
    const [form] = Form.useForm<TransactionFormValues>()
    const [createTransaction, { isLoading }] = useCreateTransactionMutation()

    const handleCreate = async (values: TransactionCreateInput) => {
        try {
            await createTransaction(values).unwrap()
            message.success('Tạo giao dịch thành công!')
            navigate('/transactions')
        } catch {
            message.error('Tạo giao dịch thất bại, vui lòng thử lại!')
        }
    }

    const handleCancel = () => {
        navigate('/transactions')
    }

    return (
        <Modal
            open={true}
            title="Tạo Giao Dịch Mới"
            footer={null}
            width={900}
            onCancel={handleCancel}
            centered
            destroyOnHidden>
            <TransactionForm form={form} onFinish={handleCreate} loading={isLoading} onCancel={handleCancel} />
        </Modal>
    )
}

export default CreateTransaction
