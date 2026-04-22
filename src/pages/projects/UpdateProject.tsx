import { useGetProjectDetailQuery, useUpdateProjectMutation, useGetProjectExploreQuery } from '@/api/project'
import Loading from '@/components/Loading'
import ProjectForm from '@/components/forms/ProjectForm'
import type { ProjectUpdateInput, CustomTab } from '@/types/project'
import { Breadcrumb, Card, Flex, Form, Space, message, Button, type BreadcrumbProps } from 'antd'
import { GoHome } from 'react-icons/go'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'
import { useState, useEffect, useRef } from 'react'
import { useNavBlocker } from '@/hooks/useNavBlocker'
import ConfirmDiscardModal from '@/components/modals/ConfirmDiscardModal'
import ManageTabsModal from '@/components/projects/ManageTabsModal'
import ProjectPermissionsModal from '@/components/projects/ProjectPermissionsModal'
import { ACTION } from '@/config/permission'
import { PROJECT_EXPLORE_CONTEXT } from '@/config/constant'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const UpdateProject = () => {
    useDocumentTitle('Cập nhật dự án')
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const { project_id } = useParams<{ project_id: string }>()
    const [searchParams] = useSearchParams()
    const isExplore = searchParams.get(PROJECT_EXPLORE_CONTEXT.TAB) === PROJECT_EXPLORE_CONTEXT.VALUE
    const projectIdNumber = Number(project_id)
    const { handleError } = useApiError()

    const { data, isLoading, isError } = useGetProjectDetailQuery(
        { project_id: projectIdNumber },
        { skip: !projectIdNumber, refetchOnMountOrArgChange: true },
    )
    const projectData = data?.data

    useEffect(() => {
        if (projectData && projectData.project_permissions) {
            const canUpdate = projectData.project_permissions.includes(ACTION.UPDATE)
            if (!canUpdate) {
                navigate('/404', { replace: true })
            }
        }
    }, [projectData, navigate])

    useEffect(() => {
        if (isError) {
            navigate('/404', { replace: true })
        }
    }, [isError, navigate])

    const isReadyRef = useRef(false)
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (projectData) {
            const timer = setTimeout(() => {
                isReadyRef.current = true
            }, 1000)
            return () => {
                clearTimeout(timer)
                isReadyRef.current = false
            }
        }
    }, [projectData])

    const { data: exploreData } = useGetProjectExploreQuery(
        { project_id: projectIdNumber },
        { skip: !projectIdNumber, refetchOnMountOrArgChange: true },
    )

    const [updateProject, { error, isLoading: isUpdating }] = useUpdateProjectMutation()

    const { showModal, handleConfirm, handleCancel } = useNavBlocker({ isDirty })

    const handleUpdate = async (values: ProjectUpdateInput) => {
        if (!projectIdNumber) return
        try {
            await updateProject({ project_id: projectIdNumber, payload: values }).unwrap()
            message.success('Lưu thông tin dự án thành công!')

            setIsDirty(false)
        } catch (err) {
            handleError(err)
        }
    }

    const handleValuesChange = () => {
        if (isReadyRef.current) {
            setIsDirty(true)
        }
    }

    const [isManageTabsOpen, setIsManageTabsOpen] = useState(false)
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false)
    const customTabs = Form.useWatch('custom_tabs', form) || []
    const currentEnableExplore = Form.useWatch('enable_explore', form)

    const handleSaveTabs = (newTabs: CustomTab[]) => {
        form.setFieldsValue({ custom_tabs: newTabs })
        setIsManageTabsOpen(false)
        message.success('Đã cập nhật danh sách tab')
    }

    if (isLoading) {
        return <Loading />
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
                    <Breadcrumb
                        className="*:items-center"
                        items={
                            [
                                {
                                    title: (
                                        <Link to="/">
                                            <GoHome size={24} />
                                        </Link>
                                    ),
                                },
                                {
                                    title: isExplore ? (
                                        <Link to="/projects/explore">Dự án tra cứu</Link>
                                    ) : (
                                        <Link to="/projects">Danh sách dự án</Link>
                                    ),
                                    className: 'text-md font-medium',
                                },
                                isExplore && {
                                    title: (
                                        <Link to={`/projects/${projectIdNumber}/explores`}>
                                            Danh sách thông tin tra cứu
                                        </Link>
                                    ),
                                    className: 'text-md font-medium',
                                },
                                {
                                    title: isExplore ? 'Sửa thông tin cấu hình' : 'Chỉnh sửa dự án',
                                    className: 'text-md font-medium',
                                },
                            ].filter(Boolean) as BreadcrumbProps['items']
                        }
                    />
                    <Space>
                        <Button type="default" onClick={() => setIsPermissionsOpen(true)}>
                            Phân quyền
                        </Button>
                        <Button type="primary" onClick={() => setIsManageTabsOpen(true)}>
                            Quản lý tab
                        </Button>
                    </Space>
                </Flex>
            </Card>
            <ManageTabsModal
                visible={isManageTabsOpen}
                onCancel={() => setIsManageTabsOpen(false)}
                initialTabs={customTabs}
                onSave={handleSaveTabs}
                project={
                    projectData
                        ? {
                              ...projectData,
                              enable_explore: currentEnableExplore ?? exploreData?.data?.enable_explore ?? false,
                          }
                        : undefined
                }
            />
            {projectIdNumber && (
                <ProjectPermissionsModal
                    visible={isPermissionsOpen}
                    onCancel={() => setIsPermissionsOpen(false)}
                    projectId={projectIdNumber}
                />
            )}
            <ErrorAlert error={error} />

            {projectData && (
                <ProjectForm
                    form={form}
                    initialValues={projectData}
                    onFinish={handleUpdate}
                    onCancel={() => navigate(-1)}
                    onValuesChange={handleValuesChange}
                    isEdit
                    loading={isUpdating}
                />
            )}

            <ConfirmDiscardModal open={showModal} onConfirm={handleConfirm} onCancel={handleCancel} />
        </Space>
    )
}

export default UpdateProject
