import React from 'react'
import { Card, Typography } from 'antd'
import BaseFileUpload from '@/components/base/BaseFileUpload'
import type { OpportunityItem } from '@/types/opportunity'

const { Text } = Typography

interface DocumentsCardProps {
    opportunity: OpportunityItem
    onFilesChange?: (urls: string[]) => void
}

const DocumentsCard: React.FC<DocumentsCardProps> = ({ opportunity, onFilesChange }) => {
    return (
        <Card
            size="small"
            title={
                <Text strong className="!text-xs !uppercase !tracking-wider !text-gray-500">
                    Tài liệu
                </Text>
            }>
            <BaseFileUpload
                existingFiles={opportunity.files || undefined}
                folder="opportunities/"
                onChange={onFilesChange}
            />
        </Card>
    )
}

export default React.memo(DocumentsCard)
