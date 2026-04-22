import { Card, Form, Input, Radio } from 'antd'

const { TextArea } = Input

const SeoFormInputs = () => {
    return (
        <Card size="small" className="!rounded-tl-none">
            <Form.Item
                label="Title SEO"
                name="seo_title"
                rules={[
                    { max: 60, message: 'Tối đa 60 ký tự' },
                    { whitespace: true, message: 'Không được chỉ chứa khoảng trắng' },
                ]}>
                <Input placeholder="Độ dài đề xuất: 50 ~ 60 ký tự" maxLength={60} showCount />
            </Form.Item>

            <Form.Item
                label="Description SEO"
                name="seo_description"
                rules={[
                    { max: 160, message: 'Tối đa 160 ký tự' },
                    { whitespace: true, message: 'Không được chỉ chứa khoảng trắng' },
                ]}>
                <TextArea placeholder="Độ dài đề xuất: 150 ~ 160 ký tự" rows={3} maxLength={160} showCount />
            </Form.Item>

            <Form.Item
                label="Keywords SEO"
                name="seo_keywords"
                rules={[
                    { max: 250, message: 'Tối đa 250 ký tự' },
                    { whitespace: true, message: 'Không được chỉ chứa khoảng trắng' },
                ]}>
                <Input placeholder="keyword1, keyword2, keyword3" maxLength={250} showCount />
            </Form.Item>

            <Form.Item label="Meta Robots" name="seo_robots">
                <Radio.Group>
                    <Radio value="ALL">ALL (index, follow)</Radio>
                    <Radio value="NONE">NONE (noindex, nofollow)</Radio>
                    <Radio value="NOINDEX">NOINDEX</Radio>
                    <Radio value="NOFOLLOW">NOFOLLOW</Radio>
                    <Radio value="INDEX, NOFOLLOW">INDEX, NOFOLLOW</Radio>
                    <Radio value="NOINDEX, FOLLOW">NOINDEX, FOLLOW</Radio>
                </Radio.Group>
            </Form.Item>
        </Card>
    )
}

export default SeoFormInputs
