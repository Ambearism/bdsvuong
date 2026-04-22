import { Card, Flex, Space, Typography, Radio, Button, Table, Row, Col, Tag, InputNumber } from 'antd'
import { SettingOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import { colors } from '@/config/colors'
import { PAYMENT_TYPE, TAX_METHOD, TAX_PERIOD } from '@/config/constant'
import type { RevenueCategorySummary, RevenueDetailItem } from '@/types/care-case-tax'
import { usePermission } from '@/hooks/usePermission'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'

const { Text } = Typography

interface TaxConfig {
    taxMethod: string
    setTaxMethod: (val: string) => void
    period: string
    setPeriod: (val: string) => void
    taxRate: number
    setTaxRate: (val: number) => void
    taxThreshold: number
    setTaxThreshold: (val: number) => void
    start_date?: string
    end_date?: string
}

interface CareCaseTaxSummaryConfigProps {
    config: TaxConfig
    isFetching: boolean
    revenueSummaryData: (RevenueCategorySummary & { key: string | number; taxBase: string; tax: string })[]
    revenueDetailData: (RevenueDetailItem & { key: string | number })[]
    onSave?: () => void
    isSaving?: boolean
}

const revenueSummaryColumns = [
    {
        title: 'Nhóm',
        dataIndex: 'group_name',
        key: 'group_name',
        render: (text: string) => <Text>{text}</Text>,
    },
    {
        title: 'Danh mục',
        dataIndex: 'category_name',
        key: 'category_name',
        render: (text: string) => <Text strong>{text}</Text>,
    },
    {
        title: 'Doanh thu',
        dataIndex: 'revenue',
        key: 'revenue',
        align: 'right' as const,
        render: (value: number) => <Text strong>{value ? value.toLocaleString() + ' đ' : '-'}</Text>,
    },
    {
        title: 'Chi phí',
        dataIndex: 'taxable_cost',
        key: 'taxable_cost',
        align: 'right' as const,
        render: (value: number) => (
            <Text style={{ color: value ? colors.red : undefined }}>{value ? value.toLocaleString() + ' đ' : '-'}</Text>
        ),
    },
    {
        title: 'Cơ sở tính thuế',
        dataIndex: 'taxBase',
        key: 'taxBase',
        align: 'right' as const,
        render: (text: string) => <Text strong>{text}</Text>,
    },
    {
        title: 'Thuế (tạm tính)',
        dataIndex: 'tax',
        key: 'tax',
        align: 'right' as const,
        render: (text: string) => (
            <Text strong style={{ color: colors.carePrimary }}>
                {text}
            </Text>
        ),
    },
]

const revenueDetailColumns = [
    {
        title: 'Ngày',
        dataIndex: 'payment_date',
        key: 'payment_date',
        render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
        title: 'Nhóm',
        dataIndex: 'group_name',
        key: 'group_name',
        render: (text: string) => <Text>{text}</Text>,
    },
    {
        title: 'Nội dung',
        dataIndex: 'content',
        key: 'content',
    },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right' as const,
        render: (value: number, record: RevenueDetailItem) => (
            <Text strong style={{ color: record.type === PAYMENT_TYPE.THU ? colors.green : colors.red }}>
                {record.type === PAYMENT_TYPE.THU ? '+' : '-'}
                {value.toLocaleString()} đ
            </Text>
        ),
    },
    {
        title: 'Loại',
        dataIndex: 'type',
        key: 'type',
        align: 'center' as const,
        render: (type: string) => (
            <Tag
                className={`!m-0 border ${
                    type === PAYMENT_TYPE.THU
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                {type}
            </Tag>
        ),
    },
]

const CareCaseTaxSummaryConfig = ({
    config,
    isFetching,
    revenueSummaryData,
    revenueDetailData,
    onSave,
    isSaving,
}: CareCaseTaxSummaryConfigProps) => {
    const { hasPermission } = usePermission()
    const isEditingDisabled = !hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE)

    const {
        taxMethod,
        setTaxMethod,
        period,
        setPeriod,
        taxRate,
        setTaxRate,
        taxThreshold,
        setTaxThreshold,
        start_date,
        end_date,
    } = config

    return (
        <div className="p-6 bg-slate-50/50 min-h-full">
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card className="shadow-sm border-slate-200 h-full">
                        <Space direction="vertical" size={24} className="w-full">
                            <Flex align="center" gap={8} className="text-slate-600">
                                <SettingOutlined />
                                <Text strong>1. Thiết lập thuế</Text>
                            </Flex>

                            <div>
                                <Text className="block mb-2 font-medium text-sm">Phương pháp tính thuế</Text>
                                <div
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors bg-white ${taxMethod === TAX_METHOD.REVENUE ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'} ${isEditingDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    onClick={() => !isEditingDisabled && setTaxMethod(TAX_METHOD.REVENUE)}>
                                    <Radio
                                        checked={taxMethod === TAX_METHOD.REVENUE}
                                        className="font-medium"
                                        disabled={isEditingDisabled}>
                                        Theo Tổng Doanh Thu
                                    </Radio>
                                    <Text type="secondary" className="block text-xs ml-6 mt-1">
                                        Thuế = (Doanh thu - Ngưỡng) * Hệ số
                                    </Text>
                                </div>
                                <div
                                    className={`p-3 rounded-lg border mt-3 cursor-pointer transition-colors bg-white ${taxMethod === TAX_METHOD.PROFIT ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'} ${isEditingDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    onClick={() => !isEditingDisabled && setTaxMethod(TAX_METHOD.PROFIT)}>
                                    <Radio
                                        checked={taxMethod === TAX_METHOD.PROFIT}
                                        className="font-medium"
                                        disabled={isEditingDisabled}>
                                        Theo Lợi Nhuận (DT - CP)
                                    </Radio>
                                    <Text type="secondary" className="block text-xs ml-6 mt-1">
                                        Thuế = (DT - CP - Ngưỡng) * Hệ số
                                    </Text>
                                </div>
                            </div>

                            <div>
                                <Text className="block mb-2 font-medium text-sm">Ngưỡng chịu thuế (VNĐ)</Text>
                                <InputNumber
                                    size="large"
                                    className="!w-full"
                                    min={0}
                                    value={taxThreshold}
                                    disabled={isEditingDisabled}
                                    onChange={val => setTaxThreshold(Number(val) || 0)}
                                />
                                <Text type="secondary" className="text-xs italic mt-1 block">
                                    Tính thuế cho phần doanh thu vượt ngưỡng
                                </Text>
                            </div>

                            <div>
                                <Text className="block mb-2 font-medium text-sm">Hệ số tính thuế (%)</Text>
                                <InputNumber
                                    size="large"
                                    className="!w-full"
                                    prefix={
                                        <Text type="secondary" className="text-base">
                                            %
                                        </Text>
                                    }
                                    value={taxRate}
                                    min={0}
                                    disabled={isEditingDisabled}
                                    onChange={val => setTaxRate(Number(val) || 0)}
                                />
                                <Text type="secondary" className="text-xs italic mt-1 block">
                                    Ví dụ: 10% (5% GTGT + 5% TNCN)
                                </Text>
                            </div>

                            {hasPermission(RESOURCE_TYPE.CARE_CASE, ACTION.UPDATE) && (
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    loading={isSaving}
                                    onClick={onSave}
                                    className="bg-blue-600 hover:bg-blue-700 mt-2">
                                    Lưu cấu hình
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Space direction="vertical" size={24} className="w-full">
                        <Card className="shadow-sm border-slate-200">
                            <Flex justify="space-between" align="center" className="mb-6">
                                <Flex align="center" gap={8} className="text-slate-600">
                                    <CalendarOutlined />
                                    <Text strong>2. Tổng hợp doanh thu theo kỳ</Text>
                                </Flex>
                                <Flex gap={4} className="bg-slate-50 p-1 rounded-lg border border-slate-200">
                                    {[TAX_PERIOD.Q1, TAX_PERIOD.Q2, TAX_PERIOD.Q3, TAX_PERIOD.Q4, TAX_PERIOD.ALL].map(
                                        item => (
                                            <div
                                                key={item}
                                                onClick={() => setPeriod(item)}
                                                className={`px-4 py-1.5 rounded-md cursor-pointer text-[12px] font-bold transition-all uppercase ${
                                                    period === item
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                }`}>
                                                {item}
                                            </div>
                                        ),
                                    )}
                                </Flex>
                            </Flex>

                            <Flex gap={16} className="mb-6" align="center">
                                <Flex
                                    align="center"
                                    gap={8}
                                    className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                                    <CalendarOutlined className="text-slate-400" />
                                    <Text className="text-slate-500 text-xs">Từ:</Text>
                                    <Text strong className="text-xs">
                                        {start_date ? new Date(start_date).toLocaleDateString('vi-VN') : 'Tất cả'}
                                    </Text>
                                </Flex>
                                <Flex
                                    align="center"
                                    gap={8}
                                    className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                                    <CalendarOutlined className="text-slate-400" />
                                    <Text className="text-slate-500 text-xs">Đến:</Text>
                                    <Text strong className="text-xs">
                                        {end_date ? new Date(end_date).toLocaleDateString('vi-VN') : 'Tất cả'}
                                    </Text>
                                </Flex>
                            </Flex>

                            <Table
                                columns={revenueSummaryColumns.map(col =>
                                    col.key === 'tax' ? { ...col, title: `Thuế (${taxRate}%)` } : col,
                                )}
                                dataSource={revenueSummaryData}
                                pagination={false}
                                loading={isFetching}
                                rowClassName={record => (record.key === 'total' ? 'bg-slate-50 font-bold' : '')}
                                bordered={false}
                                className="tax-summary-table"
                            />
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <Flex align="center" gap={8} className="text-slate-600 mb-6">
                                <FileTextOutlined />
                                <Text strong>3. Chi tiết doanh thu</Text>
                            </Flex>

                            <Table
                                columns={revenueDetailColumns}
                                dataSource={revenueDetailData}
                                pagination={false}
                                loading={isFetching}
                                bordered={false}
                                className="tax-detail-table"
                            />
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default CareCaseTaxSummaryConfig
