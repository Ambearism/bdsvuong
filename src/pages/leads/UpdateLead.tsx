import { Breadcrumb, Card, Flex, Form, message, Space, Spin, Typography } from 'antd'
import { useNavigate, useParams, Link } from 'react-router'
import { GoHome } from 'react-icons/go'
import { useMemo } from 'react'
import OpportunityForm from '@/components/forms/OpportunityForm'
import { useGetOpportunityDetailQuery, useUpdateOpportunityMutation } from '@/api/opportunity'
import type { OpportunityBase, OpportunityUpdateInput } from '@/types/opportunity'
import { OPPORTUNITY_TYPE } from '@/types/opportunity'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const UpdateLead = () => {
    useDocumentTitle('Cập nhật Lead')
    const { opportunityId } = useParams<{ opportunityId: string }>()
    const id = Number(opportunityId)
    const navigate = useNavigate()
    const [form] = Form.useForm<OpportunityBase>()

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

    const opportunity = useMemo(() => data?.data, [data])

    const [updateOpportunity, { isLoading }] = useUpdateOpportunityMutation()

    const handleUpdate = async (values: OpportunityUpdateInput) => {
        try {
            await updateOpportunity({
                opportunity_id: id,
                payload: values,
            }).unwrap()
            await refetch()
            message.success('Cập nhật Lead thành công!')
            navigate('/leads')
        } catch {
            message.error('Cập nhật Lead thất bại, vui lòng thử lại!')
        }
    }

    const handleCancel = () => {
        navigate('/leads')
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="start" align="center" gap="middle">
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
                                title: <Link to="/leads">Danh sách Lead</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Cập nhật Lead',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <Card
                title={
                    <Space>
                        <Typography.Title level={4} className="!mb-0">
                            Cập nhật Lead - {opportunity?.code || `#${id}`}
                        </Typography.Title>
                    </Space>
                }>
                <Spin spinning={isLoadingDetail}>
                    {opportunity && (
                        <OpportunityForm
                            form={form}
                            onFinish={handleUpdate}
                            initialValues={opportunity}
                            loading={isLoading}
                            onCancel={handleCancel}
                            isEdit
                            type={OPPORTUNITY_TYPE.LEAD}
                        />
                    )}
                </Spin>
            </Card>
        </Space>
    )
}

export default UpdateLead
