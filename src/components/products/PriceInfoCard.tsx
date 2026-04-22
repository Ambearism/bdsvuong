import {
    MIN_BROKERAGE_FEE,
    MIN_COMMISSION_RATE,
    MIN_POSITIVE_VALUE,
    PRODUCT_STATUS,
    PRODUCT_TRANSACTION,
} from '@/config/constant'
import { Checkbox, Col, Form, Input, InputNumber, Radio, Row } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { parseNumber, formatter } from '@/utils/number-utils'

const { TextArea } = Input

interface PriceInfoCardProps {
    productStatusOptions?: { label: string; value: string | number }[]
}

interface FormValues {
    status_product_id?: number
    acreage?: number
    price_receive?: number
    total_price_receive?: number
    price_sell?: number
    total_price_sell?: number
    price_contact?: number
    price_build?: number
    percent_closed?: number
    difference?: number
    total_closed?: number
    percent_brokerage?: number
    price_brokerage?: number
    total_contact?: number
    tax_type_id?: number
    price_rent?: number
    deposit_rent?: number
    cycle_rent?: number
    price_rent_brokerage?: number
    price_note?: string
}

const PriceInfoCard = ({ productStatusOptions }: PriceInfoCardProps) => {
    const form = Form.useFormInstance<FormValues>()
    const [sameAsReceive, setSameAsReceive] = useState<boolean>(false)
    const type_transaction_id = Form.useWatch('type_transaction_id', form)
    const status_product_id = Form.useWatch('status_product_id', form)
    const acreage = Form.useWatch('acreage', form)
    const price_receive = Form.useWatch('price_receive', form)
    const total_price_receive = Form.useWatch('total_price_receive', form)
    const price_sell = Form.useWatch('price_sell', form)
    const price_build = Form.useWatch('price_build', form)
    const price_contact = Form.useWatch('price_contact', form)
    const difference = Form.useWatch('difference', form)
    const total_closed = Form.useWatch('total_closed', form)
    const percent_closed = Form.useWatch('percent_closed', form)
    const percent_brokerage = Form.useWatch('percent_brokerage', form)

    const isRent = type_transaction_id === PRODUCT_TRANSACTION.RENT
    const isSell = type_transaction_id === PRODUCT_TRANSACTION.SELL
    const isAll = type_transaction_id === PRODUCT_TRANSACTION.ALL

    const showSellFields = isSell || isAll
    const showRentFields = isRent || isAll

    const recalculate = useCallback(() => {
        const acreageProduct = parseNumber(acreage)
        const receivePrice = parseNumber(price_receive)
        const totalPriceReceive = parseNumber(total_price_receive)
        const sellPrice = parseNumber(price_sell)
        const buildPrice = parseNumber(price_build)
        const contactPrice = parseNumber(price_contact)
        const differencePrice = parseNumber(difference)
        const totalClosed = parseNumber(total_closed)
        const percentClosed = parseNumber(percent_closed)
        const percentBroker = parseNumber(percent_brokerage)

        const updates: Partial<FormValues> = {}

        if (status_product_id !== PRODUCT_STATUS.DONG_TIEN_DO) {
            if (acreageProduct && receivePrice) {
                updates.total_price_receive = Number(((receivePrice * acreageProduct) / 1000).toFixed(3))
            }

            if (sameAsReceive) {
                updates.price_sell = receivePrice
                updates.total_price_sell = total_price_receive
            } else {
                updates.total_price_sell = Number(((sellPrice * acreageProduct) / 1000).toFixed(3))
            }
        } else {
            const totalContact = (contactPrice * acreageProduct) / 1000
            updates.total_contact = Number(totalContact.toFixed(3))

            if (percentClosed) {
                updates.total_closed = ((totalContact + buildPrice) * percentClosed) / 100
            }

            updates.total_price_receive = differencePrice / 1000 + totalClosed
            updates.price_receive = ((totalContact + buildPrice + differencePrice / 1000) * 1000) / acreageProduct
            updates.total_price_sell =
                buildPrice + totalPriceReceive + ((sellPrice - receivePrice) * acreageProduct) / 1000
        }

        if (percentBroker) {
            updates.price_brokerage = (((sellPrice * acreageProduct) / 1000 + buildPrice) * 1000 * percentBroker) / 100
        } else if (status_product_id !== PRODUCT_STATUS.DONG_TIEN_DO) {
            updates.price_brokerage = sellPrice * acreageProduct - receivePrice * acreageProduct
        }

        const currentValues = form.getFieldsValue(Object.keys(updates) as (keyof FormValues)[])
        const hasChanges = Object.keys(updates).some(
            key => updates[key as keyof FormValues] !== currentValues[key as keyof FormValues],
        )

        if (hasChanges) {
            form.setFieldsValue(updates)
        }
    }, [
        acreage,
        price_contact,
        difference,
        percent_closed,
        price_receive,
        price_sell,
        percent_brokerage,
        price_build,
        sameAsReceive,
        status_product_id,
        total_closed,
        total_price_receive,
        form,
    ])

    useEffect(() => {
        recalculate()
    }, [recalculate])

    return (
        <>
            <Form.Item label="Trạng thái" name="status_product_id" rules={[{ required: true }]}>
                <Radio.Group options={productStatusOptions} optionType="button" />
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Diện tích"
                        name="acreage"
                        rules={[
                            { required: true, message: 'Vui lòng nhập diện tích' },
                            { type: 'number', min: MIN_POSITIVE_VALUE, message: 'Diện tích phải lớn hơn 0' },
                        ]}>
                        <InputNumber formatter={formatter} className="w-full" addonAfter="m²" placeholder="0" />
                    </Form.Item>
                </Col>
                {showRentFields && (
                    <Col span={12}>
                        <Form.Item
                            label="Giá trị BĐS"
                            rules={[
                                { required: true, message: 'Vui lòng nhập giá trị BĐS' },
                                { type: 'number', min: MIN_POSITIVE_VALUE, message: 'Giá trị BĐS phải lớn hơn 0' },
                            ]}
                            name="product_value">
                            <InputNumber className="w-full" addonAfter="tỷ" placeholder="0" />
                        </Form.Item>
                    </Col>
                )}
                {showSellFields && (
                    <Col span={12}>
                        <Form.Item
                            label="Giá xây thô"
                            rules={[{ type: 'number', min: MIN_POSITIVE_VALUE, message: 'Giá xây thô phải lớn hơn 0' }]}
                            name="price_build">
                            <InputNumber className="w-full" addonAfter="tỷ" placeholder="0" />
                        </Form.Item>
                    </Col>
                )}
            </Row>

            {showSellFields && (
                <>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="price_contact"
                                        label="Giá hợp đồng"
                                        rules={[
                                            ...(status_product_id === PRODUCT_STATUS.DONG_TIEN_DO
                                                ? [{ required: true, message: 'Vui lòng nhập giá hợp đồng' }]
                                                : []),
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Giá hợp đồng phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber
                                            disabled={status_product_id !== PRODUCT_STATUS.DONG_TIEN_DO}
                                            className="w-full"
                                            addonAfter="tr/m²"
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="total_contact"
                                        label="Tổng giá HĐ"
                                        rules={[
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Tổng giá HĐ phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber
                                            disabled={status_product_id !== PRODUCT_STATUS.DONG_TIEN_DO}
                                            className="!w-full"
                                            addonAfter="tỷ"
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>

                        <Col span={24}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="difference"
                                        label="Chênh"
                                        rules={[
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Chênh phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber
                                            disabled={status_product_id !== PRODUCT_STATUS.DONG_TIEN_DO}
                                            className="!w-full"
                                            addonAfter="triệu"
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="percent_closed"
                                        label="% đã đóng"
                                        rules={[
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                max: 100,
                                                message: '% đã đóng phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber
                                            disabled={status_product_id !== PRODUCT_STATUS.DONG_TIEN_DO}
                                            className="!w-full"
                                            addonAfter="%"
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="total_closed"
                                        label="Tổng đã đóng"
                                        rules={[
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Tổng đã đóng phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber
                                            disabled={status_product_id !== PRODUCT_STATUS.DONG_TIEN_DO}
                                            className="!w-full"
                                            addonAfter="tỷ"
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="price_receive"
                                        label="Thu về"
                                        rules={[
                                            ...(showSellFields
                                                ? [{ required: true, message: 'Vui lòng nhập giá thu về' }]
                                                : []),
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Giá thu về phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber className="w-full" addonAfter="tr/m²" placeholder="0" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="total_price_receive"
                                        label="Tổng thu về"
                                        rules={[
                                            {
                                                type: 'number',
                                                min: MIN_POSITIVE_VALUE,
                                                message: 'Tổng thu về phải lớn hơn 0',
                                            },
                                        ]}>
                                        <InputNumber className="w-full" addonAfter="tỷ" placeholder="0" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <>
                                        Giá bán{' '}
                                        <Checkbox
                                            disabled={status_product_id == PRODUCT_STATUS.DONG_TIEN_DO}
                                            checked={sameAsReceive}
                                            onChange={e => setSameAsReceive(e.target.checked)}
                                            className="!ml-2">
                                            = thu về
                                        </Checkbox>
                                    </>
                                }
                                className="!mb-0">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="price_sell"
                                            rules={[
                                                ...(showSellFields && !sameAsReceive
                                                    ? [{ required: true, message: 'Vui lòng nhập giá bán' }]
                                                    : []),
                                                {
                                                    type: 'number',
                                                    min: MIN_POSITIVE_VALUE,
                                                    message: 'Giá bán phải lớn hơn 0',
                                                },
                                            ]}>
                                            <InputNumber
                                                disabled={sameAsReceive}
                                                className="!w-full"
                                                addonAfter="tr/m²"
                                                placeholder="0"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="total_price_sell"
                                            rules={[
                                                {
                                                    type: 'number',
                                                    min: MIN_POSITIVE_VALUE,
                                                    message: 'Tổng giá bán phải lớn hơn 0',
                                                },
                                            ]}>
                                            <InputNumber
                                                disabled={sameAsReceive}
                                                className="!w-full"
                                                addonAfter="tỷ"
                                                placeholder="0"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item className="!mb-0">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="percent_brokerage"
                                            label="% môi giới"
                                            rules={[
                                                {
                                                    type: 'number',
                                                    min: MIN_COMMISSION_RATE,
                                                    max: 100,
                                                    message: '% môi giới phải lớn hơn hoặc bằng 0',
                                                },
                                            ]}>
                                            <InputNumber className="!w-full" addonAfter="%" placeholder="0" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="price_brokerage"
                                            label="Phí môi giới"
                                            rules={[
                                                {
                                                    type: 'number',
                                                    min: MIN_BROKERAGE_FEE,
                                                    message: 'Phí môi giới phải lớn hơn 0',
                                                },
                                            ]}>
                                            <InputNumber className="!w-full" addonAfter="triệu" placeholder="0" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Thuế" name="tax_type_id">
                                <Radio.Group>
                                    <Radio value={1}>Bên bán</Radio>
                                    <Radio value={2}>Bên mua</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            )}

            {showRentFields && (
                <>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Giá thuê"
                                name="price_rent"
                                rules={[
                                    ...(showRentFields ? [{ required: true, message: 'Vui lòng nhập giá thuê' }] : []),
                                    { type: 'number', min: MIN_POSITIVE_VALUE, message: 'Giá thuê phải lớn hơn 0' },
                                ]}>
                                <InputNumber className="w-full" addonAfter="triệu/tháng" placeholder="0" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Đặt cọc"
                                name="deposit_rent"
                                rules={[
                                    ...(showRentFields
                                        ? [{ required: true, message: 'Vui lòng nhập tiền đặt cọc' }]
                                        : []),
                                    { type: 'number', min: MIN_POSITIVE_VALUE, message: 'Tiền đặt cọc phải lớn hơn 0' },
                                ]}>
                                <InputNumber className="w-full" addonAfter="triệu" placeholder="0" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Chu kỳ thanh toán"
                                name="cycle_rent"
                                rules={[
                                    ...(showRentFields
                                        ? [{ required: true, message: 'Vui lòng nhập chu kỳ thanh toán' }]
                                        : []),
                                    {
                                        type: 'number',
                                        min: MIN_POSITIVE_VALUE,
                                        message: 'Chu kỳ thanh toán phải lớn hơn 0',
                                    },
                                ]}>
                                <InputNumber className="w-full" addonAfter="tháng/lần" placeholder="0" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Phí môi giới khi cho thuê"
                                name="price_rent_brokerage"
                                rules={[
                                    { type: 'number', min: MIN_BROKERAGE_FEE, message: 'Phí môi giới phải lớn hơn 0' },
                                ]}>
                                <InputNumber className="w-full" addonAfter="triệu" placeholder="0" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            )}

            <Form.Item label="Ghi chú giá" name="price_note" rules={[{ max: 500 }]}>
                <TextArea rows={5} />
            </Form.Item>
        </>
    )
}

export default PriceInfoCard
