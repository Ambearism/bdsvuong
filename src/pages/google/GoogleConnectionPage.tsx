import { useLazyGetGoogleAuthUrlQuery } from '@/api/googleCalendar'
import { useGetMeQuery } from '@/api/auth'
import { CheckCircleOutlined, GoogleOutlined, CalendarOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, message, Space, Spin, Typography } from 'antd'
import { GoHome } from 'react-icons/go'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const GoogleConnectionPage = () => {
    useDocumentTitle('Kết nối Google')
    const [getGoogleAuthUrl, { isLoading: isConnecting }] = useLazyGetGoogleAuthUrlQuery()

    const { data: accountData, isLoading: isLoadingDetail } = useGetMeQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })

    const handleConnectGoogle = async () => {
        try {
            const response = await getGoogleAuthUrl().unwrap()
            const auth_url = response.data?.auth_url
            if (auth_url) {
                window.location.href = auth_url
            }
        } catch {
            message.error('Không thể lấy link kết nối Google.')
        }
    }

    if (isLoadingDetail) {
        return <Spin className="flex justify-center mt-10" size="large" />
    }

    const isConnected = !!accountData?.data?.google_access_token

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
                                title: 'Kết nối Google',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>
            <Card
                title={
                    <Space>
                        <CalendarOutlined /> <span>Quản lý kết nối Google Calendar</span>
                    </Space>
                }>
                <Flex vertical gap="large" align="center" className="py-10">
                    <Typography.Title level={4}>
                        {isConnected
                            ? 'Tài khoản của bạn đã được liên kết với Google Calendar'
                            : 'Liên kết tài khoản Google Calendar để nhận thông báo và quản lý lịch hẹn'}
                    </Typography.Title>

                    <Typography.Text type="secondary" className="text-center max-w-lg">
                        Sau khi kết nối, hệ thống sẽ tự động đồng bộ các sự kiện và gửi lời nhắc nhở đến tài khoản
                        Google của bạn.
                    </Typography.Text>

                    {isConnected ? (
                        <Space direction="vertical" align="center" size="middle">
                            <Button type="primary" ghost icon={<CheckCircleOutlined />} size="large">
                                Đã kết nối thành công
                            </Button>
                            <Typography.Text type="secondary">
                                Bạn có thể kết nối lại nếu muốn thay đổi tài khoản Google nhận thông báo.
                            </Typography.Text>
                            <Button icon={<GoogleOutlined />} onClick={handleConnectGoogle} loading={isConnecting}>
                                Kết nối lại bằng tài khoản khác
                            </Button>
                        </Space>
                    ) : (
                        <Button
                            type="primary"
                            icon={<GoogleOutlined />}
                            onClick={handleConnectGoogle}
                            loading={isConnecting}
                            size="large">
                            Kết nối Google Calendar ngay
                        </Button>
                    )}
                </Flex>
            </Card>
        </Space>
    )
}

export default GoogleConnectionPage
