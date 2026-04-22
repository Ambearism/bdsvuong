import { Space } from 'antd'
import { useGetEnumOptionsQuery } from '@/api/types'
import LeadsHubProductTable from '@/pages/products/hub/LeadsHubProductTable'
import DealsHubProductTable from '@/pages/products/hub/DealsHubProductTable'

const LeadsAndDealsHubProduct = () => {
    const { data: enumData } = useGetEnumOptionsQuery(['lead_source', 'opportunity_stage', 'product_types'])

    return (
        <Space direction="vertical" size="large" className="!w-full">
            <LeadsHubProductTable enumData={enumData} />
            <DealsHubProductTable enumData={enumData} />
        </Space>
    )
}

export default LeadsAndDealsHubProduct
