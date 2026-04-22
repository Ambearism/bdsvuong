import React from 'react'
import BasePermissionsModal from '../common/BasePermissionsModal'
import { useGetProjectAccountPermissionsQuery, useUpdateProjectAccountPermissionsMutation } from '@/api/project'

interface ProjectPermissionsModalProps {
    visible: boolean
    onCancel: () => void
    projectId: number
}

const ProjectPermissionsModal: React.FC<ProjectPermissionsModalProps> = ({ visible, onCancel, projectId }) => {
    return (
        <BasePermissionsModal
            visible={visible}
            onCancel={onCancel}
            id={projectId}
            title="dự án"
            useGetPermissionsQuery={useGetProjectAccountPermissionsQuery}
            useUpdatePermissionsMutation={useUpdateProjectAccountPermissionsMutation}
            idFieldName="project_id"
        />
    )
}

export default ProjectPermissionsModal
