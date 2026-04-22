import { Form, message, Modal } from 'antd'
import OpportunityForm from '@/components/forms/OpportunityForm'
import { useCreateOpportunityMutation } from '@/api/opportunity'
import { useNavigate } from 'react-router'
import type { OpportunityCreateInput, OpportunityBase } from '@/types/opportunity'

const CreateOpportunity = () => {
    const [form] = Form.useForm<OpportunityBase>()
    const [createOpportunity, { isLoading }] = useCreateOpportunityMutation()
    const navigate = useNavigate()

    const handleSubmit = async (values: OpportunityBase) => {
        const payload: OpportunityCreateInput = {
            ...values,
            name: values.name || `Lead #${Date.now()}`,
        } as OpportunityCreateInput

        try {
            await createOpportunity(payload).unwrap()
            message.success('Tạo Lead/Deal thành công!')
            navigate('/opportunities')
        } catch {
            message.error('Tạo Lead/Deal thất bại, vui lòng thử lại!')
        }
    }

    return (
        <Modal
            open={true}
            title="Chi tiết Lead"
            footer={null}
            width={700}
            onCancel={() => navigate('/opportunities')}
            centered>
            <OpportunityForm
                form={form}
                onFinish={handleSubmit}
                loading={isLoading}
                onCancel={() => navigate('/opportunities')}
            />
        </Modal>
    )
}

export default CreateOpportunity
