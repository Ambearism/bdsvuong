import { Modal, Flex, Typography, List, Avatar, Space } from 'antd'
import { HomeOutlined, UserOutlined } from '@ant-design/icons'
import type { LeaseContractItem } from '@/types/lease-contract'
import { EMPTY_TEXT } from '@/config/constant'

const { Text, Title } = Typography

interface SelectLeaseContractModalProps {
    open: boolean
    onCancel: () => void
    contracts: LeaseContractItem[]
    onSelect: (contract: LeaseContractItem) => void
}

const SelectLeaseContractModal = ({ open, onCancel, contracts, onSelect }: SelectLeaseContractModalProps) => {
    return (
        <Modal
            title={
                <Flex align="center" gap={8} className="border-b pb-4 mb-0">
                    <HomeOutlined className="text-indigo-600" />
                    <Title level={4} className="!m-0 text-slate-700">
                        Chọn hợp đồng thuê
                    </Title>
                </Flex>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            centered>
            <div className="px-6 py-2">
                <Text type="secondary" className="mb-4 block">
                    Vui lòng chọn hợp đồng thuê để ghi nhận dòng tiền thuế
                </Text>
                <List
                    itemLayout="horizontal"
                    dataSource={contracts}
                    renderItem={item => (
                        <List.Item
                            className="cursor-pointer hover:bg-slate-50 transition-colors p-4 rounded-xl border border-transparent hover:border-indigo-100 mt-2"
                            onClick={() => onSelect(item)}>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        icon={<HomeOutlined />}
                                        className="bg-indigo-50 text-indigo-600 border border-indigo-100"
                                        size={48}
                                    />
                                }
                                title={
                                    <Text strong className="text-[15px] text-slate-800">
                                        {item.product_rel?.name || 'Hàng hoá chưa xác định'}
                                    </Text>
                                }
                                description={
                                    <Space direction="vertical" size={0} className="w-full">
                                        <Flex align="center" gap={4}>
                                            <UserOutlined className="text-slate-400" />
                                            <Text className="text-slate-500">
                                                Người thuê: {item.tenant_rel?.name || EMPTY_TEXT} (
                                                {item.tenant_rel?.phone || EMPTY_TEXT})
                                            </Text>
                                        </Flex>
                                        <Text type="secondary" className="text-[12px]">
                                            Thời hạn: {item.start_date} - {item.end_date} | Giá:{' '}
                                            {item.price.toLocaleString()} triệu
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Modal>
    )
}

export default SelectLeaseContractModal
