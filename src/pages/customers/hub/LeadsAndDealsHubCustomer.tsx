import { Space } from 'antd'
import { useGetEnumOptionsQuery } from '@/api/types'
import LeadsHubCustomerTable from '@/pages/customers/hub/LeadsHubCustomerTable'
import DealsHubCustomerTable from '@/pages/customers/hub/DealsHubCustomerTable'

const LeadsAndDealsHubCustomer = () => {
    const { data: enumData } = useGetEnumOptionsQuery(['lead_source', 'opportunity_stage', 'product_types'])

    return (
        <Space direction="vertical" size="large" className="!w-full">
            <LeadsHubCustomerTable enumData={enumData} />
            <DealsHubCustomerTable enumData={enumData} />
        </Space>
    )
}

export default LeadsAndDealsHubCustomer
