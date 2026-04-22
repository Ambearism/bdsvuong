import { useBlocker } from 'react-router'

interface UseNavBlockerProps {
    isDirty: boolean
}

export const useNavBlocker = ({ isDirty }: UseNavBlockerProps) => {
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
    )

    const showModal = blocker.state === 'blocked'

    const handleConfirm = () => {
        blocker.proceed?.()
    }

    const handleCancel = () => {
        blocker.reset?.()
    }

    return {
        showModal,
        handleConfirm,
        handleCancel,
    }
}
