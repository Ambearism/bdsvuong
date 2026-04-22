import { auth } from '@/api/auth'
import { colors } from '@/config/colors'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { logout } from '@/redux/slice/authSlice'
import { Button, Flex, FloatButton, Grid, Layout, Menu, type MenuProps } from 'antd'
import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'
import {
    MdOutlineDashboard,
    MdLogout,
    MdOutlineNewspaper,
    MdOutlineArrowUpward,
    MdOutlineAutoAwesomeMosaic,
    MdOutlinePages,
    MdChevronLeft,
    MdLink,
    MdTimeline,
    MdOutlinePeople,
    MdOutlineDescription,
    MdOutlinePhotoLibrary,
    MdOutlinePhoto,
    MdOutlineVideocam,
    MdOutlineRequestQuote,
    MdOutlineBarChart,
    MdOutlinePieChart,
    MdOutlineManageAccounts,
    MdOutlineShield,
    MdOutlineViewSidebar,
    MdOutlineCalendarToday,
    MdOutlineLocalOffer,
    MdOutlineCheckCircleOutline,
    MdOutlineHandshake,
} from 'react-icons/md'
import { useDispatch } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { usePermission } from '@/hooks/usePermission'
import { useGetMeQuery } from '@/api/auth'
import { useAppSelector } from '@/redux/hooks'
import { authSelector } from '@/redux/slice/authSlice'
import { DYNAMIC_PARAM_REGEX } from '@/config/constant'

const { useBreakpoint } = Grid

const ROUTE_MAPPING: Record<string, string[]> = {
    '/': ['/overview', '/product-details'],
    '/projects': ['/projects/create', '/projects/:project_id/update'],
    '/projects/explore': ['/projects/:project_id/explores'],
}

const COMPILED_ROUTE_MAPPING = Object.entries(ROUTE_MAPPING).map(([parent, children]) => ({
    parent,
    regexes: children.map(route => new RegExp(`^${route.replace(DYNAMIC_PARAM_REGEX, '[^/]+')}(/.*)?$`)),
}))

type MenuItem = Required<MenuProps>['items'][number] & {
    permission?: {
        module: string
        action: string
    }
    children?: MenuItem[]
}

