import { Row, Col, Form, DatePicker, Input, Select, Checkbox, type FormInstance } from 'antd'
import { PRODUCT_TRANSACTION, SUPPLIER_TYPE } from '@/config/constant'
import type { ProductFormValues } from '@/types/product'
const { TextArea } = Input

interface ProviderInfoCardProps {
    form: FormInstance<Partial<ProductFormValues>>
    supplierOptions?: { label: string; value: string | number }[]
    transactionTypeOptions?: { label: string; value: string | number }[]
    customerOptions?: { label: string; value: string | number }[]
    sellStatusOptions?: { label: string; value: string | number }[]
    rentStatusOptions?: { label: string; value: string | number }[]
    expertOptions?: { label: string; value: string | number }[]
    loadingExperts: boolean
    loadingCustomer: boolean
    isReferrer: boolean
    setIsReferrer: (val: boolean) => void
    setSearchValue: (val: string) => void
    setShowCustomerModal: (val: boolean) => void
    onCustomerScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

const ProviderInfoCard = ({
    form,
    supplierOptions,
    transactionTypeOptions,
    customerOptions,
    sellStatusOptions,
    rentStatusOptions,
    loadingCustomer,
    isReferrer,
    loadingExperts,
    expertOptions,
    setIsReferrer,
    setSearchValue,
    onCustomerScroll,
}: ProviderInfoCardProps) => {
    const typeTransactionId = Form.useWatch('type_transaction_id', form)
    return (
        <>
            <Row gutter={16} align="middle">
                <Col span={6}>
                    <Form.Item label="Nhu cầu" name="type_transaction_id" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Chọn loại giao dịch"
                            allowClear
                            options={transactionTypeOptions}
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>
                {!!typeTransactionId && (
                    <Col span={6}>
                        <Row gutter={16}>
                            {(typeTransactionId == PRODUCT_TRANSACTION.SELL ||
                                typeTransactionId == PRODUCT_TRANSACTION.ALL) && (
                                <Col span={typeTransactionId == PRODUCT_TRANSACTION.ALL ? 12 : 24}>
                                    <Form.Item label="Trạng thái bán" name="status_transaction_sell_id">
                                        <Select
                                            showSearch
                                            placeholder="Chọn loại trạng thái bán"
                                            allowClear
                                            options={sellStatusOptions}
                                            optionFilterProp="label"
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                            {(typeTransactionId == PRODUCT_TRANSACTION.RENT ||
                                typeTransactionId == PRODUCT_TRANSACTION.ALL) && (
                                <Col span={typeTransactionId == PRODUCT_TRANSACTION.ALL ? 12 : 24}>
                                    <Form.Item label="Trạng thái thuê" name="status_transaction_rent_id">
                                        <Select
                                            showSearch
                                            placeholder="Chọn loại trạng thái thuê"
                                            allowClear
                                            options={rentStatusOptions}
                                            optionFilterProp="label"
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>
                    </Col>
                )}
                <Col span={6}>
                    <Form.Item label="Ngày gửi" name="send_date" rules={[{ required: true }]}>
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Nhà cung cấp" name="supplier_type_id" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Chọn nhà cung cấp"
                            allowClear
                            options={supplierOptions}
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item
                        shouldUpdate={(prevValues, currentValues) =>
                            prevValues.supplier_type_id !== currentValues.supplier_type_id
                        }
                        noStyle>
                        {({ getFieldValue }) => {
                            const supplierType = getFieldValue('supplier_type_id')
                            const isCustomerDisabled = !supplierType || supplierType === SUPPLIER_TYPE.CUA_TOI
                            return (
                                <Form.Item label="Tên khách hàng" name="customer_id">
                                    <Select
                                        disabled={isCustomerDisabled}
                                        showSearch
                                        placeholder="Nhập số điện thoại, tên khách hàng"
                                        allowClear
                                        filterOption={false}
                                        onSearch={setSearchValue}
                                        onPopupScroll={onCustomerScroll}
                                        loading={loadingCustomer}
                                        notFoundContent={loadingCustomer ? 'Đang tải...' : 'Không tìm thấy'}
                                        options={customerOptions}
                                    />
                                </Form.Item>
                            )
                        }}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        label={
                            <span className="flex items-center gap-2">
                                Người giới thiệu
                                <Checkbox checked={isReferrer} onChange={e => setIsReferrer(e.target.checked)} />
                            </span>
                        }
                        name="ref_id"
                        required={false}>
                        <Select
                            disabled={!isReferrer}
                            showSearch
                            placeholder="Nhập số điện thoại, tên người giới thiệu"
                            filterOption={false}
                            allowClear
                            onSearch={setSearchValue}
                            onPopupScroll={onCustomerScroll}
                            loading={loadingCustomer}
                            notFoundContent={loadingCustomer ? 'Đang tải...' : 'Không tìm thấy'}
                            options={customerOptions}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="expert_id" label="Chuyên viên phụ trách" rules={[{ required: true }]}>
                        <Select
                            placeholder="Chọn chuyên viên"
                            loading={loadingExperts}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={expertOptions}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Ghi chú NCC" name="supplier_note" rules={[{ max: 500 }]}>
                        <TextArea rows={2} />
                    </Form.Item>
                </Col>
            </Row>
        </>
    )
}

export default ProviderInfoCard
