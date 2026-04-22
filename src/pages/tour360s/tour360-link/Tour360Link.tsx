import React from 'react'
import { Card, Tabs, Button, Space, Breadcrumb, Flex } from 'antd'
import { GoHome } from 'react-icons/go'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetProjectListQuery } from '@/api/project'
import { useGetTour360ListQuery } from '@/api/tour360'
import TourToProductTab from '@/components/link-manager/TourToProductTab'
import TourToProjectTab from '@/components/link-manager/TourToProjectTab'
import { app } from '@/config/app'
import type { ProjectSimple, Tour360Simple } from '@/types/tour-link'

const Tour360Link: React.FC = () => {
    useDocumentTitle('Quản lý Liên kết Tour360')
    const navigate = useNavigate()

    const { data: projectData } = useGetProjectListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
        is_option: true,
    })
    const { data: tourData } = useGetTour360ListQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
        is_option: true,
    })

    const allProjects = (projectData?.data?.items || []) as ProjectSimple[]
    const allTours = (tourData?.data?.items || []) as Tour360Simple[]

    const tabItems = [
        {
            key: 'tour-project',
            label: 'Tour360 → Dự án',
            children: <TourToProjectTab allTours={allTours} allProjects={allProjects} />,
        },
        {
            key: 'tour-product',
            label: 'Tour360 → Hàng hoá',
            children: <TourToProductTab />,
        },
    ]

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
                                href: '/tour360s',
                                title: 'Danh sách tour 360',
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Quản lý Liên kết Tour360',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </Flex>
            </Card>

            <Card>
                <Tabs defaultActiveKey="tour-project" type="card" items={tabItems} />
            </Card>
        </Space>
    )
}

export default Tour360Link
