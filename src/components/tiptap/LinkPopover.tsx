import { useTiptapUpdated } from '@/hooks/useTiptapUpdated'
import { Button, Checkbox, Form, Input, Modal, Tooltip } from 'antd'
import { useState } from 'react'
import { MdOutlineLink } from 'react-icons/md'

type FormValues = {
    url?: string
    content?: string
    blank?: boolean
}

export const LinkPopover = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [form] = Form.useForm<FormValues>()
    const { editor } = useTiptapUpdated()

    const onOpen = () => {
        if (!editor) return

        editor.chain().focus().extendMarkRange('link').run()
        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to, ' ')
        const attrs = editor.getAttributes('link')

        form.setFieldsValue({
            url: attrs.href,
            content: selectedText,
            blank: attrs.target === '_blank',
        })
        setOpen(true)
    }

    const onClose = () => {
        form.resetFields()
        setOpen(false)
    }

    const onFinish = (values: FormValues) => {
        if (!values.url) {
            editor?.commands?.unsetLink()
        } else {
            editor?.commands?.setLink({
                href: values.url,
                target: values.blank ? '_blank' : '_self',
            })
            editor?.commands?.insertContent({ type: 'text', text: values.content || values.url })
        }
        onClose()
    }

    return (
        <Tooltip title="Link">
            <Button
                size="small"
                icon={<MdOutlineLink />}
                onClick={onOpen}
                tabIndex={-1}
                type={editor?.isActive('link') ? 'primary' : undefined}
            />
            <Modal centered open={open} onOk={() => form.submit()} onCancel={onClose} title="Chèn liên kết">
                <Form<FormValues>
                    form={form}
                    autoComplete="off"
                    className="!space-y-3"
                    labelCol={{ xs: 24, sm: 6 }}
                    wrapperCol={{ xs: 24, sm: 18 }}
                    onFinish={onFinish}>
                    <Form.Item<string> label="Url" name="url">
                        <Input />
                    </Form.Item>

                    <Form.Item<string> label="Text" name="content">
                        <Input />
                    </Form.Item>

                    <Form.Item<string>
                        name="blank"
                        valuePropName="checked"
                        label={null}
                        wrapperCol={{ sm: { offset: 6 } }}>
                        <Checkbox>Mở trên tab mới</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </Tooltip>
    )
}
