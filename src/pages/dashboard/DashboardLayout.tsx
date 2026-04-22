import { Tabs } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router'
import { usePermission } from '@/hooks/usePermission'
import { RESOURCE_TYPE, ACTION } from '@/config/permission'

const DashboardLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { hasPermission } = usePermission()
    const [activeTabKey, setActiveTabKey] = useState<string>('overview')

    const canReadDashboard = hasPermission(RESOURCE_TYPE.DASHBOARD, ACTION.READ)
    const canReadReport = hasPermission(RESOURCE_TYPE.REPORT, ACTION.READ)

    const filteredTabItems = useMemo(() => {
        const items = []
        if (canReadDashboard) {
            items.push({
                key: 'overview',
                label: 'Tổng quan',
            })
        }
        if (canReadReport) {
            items.push({
                key: 'product-details',
                label: 'Chi tiết kho hàng',
            })
        }
        return items
    }, [canReadDashboard, canReadReport])

    useEffect(() => {
        if (location.pathname === '/' || location.pathname === '/overview') {
            setActiveTabKey('overview')
        } else if (location.pathname === '/product-details') {
            setActiveTabKey('product-details')
        }
    }, [location.pathname])

    const handleTabChange = (key: string) => {
        setActiveTabKey(key)
        if (key === 'overview') {
            navigate('/overview')
        } else if (key === 'product-details') {
            navigate('/product-details')
        }
    }

    if (filteredTabItems.length === 0) {
        return <Outlet />
    }

    return (
        <div className="w-full">
            <Tabs activeKey={activeTabKey} onChange={handleTabChange} items={filteredTabItems} centered />
            <Outlet />
        </div>
    )
}

export default DashboardLayout
