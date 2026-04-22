import { ImageGallery } from '@/components/tiptap/ImageGallery'
import { IMAGE_TYPE } from '@/config/constant'
import type { UploadImageResponse } from '@/types/image'
import { useCurrentEditor } from '@tiptap/react'
import { Button, Form, Input, Modal, Space, Tooltip } from 'antd'
import { useState } from 'react'
import { MdOutlineImage, MdOutlineImageSearch } from 'react-icons/md'

type FormValues = {
    source?: string
    description?: string
}

export const ImagePopover = () => {
    const { editor } = useCurrentEditor()
    const [open, setOpen] = useState<boolean>(false)
    const [openManager, setOpenManager] = useState<boolean>(false)
    const [form] = Form.useForm<FormValues>()

    const onOpen = () => {
        if (!editor) return
        const previousAttrs = editor.getAttributes('image')
        form.setFieldsValue(previousAttrs)
        setOpen(true)
    }

    const onClose = () => {
        form.resetFields()
        setOpen(false)
    }

    const onOpenManager = () => setOpenManager(true)
    const onCloseManager = () => setOpenManager(false)

    const onFinish = (values: FormValues) => {
        if (values.source) {
            editor
                ?.chain()
                .focus()
                .setImage({
                    src: values.source,
                    alt: values.description,
                    width: 1280,
                    height: 720,
                })
                .run()
        }
        onClose()
    }

    const handleUploadComplete = (uploadedFiles: UploadImageResponse[]) => {
        if (uploadedFiles && uploadedFiles.length > 0) {
            if (uploadedFiles.length > 1) {
                if (editor) {
                    const { schema } = editor.view.state
                    const nodes = uploadedFiles
                        .filter(file => file.path)
                        .map(file => schema.node('image', { src: file.path, width: 1280, height: 720 }))

                    if (nodes.length > 0) {
                        editor.view.dispatch(editor.view.state.tr.insert(editor.state.selection.to, nodes))
                    }
                }
                onClose()
            } else {
                const firstImage = uploadedFiles[0]
                if (firstImage && firstImage.path) {
                    form.setFieldsValue({ source: firstImage.path })
                }
            }
        }
        onCloseManager()
    }

    return (
        <>
            <Tooltip title="Image">
                <Button size="small" icon={<MdOutlineImage />} tabIndex={-1} onClick={onOpen} />
            </Tooltip>

            <Modal centered open={open} onCancel={onClose} onOk={() => form.submit()} title="Chèn hình ảnh">
                <Form
                    form={form}
                    autoComplete="off"
                    className="!space-y-3"
                    labelCol={{ xs: 24, sm: 6 }}
                    wrapperCol={{ xs: 24, sm: 18 }}
                    onFinish={onFinish}>
                    <Form.Item<FormValues> label="Đường dẫn">
                        <Space.Compact className="!w-full">
                            <Form.Item name="source" noStyle rules={[{ type: 'url' }]}>
                                <Input placeholder="Dán đường dẫn hoặc upload ảnh" />
                            </Form.Item>

                            <Button type="primary" icon={<MdOutlineImageSearch />} onClick={onOpenManager}>
                                Upload
                            </Button>
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item<FormValues> label="Mô tả" name="description" rules={[{ max: 50 }]}>
                        <Input placeholder="Mô tả" />
                    </Form.Item>
                </Form>
            </Modal>

            {openManager && (
                <ImageGallery
                    open={openManager}
                    onCancel={onCloseManager}
                    onUploadComplete={handleUploadComplete}
                    folder="text-editor"
                    imageType={IMAGE_TYPE.IMAGE_EDITOR}
                />
            )}
        </>
    )
}
