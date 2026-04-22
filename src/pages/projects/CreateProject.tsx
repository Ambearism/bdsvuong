import React, { useState } from 'react'
import { Form, message, Breadcrumb, Card, Space, Flex, Button } from 'antd'
import { useNavigate, Link } from 'react-router'
import { GoHome } from 'react-icons/go'
import ProjectForm from '@/components/forms/ProjectForm'
import type { ProjectCreateInput, CustomTab } from '@/types/project'
import type { RcFile } from 'antd/es/upload'
import { useCreateProjectMutation } from '@/api/project'
import { useApiError } from '@/utils/error'
import { ErrorAlert } from '@/components/base/ErrorAlert'
import ConfirmDiscardModal from '@/components/modals/ConfirmDiscardModal'
import { useNavBlocker } from '@/hooks/useNavBlocker'
import ManageTabsModal from '@/components/projects/ManageTabsModal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CreateProject: React.FC = () => {
    useDocumentTitle('Tạo dự án')
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [isDirty, setIsDirty] = useState(false)
    const [createProject, { error, isLoading }] = useCreateProjectMutation()
    const { handleError } = useApiError()

    const { showModal, handleConfirm, handleCancel } = useNavBlocker({ isDirty })

    const handleCreate = async (values: ProjectCreateInput, logoFile?: RcFile | null) => {
        try {
            setIsDirty(false)
            const formData = new FormData()

            formData.append('payload', JSON.stringify(values))

            if (logoFile) {
                formData.append('logo', logoFile)
            }

            await createProject(formData).unwrap()

            message.success('Lưu thông tin dự án thành công!')

            setTimeout(() => {
                navigate('/projects')
            }, 0)
        } catch (err) {
            handleError(err)
        }
    }

    const [isManageTabsOpen, setIsManageTabsOpen] = useState(false)

    const customTabs = Form.useWatch('custom_tabs', form) || []
    const currentEnableExplore = Form.useWatch('enable_explore', form)
    const currentUrlProject = Form.useWatch('url_project', form)

    const handleSaveTabs = (newTabs: CustomTab[]) => {
        form.setFieldsValue({ custom_tabs: newTabs })
        setIsManageTabsOpen(false)
        message.success('Đã cập nhật danh sách tab')
    }

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Card className="!py-2">
                <Flex className="w-full" justify="space-between" align="center" gap="middle">
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
                                title: <Link to="/projects">Danh sách dự án</Link>,
                                className: 'text-md font-medium',
                            },
                            {
                                title: 'Tạo dự án',
                                className: 'text-md font-medium',
                            },
                        ]}
                    />
                    <Button type="primary" onClick={() => setIsManageTabsOpen(true)}>
                        Quản lý tab
                    </Button>
                </Flex>
            </Card>
            <ManageTabsModal
                visible={isManageTabsOpen}
                onCancel={() => setIsManageTabsOpen(false)}
                initialTabs={customTabs}
                onSave={handleSaveTabs}
                project={{
                    id: 0,
                    name: form.getFieldValue('name') || '',
                    url_project: currentUrlProject,
                    enable_explore: currentEnableExplore,
                }}
            />
            <ErrorAlert error={error} />
            <ProjectForm
                form={form}
                onFinish={handleCreate}
                onCancel={() => navigate(-1)}
                onValuesChange={() => setIsDirty(true)}
                loading={isLoading}
                isEdit={false}
            />
            <ConfirmDiscardModal open={showModal} onConfirm={handleConfirm} onCancel={handleCancel} />
        </Space>
    )
}

export default CreateProject
