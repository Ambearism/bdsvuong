import ListImage360 from '@/components/image-360/ListImage360'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import { LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Flex, Space } from 'antd'
import { GoHome } from 'react-icons/go'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const ListImage360Page = () => {
    useDocumentTitle('Danh sách ảnh 360')
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
                                title: 'Danh sách ảnh 360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Flex gap="small">
                        <Button type="primary" icon={<LinkOutlined />} href="/image-360/link" className="w-fit">
                            Liên kết ảnh 360
                        </Button>
                        {hasPermission(RESOURCE_TYPE.VIEW_360, ACTION.CREATE) && (
                            <Button type="primary" icon={<PlusOutlined />} href="/image-360/create" className="w-fit">
                                Tạo mới
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <ListImage360 />
        </Space>
    )
}

export default ListImage360Page
