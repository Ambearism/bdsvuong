import LinkManager from '@/components/image-360/tab-link-image-360/LinkManager'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Breadcrumb, Button, Card, Flex, Space } from 'antd'
import { GoHome } from 'react-icons/go'
import { useNavigate } from 'react-router'
import { ArrowLeftOutlined } from '@ant-design/icons'

const ListImage360Page = () => {
    useDocumentTitle('Liên kết ảnh 360')
    const navigate = useNavigate()
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
                                href: '/image-360',
                                title: 'Danh sách ảnh 360',
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Liên kết ảnh 360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </Flex>
            </Card>
            <LinkManager />
        </Space>
    )
}

export default ListImage360Page
