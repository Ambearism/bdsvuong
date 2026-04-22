import { Breadcrumb, Card, Flex, Form, message, Space, Typography } from 'antd'
import { useNavigate, Link, useSearchParams } from 'react-router'
import { GoHome } from 'react-icons/go'
import OpportunityForm from '@/components/forms/OpportunityForm'
import { useCreateOpportunityMutation } from '@/api/opportunity'
import type { OpportunityCreateInput, OpportunityBase } from '@/types/opportunity'
import { OpportunityStage, OPPORTUNITY_TYPE } from '@/types/opportunity'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CreateLead = () => {
    useDocumentTitle('Tạo Lead')
    const navigate = useNavigate()
    const [form] = Form.useForm<OpportunityBase>()
    const [searchParams] = useSearchParams()
    const product_id = searchParams.get('product_id')
    const productId = product_id ? Number(product_id) : undefined

    const [createOpportunity, { isLoading }] = useCreateOpportunityMutation()

    const handleCreate = async (values: OpportunityCreateInput) => {
        try {
            await createOpportunity(values).unwrap()
            message.success('Tạo lead thành công')
            navigate('/leads')
        } catch {
            message.error('Tạo lead thất bại, vui lòng thử lại!')
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
                                title: 'Tạo Lead Mới',
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
                            Tạo Lead Mới
                        </Typography.Title>
                    </Space>
                }>
                <OpportunityForm
                    form={form}
                    onFinish={handleCreate}
                    loading={isLoading}
                    onCancel={handleCancel}
                    initialValues={{ stage: OpportunityStage.LEAD_MOI, product_id: productId }}
                    type={OPPORTUNITY_TYPE.LEAD}
                />
            </Card>
        </Space>
    )
}

export default CreateLead
