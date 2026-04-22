import { useState, type ReactNode } from 'react'
import { Tabs, Space, Row, Col, Card, Typography, Flex, Spin, Result } from 'antd'
import { CalculatorOutlined } from '@ant-design/icons'
import { TAX_METHOD, QUARTER_DATE_RANGES, TAX_PERIOD, MULTIPLIER } from '@/config/constant'
import { colors } from '@/config/colors'
import { useGetCareCaseRevenueQuery } from '@/api/care-case-tax'
import { useUpdateCareCaseMutation } from '@/api/care-case'
import { message } from 'antd'
import { useApiError } from '@/utils/error'
import CareCaseTaxHistory from '@/components/care/CareCaseTaxHistory'
import CareCaseTaxSummaryConfig from '@/components/care/CareCaseTaxSummaryConfig'

const { Text, Title } = Typography

interface Props {
    caseId: number
    taxConfig: {
        taxMethod: string
        setTaxMethod: (val: string) => void
        taxRate: number
        setTaxRate: (val: number) => void
        taxThreshold: number
        setTaxThreshold: (val: number) => void
        taxYear: number
        setTaxYear: (val: number) => void
    }
}

const CareCaseTaxTab = ({ caseId, taxConfig }: Props) => {
    const { taxMethod, setTaxMethod, taxRate, setTaxRate, taxThreshold, setTaxThreshold, taxYear } = taxConfig
    const [period, setPeriod] = useState<string>(TAX_PERIOD.ALL)

    const year = taxYear
    let start_date = `${year}-01-01`
    let end_date = `${year}-12-31`

    if (period && QUARTER_DATE_RANGES[period]) {
        const range = QUARTER_DATE_RANGES[period]
        start_date = `${year}-${range.start}`
        end_date = `${year}-${range.end}`
    }

    const {
        data: revenueData,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetCareCaseRevenueQuery({
        care_case_id: caseId,
        start_date,
        end_date,
    })

    const [updateCareCase, { isLoading: isSaving }] = useUpdateCareCaseMutation()
    const { handleError } = useApiError()

    const handleSaveConfig = async () => {
        try {
            await updateCareCase({
                care_case_id: caseId,
                payload: {
                    tax_rate: taxRate,
                    tax_threshold: taxThreshold,
                    tax_method: taxMethod,
                },
            }).unwrap()
            message.success('Cập nhật cấu hình thuế thành công')
            refetch()
        } catch (err) {
            handleError(err, 'Lưu cấu hình thất bại')
        }
    }

    if (isLoading && !revenueData) {
        return (
            <Flex justify="center" align="center" className="min-h-[400px]">
                <Spin size="large" tip="Đang tải dữ liệu doanh thu..." />
            </Flex>
        )
    }

    if (isError || !revenueData?.data) {
        return (
            <Result
                status="error"
                title="Không tải được dữ liệu doanh thu"
                subTitle="Có lỗi xảy ra, vui lòng thử lại sau."
            />
        )
    }

    const rawData = revenueData.data
    const total_revenue = rawData.total_revenue * MULTIPLIER
    const total_taxable_cost = (rawData.total_taxable_cost || 0) * MULTIPLIER
    const categories = rawData.categories.map(categoryItem => ({
        ...categoryItem,
        revenue: categoryItem.revenue * MULTIPLIER,
        taxable_cost: categoryItem.taxable_cost * MULTIPLIER,
    }))
    const details = rawData.details.map(detailItem => ({
        ...detailItem,
        amount: detailItem.amount * MULTIPLIER,
    }))

    const baseAmount =
        taxMethod === TAX_METHOD.REVENUE ? total_revenue : Math.max(0, total_revenue - total_taxable_cost)
    const isExceedingThreshold = baseAmount > taxThreshold
    const totalTaxBase = isExceedingThreshold ? baseAmount - taxThreshold : 0
    const totalTax = (totalTaxBase * taxRate) / 100
    const netProfit = total_revenue - total_taxable_cost - totalTax

    const summaryData: {
        title: string
        value: string
        valueColor?: string
        bgIcon?: ReactNode
        isSpecial?: boolean
    }[] = [
        {
            title: 'Tổng doanh thu',
            value: `${total_revenue.toLocaleString()} đ`,
        },
        {
            title: 'Chi phí',
            value: `${total_taxable_cost.toLocaleString()} đ`,
            valueColor: colors.red,
        },
        {
            title: 'Thuế phải nộp (tạm tính)',
            value: `${totalTax.toLocaleString()} đ`,
            valueColor: colors.blue,
            bgIcon: <CalculatorOutlined className="!text-[48px]" style={{ color: colors.gray }} />,
        },
        {
            title: 'Lợi nhuận ròng',
            value: `${netProfit.toLocaleString()} đ`,
            valueColor: netProfit >= 0 ? colors.green : colors.red,
            isSpecial: true,
        },
    ]

    const tableData = categories.map(category => {
        const categoryBaseAmount =
            taxMethod === TAX_METHOD.REVENUE ? category.revenue : Math.max(0, category.revenue - category.taxable_cost)
        const proportion = baseAmount > 0 ? categoryBaseAmount / baseAmount : 0
        const categoryTaxBase = totalTaxBase * proportion
        const taxValue = totalTax * proportion
        return {
            ...category,
            key: category.category_id,
            taxBase: `${categoryTaxBase.toLocaleString()} đ`,
            tax: `${taxValue.toLocaleString()} đ`,
        }
    })

    const totalRow = {
        key: 'total',
        group_name: '',
        category_name: 'Tổng cộng',
        revenue: total_revenue,
        taxable_cost: total_taxable_cost,
        taxBase: `${totalTaxBase.toLocaleString()} đ`,
        tax: `${totalTax.toLocaleString()} đ`,
        category_id: 0,
        category_code: 'TOTAL',
        cost: 0,
        type: 'TOTAL',
    }

    const revenueSummaryData = [...tableData, totalRow]
    const revenueDetailData = details.map((detailItem, index) => ({ ...detailItem, key: detailItem.id || index }))

    const tabItems = [
        {
            key: 'summary',
            label: 'Tổng hợp & Cấu hình',
            children: (
                <CareCaseTaxSummaryConfig
                    config={{
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
                    }}
                    isFetching={isFetching}
                    revenueSummaryData={revenueSummaryData}
                    revenueDetailData={revenueDetailData}
                    onSave={handleSaveConfig}
                    isSaving={isSaving}
                />
            ),
        },
        {
            key: 'history',
            label: 'Lịch sử nộp thuế',
            children: <CareCaseTaxHistory caseId={caseId} totalTax={totalTax} onSuccess={refetch} />,
        },
    ]

    return (
        <Space direction="vertical" size={24} className="w-full">
            <Row gutter={[16, 16]}>
                {summaryData.map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card
                            bordered
                            className={`shadow-sm h-full ${item.isSpecial ? 'bg-emerald-50 border-emerald-100' : ''}`}>
                            <Space direction="vertical" size={2} className="w-full relative">
                                <Text className="text-[12px] font-bold text-slate-800 block mb-1">{item.title}</Text>
                                <Title level={3} className="!m-0" style={{ color: item.valueColor || 'inherit' }}>
                                    {item.value}
                                </Title>
                                {item.bgIcon && (
                                    <div className="absolute right-0 top-0 opacity-30 !-translate-y-[10%]">
                                        {item.bgIcon}
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="shadow-sm border-slate-200 overflow-hidden">
                <Tabs
                    defaultActiveKey="summary"
                    items={tabItems}
                    className="w-full h-full tax-tabs"
                    destroyInactiveTabPane
                />
            </Card>
        </Space>
    )
}

export default CareCaseTaxTab
