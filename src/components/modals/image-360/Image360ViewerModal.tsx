import React, { useRef } from 'react'
import { Modal } from 'antd'
import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'

interface Image360ViewerModalProps {
    open: boolean
    onClose: () => void
    image_url: string
}

const Image360ViewerModal: React.FC<Image360ViewerModalProps> = ({ open, onClose, image_url }) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const viewerInstance = useRef<Viewer | null>(null)

    const initViewer = () => {
        if (!containerRef.current) return

        if (viewerInstance.current) {
            viewerInstance.current.destroy()
        }

        viewerInstance.current = new Viewer({
            container: containerRef.current,
            panorama: image_url,
            navbar: 'zoom fullscreen',
        })
    }

    return (
        <Modal
            title="Xem nhanh ảnh 360"
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={900}
            destroyOnHidden
            afterOpenChange={isOpen => {
                if (isOpen) {
                    setTimeout(initViewer, 0)
                }
            }}>
            <div ref={containerRef} className="w-full h-[60vh]" />
        </Modal>
    )
}

export default Image360ViewerModal
