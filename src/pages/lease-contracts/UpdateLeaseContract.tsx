import { useGetLeaseContractDetailQuery, useUpdateLeaseContractMutation } from '@/api/lease-contract'
import LeaseContractForm, { type LeaseContractFormValues } from '@/components/forms/LeaseContractForm'
import { app } from '@/config/app'
import { BILLING_CYCLE_VALUE, BILLING_CYCLE_VALUE_MAP } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type {
    BillingCycleValue,
    LeaseContractBillingUnit,
    LeaseContractItem,
    LeaseContractUpdateInput,
} from '@/types/lease-contract'
import { Breadcrumb, Card, Flex, Form, Space, message } from 'antd'
import dayjs from 'dayjs'
import { GoHome } from 'react-icons/go'
import { Link, useNavigate, useParams } from 'react-router'

type BillingCycleMapValue = { billing_period?: number; billing_unit?: LeaseContractBillingUnit }

const resolveBillingCycle = (billingPeriod?: number, billingUnit?: LeaseContractBillingUnit): BillingCycleValue => {
    const entries = Object.entries(BILLING_CYCLE_VALUE_MAP) as [BillingCycleValue, BillingCycleMapValue][]
    const match = entries.find(
        ([, config]) => config.billing_period === billingPeriod && config.billing_unit === billingUnit,
    )
    return match?.[0] ?? BILLING_CYCLE_VALUE.ONE_TIME
}

const buildInitialValues = (leaseContract?: LeaseContractItem): Partial<LeaseContractFormValues> => {
    if (!leaseContract) return {}

    return {
        landlord_id: leaseContract.landlord_id,
        tenant_id: leaseContract.tenant_id,
        product_id: leaseContract.product_id,
        unit_product: leaseContract.unit_product,
        price: leaseContract.price,
        deposit: leaseContract.deposit,
        billing_cycle: resolveBillingCycle(leaseContract.billing_period, leaseContract.billing_unit),
        start_date: leaseContract.start_date ? dayjs(leaseContract.start_date) : undefined,
        end_date: leaseContract.end_date ? dayjs(leaseContract.end_date) : undefined,
        due_date_rule: leaseContract.due_date_rule,
        close_day: leaseContract.close_day,
        grace_period_days: leaseContract.grace_period_days,
        note: leaseContract.note,
        file_urls: leaseContract.files,
        product_value: leaseContract.product_rel?.product_value,
    }
}

const UpdateLeaseContract = () => {
    useDocumentTitle('Cập nhật hợp đồng thuê')

    const navigate = useNavigate()
    const { lease_contract_id } = useParams<{ lease_contract_id: string }>()
    const leaseContractId = Number(lease_contract_id)

    const [form] = Form.useForm<LeaseContractFormValues>()

    const { data } = useGetLeaseContractDetailQuery(
        { lease_contract_id: leaseContractId },
        {
            skip: Number.isNaN(leaseContractId),
            refetchOnMountOrArgChange: true,
        },
    )
    const leaseContract = data?.data

    const [updateLeaseContract, { isLoading: isSubmitting }] = useUpdateLeaseContractMutation()

    const handleSubmit = async (values: LeaseContractFormValues) => {
        if (!values.start_date || !values.end_date || !values.billing_cycle || !values.price) {
            message.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
            return
        }

        const billingCycleConfig = BILLING_CYCLE_VALUE_MAP[values.billing_cycle]

        const payload: LeaseContractUpdateInput = {
            start_date: values.start_date.format('YYYY-MM-DD'),
            end_date: values.end_date.format('YYYY-MM-DD'),
            billing_period: billingCycleConfig?.billing_period,
            billing_unit: billingCycleConfig?.billing_unit,
            price: values.price,
            deposit: values.deposit,
            product_value: values.product_value,
        }

        try {
            await updateLeaseContract({
                lease_contract_id: leaseContractId,
                payload,
            }).unwrap()

            message.success('Cập nhật hợp đồng thuê thành công')
            navigate(`/lease-contracts/${leaseContractId}/hub`)
        } catch {
            message.error('Cập nhật hợp đồng thuê thất bại, vui lòng thử lại')
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
                                title: leaseContractId ? (
                                    <Link to={`/lease-contracts/${leaseContractId}/hub`}>Hub hợp đồng</Link>
                                ) : (
                                    'Hub hợp đồng'
                                ),
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Cập nhật hợp đồng thuê',
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
                    onCancel={() => navigate(`/lease-contracts/${leaseContractId}/hub`)}
                    submitText="Cập nhật hợp đồng"
                    submitLoading={isSubmitting}
                    initialValues={buildInitialValues(leaseContract)}
                    title={`Cập nhật hợp đồng ${leaseContractId ? `#HDT${String(leaseContractId).padStart(app.CODE_PAD_LENGTH, '0')}` : ''}`}
                    isEdit
                />
            </Card>
        </Space>
    )
}

export default UpdateLeaseContract
