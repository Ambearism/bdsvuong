import { useState, useMemo } from 'react'
import { Card, Row, Col, Typography, Select, Radio, Button, Table, Flex, Switch, ConfigProvider } from 'antd'
import {
    DownloadOutlined,
    CalculatorOutlined,
    DollarCircleOutlined,
    WalletOutlined,
    InfoCircleOutlined,
    UserOutlined,
    FallOutlined,
    RiseOutlined,
    HistoryOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useGetCareCaseRevenueQuery } from '@/api/care-case-tax'
import {
    PAYMENT_TYPE,
    TAX_METHOD,
    LEASE_CONTRACT_PAYMENT_STATUS,
    TAX_GROUP_CODE,
    ROI_PERIOD_TYPE,
    MULTIPLIER,
    MONTHS_IN_YEAR,
    QUARTERS_IN_YEAR,
} from '@/config/constant'
import dayjs from 'dayjs'
import { colors } from '@/config/colors'
import { exportToCSV } from '@/utils/export-utils'

const { Text } = Typography

interface Props {
    caseId: number
    customerName?: string
    assetValue: number
    taxConfig: {
        taxMethod: string
        taxRate: number
        taxThreshold: number
        taxYear: number
        setTaxYear: (val: number) => void
    }
}

interface PeriodData {
    period: string
    revenue: number
    cost: number
    tax: number
    netProfit: number
    roi: number
    key: string
}

