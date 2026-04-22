import React, { useState } from 'react'
import { Input, Button, Flex, Select } from 'antd'
import { SendOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface QuickNoteInputProps {
    onSubmit: (content: string, label: string) => Promise<void>
    loading?: boolean
}

const LABEL_OPTIONS = [
    { value: 'care', label: '🏷️ Chăm sóc' },
    { value: 'response', label: '💬 Phản hồi KH' },
    { value: 'call', label: '📞 Cuộc gọi' },
    { value: 'note', label: '📝 Ghi chú' },
]

const QuickNoteInput: React.FC<QuickNoteInputProps> = ({ onSubmit, loading }) => {
    const [content, setContent] = useState('')
    const [label, setLabel] = useState('care')

    const handleSubmit = async () => {
        if (!content.trim()) return
        await onSubmit(content.trim(), label)
        setContent('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="quick-note-input">
            <TextArea
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập ghi chú, link ảnh, nhận xét... (Ctrl+Enter để gửi)"
                autoSize={{ minRows: 2, maxRows: 5 }}
                className="!border-none !shadow-none !p-0 !resize-none"
            />
            <div className="quick-note-input__actions">
                <Select
                    value={label}
                    onChange={setLabel}
                    options={LABEL_OPTIONS}
                    size="small"
                    className="!w-40"
                    variant="borderless"
                />
                <Flex gap={8}>
                    <Button
                        type="primary"
                        size="small"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!content.trim()}>
                        Gửi
                    </Button>
                </Flex>
            </div>
        </div>
    )
}

export default React.memo(QuickNoteInput)
