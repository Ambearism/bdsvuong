import { useGetProjectOverviewAdminQuery } from '@/api/project'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Breadcrumb, Card, Flex, Space } from 'antd'
import { GoHome } from 'react-icons/go'
import ProjectExploreTable from '@/components/projects/ProjectExploreTable'

const ProjectExploreList = () => {
    useDocumentTitle('Dự án tra cứu')

    const {
        data: projectData,
        isLoading,
        refetch,
    } = useGetProjectOverviewAdminQuery(undefined, { refetchOnMountOrArgChange: true })

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
                                title: 'Dự án tra cứu',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                </Flex>
            </Card>

            <ProjectExploreTable data={projectData?.data?.items || []} loading={isLoading} onRefetch={refetch} />
        </Space>
    )
}

export default ProjectExploreList