const CareCaseRoiTab = ({ caseId, customerName, assetValue, taxConfig }: Props) => {
    const { taxMethod, taxRate, taxThreshold, taxYear, setTaxYear } = taxConfig
    const [periodType, setPeriodType] = useState<(typeof ROI_PERIOD_TYPE)[keyof typeof ROI_PERIOD_TYPE]>(
        ROI_PERIOD_TYPE.MONTH,
    )
    const [onlyApproved, setOnlyApproved] = useState<boolean>(true)

    const year = taxYear
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const { data: revenueData, isFetching } = useGetCareCaseRevenueQuery({
        care_case_id: caseId,
        start_date: startDate,
        end_date: endDate,
    })

    const details = revenueData?.data?.details
    const processedData = useMemo(() => {
        const rawDetails = details || []
        const filteredDetails = rawDetails

        const periods: Record<string, { revenue: number; cost: number; taxable_cost: number }> = {}

        if (periodType === ROI_PERIOD_TYPE.MONTH) {
            for (let index = 1; index <= MONTHS_IN_YEAR; index++) {
                periods[index.toString()] = { revenue: 0, cost: 0, taxable_cost: 0 }
            }
        } else {
            for (let index = 1; index <= QUARTERS_IN_YEAR; index++) {
                periods[index.toString()] = { revenue: 0, cost: 0, taxable_cost: 0 }
            }
        }

        filteredDetails.forEach(item => {
            if (onlyApproved && item.status !== LEASE_CONTRACT_PAYMENT_STATUS.APPROVED) return

            const date = dayjs(item.payment_date)
            if (date.year() !== year) return

            let periodKey = ''
            if (periodType === ROI_PERIOD_TYPE.MONTH) {
                periodKey = (date.month() + 1).toString()
            } else {
                periodKey = Math.ceil((date.month() + 1) / 3).toString()
            }

            if (periods[periodKey]) {
                const amount = item.amount * MULTIPLIER
                if (item.type === PAYMENT_TYPE.THU) {
                    periods[periodKey].revenue += amount
                } else if (item.type === PAYMENT_TYPE.CHI) {
                    if (item.group_code !== TAX_GROUP_CODE) {
                        periods[periodKey].cost += amount
                    }

                    if (item.is_tax_deductible) {
                        periods[periodKey].taxable_cost += amount
                    }
                }
            }
        })

        const yearTotalsResult = Object.keys(periods).reduce(
            (accumulator, key) => ({
                revenue: accumulator.revenue + periods[key].revenue,
                cost: accumulator.cost + periods[key].cost,
                taxable_cost: accumulator.taxable_cost + periods[key].taxable_cost,
            }),
            { revenue: 0, cost: 0, taxable_cost: 0 },
        )

        const annualBaseAmount =
            taxMethod === TAX_METHOD.REVENUE
                ? yearTotalsResult.revenue
                : Math.max(0, yearTotalsResult.revenue - yearTotalsResult.taxable_cost)

        const isExceedingThreshold = annualBaseAmount > taxThreshold

        const tableData: PeriodData[] = Object.keys(periods)
            .map(key => {
                const { revenue, cost, taxable_cost } = periods[key]

                const periodBase = taxMethod === TAX_METHOD.REVENUE ? revenue : Math.max(0, revenue - taxable_cost)
                const annualTax = isExceedingThreshold ? ((annualBaseAmount - taxThreshold) * taxRate) / 100 : 0
                const proportion = annualBaseAmount > 0 ? periodBase / annualBaseAmount : 0
                const tax = isExceedingThreshold ? annualTax * proportion : 0

                const netProfit = revenue - cost - tax
                const roi = assetValue > 0 ? (netProfit / assetValue) * 100 : 0

                return {
                    key,
                    period: periodType === ROI_PERIOD_TYPE.MONTH ? `Tháng ${key}/${year}` : `Quý ${key}/${year}`,
                    revenue,
                    cost,
                    tax,
                    netProfit,
                    roi,
                }
            })
            .sort((a, b) => Number(a.key) - Number(b.key))

        const annualTax = isExceedingThreshold ? ((annualBaseAmount - taxThreshold) * taxRate) / 100 : 0
        const annualNetProfit = yearTotalsResult.revenue - yearTotalsResult.cost - annualTax

        const totalNetCashflow = yearTotalsResult.revenue - yearTotalsResult.cost
        const totalRoi = assetValue > 0 ? (annualNetProfit / assetValue) * 100 : 0

        return {
            tableData: [...tableData].sort((a, b) => Number(b.key) - Number(a.key)),
            totals: {
                revenue: yearTotalsResult.revenue,
                cost: yearTotalsResult.cost,
                taxable_cost: yearTotalsResult.taxable_cost,
                tax: annualTax,
                netProfit: annualNetProfit,
            },
            totalNetCashflow,
            totalRoi,
        }
    }, [details, periodType, year, assetValue, taxMethod, taxRate, taxThreshold, onlyApproved])

    const { tableData, totals, totalNetCashflow, totalRoi } = processedData

    const summaryCards = [
        {
            title: 'Tổng doanh thu',
            value: totals.revenue,
            suffix: 'triệu',
            description: 'Dòng tiền thực thu',
            color: colors.emerald,
            icon: <DollarCircleOutlined />,
            background: 'bg-emerald-50',
        },
        {
            title: 'Tổng chi phí',
            value: totals.cost,
            suffix: 'triệu',
            description: 'Phí vận hành, sửa chữa',
            color: colors.rose,
            icon: <FallOutlined />,
            background: 'bg-red-50',
        },
        {
            title: 'Thuế tạm tính',
            value: totals.tax,
            suffix: 'triệu',
            description: `TNCN + GTGT (${taxRate}%)`,
            color: colors.amber,
            icon: <CalculatorOutlined />,
            background: 'bg-amber-50',
        },
        {
            title: 'Lợi nhuận ròng',
            value: totals.netProfit,
            suffix: 'triệu',
            description: 'Sau khi trừ tất cả',
            color: colors.indigo,
            icon: <RiseOutlined />,
            background: 'bg-indigo-50',
        },
        {
            title: 'Dòng tiền ròng',
            value: totalNetCashflow,
            suffix: 'triệu',
            description: 'Cash In - Cash Out',
            color: colors.blue,
            icon: <WalletOutlined />,
            background: 'bg-blue-50',
        },
        {
            title: 'ROI (Ước tính)',
            value: totalRoi,
            suffix: '%',
            description: `Trên giá trị ${(assetValue / 1_000_000_000).toFixed(1)} tỷ`,
            color: colors.violet,
            icon: <HistoryOutlined />,
            bg: 'bg-violet-50',
        },
    ]

    const columns: ColumnsType<PeriodData> = [
        {
            title: <Text className="text-xs font-semibold text-slate-400">Kỳ báo cáo</Text>,
            dataIndex: 'period',
            key: 'period',
            onCell: () => ({ className: '!bg-slate-50/50' }),
            render: text => <Text className="text-base font-semibold text-slate-700">{text}</Text>,
        },
        {
            title: <Text className="text-xs font-semibold text-slate-400">Doanh thu</Text>,
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: value => (
                <Text className="text-base font-semibold !text-emerald-500">
                    {(value / MULTIPLIER).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} triệu
                </Text>
            ),
        },
        {
            title: <Text className="text-xs font-semibold text-slate-400">Chi phí</Text>,
            dataIndex: 'cost',
            key: 'cost',
            align: 'right',
            render: value => (
                <Text className="text-base font-semibold !text-rose-500">
                    {(value / MULTIPLIER).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} triệu
                </Text>
            ),
        },
        {
            title: <Text className="text-xs font-semibold text-slate-400">Thuế (Tạm)</Text>,
            dataIndex: 'tax',
            key: 'tax',
            align: 'right',
            render: value => (
                <Text className="text-base font-semibold !text-amber-500">
                    {(value / MULTIPLIER).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} triệu
                </Text>
            ),
        },
        {
            title: <Text className="text-xs font-semibold text-slate-400">Lợi nhuận ròng</Text>,
            dataIndex: 'netProfit',
            key: 'netProfit',
            align: 'right',
            render: value => (
                <Text className="text-base font-semibold !text-indigo-600">
                    {(value / MULTIPLIER).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} triệu
                </Text>
            ),
        },
        {
            title: <Text className="text-xs font-semibold text-slate-400">ROI</Text>,
            dataIndex: 'roi',
            key: 'roi',
            align: 'right',
            render: value => <Text className="text-sm font-semibold text-slate-400">{value.toFixed(2)}%</Text>,
        },
    ]

    const handleExport = () => {
        const headers = [
            'Kỳ báo cáo',
            'Doanh thu (triệu)',
            'Chi phí (triệu)',
            'Thuế (triệu)',
            'Lợi nhuận ròng (triệu)',
            'ROI (%)',
        ]
        const rows = tableData.map(row => [
            row.period,
            (row.revenue / MULTIPLIER).toFixed(2),
            (row.cost / MULTIPLIER).toFixed(2),
            (row.tax / MULTIPLIER).toFixed(2),
            (row.netProfit / MULTIPLIER).toFixed(2),
            row.roi.toFixed(2),
        ])

        exportToCSV(headers, rows, `Bao_cao_ROI_${customerName || 'Khach_hang'}_${year}`)
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 12,
                    colorPrimary: colors.indigo,
                },
                components: {
                    Table: {
                        headerBg: 'transparent',
                        headerBorderRadius: 12,
                        cellPaddingBlock: 24,
                        cellPaddingInline: 16,
                        headerColor: colors.careLabelLight,
                    },
                    Select: {
                        controlHeight: 40,
                        borderRadius: 12,
                        colorBorder: colors.grayLight,
                    },
                    Radio: {
                        controlHeight: 40,
                        borderRadius: 12,
                        buttonPaddingInline: 16,
                    },
                    Card: {
                        borderRadiusLG: 16,
                    },
                },
            }}>
            <>
                <Card className="shadow-sm border-slate-100/60 ring-1 ring-slate-100/5 !mb-4">
                    <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                        <Flex gap={12} align="center">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-3">
                                <div className="bg-slate-200 rounded-lg p-1 text-slate-400">
                                    <UserOutlined />
                                </div>
                                <Text className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                                    {customerName || 'Khách hàng'}
                                </Text>
                            </div>

                            <Select
                                value={year}
                                onChange={setTaxYear}
                                className="w-32 font-semibold text-slate-700"
                                options={[
                                    { value: 2023, label: 'Năm 2023' },
                                    { value: 2024, label: 'Năm 2024' },
                                    { value: 2025, label: 'Năm 2025' },
                                    { value: 2026, label: 'Năm 2026' },
                                ]}
                            />

                            <Radio.Group
                                value={periodType}
                                onChange={event => setPeriodType(event.target.value)}
                                className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex items-center gap-1">
                                <Radio.Button
                                    value={ROI_PERIOD_TYPE.MONTH}
                                    className="!h-8 !leading-8 !rounded-lg !border-none !bg-transparent !text-xs !font-semibold !text-slate-400 [&.ant-radio-button-wrapper-checked]:!bg-white [&.ant-radio-button-wrapper-checked]:!text-blue-600 [&.ant-radio-button-wrapper-checked]:!shadow-sm [&::before]:!hidden px-4">
                                    Tháng
                                </Radio.Button>
                                <Radio.Button
                                    value={ROI_PERIOD_TYPE.QUARTER}
                                    className="!h-8 !leading-8 !rounded-lg !border-none !bg-transparent !text-xs !font-semibold !text-slate-400 [&.ant-radio-button-wrapper-checked]:!bg-white [&.ant-radio-button-wrapper-checked]:!text-blue-600 [&.ant-radio-button-wrapper-checked]:!shadow-sm [&::before]:!hidden px-4">
                                    Quý
                                </Radio.Button>
                            </Radio.Group>
                        </Flex>

                        <Flex gap={24} align="center">
                            <Flex align="center" gap={12}>
                                <Switch checked={onlyApproved} onChange={setOnlyApproved} className="bg-slate-200" />
                                <div className="flex flex-col -gap-1">
                                    <Text className="text-xs font-semibold text-slate-700 leading-tight">
                                        Chỉ dòng tiền ĐÃ DUYỆT
                                    </Text>
                                    <Text className="text-xs text-slate-400">Bỏ qua trạng thái Pending</Text>
                                </div>
                            </Flex>
                            <Button
                                icon={<DownloadOutlined />}
                                className="!h-10 px-6 rounded-xl font-semibold border-slate-200 text-slate-600 shadow-sm"
                                onClick={handleExport}>
                                Xuất báo cáo
                            </Button>
                        </Flex>
                    </Flex>
                </Card>

                <Row gutter={[16, 16]} className="!mb-4">
                    {summaryCards.map((card, index) => (
                        <Col xs={24} sm={12} md={12} lg={8} xl={8} xxl={4} key={index}>
                            <Card
                                className="h-full border-slate-100 shadow-sm overflow-hidden"
                                styles={{ body: { padding: '24px 20px' } }}>
                                <Flex vertical gap={4} className="relative h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <Text className="text-sm font-semibold text-slate-400 tracking-tight">
                                            {card.title}
                                        </Text>
                                        <div
                                            className={`p-2 rounded-lg ${card.background}`}
                                            style={{ color: card.color }}>
                                            {card.icon}
                                        </div>
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-3xl font-bold leading-none" style={{ color: card.color }}>
                                            {card.suffix === '%'
                                                ? card.value.toFixed(2)
                                                : (card.value / MULTIPLIER).toLocaleString('vi-VN', {
                                                      maximumFractionDigits: 2,
                                                  })}
                                        </span>
                                        <span className="ml-1 text-lg font-semibold text-slate-700">{card.suffix}</span>
                                    </div>
                                    <Text className="text-sm font-bold text-slate-400 mt-1">{card.description}</Text>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="px-4 py-2 bg-white/50 border-b border-slate-100">
                    <Flex align="center" gap={8} className="text-xs text-slate-400 flex-wrap font-bold">
                        <InfoCircleOutlined className="text-slate-300" />
                        <Text className="text-slate-400">Công thức:</Text>
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            Lợi nhuận ròng = Doanh thu - Chi phí - Thuế
                        </span>
                        <span className="flex items-center gap-1 mx-2">
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            Thuế: Nếu tổng doanh thu năm {taxYear} vượt {(taxThreshold / 1_000_000).toLocaleString()}tr
                            thì tính ({taxRate}% x (doanh thu - ngưỡng)), ngược lại bằng 0
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            ROI = Lợi nhuận ròng / Giá trị tài sản (Ước tính)
                        </span>
                    </Flex>
                </div>

                <Card className="border-slate-100 shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
                    <Table
                        columns={columns}
                        dataSource={tableData}
                        pagination={false}
                        loading={isFetching}
                        rowClassName="hover:bg-slate-50/50"
                    />
                </Card>
            </>
        </ConfigProvider>
    )
}

export default CareCaseRoiTab