const items: MenuItem[] = [
    {
        type: 'group',
        label: 'Tổng quan',
        children: [
            {
                key: '/',
                icon: <MdOutlineDashboard size={18} />,
                label: 'Tổng quan',
                permission: { module: RESOURCE_TYPE.DASHBOARD, action: ACTION.READ },
            },
        ],
    },
    {
        type: 'group',
        label: 'Kinh doanh',
        children: [
            {
                key: 'lead-deal',
                icon: <MdTimeline size={18} />,
                label: 'Lead',
                children: [
                    {
                        key: '/leads',
                        label: 'Danh sách Lead',
                        permission: { module: RESOURCE_TYPE.LEAD, action: ACTION.READ },
                    },
                    {
                        key: '/deals',
                        label: 'Danh sách Deal',
                        permission: { module: RESOURCE_TYPE.DEAL, action: ACTION.READ },
                    },
                    {
                        key: '/pipelines',
                        label: 'Tiến Trình Pipeline',
                        permission: { module: RESOURCE_TYPE.PIPELINE_PROCESS, action: ACTION.READ },
                    },
                ],
            },
        ],
    },
    {
        type: 'group',
        label: 'Hàng hoá & Dự án',
        children: [
            {
                key: '/projects-group',
                icon: <MdOutlinePages size={18} />,
                label: 'Dự án',
                children: [
                    {
                        key: '/projects',
                        label: 'Danh sách dự án',
                    },
                    {
                        key: '/projects/explore',
                        label: 'Dự án tra cứu',
                    },
                ],
            },
            {
                key: '/product',
                icon: <MdOutlineAutoAwesomeMosaic size={18} />,
                label: 'Hàng hoá',
                children: [
                    {
                        key: '/products',
                        label: 'Danh sách Hàng hoá',
                    },
                    {
                        key: '/product-locations',
                        label: 'Vị trí Hàng hoá',
                    },
                ],
            },
        ],
    },
    {
        type: 'group',
        label: 'Giao dịch & Hợp đồng',
        children: [
            {
                key: '/transactions',
                icon: <MdOutlineRequestQuote size={18} />,
                label: 'Giao dịch & Hợp đồng',
                permission: { module: RESOURCE_TYPE.CONTRACT, action: ACTION.READ },
            },
            {
                key: '/lease-contracts',
                icon: <MdOutlineDescription size={18} />,
                label: 'Hợp đồng thuê',
                permission: { module: RESOURCE_TYPE.LEASE_CONTRACT, action: ACTION.READ },
            },
        ],
    },
    {
        type: 'group',
        label: 'Vuông Care & Tài chính',
        children: [
            {
                key: '/care',
                icon: <MdOutlineHandshake size={18} />,
                label: 'Chăm Sóc (Care)',
                permission: { module: RESOURCE_TYPE.CARE_CASE, action: ACTION.READ },
            },
            {
                key: '/lease-contracts-payments',
                icon: <MdOutlineCheckCircleOutline size={18} />,
                label: 'Duyệt dòng tiền',
                permission: { module: RESOURCE_TYPE.CASH_FLOW, action: ACTION.READ },
            },
            {
                key: '/configs-cost-categories',
                icon: <MdOutlineLocalOffer size={18} />,
                label: 'Danh mục Chi phí',
                permission: { module: RESOURCE_TYPE.TAX_CONFIGURATION, action: ACTION.READ },
            },
        ],
    },
    {
        type: 'group',
        label: 'Khách hàng & Dữ liệu liên kết',
        children: [
            {
                key: '/customers',
                icon: <MdOutlinePeople size={18} />,
                label: 'Khách hàng',
            },
            {
                key: '/group-link-products',
                icon: <MdLink size={18} />,
                label: 'Quản lý tổ hợp Link',
                permission: { module: RESOURCE_TYPE.GROUP_LINK, action: ACTION.READ },
            },
            {
                key: '/news',
                icon: <MdOutlineNewspaper size={18} />,
                label: 'Bài viết',
                permission: { module: RESOURCE_TYPE.NEW, action: ACTION.READ },
            },
        ],
    },
    {
        type: 'group',
        label: 'Media 360',
        children: [
            {
                key: '/tour360s',
                icon: <MdOutlineVideocam size={18} />,
                label: 'Danh sách tour 360',
                permission: { module: RESOURCE_TYPE.TOUR_360, action: ACTION.READ },
            },
            {
                key: '/image-360',
                icon: <MdOutlinePhoto size={18} />,
                label: 'Danh sách ảnh 360',
                permission: { module: RESOURCE_TYPE.VIEW_360, action: ACTION.READ },
            },
            {
                key: '/albums',
                icon: <MdOutlinePhotoLibrary size={18} />,
                label: 'Album ảnh 360',
                permission: { module: RESOURCE_TYPE.ALBUM_360, action: ACTION.READ },
            },
        ],
    },
    {
        type: 'group',
        label: 'Báo cáo & Số liệu',
        children: [
            {
                key: '/reports-product-details',
                icon: <MdOutlineBarChart size={18} />,
                label: 'Báo Cáo Hàng Hóa',
                permission: { module: RESOURCE_TYPE.REPORT, action: ACTION.READ },
            },
            {
                key: '/reports-sales-performance',
                icon: <MdOutlinePieChart size={18} />,
                label: 'Báo Cáo Hiệu Suất Sales',
                permission: { module: RESOURCE_TYPE.REPORT, action: ACTION.READ },
            },
        ],
    },
    {
        type: 'group',
        label: 'Quản trị hệ thống',
        children: [
            {
                key: '/accounts',
                icon: <MdOutlineManageAccounts size={18} />,
                label: 'Tài khoản',
                permission: { module: RESOURCE_TYPE.STAFF, action: ACTION.READ },
            },
            {
                key: '/configs-role',
                icon: <MdOutlineShield size={18} />,
                label: 'Phân quyền',
                permission: { module: RESOURCE_TYPE.ROLE, action: ACTION.READ },
            },
        ],
    },
    {
        type: 'group',
        label: 'Cài đặt',
        children: [
            {
                key: '/basic-config',
                icon: <MdOutlineViewSidebar size={18} />,
                label: 'Footer Settings',
                permission: { module: RESOURCE_TYPE.SETTING, action: ACTION.READ },
            },
            {
                key: '/settings-google-calendar',
                icon: <MdOutlineCalendarToday size={18} />,
                label: 'Google Calendar',
            },
        ],
    },
    {
        key: '/logout',
        icon: <MdLogout size={18} />,
        label: 'Đăng xuất',
    },
]

