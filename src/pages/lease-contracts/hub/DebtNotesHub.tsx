import {
    useCreateLeaseContractDebtNoteMutation,
    useGetLeaseContractDebtNotesQuery,
    useDeleteLeaseContractDebtNoteMutation,
} from '@/api/lease-contract'
import {
    DEBT_NOTE_TARGET_TYPE,
    DEBT_NOTE_TYPE,
    DEBT_NOTE_TYPE_LABELS,
    DEBT_NOTE_TYPE_TAG_COLORS,
} from '@/config/constant'
import DebtNoteFormFields, { type DebtNoteFormValues } from '@/pages/lease-contracts/DebtNoteFormFields'
import { ClockCircleOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import { withPrice } from '@/lib/utils'
import {
    Button,
    Card,
    Divider,
    Empty,
    Flex,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Tag,
    Space,
    Typography,
    message,
} from 'antd'
import Loading from '@/components/Loading'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useOutletContext, useParams } from 'react-router'

const QUICK_TEMPLATES = ['Xin chậm đóng', 'Đã báo chủ nhà']

const { Text } = Typography

export default function DebtNotesHub() {
    const { lease_contract_id } = useParams<{ lease_contract_id: string }>()
    const leaseContractId = Number(lease_contract_id)
    const [form] = Form.useForm<DebtNoteFormValues>()

    const [createDebtNote, { isLoading: isCreating }] = useCreateLeaseContractDebtNoteMutation()
    const [deleteDebtNote, { isLoading: isDeleting }] = useDeleteLeaseContractDebtNoteMutation()
    const {
        data: debtNotesResp,
        refetch,
        isFetching,
    } = useGetLeaseContractDebtNotesQuery({ lease_contract_id: leaseContractId }, { skip: !leaseContractId })
    const { isPausedLeaseContract } = useOutletContext<{ isPausedLeaseContract: boolean }>()

    const debtNotes = useMemo(() => debtNotesResp?.data?.items ?? [], [debtNotesResp])
    const contentValue = Form.useWatch('content', form)
    const selectedQuickTemplate = QUICK_TEMPLATES.find(item => item === contentValue)

    const handleSubmit = async (values: DebtNoteFormValues) => {
        if (!leaseContractId) return

        try {
            await createDebtNote({
                ...values,
                reminder_date: values.reminder_date?.format('YYYY-MM-DD') || '',
                target_id: leaseContractId,
                target_type: DEBT_NOTE_TARGET_TYPE.LEASE_CONTRACT,
            }).unwrap()

            message.success('Lưu ghi chú nợ thành công')
            form.resetFields()
            form.setFieldsValue({ type: DEBT_NOTE_TYPE.GENERAL })
            await refetch()
        } catch {
            message.error('Lưu ghi chú nợ thất bại, vui lòng thử lại')
        }
    }

    const fillQuickTemplate = (template: string) => {
        form.setFieldValue('content', template)
    }

    const handleDeleteDebtNote = async (debtNoteId: number) => {
        try {
            await deleteDebtNote({ debt_note_id: debtNoteId }).unwrap()
            message.success('Xoá ghi chú nợ thành công')
            await refetch()
        } catch {
            message.error('Xoá ghi chú nợ thất bại, vui lòng thử lại')
        }
    }

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
            <Card className="!rounded-2xl !border-slate-200">
                <Space direction="vertical" size={16} className="!w-full">
                    <Space size={10} align="center">
                        <Button type="primary" shape="circle" icon={<PlusOutlined />} />
                        <Text className="!text-[22px] !font-bold !uppercase">TẠO GHI CHÚ</Text>
                    </Space>

                    <Form<DebtNoteFormValues>
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{ type: DEBT_NOTE_TYPE.GENERAL }}>
                        <DebtNoteFormFields />

                        <Form.Item name="target_id" hidden>
                            <InputNumber />
                        </Form.Item>
                        <Form.Item name="target_type" hidden>
                            <Input />
                        </Form.Item>

                        <Space className="!w-full !justify-between">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isCreating}
                                icon={<SaveOutlined />}
                                disabled={isPausedLeaseContract}>
                                Lưu
                            </Button>
                        </Space>

                        <Divider />

                        <Flex vertical>
                            <Text className="!mb-2">Mẫu nhanh</Text>
                            <Space wrap>
                                {QUICK_TEMPLATES.map(item => (
                                    <Button
                                        key={item}
                                        type={selectedQuickTemplate === item ? 'primary' : 'default'}
                                        disabled={isPausedLeaseContract}
                                        onClick={() => fillQuickTemplate(item)}>
                                        {item}
                                    </Button>
                                ))}
                            </Space>
                        </Flex>
                    </Form>
                </Space>
            </Card>

            <div className="!space-y-4">
                {isFetching ? (
                    <Card className="!rounded-2xl !border-slate-200">
                        <Loading />
                    </Card>
                ) : (
                    debtNotes.map(note => {
                        const ownerName =
                            note.assigned_to_rel?.full_name || note.assigned_to_rel?.account_name || 'Chưa rõ'

                        return (
                            <Card key={note.id} className="!rounded-2xl !border-slate-200">
                                <Space direction="vertical" size={10} className="!w-full">
                                    <Space className="!w-full !justify-between" align="start">
                                        <Space>
                                            <UserOutlined className="text-gray-400!mt-1" />
                                            <Text strong>{ownerName}</Text>
                                            <Tag color={DEBT_NOTE_TYPE_TAG_COLORS[note.type] ?? 'default'}>
                                                {DEBT_NOTE_TYPE_LABELS[note.type] ?? note.type}
                                            </Tag>
                                        </Space>

                                        <Space size={6}>
                                            <ClockCircleOutlined className="!text-slate-400" />
                                            <Text className="!text-slate-400 !font-semibold">
                                                {dayjs(note.reminder_date).format('DD/MM/YYYY')}
                                            </Text>
                                        </Space>
                                    </Space>

                                    <Flex vertical>
                                        <div className="flex items-start justify-between">
                                            <Text className="!text-[20px] !font-semibold">{note.title}</Text>
                                            {note.amount ? (
                                                <Text className="!font-semibold !text-blue-500">
                                                    {withPrice(note.amount)}
                                                </Text>
                                            ) : null}
                                        </div>

                                        <div className="mt-2 flex items-center gap-3">
                                            <Text className="!text-[16px] !text-slate-700">
                                                {note.content || 'Không có nội dung'}
                                            </Text>
                                        </div>
                                    </Flex>

                                    <div className="flex justify-end">
                                        <Popconfirm
                                            title="Xoá ghi chú nợ"
                                            description="Bạn có chắc chắn muốn xoá ghi chú này không?"
                                            okText="Xoá"
                                            cancelText="Huỷ"
                                            disabled={isPausedLeaseContract}
                                            onConfirm={() => handleDeleteDebtNote(note.id)}>
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                loading={isDeleting}
                                                disabled={isPausedLeaseContract}
                                                danger
                                            />
                                        </Popconfirm>
                                    </div>
                                </Space>
                            </Card>
                        )
                    })
                )}

                {!isFetching && debtNotes.length === 0 && (
                    <Card className="!rounded-2xl !border-slate-200">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Chưa có ghi chú nợ"
                            className="!my-10"
                        />
                    </Card>
                )}
            </div>
        </div>
    )
}
