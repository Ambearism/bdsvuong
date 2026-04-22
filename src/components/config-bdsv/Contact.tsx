import { Card, Form, Input } from 'antd'
import { REGEX_EMAIL, REGEX_URL } from '@/config/constant'

const Contact = () => {
    return (
        <Card size="small" className="!rounded-tl-none">
            <Form.Item
                label="Thông tin công ty"
                name="company_info"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    { required: true, message: 'Vui lòng nhập thông tin công ty!' },
                    { max: 255, message: 'Thông tin công ty không được vượt quá 255 ký tự!' },
                ]}>
                <Input placeholder="CÔNG TY TNHH ĐỊA ỐC HÀ ĐÔNG" />
            </Form.Item>
            <Form.Item
                label="Địa chỉ"
                name="address"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ!' },
                    { max: 255, message: 'Địa chỉ không được vượt quá 255 ký tự!' },
                ]}>
                <Input placeholder="123 Đường phố, Quận, Thành phố, Tỉnh" />
            </Form.Item>
            <Form.Item
                label="Chăm sóc khách hàng"
                name="manager_contact"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    {
                        pattern: REGEX_EMAIL,
                        message: 'Vui lòng nhập đúng định dạng email!',
                    },
                    {
                        max: 255,
                        message: 'Chăm sóc khách hàng không được vượt quá 255 ký tự!',
                    },
                ]}>
                <Input placeholder="batdongsanvuong@gmail.com" />
            </Form.Item>
            <Form.Item
                label="Hỗ trợ khách hàng"
                name="technical_support"
                layout="horizontal"
                colon={false}
                labelCol={{ className: 'custom-label' }}
                className="!p-2 !mb-0"
                rules={[
                    {
                        pattern: REGEX_URL,
                        message: 'Vui lòng nhập đúng định dạng URL!',
                    },
                    {
                        max: 255,
                        message: 'Hỗ trợ khách hàng không được vượt quá 255 ký tự!',
                    },
                ]}>
                <Input placeholder="https://www.facebook.com/batdongsanvuong" />
            </Form.Item>
        </Card>
    )
}

export default Contact
