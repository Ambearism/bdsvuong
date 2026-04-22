import { useGetImportTemplateMutation, useImportExploresMutation } from '@/api/explore'
import { Button, message, Modal, Upload, Typography, Alert, Divider, Flex } from 'antd'
import { FileExcelOutlined, UploadOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { UploadFile } from 'antd/es/upload/interface'

const { Text, Paragraph } = Typography

interface ImportExploreModalProps {
    open: boolean
    onCancel: () => void
    projectId: number
    onImportSuccess: () => void
}

const ImportExploreModal = ({ open, onCancel, projectId, onImportSuccess }: ImportExploreModalProps) => {
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const [getImportTemplate, { isLoading: isDownloadingTemplate }] = useGetImportTemplateMutation()
    const [importExplores, { isLoading: isImporting }] = useImportExploresMutation()

    const handleDownloadTemplate = async () => {
        try {
            const blob = await getImportTemplate({ project_id: projectId }).unwrap()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `mau_import_thong_tin_tra_cuu_${projectId}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            message.success('Tải file mẫu thành công!')
        } catch {
            message.error('Tải file mẫu thất bại!')
        }
    }

    const handleImport = async () => {
        if (fileList.length === 0) {
            message.warning('Vui lòng chọn file Excel!')
            return
        }

        try {
            const fileObj = fileList[0].originFileObj || (fileList[0] as unknown as File)
            const result = await importExplores({
                project_id: projectId,
                file: fileObj,
            }).unwrap()

            if (result.data.failed > 0) {
                Modal.error({
                    title: 'Kết quả Import có lỗi',
                    content: (
                        <div>
                            <p>
                                Thành công: <b>{result.data.success}</b>
                            </p>
                            <p>
                                Thất bại: <b>{result.data.failed}</b>
                            </p>
                            <Divider />
                            <div className="max-h-50 overflow-auto">
                                {result.data.errors.map((err: string, idx: number) => (
                                    <p key={idx} className="text-red-500 text-xs">
                                        - {err}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ),
                    width: 500,
                })
            } else {
                message.success(`Import thành công ${result.data.success} bản ghi!`)
                setFileList([])
                onImportSuccess()
            }
        } catch {
            message.error('Import thất bại!')
        }
    }

    return (
        <Modal
            title={
                <Flex align="center" gap="small">
                    <UploadOutlined /> Nhập dữ liệu từ Excel
                </Flex>
            }
            open={open}
            onCancel={onCancel}
            onOk={handleImport}
            confirmLoading={isImporting}
            okText="Bắt đầu Import"
            cancelText="Hủy"
            width={650}>
            <div className="py-2">
                <Alert
                    message="Hướng dẫn sử dụng"
                    description={
                        <Typography>
                            <Paragraph>
                                1. Tải file Excel mẫu bằng nút bên dưới. File mẫu sẽ tự động cấu hình các cột theo cài
                                đặt của dự án này.
                            </Paragraph>
                            <Paragraph>2. Điền thông tin vào file mẫu. Giữ nguyên tiêu đề các cột.</Paragraph>
                            <Paragraph>
                                3. <b>Lưu ý:</b> Với các cột Có/Không (Căn góc, Hoàn thiện...), vui lòng điền{' '}
                                <Text code>Có</Text> hoặc <Text code>Không</Text>.
                            </Paragraph>
                            <Paragraph>
                                4. Nếu muốn <b>cập nhật</b> bản ghi cũ, hãy điền <Text strong>ID</Text> của bản ghi đó.
                                Nếu để trống ID, hệ thống sẽ <b>tạo mới</b> bản ghi.
                            </Paragraph>
                            <Paragraph>
                                5. Với cột <b>Hướng nhà 1 & 2</b>, vui lòng điền đúng một trong các giá trị:{' '}
                                <Text code>Đông</Text>, <Text code>Tây</Text>, <Text code>Nam</Text>,{' '}
                                <Text code>Bắc</Text>, <Text code>Đông Bắc</Text>, <Text code>Đông Nam</Text>,{' '}
                                <Text code>Tây Bắc</Text>, <Text code>Tây Nam</Text>.
                            </Paragraph>
                        </Typography>
                    }
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                />

                <div className="mt-4 mb-6">
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadTemplate}
                        loading={isDownloadingTemplate}>
                        Tải file Excel mẫu
                    </Button>
                </div>

                <Divider orientation="left">Chọn file tải lên</Divider>

                <Upload.Dragger
                    accept=".xlsx, .xls"
                    multiple={false}
                    fileList={fileList}
                    beforeUpload={file => {
                        setFileList([file])
                        return false
                    }}
                    onRemove={() => setFileList([])}>
                    <p className="ant-upload-drag-icon">
                        <FileExcelOutlined className="!text-green-700" />
                    </p>
                    <p className="ant-upload-text">Nhấn hoặc kéo thả file vào đây để tải lên</p>
                    <p className="ant-upload-hint">Chỉ hỗ trợ file .xlsx hoặc .xls</p>
                </Upload.Dragger>
            </div>
        </Modal>
    )
}

export default ImportExploreModal
