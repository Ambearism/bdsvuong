import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Breadcrumb, Card, Col, Flex, Row, Space } from 'antd'
import { useState } from 'react'
import { GoHome } from 'react-icons/go'
import RoleList from '@/components/config-roles/RoleList'
import RolePermissions from '@/components/config-roles/RolePermissions'

const RolePage = () => {
    useDocumentTitle('Quản lý phân quyền')
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

    return (
        <Space direction="vertical" size="middle" className="w-full h-full">
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
                                title: 'Quản lý vai trò & Quyền hạn',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <Row gutter={16} className="h-[calc(100vh-200px)]">
                <Col span={8} className="h-full">
                    <RoleList selectedRoleId={selectedRoleId} onSelect={setSelectedRoleId} />
                </Col>
                <Col span={16} className="h-full">
                    <RolePermissions roleId={selectedRoleId} />
                </Col>
            </Row>
        </Space>
    )
}

export default RolePage
