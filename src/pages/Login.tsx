import { useLoginMutation } from '@/api/auth'
import { isApiError } from '@/lib/utils'
import { useAppDispatch } from '@/redux/hooks'
import { setAuth } from '@/redux/slice/authSlice'
import type { LoginRequest } from '@/types'
import { Alert, Button, Card, Flex, Form, Image, Input, Space } from 'antd'
import { useEffect } from 'react'

const Login = () => {
    const [login, { data, error, isLoading, isSuccess }] = useLoginMutation()

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setAuth(data))
        }
    }, [isSuccess, dispatch, data])

    return (
        <Flex justify="center" className="!mt-12.5">
            <Card className="w-sm !rounded-none !border-t-3 !border-t-red-400">
                <Space direction="vertical" size={16} className="w-full">
                    <Flex align="center" justify="center">
                        <Image height={68} src="/logo_bdsv.png" preview={false} />
                    </Flex>
                    {isApiError(error) && <Alert message={error.data.status.message} type="error" />}
                    <Form name="login" onFinish={login} autoComplete="off" layout="vertical">
                        <Form.Item<LoginRequest>
                            label="Tài khoản"
                            name="account_name"
                            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
                            style={{ marginBottom: 16 }}
                            className="[&_label]:font-bold">
                            <Input placeholder="Tài khoản" style={{ borderRadius: 0 }} />
                        </Form.Item>

                        <Form.Item<LoginRequest>
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            style={{ marginBottom: 36 }}
                            className="[&_label]:font-bold">
                            <Input.Password placeholder="Mật khẩu" style={{ borderRadius: 0 }} />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                htmlType="submit"
                                block
                                loading={isLoading}
                                style={{ borderRadius: 0 }}
                                type="primary">
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
            </Card>
        </Flex>
    )
}

export default Login
