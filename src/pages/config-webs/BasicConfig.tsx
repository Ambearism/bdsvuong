import { useState, useEffect } from 'react'
import { Breadcrumb, Form, Button, Space, Card, message, Tabs, Flex } from 'antd'
import type { FormProps } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { GoHome } from 'react-icons/go'
import { useGetBasicConfigQuery, useSaveBasicConfigMutation } from '@/api/config'
import type { BasicConfigInput } from '@/types/config'
import Loading from '@/components/Loading'
import BasicInfo from '@/components/config-bdsv/BasicInfo'
import Contact from '@/components/config-bdsv/Contact'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'

const BasicConfig = () => {
    useDocumentTitle('Cấu hình Website')
    const { hasPermission } = usePermission()
    const [form] = Form.useForm()
    const [activeTab, setActiveTab] = useState('basicInfo')
    const { data, isLoading } = useGetBasicConfigQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })
    const [saveConfig, { isLoading: isSaving }] = useSaveBasicConfigMutation()

    useEffect(() => {
        if (data?.data) {
            form.setFieldsValue(data.data)
        }
    }, [data, form])

    const onFinish = async (values: BasicConfigInput) => {
        try {
            await saveConfig(values).unwrap()
            message.success('Lưu cấu hình thành công!')
        } catch {
            message.error('Lưu cấu hình thất bại!')
        }
    }

    if (isLoading) {
        return <Loading />
    }

    const tabItems = [
        {
            key: 'basicInfo',
            label: 'Thông tin cơ bản',
            children: <BasicInfo />,
        },
        {
            key: 'contact',
            label: 'Liên hệ',
            children: <Contact />,
        },
    ]

    const onFinishFailed: FormProps<BasicConfigInput>['onFinishFailed'] = errorInfo => {
        if (errorInfo.errorFields.length > 0) {
            const firstErrorField = errorInfo.errorFields[0].name[0] as string
            const fieldToTab: Record<string, string> = {
                hotline: 'basicInfo',
                number_phone: 'basicInfo',
                facebook: 'basicInfo',
                google_plus: 'basicInfo',
                youtube: 'basicInfo',
                company_info: 'contact',
                address: 'contact',
                manager_contact: 'contact',
                technical_support: 'contact',
            }
            const targetTab = fieldToTab[firstErrorField]
            if (targetTab) {
                setActiveTab(targetTab)
            }
        }
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={[
                            {
                                href: '/',
                                title: <GoHome size={24} />,
                            },
                            {
                                title: 'Cấu hình Website',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                disabled={!hasPermission(RESOURCE_TYPE.SETTING, ACTION.UPDATE)}>
                <Card>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} type="card" />

                    {hasPermission(RESOURCE_TYPE.SETTING, ACTION.UPDATE) && (
                        <Flex justify="center" className="!mt-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={isSaving}
                                size="large">
                                Lưu
                            </Button>
                        </Flex>
                    )}
                </Card>
            </Form>
        </Space>
    )
}

export default BasicConfig
