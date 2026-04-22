import { Row, Col, Card, List, Typography, Tag, Space, Button, Skeleton, Empty, Flex } from 'antd'
import { PlusOutlined, EditOutlined, PhoneOutlined, MailOutlined, LeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate, useLocation, Link } from 'react-router'
import { useState } from 'react'
import { useGetChildrenGroupCustomerQuery } from '@/api/group-customer'
import { useGetCustomerByGroupCustomerQuery } from '@/api/customer'
import GroupCustomerModal from '@/components/modals/group-customer/GroupCustomerModal'

const DetailGroupCustomer = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { groupCustomerIdParam } = useParams<{ groupCustomerIdParam: string }>()
    const groupCustomerId = Number(groupCustomerIdParam)

    const {
        data: dataChildren,
        isLoading: loadingChildren,
        isError: errorChildren,
        refetch: refetchChildren,
    } = useGetChildrenGroupCustomerQuery(
        { customer_group_id: groupCustomerId },
        { skip: Number.isNaN(groupCustomerId) },
    )
    const childrenItems = dataChildren?.data?.items ?? []

    const {
        data: dataCustomer,
        isLoading: loadingCustomer,
        isError: errorCustomer,
    } = useGetCustomerByGroupCustomerQuery(
        { customer_group_id: groupCustomerId },
        { skip: Number.isNaN(groupCustomerId) },
    )
    const customerItems = dataCustomer?.data?.items ?? []

    const backTarget = location.state?.from || '/customer-groups'
    const handleBack = () => navigate(backTarget)

    const [openCreateGroup, setOpenCreateGroup] = useState(false)
    const openCreateGroupModal = () => setOpenCreateGroup(true)
    const closeCreateGroupModal = () => setOpenCreateGroup(false)

    const [openUpdateGroup, setOpenUpdateGroup] = useState(false)
    const openUpdateModal = () => setOpenUpdateGroup(true)
    const closeUpdateModal = () => setOpenUpdateGroup(false)

    const handleCreateGroupSuccess = async () => {
        closeCreateGroupModal()
        await refetchChildren()
    }

    const handleUpdateGroupSuccess = async () => {
        closeUpdateModal()
        await refetchChildren()
    }

    return (
        <>
            <Card size="small" className="mb-3">
                <Flex align="center" justify="space-between" gap={12} wrap="wrap" className="gap-3">
                    <Space className="gap-2">
                        <Button icon={<LeftOutlined />} onClick={handleBack}>
                            Quay lại
                        </Button>
                        <Button type="default" icon={<EditOutlined />} onClick={openUpdateModal}>
                            Cập nhật nhóm
                        </Button>
                    </Space>

                    <Typography.Text type="secondary" className="text-gray-500">
                        Nhóm hiện tại: #{groupCustomerId}
                    </Typography.Text>
                </Flex>
            </Card>

            <Row gutter={16}>
                <Col span={12}>
                    <Card
                        title={
                            <Space className="gap-2">
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={openCreateGroupModal}
                                />
                                <Typography.Text strong>NHÓM CẤP DƯỚI</Typography.Text>
                            </Space>
                        }>
                        <div className="pt-2">
                            {loadingChildren ? (
                                <Skeleton active paragraph={{ rows: 6 }} />
                            ) : errorChildren ? (
                                <Empty description="Lỗi tải danh sách nhóm" />
                            ) : childrenItems.length === 0 ? (
                                <Empty description="Chưa có nhóm con" />
                            ) : (
                                <List
                                    dataSource={childrenItems}
                                    split={false}
                                    renderItem={g => (
                                        <List.Item className="rounded-xl p-3">
                                            <Link
                                                to={`/customer-groups/${g.id}/detail`}
                                                state={{ from: location.pathname }}
                                                className="block">
                                                <Space direction="vertical" size={4} className="w-full">
                                                    <div className="flex items-center">
                                                        <Tag bordered={false}>#{g.id}</Tag>
                                                        <Typography.Link className="text-[16px] font-semibold">
                                                            {g.name}
                                                        </Typography.Link>
                                                    </div>
                                                    <Typography.Text type="secondary" className="text-gray-500">
                                                        {g.content || 'Chưa cập nhập mô tả nhóm'}
                                                    </Typography.Text>
                                                </Space>
                                            </Link>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </div>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        title={
                            <Space className="gap-2">
                                <Button size="small" type="primary" icon={<PlusOutlined />} />
                                <Typography.Text strong>THÔNG TIN KHÁCH</Typography.Text>
                            </Space>
                        }>
                        <div className="pt-2">
                            {Number.isNaN(groupCustomerId) ? (
                                <Empty description="Thiếu group id trên URL" />
                            ) : loadingCustomer ? (
                                <Skeleton active paragraph={{ rows: 6 }} />
                            ) : errorCustomer ? (
                                <Empty description="Lỗi tải danh sách khách hàng" />
                            ) : customerItems.length === 0 ? (
                                <Empty description="Nhóm chưa có khách hàng" />
                            ) : (
                                <List
                                    dataSource={customerItems}
                                    split={false}
                                    renderItem={c => {
                                        const g = c?.gender as boolean | null | undefined
                                        const genderTag =
                                            g === true ? (
                                                <Tag color="pink">Nữ</Tag>
                                            ) : g === false ? (
                                                <Tag color="blue">Nam</Tag>
                                            ) : null

                                        return (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        key="edit"
                                                        type="default"
                                                        size="small"
                                                        icon={<EditOutlined />}
                                                    />,
                                                ]}
                                                className="rounded-xl p-3">
                                                <Space direction="vertical" size={6} className="w-full">
                                                    <Space wrap size={0} className="flex flex-wrap items-center">
                                                        <Tag bordered={false}>#{c.id}</Tag>
                                                        <Typography.Text strong className="text-[16px] pr-3">
                                                            {c.name}
                                                        </Typography.Text>
                                                        {genderTag}
                                                    </Space>

                                                    <Space size={16} wrap className="flex flex-wrap items-center gap-4">
                                                        {c.phone && (
                                                            <Space className="flex items-center gap-1">
                                                                <PhoneOutlined />
                                                                <Typography.Link href={`tel:${c.phone}`}>
                                                                    {c.phone}
                                                                </Typography.Link>
                                                            </Space>
                                                        )}
                                                        {c.email && (
                                                            <Space className="flex items-center gap-1">
                                                                <MailOutlined />
                                                                <Typography.Link href={`mailto:${c.email}`}>
                                                                    {c.email}
                                                                </Typography.Link>
                                                            </Space>
                                                        )}
                                                    </Space>
                                                    {c?.note && (
                                                        <Typography.Text type="secondary" className="text-gray-500">
                                                            {c.note}
                                                        </Typography.Text>
                                                    )}
                                                </Space>
                                            </List.Item>
                                        )
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <GroupCustomerModal
                open={openCreateGroup}
                onCancel={closeCreateGroupModal}
                onSuccess={handleCreateGroupSuccess}
                mode="create"
                defaultParentId={Number.isNaN(groupCustomerId) ? null : groupCustomerId}
            />

            <GroupCustomerModal
                open={openUpdateGroup}
                onCancel={closeUpdateModal}
                onSuccess={handleUpdateGroupSuccess}
                mode="update"
                editingId={Number.isNaN(groupCustomerId) ? null : groupCustomerId}
            />
        </>
    )
}

export default DetailGroupCustomer
