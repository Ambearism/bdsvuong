import { useGetFoldersQuery } from '@/api/folder'
import Loading from '@/components/Loading'
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons'
import type { ModalProps } from 'antd'
import { Button, Empty, Flex, Input, Modal, Result, Segmented, Space } from 'antd'
import { useState } from 'react'
import { MdCreateNewFolder, MdUploadFile } from 'react-icons/md'

type ViewType = 'List' | 'Grid'

export const FileManager = ({ open, onCancel }: ModalProps) => {
    const [view, setView] = useState<ViewType>('List')
    const { data: { data: folders } = { data: [] }, isLoading } = useGetFoldersQuery(undefined, { skip: !open })

    return (
        <Modal
            centered
            open={open}
            onCancel={onCancel}
            footer={null}
            loading={isLoading}
            title={
                <Flex align="center" justify="space-between">
                    <Space>
                        <Button icon={<MdCreateNewFolder />}>Tạo thư mục</Button>
                        <Button icon={<MdUploadFile />}>Upload file</Button>
                    </Space>
                    <Segmented<ViewType>
                        options={[
                            { value: 'List', icon: <BarsOutlined /> },
                            { value: 'Grid', icon: <AppstoreOutlined /> },
                        ]}
                        value={view}
                        onChange={setView}
                    />
                    <Space className="mr-8">
                        <Input.Search placeholder="Tìm kiếm" />
                    </Space>
                </Flex>
            }
            width={1000}>
            {isLoading && <Result icon={<Loading />} />}
            {folders && !isLoading && <Empty description={false} />}
        </Modal>
    )
}
