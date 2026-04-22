import { useDeleteProjectMutation } from '@/api/project'
import { app } from '@/config/app'
import { ACTION } from '@/config/permission'
import type { ProjectExploreOverview } from '@/types/project'
import { DeleteOutlined, EditOutlined, LinkOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Button, Card, Popconfirm, Space, Table, Tooltip, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import { useNavigate } from 'react-router'

interface ProjectExploreTableProps {
    data: ProjectExploreOverview[]
    loading: boolean
    onRefetch: () => void
}

const ProjectExploreTable: React.FC<ProjectExploreTableProps> = ({ data, loading, onRefetch }) => {
    const navigate = useNavigate()
    const [deleteProject] = useDeleteProjectMutation()

    const handleDelete = async (id: number) => {
        try {
            await deleteProject({ project_id: id }).unwrap()
            message.success('Xóa dự án thành công!')
            onRefetch()
        } catch {
            message.error('Xóa dự án thất bại!')
        }
    }

    const getPermissions = (record: ProjectExploreOverview) => {
        const itemPermissions = record.project_permissions
        return {
            canRead: itemPermissions ? itemPermissions.includes(ACTION.READ) : true,
            canUpdate: itemPermissions ? itemPermissions.includes(ACTION.UPDATE) : true,
            canDelete: itemPermissions ? itemPermissions.includes(ACTION.DELETE) : true,
        }
    }

    const columns: ColumnsType<ProjectExploreOverview> = [
        {
            title: 'Tên dự án',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: ProjectExploreOverview) => {
                const { canRead } = getPermissions(record)
                return canRead ? (
                    <Typography.Link
                        className="line-clamp-2"
                        onClick={() => navigate(`/projects/${record.id}/explores`)}>
                        {name}
                    </Typography.Link>
                ) : (
                    <Typography.Text className="line-clamp-2">{name}</Typography.Text>
                )
            },
        },
        {
            title: 'Hàng hoá',
            dataIndex: 'product_count',
            key: 'product_count',
            align: 'center',
        },
        {
            title: 'Phân khu',
            dataIndex: 'divisive',
            key: 'divisive',
            align: 'center',
        },
        {
            title: 'Lô',
            dataIndex: 'parcel',
            key: 'parcel',
            align: 'center',
        },
        {
            title: 'BĐS Tra Cứu',
            dataIndex: 'total_units',
            key: 'total_units',
            align: 'center',
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                const { canRead, canUpdate, canDelete } = getPermissions(record)

                return (
                    <Space>
                        {canRead && record.enable_explore && (
                            <Tooltip title="Xem trên trang">
                                <Button
                                    icon={<LinkOutlined />}
                                    size="small"
                                    href={`${app.CLIENT_URL}/tra-cuu-du-an-${record.url_project}`}
                                    target="_blank"
                                />
                            </Tooltip>
                        )}
                        {canRead && (
                            <Tooltip title="Danh sách thông tin tra cứu">
                                <Button
                                    icon={<UnorderedListOutlined />}
                                    onClick={() => navigate(`/projects/${record.id}/explores`)}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Tooltip>
                        )}

                        {canUpdate && (
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/projects/${record.id}/update?tab=explore`)}
                                    size="small"
                                    color="cyan"
                                    variant="outlined"
                                />
                            </Tooltip>
                        )}

                        {canDelete && (
                            <Popconfirm
                                title="Xóa dự án"
                                description="Bạn có chắc chắn muốn xóa dự án này không?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                placement="topRight">
                                <Tooltip title="Xóa">
                                    <Button icon={<DeleteOutlined />} size="small" danger />
                                </Tooltip>
                            </Popconfirm>
                        )}
                    </Space>
                )
            },
        },
    ]

    return (
        <Card>
            <Table<ProjectExploreOverview>
                dataSource={data}
                columns={columns}
                loading={loading}
                rowKey="id"
                bordered
                scroll={{ x: true }}
                pagination={false}
            />
        </Card>
    )
}

export default ProjectExploreTable
