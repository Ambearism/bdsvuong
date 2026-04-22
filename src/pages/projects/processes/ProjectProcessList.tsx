import {
    useGetProjectProcessListQuery,
    useCreateProjectProcessMutation,
    useUpdateProjectProcessMutation,
} from '@/api/project-process'
import Loading from '@/components/Loading'
import ProjectProcessForm from '@/components/forms/ProjectProcessForm'
import type { ProjectProcessItem, ProjectProcessCreateInput } from '@/types/project-process'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Space, Table, Tooltip, Modal, message, Form } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useParams } from 'react-router'
import { app } from '@/config/app'
import { PreviewTextEditor } from '@/components/tiptap/PreviewTextEditor'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const ProjectProcessList = () => {
    useDocumentTitle('Tiến độ dự án')
    const { project_id } = useParams<{ project_id: string }>()
    const projectId = Number(project_id)

    const [page, setPage] = useState(app.DEFAULT_PAGE)
    const [pageSize, setPageSize] = useState(app.DEFAULT_PAGE_SIZE)

    const { data, isLoading, refetch } = useGetProjectProcessListQuery(
        { project_id: projectId, page, per_page: pageSize },
        { refetchOnMountOrArgChange: true },
    )

    const [createProcess, { isLoading: creating }] = useCreateProjectProcessMutation()
    const [updateProcess, { isLoading: updating }] = useUpdateProjectProcessMutation()

    const [modalOpen, setModalOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState<ProjectProcessItem | null>(null)
    const [form] = Form.useForm<ProjectProcessCreateInput>()

    const openModal = (record?: ProjectProcessItem) => {
        setEditingRecord(record || null)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingRecord(null)
    }

    const handleFinish = async (values: ProjectProcessCreateInput) => {
        try {
            if (editingRecord) {
                await updateProcess({
                    process_id: editingRecord.id,
                    payload: values,
                }).unwrap()
                message.success('Cập nhật tiến độ thành công!')
            } else {
                await createProcess({
                    project_id: projectId,
                    date_progress: values.date_progress,
                    description: values.description,
                }).unwrap()
                message.success('Tạo tiến độ thành công!')
            }
            refetch()
            closeModal()
        } catch {
            message.error(editingRecord ? 'Cập nhật tiến độ thất bại!' : 'Tạo tiến độ thất bại!')
        }
    }

    const columns: ColumnsType<ProjectProcessItem> = [
        { title: 'Ngày cập nhật', dataIndex: 'date_progress', key: 'date_progress', width: 150 },
        {
            title: 'Nội dung tiến độ',
            dataIndex: 'description',
            key: 'description',
            render: text => <PreviewTextEditor value={text} />,
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            width: 120,
            render: record => (
                <Tooltip title="Chỉnh sửa">
                    <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} />
                </Tooltip>
            ),
        },
    ]

    const handlePageChange = (p: number, size?: number) => {
        setPage(p)
        if (size) setPageSize(size)
    }
    if (isLoading) return <Loading />

    return (
        <Space direction="vertical" size="middle" className="w-full">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                Thêm tiến độ
            </Button>

            <Table<ProjectProcessItem>
                dataSource={data?.data?.items || []}
                columns={columns}
                loading={creating || updating}
                rowKey="id"
                bordered
                scroll={{ x: true }}
                pagination={{
                    current: page,
                    pageSize: app.DEFAULT_PAGE_SIZE,
                    total: data?.data?.total || 0,
                    onChange: handlePageChange,
                    responsive: true,
                    showSizeChanger: false,
                    showTotal: total => `Tổng số ${total} bản ghi`,
                }}
            />

            <Modal
                title={editingRecord ? 'Cập nhật tiến độ' : 'Tạo tiến độ'}
                open={modalOpen}
                onCancel={closeModal}
                footer={null}>
                <ProjectProcessForm
                    form={form}
                    initialValues={editingRecord || undefined}
                    isEdit={!!editingRecord}
                    onFinish={handleFinish}
                    onCancel={closeModal}
                    loading={creating || updating}
                />
            </Modal>
        </Space>
    )
}

export default ProjectProcessList
