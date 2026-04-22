import ListAccount from '@/components/accounts/ListAccount'
import { Breadcrumb, Button, Card, Flex, Space } from 'antd'
import { GoHome } from 'react-icons/go'
import { PlusOutlined } from '@ant-design/icons'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const ListAccountPage = () => {
    useDocumentTitle('Danh sách nhân viên')
    const { hasPermission } = usePermission()
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
                                title: 'Danh sách nhân viên',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Flex gap="small">
                        {hasPermission(RESOURCE_TYPE.STAFF, ACTION.CREATE) && (
                            <Button type="primary" icon={<PlusOutlined />} href="/accounts/create" className="w-fit">
                                Tạo mới
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <ListAccount />
        </Space>
    )
}

export default ListAccountPage
