import { useMemo } from 'react'
import { Typography } from 'antd'

const sanitizeHtmlForPreview = (html: string = ''): string => {
    return html.replace(/\sdata-[a-zA-Z0-9-]+="[^"]*"/g, '')
}

interface Props {
    value?: string | null
}

export const PreviewTextEditor = ({ value }: Props) => {
    const html = useMemo(() => sanitizeHtmlForPreview(value || ''), [value])

    if (!value) return <Typography.Text type="secondary">Không có dữ liệu</Typography.Text>

    return <div className="preview-text-editor text-base text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />
}
