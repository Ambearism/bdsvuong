import { useRef } from 'react'
import { Breadcrumb, Button, Card, Flex, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { GoHome } from 'react-icons/go'
import CostCategoryManager, { type CostCategoryManagerRef } from '@/components/cost-categories/CostCategoryManager'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CostCategoryPage = () => {
    useDocumentTitle('Danh mục chi phí')
    const { hasPermission } = usePermission()
    const managerRef = useRef<CostCategoryManagerRef>(null)

    const handleAddGroup = () => {
        managerRef.current?.openGroupModal()
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
                                title: 'Danh mục chi phí',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Flex gap="small">
                        {hasPermission(RESOURCE_TYPE.TAX_CONFIGURATION, ACTION.CREATE) && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGroup}>
                                Thêm Nhóm
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <CostCategoryManager ref={managerRef} />
        </Space>
    )
}

export default CostCategoryPage
