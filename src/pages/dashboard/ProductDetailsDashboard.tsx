import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import ProductDetailsAndValue from '@/pages/dashboard/ProductDetailsAndValue'
import ProductStats from '@/pages/dashboard/ProductStats'
import UpdatedProductsChart from '@/pages/dashboard/UpdatedProductsChart'
import SoldSellProductsChart from '@/pages/dashboard/SoldSellProductsChart'
import SoldRentProductsChart from '@/pages/dashboard/SoldRentProductsChart'
import { Breadcrumb, Card, Flex } from 'antd'
import { GoHome } from 'react-icons/go'
import { Link } from 'react-router'
import { usePermission } from '@/hooks/usePermission'
import { RESOURCE_TYPE, ACTION } from '@/config/permission'

const ProductDetailsDashboard = ({ standalone }: { standalone?: boolean }) => {
    useDocumentTitle('Báo Cáo Hàng Hoá')
    const { hasPermission } = usePermission()
    const canReadReport = hasPermission(RESOURCE_TYPE.REPORT, ACTION.READ)

    if (!canReadReport) {
        return null
    }

    const content = (
        <>
            <div className={standalone ? '' : '!mt-5'}>
                <ProductStats />
            </div>
            <Card className="!mt-5">
                <UpdatedProductsChart />
            </Card>
            <div className="grid grid-cols-2 gap-4 !mt-5">
                <Card>
                    <SoldSellProductsChart />
                </Card>
                <Card>
                    <SoldRentProductsChart />
                </Card>
            </div>
            <Card className="!mt-5">
                <ProductDetailsAndValue />
            </Card>
        </>
    )

    if (standalone) {
        return (
            <Flex vertical className="w-full">
                <Card className="!py-2 !mb-5">
                    <Flex className="w-full" justify="start" align="center" gap="middle">
                        <Breadcrumb
                            className="*:items-center"
                            items={[
                                {
                                    title: (
                                        <Link to="/">
                                            <GoHome size={24} />
                                        </Link>
                                    ),
                                },
                                {
                                    title: 'Báo Cáo Hàng Hoá',
                                    className: 'text-md font-medium',
                                },
                            ]}
                        />
                    </Flex>
                </Card>
                {content}
            </Flex>
        )
    }

    return content
}

export default ProductDetailsDashboard
