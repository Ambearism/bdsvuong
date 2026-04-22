import { useCurrentEditor } from '@tiptap/react'
import { Button, Form, Input, InputNumber, Modal, Tabs, Tooltip } from 'antd'
import { useState } from 'react'
import { MdOndemandVideo } from 'react-icons/md'
import {
    REGEX_IFRAME_HEIGHT,
    REGEX_IFRAME_SRC,
    REGEX_IFRAME_WIDTH,
    REGEX_YOUTUBE,
    YOUTUBE_EMBED_URL,
} from '@/config/constant'

type FormValues = {
    source: string
    alternativeSource?: string
    width?: number
    height?: number
}

export const VideoPopover = () => {
    const { editor } = useCurrentEditor()
    const [open, setOpen] = useState<boolean>(false)
    const [activeTab, setActiveTab] = useState<string>('general')
    const [form] = Form.useForm<FormValues>()
    const [embedCode, setEmbedCode] = useState('')
    const [error, setError] = useState<string | null>(null)

    const onOpen = () => {
        setOpen(true)
        setError(null)
        if (editor?.isActive('iframe')) {
            const attrs = editor.getAttributes('iframe')
            form.setFieldsValue({
                source: attrs.src,
                width: parseInt(attrs.width) || undefined,
                height: parseInt(attrs.height) || undefined,
            })
        } else {
            form.resetFields()
            setEmbedCode('')
        }
    }

    const onClose = () => {
        setOpen(false)
        form.resetFields()
        setEmbedCode('')
        setError(null)
    }

    const getEmbedUrl = (url: string) => {
        if (!url) return ''

        const match = url.match(REGEX_YOUTUBE)

        if (match && match[1]) {
            return `${YOUTUBE_EMBED_URL}/${match[1]}`
        }

        return url
    }

    const insertIframe = (params: { src: string; width?: number; height?: number }) => {
        if (!params.src) return
        editor?.chain().focus().setIframe(params).run()
    }

    const validateEmbed = (code: string) => {
        if (!code.trim()) {
            setError(null)
            return true
        }

        const srcMatch = code.match(REGEX_IFRAME_SRC)
        if (srcMatch && srcMatch[1]) {
            setError(null)
            return true
        }

        const url = code.trim()
        if (url.startsWith('http') || url.startsWith('//')) {
            setError(null)
            return true
        }

        setError('Mã nhúng không đúng nội dung iframe hoặc không có đường dẫn (src)')
        return false
    }

    const handleOk = async () => {
        const values = await form.validateFields().catch(() => null)
        if (values === null) return

        if (values.source) {
            insertIframe({
                src: getEmbedUrl(values.source),
                width: values.width,
                height: values.height,
            })
            onClose()
            return
        }

        const isEmbedValid = validateEmbed(embedCode)
        if (!isEmbedValid) return

        if (embedCode.trim()) {
            const srcMatch = embedCode.match(REGEX_IFRAME_SRC)
            const widthMatch = embedCode.match(REGEX_IFRAME_WIDTH)
            const heightMatch = embedCode.match(REGEX_IFRAME_HEIGHT)

            const src = srcMatch ? srcMatch[1] : embedCode.trim()
            insertIframe({
                src: src.startsWith('http') || src.startsWith('//') ? getEmbedUrl(src) : src,
                width: widthMatch ? parseInt(widthMatch[1]) : undefined,
                height: heightMatch ? parseInt(heightMatch[1]) : undefined,
            })
            onClose()
            return
        }

        onClose()
    }

    const items = [
        {
            key: 'general',
            label: 'Cơ bản',
            children: (
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Link video"
                        name="source"
                        rules={[{ type: 'url', message: 'Đường dẫn không hợp lệ' }]}>
                        <Input placeholder="http://" />
                    </Form.Item>

                    <Form.Item
                        label="Link thay thế"
                        name="alternativeSource"
                        rules={[{ type: 'url', message: 'Đường dẫn không hợp lệ' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Kích thước" className="mb-0">
                        <div className="flex gap-2 items-start">
                            <Form.Item
                                name="width"
                                rules={[{ type: 'number', min: 0, message: 'Kích thước không được < 0' }]}
                                className="mb-0">
                                <InputNumber placeholder="Rộng" className="!w-full" />
                            </Form.Item>
                            <span className="pt-2">x</span>
                            <Form.Item
                                name="height"
                                rules={[{ type: 'number', min: 0, message: 'Kích thước không được < 0' }]}
                                className="mb-0">
                                <InputNumber placeholder="Cao" className="!w-full" />
                            </Form.Item>
                        </div>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'embed',
            label: 'Mã nhúng',
            children: (
                <div className="flex flex-col gap-1">
                    <div>Dán mã nhúng của bạn vào bên dưới:</div>
                    <Input.TextArea
                        rows={6}
                        value={embedCode}
                        status={error ? 'error' : ''}
                        onChange={e => {
                            const val = e.target.value
                            setEmbedCode(val)
                            validateEmbed(val)
                        }}
                    />
                    {error && <div className="text-red-500 text-[12px]">{error}</div>}
                </div>
            ),
        },
    ]

    return (
        <>
            <Tooltip title="Video">
                <Button size="small" icon={<MdOndemandVideo />} onClick={onOpen} tabIndex={-1} />
            </Tooltip>

            <Modal title="Chèn/chỉnh sửa video" open={open} onCancel={onClose} onOk={handleOk} width={600}>
                <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />
            </Modal>
        </>
    )
}
