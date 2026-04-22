import { useState, useEffect } from 'react'
import { Breadcrumb, Card, Form, Button, Space, message, Tabs } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useGetAboutConfigQuery, useSaveAboutConfigMutation } from '@/api/config'
import { GoHome } from 'react-icons/go'
import type { AboutConfigInput } from '@/types/config'
import Loading from '@/components/Loading'
import HotlineConfig from '@/components/config-bdsv/HotlineConfig'
import Box1Config from '@/components/config-bdsv/Box1Config'
import Box2Config from '@/components/config-bdsv/Box2Config'
import Box3Config from '@/components/config-bdsv/Box3Config'
import Box4Config from '@/components/config-bdsv/Box4Config'
import Box5Config from '@/components/config-bdsv/Box5Config'

const AboutConfig = () => {
    const [form] = Form.useForm()
    const [activeTab, setActiveTab] = useState('hotline')
    const { data, isLoading } = useGetAboutConfigQuery()
    const [saveConfig, { isLoading: isSaving }] = useSaveAboutConfigMutation()

    useEffect(() => {
        if (data?.data) {
            form.setFieldsValue(data.data)
        }
    }, [data, form])

    const onFinish = async (values: AboutConfigInput) => {
        try {
            await saveConfig(values).unwrap()
            message.success('Lưu cấu hình trang giới thiệu thành công!')
        } catch {
            message.error('Lưu cấu hình thất bại!')
        }
    }

    if (isLoading) {
        return <Loading />
    }

    const tabItems = [
        {
            key: 'hotline',
            label: 'Thông tin cơ bản',
            children: <HotlineConfig />,
        },
        {
            key: 'box1',
            label: 'BOX 1',
            children: <Box1Config />,
        },
        {
            key: 'box2',
            label: 'BOX 2',
            children: <Box2Config />,
        },
        {
            key: 'box3',
            label: 'BOX 3',
            children: <Box3Config />,
        },
        {
            key: 'box4',
            label: 'BOX 4',
            children: <Box4Config />,
        },
        {
            key: 'box5',
            label: 'BOX 5',
            children: <Box5Config />,
        },
    ]

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card size="small">
                <Space direction="vertical" className="w-full">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Thông tin trang giới thiệu',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Space>
            </Card>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    type="card"
                    tabBarStyle={{ marginBottom: 0 }}
                />

                <div className="mt-4">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving} size="large">
                        Lưu
                    </Button>
                </div>
            </Form>
        </Space>
    )
}

export default AboutConfig
