import { Form, message, Modal, Spin } from 'antd'
import OpportunityForm from '@/components/forms/OpportunityForm'
import { useGetOpportunityDetailQuery, useUpdateOpportunityMutation } from '@/api/opportunity'
import { useNavigate, useParams } from 'react-router'
import type { OpportunityItem, OpportunityUpdateInput } from '@/types/opportunity'
import { useMemo } from 'react'

const UpdateOpportunity = () => {
    const { opportunityId } = useParams<{ opportunityId: string }>()
    const id = Number(opportunityId)
    const navigate = useNavigate()
    const [form] = Form.useForm()

    const {
        data,
        isLoading: isLoadingDetail,
        refetch,
    } = useGetOpportunityDetailQuery(
        { opportunity_id: id },
        {
            skip: Number.isNaN(id),
            refetchOnMountOrArgChange: true,
        },
    )

    const opportunityData = useMemo(() => {
        if (!data?.data) return undefined
        return {
            ...data.data,
        }
    }, [data])

    const [updateOpportunity, { isLoading }] = useUpdateOpportunityMutation()

    const handleSubmit = async (rawValues: Partial<OpportunityItem>) => {
        const values: OpportunityUpdateInput = { ...rawValues }

        try {
            await updateOpportunity({
                opportunity_id: id,
                payload: values,
            }).unwrap()

            await refetch()

            message.success('Cập nhật Lead/Deal thành công!')
            navigate('/opportunities', { replace: true })
        } catch {
            message.error('Cập nhật Lead/Deal thất bại, vui lòng thử lại!')
        }
    }

    return (
        <Modal
            open={true}
            title={`Chi tiết Lead #${id}`}
            footer={null}
            width={700}
            onCancel={() => navigate('/opportunities')}
            centered>
            <Spin spinning={isLoadingDetail}>
                <OpportunityForm
                    key={id}
                    form={form}
                    onFinish={handleSubmit}
                    initialValues={opportunityData}
                    loading={isLoading}
                    onCancel={() => navigate('/opportunities')}
                    isEdit
                />
            </Spin>
        </Modal>
    )
}

export default UpdateOpportunity
