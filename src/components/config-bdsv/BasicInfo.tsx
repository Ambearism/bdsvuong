import { Card, Form, Input } from 'antd'
import { REGEX_PHONE, REGEX_URL } from '@/config/constant'

const BasicInfo = () => {
    return (
        <Card size="small" className="!rounded-tl-none">
            <Form.Item
                label="Số hotline"
                name="hotline"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[{ max: 255, message: 'Số hotline không được vượt quá 255 ký tự!' }]}>
                <Input placeholder="098 7906817 - 0906 205 123" />
            </Form.Item>

            <Form.Item
                label="Số điện thoại bàn"
                name="number_phone"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    {
                        pattern: REGEX_PHONE,
                        message: 'Số điện thoại không đúng định dạng!',
                    },
                    {
                        max: 255,
                        message: 'Số điện thoại bàn không được vượt quá 255 ký tự!',
                    },
                ]}>
                <Input placeholder="024 3999 9999" />
            </Form.Item>

            <Form.Item
                label="Facebook"
                name="facebook"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    {
                        pattern: REGEX_URL,
                        message: 'URL không đúng định dạng!',
                    },
                    {
                        max: 255,
                        message: 'Facebook không được vượt quá 255 ký tự!',
                    },
                ]}>
                <Input placeholder="https://www.facebook.com/..." />
            </Form.Item>

            <Form.Item
                label="Google+"
                name="google_plus"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    {
                        pattern: REGEX_URL,
                        message: 'URL không đúng định dạng!',
                    },
                    {
                        max: 255,
                        message: 'Google+ không được vượt quá 255 ký tự!',
                    },
                ]}>
                <Input placeholder="https://plus.google.com/..." />
            </Form.Item>

            <Form.Item
                label="Youtube"
                name="youtube"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    {
                        pattern: REGEX_URL,
                        message: 'URL không đúng định dạng!',
                    },
                    {
                        max: 255,
                        message: 'Youtube không được vượt quá 255 ký tự!',
                    },
                ]}>
                <Input placeholder="https://www.youtube.com/..." />
            </Form.Item>
        </Card>
    )
}

export default BasicInfo