const getMenuKeys = (menuItems: MenuItem[]): string[] => {
    const keys: string[] = []
    menuItems.forEach(item => {
        if (item?.key) {
            keys.push(item.key as string)
        }
        if (item?.children) {
            keys.push(...getMenuKeys(item.children))
        }
    })
    return keys
}

const ALL_MENU_KEYS = getMenuKeys(items)

const PrivateLayout = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { lg } = useBreakpoint()
    const { hasPermission } = usePermission()
    const { isSignedIn, accessToken } = useAppSelector(authSelector)

    useGetMeQuery(undefined, {
        skip: !isSignedIn && !accessToken,
    })

    const selectedKeys = useMemo(() => {
        const { pathname, search } = location
        const query = new URLSearchParams(search)
        const tab = query.get('tab')

        if (pathname.includes('/projects/') && pathname.includes('/update') && tab === 'explore') {
            return ['/projects/explore']
        }

        if (ALL_MENU_KEYS.includes(pathname)) {
            return [pathname]
        }

        for (const { parent, regexes } of COMPILED_ROUTE_MAPPING) {
            if (regexes.some(re => re.test(pathname))) {
                return [parent]
            }
        }

        const baseRoute = `/${pathname.split('/')[1]}`
        return [baseRoute]
    }, [location])

    const toggleCollapsed = () => setCollapsed(!collapsed)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login', { replace: true })
    }

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === '/logout') {
            handleLogout()
            dispatch(auth.util.resetApiState())
            return
        }
        navigate(key)
    }

    const filterMenu = useCallback(
        (menuItems: MenuItem[]): MenuItem[] => {
            return menuItems
                .filter(item => !item.permission || hasPermission(item.permission.module, item.permission.action))
                .map(item => (item.children ? { ...item, children: filterMenu(item.children) } : item))
                .filter(item => !item.children || item.children.length > 0)
        },
        [hasPermission],
    )

    const filteredMenuItems = useMemo(() => filterMenu(items), [filterMenu])

    return (
        <Layout hasSider className="h-full w-full">
            <Layout.Sider
                width={250}
                breakpoint="lg"
                trigger={null}
                collapsible
                collapsed={collapsed}
                onBreakpoint={setCollapsed}
                theme="light"
                className="top-0 !sticky bottom-0 left-0 h-screen overflow-y-auto pt-12.5 shadow-md">
                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={filteredMenuItems}
                    className="!border-none"
                    onClick={handleMenuClick}
                />
            </Layout.Sider>
            <Layout>
                <Layout.Header className="!h-12.5 fixed left-0 right-0 top-0 z-50 flex items-center !bg-red-700 !px-0 !leading-none !text-white">
                    <Flex
                        align="center"
                        justify="center"
                        gap={4}
                        className={classNames({
                            'h-full': true,
                            'w-52.5': lg && !collapsed,
                            'w-20': !lg || collapsed,
                        })}>
                        <img
                            src={collapsed ? '/logo_bdsv_mini.svg' : '/logo_bdsv.svg'}
                            alt="BĐS VUÔNG Logo"
                            className={classNames({
                                'w-6 !ml-2': collapsed,
                                'h-7/10 !mr-10.5': !collapsed,
                            })}
                        />
                    </Flex>
                    <Flex flex={1} className="h-full !pr-4">
                        <Button
                            onClick={toggleCollapsed}
                            type="text"
                            icon={
                                <MdChevronLeft
                                    size={24}
                                    color={colors.white}
                                    className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                                />
                            }
                            className="!h-full !rounded-none"
                        />
                    </Flex>
                </Layout.Header>
                <Layout className="pt-12.5">
                    <Layout.Content className="p-4">
                        <Outlet />
                    </Layout.Content>
                    <Layout.Footer className="text-center">© {new Date().getFullYear()} BĐS Vuông</Layout.Footer>
                </Layout>
                <FloatButton.BackTop icon={<MdOutlineArrowUpward />} />
            </Layout>
        </Layout>
    )
}

export default PrivateLayout
