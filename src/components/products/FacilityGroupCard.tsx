import { Col, Form, Row, Checkbox, Card, Rate, Typography } from 'antd'
import { memo, useMemo } from 'react'

interface Opt {
    label: string
    value: string | number
}
interface FacilityGroupCardProps {
    furnitureOptions?: Opt[]
    convenientOptions?: Opt[]
    fitOptions?: Opt[]
}

const CheckboxGrid = ({
    name,
    options,
    colSpan = 12,
}: {
    name: string
    options?: Opt[]
    colSpan?: 6 | 8 | 12 | 24
}) => {
    const safeOptions = useMemo(() => options ?? [], [options])
    return (
        <Form.Item name={name} noStyle>
            <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[8, 8]}>
                    {safeOptions.map(item => (
                        <Col span={colSpan} key={item.value}>
                            <Checkbox value={item.value}>{item.label}</Checkbox>
                        </Col>
                    ))}
                </Row>
            </Checkbox.Group>
        </Form.Item>
    )
}

const FacilityGroupCard = ({ furnitureOptions, convenientOptions, fitOptions }: FacilityGroupCardProps) => {
    return (
        <Row gutter={[12, 12]}>
            <Col span={8}>
                <Card title="Nội thất">
                    <CheckboxGrid name="furniture_ids" options={furnitureOptions} />
                </Card>
            </Col>

            <Col span={8}>
                <Card title="Tiện nghi">
                    <CheckboxGrid name="convenient_ids" options={convenientOptions} />
                </Card>
            </Col>

            <Col span={8}>
                <Card title="Phù hợp">
                    <Row gutter={[0, 16]}>
                        <Col span={24}>
                            <CheckboxGrid name="fit_ids" options={fitOptions} />
                        </Col>
                        <Col span={24}>
                            <Typography.Text strong className="!pt-4">
                                Đánh giá
                            </Typography.Text>
                            <Form.Item name="rate" initialValue={0}>
                                <Rate count={5} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    )
}

export default memo(FacilityGroupCard)
