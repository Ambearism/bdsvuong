import { useState, useMemo } from 'react'
import { Card, Row, Col, Typography, Spin, ConfigProvider, Flex, Radio } from 'antd'
import { InfoCircleOutlined, DollarCircleOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons'
import { useGetCareCaseRevenueQuery } from '@/api/care-case-tax'
import {
    PAYMENT_TYPE,
    TAX_METHOD,
    TAX_GROUP_CODE,
    MULTIPLIER,
    LEASE_CONTRACT_PAYMENT_STATUS,
    TAX_PERIOD,
    QUARTER_DATE_RANGES,
} from '@/config/constant'
import { colors } from '@/config/colors'

const { Text, Title } = Typography

interface Props {
    caseId: number
    assetValue: number
    taxConfig: {
        taxMethod: string
        taxRate: number
        taxThreshold: number
        taxYear: number
        setTaxYear: (val: number) => void
    }
}

const CareCaseCashflowTab = ({ caseId, assetValue, taxConfig }: Props) => {
    const { taxMethod, taxRate, taxThreshold, taxYear, setTaxYear } = taxConfig
    const [period, setPeriod] = useState<string>(TAX_PERIOD.ALL)

    const year = taxYear
    let startDate = `${year}-01-01`
    let endDate = `${year}-12-31`

    if (period !== TAX_PERIOD.ALL && QUARTER_DATE_RANGES[period]) {
        const range = QUARTER_DATE_RANGES[period]
        startDate = `${year}-${range.start}`
        endDate = `${year}-${range.end}`
    }

    const { data: revenueData, isFetching } = useGetCareCaseRevenueQuery({
        care_case_id: caseId,
        start_date: startDate,
        end_date: endDate,
    })

    const details = revenueData?.data?.details

    const processedData = useMemo(() => {
        const rawDetails = details || []

        let totalRevenue = 0
        let totalCost = 0
        let taxableCostTotal = 0
        let taxPaid = 0

        rawDetails.forEach(item => {
            if (item.status !== LEASE_CONTRACT_PAYMENT_STATUS.APPROVED) return

            const amount = item.amount * MULTIPLIER
            if (item.type === PAYMENT_TYPE.THU) {
                totalRevenue += amount
            } else if (item.type === PAYMENT_TYPE.CHI) {
                if (item.group_code === TAX_GROUP_CODE) {
                    taxPaid += amount
                } else {
                    totalCost += amount
                }

                if (item.is_tax_deductible) {
                    taxableCostTotal += amount
                }
            }
        })

        const revenueGroups: Record<string, number> = {}
        const expenseGroups: Record<string, number> = {}

        rawDetails.forEach(item => {
            if (item.status !== LEASE_CONTRACT_PAYMENT_STATUS.APPROVED) return
            const amount = item.amount * MULTIPLIER

            if (item.type === PAYMENT_TYPE.THU) {
                const name = item.group_name || 'Doanh thu khác'
                revenueGroups[name] = (revenueGroups[name] || 0) + amount
            } else if (item.type === PAYMENT_TYPE.CHI && item.group_code !== TAX_GROUP_CODE) {
                const name = item.group_name || 'Chi phí khác'
                expenseGroups[name] = (expenseGroups[name] || 0) + amount
            }
        })

        const expenseCategories = Object.entries(expenseGroups)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)

        const taxBase = taxMethod === TAX_METHOD.REVENUE ? totalRevenue : Math.max(0, totalRevenue - taxableCostTotal)
        const isExceedingThreshold = taxBase > taxThreshold
        const taxCalculated = isExceedingThreshold ? ((taxBase - taxThreshold) * taxRate) / 100 : 0

        const revenueBeforeTax = totalRevenue - totalCost
        const netProfit = revenueBeforeTax - taxCalculated
        const roi = assetValue > 0 ? (netProfit / assetValue) * 100 : 0

        return {
            totalRevenue,
            totalCost,
            taxCalculated,
            taxPaid,
            netProfit,
            roi,
            expenseCategories,
            revenueBeforeTax,
        }
    }, [details, taxMethod, taxRate, taxThreshold, assetValue])

    const { totalRevenue, totalCost, taxCalculated, netProfit, roi, expenseCategories, revenueBeforeTax } =
        processedData

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        )
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 16,
                    colorPrimary: colors.indigo,
                    colorText: colors.careLabel,
                    fontSize: 13,
                },
                components: {
                    Radio: {
                        buttonBg: colors.transparent,
                        buttonCheckedBg: colors.white,
                        buttonColor: colors.careLabelLight,
                        colorTextLightSolid: colors.indigo,
                        paddingContentHorizontal: 20,
                        controlHeight: 32,
                        borderRadiusSM: 8,
                        fontWeightStrong: 700,
                        fontSize: 11,
                    },
                    Card: {
                        paddingLG: 24,
                    },
                },
            }}>
            <>
                <Card className="shadow-sm border-slate-100/60 ring-1 ring-slate-100/5 !mb-4">
                    <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                        <Flex gap={12} align="center">
                            <Radio.Group
                                value={period}
                                onChange={e => setPeriod(e.target.value)}
                                buttonStyle="solid"
                                className="bg-slate-100/50 p-1 rounded-xl flex items-center border-none">
                                {Object.values(TAX_PERIOD).map(p => (
                                    <Radio.Button
                                        key={p}
                                        value={p}
                                        className="!border-none !bg-transparent !shadow-none uppercase tracking-wider">
                                        {p}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>
                        </Flex>

                        <Flex gap={24} align="center">
                            <Flex align="center" gap={12}>
                                <Text className="!text-xs !font-semibold !text-black">Năm:</Text>
                                <Radio.Group
                                    value={taxYear}
                                    onChange={e => setTaxYear(e.target.value)}
                                    buttonStyle="solid"
                                    className="bg-slate-100/50 p-1 rounded-xl flex items-center border-none">
                                    {[2024, 2025, 2026].map(y => (
                                        <Radio.Button
                                            key={y}
                                            value={y}
                                            className="!border-none !bg-transparent !shadow-none">
                                            {y}
                                        </Radio.Button>
                                    ))}
                                </Radio.Group>
                            </Flex>
                        </Flex>
                    </Flex>
                </Card>

                <Row gutter={[16, 16]} className="!mb-4">
                    <Col xs={24} md={8}>
                        <Card className="border-slate-100 shadow-sm h-full">
                            <div className="flex flex-col h-full relative">
                                <Text className="!text-base !text-black !font-semibold !mb-3">Doanh thu thực nhận</Text>
                                <div className="flex items-baseline gap-1">
                                    <Title
                                        level={2}
                                        className="!m-0 text-3xl font-bold"
                                        style={{ color: colors.emerald }}>
                                        {(totalRevenue / MULTIPLIER).toLocaleString('vi-VN')}
                                    </Title>
                                    <Text className="!text-sm !font-bold !text-black">triệu</Text>
                                </div>
                                <Text className="!text-black !text-sm !mt-4 !font-bold flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    Bao gồm tất cả nguồn thu
                                </Text>
                                <div className="absolute right-0 top-0 text-emerald-700">
                                    <DollarCircleOutlined className="text-4xl" />
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="border-slate-100 shadow-sm h-full">
                            <div className="flex flex-col h-full relative">
                                <Text className="!text-base !text-black !font-semibold !mb-3">Chi phí vận hành</Text>
                                <div className="flex items-baseline gap-1">
                                    <Title level={2} className="!m-0 text-3xl font-bold" style={{ color: colors.rose }}>
                                        {(totalCost / MULTIPLIER).toLocaleString('vi-VN')}
                                    </Title>
                                    <Text className="!text-sm !font-bold !text-black">triệu</Text>
                                </div>
                                <Text className="!text-black !text-sm !mt-4 !font-bold flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-rose-500" />
                                    Bảo trì, sửa chữa, phí care...
                                </Text>
                                <div className="absolute right-0 top-0 text-rose-700">
                                    <FallOutlined className="text-4xl" />
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="border-slate-100 shadow-sm h-full">
                            <div className="flex flex-col h-full relative">
                                <Text className="!text-base !text-black !font-semibold !mb-3">Thu nhập Net & ROI</Text>
                                <div className="flex items-baseline gap-3">
                                    <div className="flex items-baseline gap-1">
                                        <Title
                                            level={2}
                                            className="!m-0 text-3xl font-bold"
                                            style={{ color: colors.indigo }}>
                                            {(netProfit / MULTIPLIER).toLocaleString('vi-VN')}
                                        </Title>
                                        <Text className="!text-sm !font-bold !text-black">triệu</Text>
                                    </div>
                                    <div className="bg-indigo-50 px-2 py-0.5 rounded-lg">
                                        <Text className="!text-black !font-bold !text-sm">ROI: {roi.toFixed(1)}%</Text>
                                    </div>
                                </div>
                                <Text className="!text-black !text-sm !mt-4 !font-bold flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                    Sau khi trừ chi phí & thuế tạm tính
                                </Text>
                                <div className="absolute right-0 top-0 text-indigo-700">
                                    <RiseOutlined className="text-4xl" />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Card
                    className="border-slate-100 shadow-sm overflow-hidden"
                    styles={{ body: { padding: 0 } }}
                    title={
                        <Flex justify="space-between" align="center">
                            <Text className="!text-black !font-semibold !text-base !tracking-tight">
                                Chi tiết dòng tiền {period === TAX_PERIOD.ALL ? `năm ${taxYear}` : period}
                            </Text>
                        </Flex>
                    }>
                    <div className="divide-y divide-slate-50">
                        <div className="bg-white">
                            <div className="px-8 py-5 flex justify-between items-center">
                                <Text className="!text-black !font-semibold !text-base">
                                    Tổng doanh thu thực nhận (Cash basis)
                                </Text>
                                <Text className="!text-black !font-semibold !text-xl">
                                    {(totalRevenue / MULTIPLIER).toLocaleString('vi-VN')} triệu
                                </Text>
                            </div>
                        </div>

                        <div className="bg-slate-50/20">
                            {expenseCategories.length === 0 ? (
                                <div className="px-12 py-3 text-center sm:text-left">
                                    <Text className="text-sm italic text-slate-400">Không có khoản chi phí</Text>
                                </div>
                            ) : (
                                expenseCategories.map((cat, idx) => (
                                    <div
                                        key={idx}
                                        className="px-12 py-3 flex justify-between items-center border-b border-slate-50 last:border-0">
                                        <Text className="!font-semibold !text-base !italic !text-black">
                                            - {cat.name}
                                        </Text>
                                        <Text className="font-semibold text-base" style={{ color: colors.rose }}>
                                            -{(cat.amount / MULTIPLIER).toLocaleString('vi-VN')} triệu
                                        </Text>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="px-8 py-5 flex justify-between items-center bg-indigo-50/5 border-t border-slate-100">
                            <Text className="!text-black !font-semibold !text-base">Doanh thu trước thuế</Text>
                            <Text className="text-indigo-600 font-semibold text-xl">
                                {(revenueBeforeTax / MULTIPLIER).toLocaleString('vi-VN')} triệu
                            </Text>
                        </div>

                        <div className="px-8 py-5 flex justify-between items-center bg-white">
                            <Flex vertical>
                                <Text className="!font-semibold !text-base !text-black">
                                    Thuế TNCN & GTGT (Tạm tính)
                                </Text>
                                <Text className="!text-sm !text-slate-400 !font-medium !italic">
                                    Tính trên cơ sở thuế {taxRate}%
                                </Text>
                            </Flex>
                            <Text className="font-semibold text-xl" style={{ color: colors.rose }}>
                                -{(taxCalculated / MULTIPLIER).toLocaleString('vi-VN')} triệu
                            </Text>
                        </div>

                        <div className="px-8 py-6 flex justify-between items-center bg-white border-t-2 border-slate-100">
                            <Flex vertical>
                                <Text className="!text-black !font-semibold !text-lg !uppercase !tracking-wide">
                                    Lợi nhuận ròng (Net Profit)
                                </Text>
                                <Text className="!text-sm text-slate-400 !font-medium">
                                    Dòng tiền thực nhận sau khi trừ tất cả chi phí và thuế
                                </Text>
                            </Flex>
                            <Text className="font-semibold text-2xl" style={{ color: colors.emerald }}>
                                {(netProfit / MULTIPLIER).toLocaleString('vi-VN')} triệu
                            </Text>
                        </div>
                    </div>
                </Card>

                <div className="flex items-center gap-2 text-slate-700 px-2 py-1">
                    <InfoCircleOutlined className="text-xs" />
                    <Text className="!text-xs !font-bold !uppercase !tracking-tight !text-black">
                        Thông số dựa trên dữ liệu thanh toán thực tế của hệ thống
                    </Text>
                </div>
            </>
        </ConfigProvider>
    )
}

export default CareCaseCashflowTab
