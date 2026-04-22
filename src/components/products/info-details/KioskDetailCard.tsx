import { Row, Col, Form, Input, Select, Checkbox, InputNumber, Flex } from 'antd'
import { TextEditor } from '@/components/tiptap'
import CheckDuplicateInfoButton from '@/components/products/CheckDuplicateInfoButton'

interface KioskDetailCardProps {
    directionOptions?: { label: string; value: string | number }[]
    isExploreMode?: boolean
    divisiveOptions?: { label: string; value: string }[]
    parcelOptions?: { label: string; value: string }[]
    numberOptions?: { label: string; value: string }[]
    onDivisiveChange?: (val: string) => void
    onParcelChange?: (val: string) => void
    isSearchingInfo?: boolean
}

const KioskDetailCard = ({
    directionOptions,
    isExploreMode,
    divisiveOptions,
    parcelOptions,
    numberOptions,
    onDivisiveChange,
    onParcelChange,
    isSearchingInfo,
}: KioskDetailCardProps) => {
    return (
        <>
            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item label="Tòa" name="apartment" rules={[{ max: 50 }]}>
                        {isExploreMode ? (
                            <Select
                                options={divisiveOptions}
                                onChange={onDivisiveChange}
                                showSearch
                                placeholder="Chọn tòa"
                                loading={isSearchingInfo}
                            />
                        ) : (
                            <Input />
                        )}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        label="Tầng"
                        name="number_floor"
                        rules={isExploreMode ? [{ max: 50 }] : [{ type: 'number' }]}>
                        {isExploreMode ? (
                            <Select
                                options={parcelOptions}
                                onChange={onParcelChange}
                                showSearch
                                placeholder="Chọn tầng"
                                loading={isSearchingInfo}
                            />
                        ) : (
                            <InputNumber className="!w-full" />
                        )}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Flex justify="space-between" align="center" className="!mb-2">
                        <span title="Số căn">Số căn</span>
                        <CheckDuplicateInfoButton />
                    </Flex>
                    <Form.Item name="number" rules={[{ max: 50 }]}>
                        {isExploreMode ? (
                            <Select
                                options={numberOptions}
                                showSearch
                                placeholder="Chọn số căn"
                                loading={isSearchingInfo}
                            />
                        ) : (
                            <Input
                                placeholder="Nhập số căn"
                                addonAfter={
                                    <Form.Item name="is_corner" valuePropName="checked" noStyle initialValue={false}>
                                        <Checkbox>Góc</Checkbox>
                                    </Form.Item>
                                }
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Tình trạng" name="finish_house" valuePropName="checked">
                        <Checkbox>Đã hoàn thiện</Checkbox>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item label="Hướng nhà" name="direction_house_id">
                        <Select
                            showSearch
                            placeholder="Chọn hướng nhà"
                            allowClear
                            options={directionOptions}
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label="Mặt tiền" name="street_frontage" rules={[{ type: 'number', min: 0 }]}>
                        <InputNumber className="!w-full" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
                <TextEditor />
            </Form.Item>
        </>
    )
}

export default KioskDetailCard
