import { Breadcrumb, Card, Flex, Space, message, Form } from 'antd'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { GoHome } from 'react-icons/go'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { BILLING_CYCLE_VALUE_MAP, LEASE_CONTRACT_DUE_DATE_RULE } from '@/config/constant'
import type { BillingCycleValue, LeaseContractCreateInput } from '@/types/lease-contract'
import type { CustomerCreateInput } from '@/types/customer'
import { useCreateCustomerMutation } from '@/api/customer'
import { useCreateLeaseContractMutation } from '@/api/lease-contract'
import LeaseContractForm, { type LeaseContractFormValues } from '@/components/forms/LeaseContractForm'

const CreateLeaseContract = () => {
    useDocumentTitle('Tạo hợp đồng thuê mới')

    const navigate = useNavigate()
    const [form] = Form.useForm<LeaseContractFormValues>()

    const [createCustomer] = useCreateCustomerMutation()
    const [createLeaseContract, { isLoading: isSubmitting }] = useCreateLeaseContractMutation()

    const [searchParams] = useSearchParams()
    const landlordId = searchParams.get('landlord_id')
    const tenantId = searchParams.get('tenant_id')
    const productId = searchParams.get('product_id')

    const initialValues = {
        landlord_id: landlordId ? Number(landlordId) : undefined,
        tenant_id: tenantId ? Number(tenantId) : undefined,
        product_id: productId ? Number(productId) : undefined,
    }

    const createCustomerIfNeeded = async (
        customerId: number | undefined,
        name: string | undefined,
        phone: string | undefined,
    ) => {
        if (customerId) return customerId
        if (!name || !phone) return undefined

        const payload: CustomerCreateInput = { name, phone }
        const customerRes = await createCustomer(payload).unwrap()
        return customerRes.data?.id
    }

    const handleSubmit = async (values: LeaseContractFormValues) => {
        try {
            const selectedLandlordId = values.landlord_id
            const selectedTenantId = await createCustomerIfNeeded(
                values.tenant_id,
                values.new_tenant_name,
                values.new_tenant_phone,
            )

            if (!selectedLandlordId) {
                message.error('Vui lòng chọn chủ nhà')
                return
            }

            if (!selectedTenantId) {
                message.error('Vui lòng chọn hoặc tạo khách thuê')
                return
            }

            const billingCycleValue = values.billing_cycle
                ? BILLING_CYCLE_VALUE_MAP[values.billing_cycle as BillingCycleValue]
                : undefined

            const payload: LeaseContractCreateInput = {
                product_id: values.product_id!,
                unit_product: values.unit_product?.trim() || undefined,
                tenant_id: selectedTenantId,
                landlord_id: selectedLandlordId,
                price: values.price!,
                deposit: values.deposit,
                billing_period: billingCycleValue?.billing_period,
                billing_unit: billingCycleValue?.billing_unit,
                start_date: values.start_date?.format('YYYY-MM-DD') || '',
                end_date: values.end_date?.format('YYYY-MM-DD') || '',
                due_date_rule: values.due_date_rule,
                close_day: values.due_date_rule === LEASE_CONTRACT_DUE_DATE_RULE.FIXED ? values.close_day : undefined,
                grace_period_days: values.grace_period_days,
                note: values.note?.trim() || undefined,
                file_urls: values.file_urls,
                product_value: values.product_value,
            }

            await createLeaseContract(payload).unwrap()
            message.success('Tạo hợp đồng thuê thành công')
            navigate('/lease-contracts')
        } catch {
            message.error('Tạo hợp đồng thuê thất bại, vui lòng thử lại')
        }
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
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
                                title: <Link to="/lease-contracts">Danh sách hợp đồng thuê</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Thiết lập hợp đồng thuê',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <Card>
                <LeaseContractForm
                    form={form}
                    onFinish={handleSubmit}
                    onCancel={() => navigate('/lease-contracts')}
                    submitText="Tạo hợp đồng thuê"
                    submitLoading={isSubmitting}
                    initialValues={initialValues}
                    title="Tạo mới hợp đồng thuê"
                />
            </Card>
        </Space>
    )
}

export default CreateLeaseContract
